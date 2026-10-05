import type { PlanConfig, TrackId } from "@/data/types";

/** Removes floating-point noise such as 0.30000000000000004. */
const clean = (value: number) => Math.round(value * 1e6) / 1e6;

export function roundToStep(value: number, step: number): number {
  return clean(Math.round(value / step) * step);
}

/** Weekly hours budgeted for a track: weeklyHours x its share, rounded to the plan's hour step. */
export function trackWeeklyHours(plan: PlanConfig, track: TrackId): number {
  return roundToStep(plan.weeklyHours * plan.split[track], plan.hourStep);
}

/**
 * Splits `totalHours` between tasks in proportion to their weights, in whole multiples of `step`
 * (largest-remainder method). The result always adds up to `totalHours` rounded to the step.
 */
export function allocateHours(weights: number[], totalHours: number, step: number): number[] {
  if (weights.length === 0) return [];
  const safe = weights.map((weight) => (Number.isFinite(weight) && weight > 0 ? weight : 1));
  const weightSum = safe.reduce((sum, weight) => sum + weight, 0);
  const totalUnits = Math.round(totalHours / step);

  const shares = safe.map((weight) => (totalUnits * weight) / weightSum);
  const units = shares.map((share) => Math.floor(share));
  let leftover = totalUnits - units.reduce((sum, value) => sum + value, 0);

  // Hand the remaining units to the largest fractional parts; ties go to the earlier task.
  const order = shares
    .map((share, index) => ({ index, fraction: share - Math.floor(share) }))
    .sort((a, b) => b.fraction - a.fraction || a.index - b.index);
  for (const { index } of order) {
    if (leftover <= 0) break;
    units[index] += 1;
    leftover -= 1;
  }
  return units.map((value) => clean(value * step));
}
