"use client";

import { Menu, Rocket, X } from "lucide-react";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { Modal } from "../ui/Modal";
import { SidebarContent } from "./SidebarContent";
import { StatusBanner } from "./StatusBanner";
import { ThemeToggle } from "./ThemeToggle";

/** Desktop: fixed sidebar. Mobile: sticky top bar that opens the same navigation in a drawer. */
export function AppShell({ children }: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const closeDrawer = () => setDrawerOpen(false);

  return (
    <div className="min-h-dvh lg:flex">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-foreground"
      >
        Skip to content
      </a>

      <aside className="hidden border-r border-line bg-surface lg:sticky lg:top-0 lg:block lg:h-dvh lg:w-64 lg:shrink-0">
        <SidebarContent />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-background/90 px-4 py-2.5 backdrop-blur lg:hidden">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open navigation"
              aria-expanded={drawerOpen}
              className="inline-flex size-9 items-center justify-center rounded-lg text-muted hover:bg-surface-muted hover:text-foreground"
            >
              <Menu className="size-5" aria-hidden="true" />
            </button>
            <Link href="/" className="flex items-center gap-2 text-sm font-semibold">
              <Rocket className="size-4 text-accent" aria-hidden="true" />
              AI Engineer Roadmap
            </Link>
          </div>
          <ThemeToggle iconOnly />
        </header>

        <Modal
          open={drawerOpen}
          onClose={closeDrawer}
          aria-label="Navigation"
          className="m-0 mr-auto h-dvh max-h-none w-72 max-w-[85vw]"
          panelClassName="relative h-full border-r border-line bg-surface text-foreground shadow-xl"
        >
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Close navigation"
            className="absolute top-4 right-3 inline-flex size-8 items-center justify-center rounded-lg text-muted hover:bg-surface-muted hover:text-foreground"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
          <SidebarContent onNavigate={closeDrawer} />
        </Modal>

        <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
          <StatusBanner />
          {children}
        </main>
      </div>
    </div>
  );
}
