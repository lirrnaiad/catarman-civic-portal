"use client";

import { ViewTransition, type ReactNode } from "react";

/**
 * Wrap each main tab's page content (not the layout: layouts persist, so
 * enter/exit never fire there). SiteNav tags each tab link with
 * "tab-forward" or "tab-back" depending on which side the target tab is,
 * so content slides the way the tabs are laid out. Everything else
 * (refreshes, browser back) switches instantly.
 */
export default function TabTransition({ children }: { children: ReactNode }) {
  const slide = { "tab-forward": "tab-forward", "tab-back": "tab-back", default: "none" };
  return (
    <ViewTransition enter={slide} exit={slide} default="none">
      {children}
    </ViewTransition>
  );
}
