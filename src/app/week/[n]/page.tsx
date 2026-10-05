import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WeekView } from "@/components/week/WeekView";
import { roadmap } from "@/lib/content";

// Only weeks that exist in src/data/weeks are generated; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return roadmap.weeks.map((week) => ({ n: String(week.number) }));
}

export async function generateMetadata({ params }: PageProps<"/week/[n]">): Promise<Metadata> {
  const { n } = await params;
  const week = roadmap.weeksByNumber.get(Number(n));
  return { title: week ? `Week ${week.number}: ${week.title}` : "Week" };
}

export default async function WeekPage({ params }: PageProps<"/week/[n]">) {
  const { n } = await params;
  const weekNumber = Number(n);
  if (!roadmap.weeksByNumber.has(weekNumber)) notFound();
  return <WeekView weekNumber={weekNumber} />;
}
