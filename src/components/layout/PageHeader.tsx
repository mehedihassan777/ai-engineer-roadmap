import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: ReactNode;
  /** Small line above the title, e.g. "Phase 1 · LLM foundations". */
  eyebrow?: ReactNode;
  actions?: ReactNode;
}

export function PageHeader({ title, description, eyebrow, actions }: PageHeaderProps) {
  return (
    <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && <p className="mb-2 text-sm text-muted">{eyebrow}</p>}
        <h1 className="text-3xl leading-[1.08] font-bold tracking-tight sm:text-[2.75rem]">{title}</h1>
        {description && <p className="mt-3 max-w-[65ch] text-muted sm:text-[1.0625rem]">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}
