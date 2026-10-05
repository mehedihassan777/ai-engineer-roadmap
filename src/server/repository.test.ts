import { beforeAll, describe, expect, it } from "vitest";
import { createDefaultState } from "@/lib/state/defaults";
import type { PersistedState } from "@/lib/state/types";
import { createMemoryRepository } from "./memory-repository";
import type { SyncRepository } from "./repository";
import { createSqlRepository } from "./sql-repository";
import { createPgliteRunner } from "./testing";

const stateWith = (taskId: string): PersistedState => ({
  ...createDefaultState("2026-10-05"),
  tasks: { [taskId]: "done" },
  notes: { "1": "note with \"quotes\", unicode — ✓ and\nnewlines" },
});

/** The contract every repository must satisfy; runs against the in-memory version and the real SQL on PGlite. */
function repositoryContract(name: string, create: () => Promise<SyncRepository>) {
  describe(name, () => {
    let repo: SyncRepository;
    beforeAll(async () => {
      repo = await create();
    });

    it("returns null before anything is stored", async () => {
      expect(await repo.get("empty")).toBeNull();
    });

    it("stores the first write as revision 1 when the base revision is 0", async () => {
      const result = await repo.put({ workspace: "w1", baseRev: 0, state: stateWith("a"), deviceId: "home" });
      expect(result).toMatchObject({ ok: true, rev: 1 });
      const stored = await repo.get("w1");
      expect(stored?.rev).toBe(1);
      expect(stored?.updatedBy).toBe("home");
      expect(stored?.state).toEqual(stateWith("a"));
      expect(() => new Date(stored?.updatedAt ?? "").toISOString()).not.toThrow();
    });

    it("bumps the revision when the base revision matches", async () => {
      const result = await repo.put({ workspace: "w1", baseRev: 1, state: stateWith("b"), deviceId: "office" });
      expect(result).toMatchObject({ ok: true, rev: 2 });
      expect((await repo.get("w1"))?.updatedBy).toBe("office");
    });

    it("rejects a stale base revision and returns what is stored", async () => {
      const result = await repo.put({ workspace: "w1", baseRev: 1, state: stateWith("stale"), deviceId: "home" });
      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.current?.rev).toBe(2);
      expect(result.current?.state).toEqual(stateWith("b"));
      expect((await repo.get("w1"))?.state).toEqual(stateWith("b")); // unchanged
    });

    it("rejects a base revision from the future too", async () => {
      expect((await repo.put({ workspace: "w1", baseRev: 9, state: stateWith("x"), deviceId: "home" })).ok).toBe(false);
    });

    it("re-seeds when the row does not exist, whatever base revision the client had", async () => {
      const result = await repo.put({ workspace: "wiped", baseRev: 5, state: stateWith("c"), deviceId: "home" });
      expect(result).toMatchObject({ ok: true, rev: 1 });
    });

    it("keeps workspaces separate", async () => {
      await repo.put({ workspace: "other", baseRev: 0, state: stateWith("z"), deviceId: "home" });
      expect((await repo.get("other"))?.state.tasks).toEqual({ z: "done" });
      expect((await repo.get("w1"))?.state.tasks).toEqual({ b: "done" });
    });

    it("lets exactly one of two concurrent writers on the same revision win", async () => {
      await repo.put({ workspace: "race", baseRev: 0, state: stateWith("base"), deviceId: "home" });
      const results = await Promise.all([
        repo.put({ workspace: "race", baseRev: 1, state: stateWith("from-home"), deviceId: "home" }),
        repo.put({ workspace: "race", baseRev: 1, state: stateWith("from-office"), deviceId: "office" }),
      ]);
      expect(results.filter((result) => result.ok)).toHaveLength(1);
      expect((await repo.get("race"))?.rev).toBe(2);
    });
  });
}

repositoryContract("memory repository", async () => createMemoryRepository());
repositoryContract("SQL repository on PGlite (real Postgres)", async () => createSqlRepository(await createPgliteRunner()));
