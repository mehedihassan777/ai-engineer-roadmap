import type { Metadata } from "next";
import { CurrentWeekView } from "@/components/week/CurrentWeekView";

export const metadata: Metadata = { title: "This week" };

export default function ThisWeekPage() {
  return <CurrentWeekView />;
}
