"use client";

import { useEffect, useRef, type DialogHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

interface ModalProps extends Omit<DialogHTMLAttributes<HTMLDialogElement>, "open" | "onClose" | "children"> {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Classes for the inner panel. The <dialog> itself is just the backdrop target. */
  panelClassName?: string;
}

/**
 * A modal built on the native <dialog>: focus is trapped, Esc closes it, and everything behind is inert.
 * Clicking the backdrop closes it too.
 */
export function Modal({ open, onClose, children, className, panelClassName, ...props }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className={cn("bg-transparent backdrop:bg-black/50 backdrop:backdrop-blur-[1px]", className)}
      {...props}
    >
      <div className={panelClassName}>{children}</div>
    </dialog>
  );
}
