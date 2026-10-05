import type { Metadata } from "next";
import { Suspense } from "react";
import { TasksSkeleton, TasksView } from "@/components/tasks/TasksView";

export const metadata: Metadata = { title: "All tasks" };

export default function TasksPage() {
  // TasksView reads the filters from the URL (useSearchParams), which needs a Suspense boundary.
  return (
    <Suspense fallback={<TasksSkeleton />}>
      <TasksView />
    </Suspense>
  );
}
