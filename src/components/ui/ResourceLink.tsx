import { ExternalLink } from "lucide-react";
import type { Resource } from "@/data/types";
import { Badge } from "./Badge";

/** A resource with a verified URL opens in a new tab; one without is plain text flagged "verify link". */
export function ResourceLink({ resource }: { resource: Resource }) {
  if (!resource.url) {
    return (
      <span className="inline-flex flex-wrap items-center gap-1.5 text-sm text-muted">
        {resource.title}
        <Badge tone="warning">verify link</Badge>
      </span>
    );
  }
  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-sm text-accent underline-offset-2 hover:underline"
    >
      {resource.title}
      <ExternalLink className="size-3.5 shrink-0" aria-hidden="true" />
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}
