import { CONTENT, PLAN } from "@/data";
import type { Week } from "@/data/types";
import { describe, expect, it } from "vitest";
import { groupTasksByTrack, resolveRoadmap } from "./roadmap";

const roadmap = resolveRoadmap(CONTENT, PLAN);

describe("resolveRoadmap", () => {
  it("keeps weeks in order and indexes them", () => {
    expect(roadmap.weeks.map((week) => week.number)).toEqual([...roadmap.weeks.map((week) => week.number)].sort((a, b) => a - b));
    expect(roadmap.weeksByNumber.get(1)?.title).toBe(CONTENT.weeks[0].title);
  });

  it("derives task hours from weights and the track budget", () => {
    // Week 1 weights are written as hours, so they map 1:1 at the default 15 h budget.
    expect(roadmap.tasksById.get("w01-p1-scaffold-api")?.hours).toBe(1.75);
    expect(roadmap.tasksById.get("w01-claude-md")?.hours).toBe(1);
    expect(roadmap.tasksById.get("w01-dsa-1")?.hours).toBe(0.75);
  });

  it("gives every week exactly the weekly budget when every track has tasks", () => {
    for (const week of roadmap.weeks) {
      expect(week.totalHours).toBeCloseTo(PLAN.weeklyHours, 9);
      expect(week.hoursByTrack.ai).toBeCloseTo(6.75, 9);
      expect(week.hoursByTrack.dsa).toBeCloseTo(2.25, 9);
    }
  });

  it("totals hours and tasks across the plan", () => {
    expect(roadmap.totalHours).toBeCloseTo(PLAN.weeklyHours * roadmap.weeks.length, 9);
    const taskCount = Object.values(roadmap.taskCountByTrack).reduce((sum, value) => sum + value, 0);
    expect(taskCount).toBe(roadmap.tasksById.size);
  });

  it("records where each task lives", () => {
    const task = roadmap.tasksById.get("w02-sd-scalability");
    expect(task?.weekNumber).toBe(2);
    expect(task?.phaseId).toBe("llm-foundations");
    expect(task?.track).toBe("design");
  });

  it("rescales every task when the budget changes", () => {
    const rescaled = resolveRoadmap(CONTENT, { ...PLAN, weeklyHours: 30 });
    expect(rescaled.tasksById.get("w01-p1-scaffold-api")?.hours).toBe(3.5);
    expect(rescaled.weeks[0].totalHours).toBeCloseTo(30, 9);
  });

  it("leaves a track's budget unallocated when a week has no tasks for it", () => {
    const week: Week = { ...CONTENT.weeks[0], tasks: CONTENT.weeks[0].tasks.filter((task) => task.track !== "assisted") };
    const resolved = resolveRoadmap({ ...CONTENT, weeks: [week] }, PLAN);
    expect(resolved.weeks[0].hoursByTrack.assisted).toBe(0);
    expect(resolved.weeks[0].totalHours).toBeCloseTo(13.5, 9);
  });
});

describe("groupTasksByTrack", () => {
  it("returns groups in track order with their hours", () => {
    const week = roadmap.weeksByNumber.get(1);
    expect(week).toBeDefined();
    if (!week) return;
    const groups = groupTasksByTrack(week, CONTENT.tracks);
    expect(groups.map((group) => group.track.id)).toEqual(["ai", "assisted", "design", "fundamentals", "dsa"]);
    expect(groups.find((group) => group.track.id === "dsa")?.tasks).toHaveLength(3);
    expect(groups.find((group) => group.track.id === "ai")?.hours).toBeCloseTo(6.75, 9);
  });
});
