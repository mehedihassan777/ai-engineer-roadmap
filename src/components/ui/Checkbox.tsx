import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/** A native checkbox (keyboard and screen-reader friendly) with the accent colour. Always pass an accessible name. */
export function Checkbox({ className, ...props }: Omit<InputHTMLAttributes<HTMLInputElement>, "type">) {
  return <input type="checkbox" className={cn("size-5 shrink-0 cursor-pointer rounded accent-accent", className)} {...props} />;
}
