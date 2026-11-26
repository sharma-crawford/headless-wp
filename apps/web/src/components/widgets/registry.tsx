import dynamic from "next/dynamic";
import type { ComponentType } from "react";

import "@/components/study/courses/study.css";
import "@/components/study/courses/evidence/admission/admission.css";

/**
 * The widgets a lesson can place by key: `[[widget:corporate-veil-tabs]]` on a
 * line of its own in the builder.
 *
 * A widget is code a developer wrote, so this list is a developer's: an author
 * can place a widget but cannot make one. A key not listed here draws nothing,
 * so a body written for a widget that has not shipped yet still renders. To add
 * one, write the component and add its key below; nothing else changes.
 *
 * Each is loaded only on a page that places it (next/dynamic), so a lesson
 * without widgets pays nothing for the ones that exist. Widgets must not carry
 * anything an unenrolled reader should not see: they are drawn inside lesson
 * bodies, which the plugin has already gated.
 */
const CorporateVeilTabs = dynamic(() => import("@/components/study/courses/business-associations/corporate-veil-tabs"));
const PracticeScenario = dynamic(() => import("@/components/study/courses/business-associations/practice-scenario"));
const AdmissionFlow = dynamic(() => import("@/components/study/courses/evidence/admission/admission-flow"));

/** The look the room widgets were written against (study.css scopes to `.study`). */
function inStudy(Widget: ComponentType): ComponentType {
  return function StudyWidget() {
    return (
      <div className="study">
        <Widget />
      </div>
    );
  };
}

export const WIDGETS: Record<string, ComponentType> = {
  "corporate-veil-tabs": inStudy(CorporateVeilTabs),
  "business-associations-practice": inStudy(PracticeScenario),
  "evidence-admission-flowchart": inStudy(AdmissionFlow),
};
