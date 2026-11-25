# Armory law-school course migration

The nine courses were restored through the existing WordPress curriculum builder as new draft programmes on November 24, 2026 (America/Chicago). Existing programmes and enrollments were not replaced. No CLE credit was assigned.

| Course | WordPress programme |
| --- | --- |
| Business Associations | 179 |
| Criminal Procedure | 221 |
| Evidence | 275 |
| Professional Responsibility | 386 |
| Property | 479 |
| Criminal Law | 524 |
| Contracts | 569 |
| Torts | 620 |
| Civil Procedure | 671 |

`src/lib/study-courses.ts` maps the hosted interactive rooms to these programmes. WordPress remains the authority for enrollment and staff access. The WordPress lessons contain all structured source material and native practice quizzes; `/study/[subject]` preserves the original themed presentation, custom exercises, course maps, soundtracks and the Evidence admission flowchart. These presentations and their question banks are versioned here: edit them alongside the corresponding WordPress lessons to keep both views consistent.

The migration preserves 172 sections, 446 questions and their answers/explanations, and 138 case briefs. All nine rooms have local links. External citations still open their original authorities; recordings originally available only through Suno retain those links.

All 103 original illustration/audio files are in `apps/web/course-assets`, outside `public`. SHA-256 checks against the staged source manifest matched every file. The protected streaming route supports audio ranges and requires course access; shared media is available to participants in this nine-course library and teaching staff. Answer keys are returned only after the same WordPress programme-access check. Staff preview is honored by WordPress, never by a client-provided role.

Source: Edward Schmalz's staged legal-renaissance.com project. Source restrictions were preserved through Armory authentication and enrollment. Neither source files nor credentials are exposed as public downloads. No law or legal analysis was updated as part of migration.

Validation: production build, TypeScript and ESLint; all nine room headings and no legal-renaissance.com links; quiz answer selection, grading and explanations; Evidence flowchart selection; local illustration response and audio-player source; anonymous media and answer-key denial. Existing imported-source image/unused-variable lint warnings remain non-blocking.
