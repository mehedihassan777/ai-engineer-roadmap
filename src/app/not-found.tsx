import { Compass } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { LinkButton } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <EmptyState
      icon={<Compass className="size-8" aria-hidden="true" />}
      title="Page not found"
      description="That page does not exist (yet). If it is a week or a project, check that its content file is registered in src/data."
      action={<LinkButton href="/" variant="primary">Back to the dashboard</LinkButton>}
    />
  );
}
