import { describe, expect, it } from "vitest";
import { MIN_TOKEN_LENGTH, readSyncConfig } from "./config";

const TOKEN = "t".repeat(MIN_TOKEN_LENGTH);

describe("readSyncConfig", () => {
  it("is simply off when nothing is configured", () => {
    expect(readSyncConfig({})).toEqual({ config: null, problem: null });
    expect(readSyncConfig({ SYNC_TOKEN: "  ", DATABASE_URL: " " })).toEqual({ config: null, problem: null });
  });

  it("enables the Neon store when the database URL and a long token are present", () => {
    const { config, problem } = readSyncConfig({ DATABASE_URL: "postgresql://u:p@host/db", SYNC_TOKEN: TOKEN });
    expect(problem).toBeNull();
    expect(config).toEqual({ token: TOKEN, store: { kind: "neon", url: "postgresql://u:p@host/db" } });
  });

  it("trims whitespace around values", () => {
    const { config } = readSyncConfig({ DATABASE_URL: " postgresql://h/db \n", SYNC_TOKEN: ` ${TOKEN} ` });
    expect(config?.token).toBe(TOKEN);
    expect(config?.store).toEqual({ kind: "neon", url: "postgresql://h/db" });
  });

  it("fails closed: a database without a token (or with a short one) does not enable sync", () => {
    expect(readSyncConfig({ DATABASE_URL: "postgresql://h/db" })).toMatchObject({ config: null, problem: expect.stringContaining("SYNC_TOKEN is not set") });
    expect(readSyncConfig({ DATABASE_URL: "postgresql://h/db", SYNC_TOKEN: "short" })).toMatchObject({
      config: null,
      problem: expect.stringContaining("at least 32"),
    });
  });

  it("reports a missing database when only a token is set", () => {
    expect(readSyncConfig({ SYNC_TOKEN: TOKEN })).toEqual({ config: null, problem: "DATABASE_URL is not set." });
  });

  it("allows the in-memory store only outside production", () => {
    expect(readSyncConfig({ SYNC_STORE: "memory", SYNC_TOKEN: TOKEN }).config?.store).toEqual({ kind: "memory" });
    expect(readSyncConfig({ SYNC_STORE: "memory", SYNC_TOKEN: TOKEN, NODE_ENV: "production" })).toMatchObject({
      config: null,
      problem: expect.stringContaining("development only"),
    });
  });

  it("prefers the database over the in-memory store when both are set", () => {
    const { config } = readSyncConfig({ SYNC_STORE: "memory", DATABASE_URL: "postgresql://h/db", SYNC_TOKEN: TOKEN });
    expect(config?.store.kind).toBe("neon");
  });
});
