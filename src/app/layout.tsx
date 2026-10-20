import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible_Next, Bricolage_Grotesque, Geist_Mono } from "next/font/google";
import { AppShell } from "@/components/layout/AppShell";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import "./globals.css";

// Fonts chosen in DESIGN.md: a characterful grotesque for headings and numbers, a legibility-first face for reading.
const heading = Bricolage_Grotesque({
  variable: "--font-heading",
  subsets: ["latin"],
});

const body = Atkinson_Hyperlegible_Next({
  variable: "--font-body",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  // Only used for occasional code snippets; loading it lazily avoids an "unused preload" console warning.
  preload: false,
});

export const metadata: Metadata = {
  title: {
    default: "AI Engineer Roadmap",
    template: "%s · AI Engineer Roadmap",
  },
  description: "A personal 24-week roadmap to becoming an AI engineer who ships production-grade AI-integrated systems.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2f4f1" },
    { media: "(prefers-color-scheme: dark)", color: "#13171e" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: the inline script below adds the "dark" class before React hydrates.
    <html lang="en" suppressHydrationWarning className={`${heading.variable} ${body.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
