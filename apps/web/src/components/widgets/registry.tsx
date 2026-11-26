import type { ComponentType } from "react";

import CorporateVeilTabs from "@/components/study/courses/business-associations/corporate-veil-tabs";
import "@/components/study/courses/study.css";

/**
 * The widgets a lesson can place by key: `[[widget:corporate-veil-tabs]]` on a
 * line of its own in the builder.
 *
 * A widget is code a developer wrote, so this list is a developer's: an author
 * can place a widget but cannot make one. A key not listed here draws nothing,
 * so a body written for a widget that has not shipped yet still renders. To add
 * one, write the component and add its key below; nothing else changes.
 *
 * Widgets must not carry anything an unenrolled reader should not see. They are
 * drawn inside lesson bodies, which the plugin has already gated.
 */
export const WIDGETS: Record<string, ComponentType> = {
  "corporate-veil-tabs": () => (
    <div className="study">
      <CorporateVeilTabs />
    </div>
  ),
};
