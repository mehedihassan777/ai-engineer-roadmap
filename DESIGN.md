# Design notes

The UI follows the `frontend-design` skill in `.claude/skills/frontend-design/` (copied from
[anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/frontend-design), Apache 2.0).
Read it before changing how the app looks; this file is the plan it asked for, so later changes stay consistent.

## Brief

- **Subject:** one working engineer's 24-week study plan toward AI engineering.
- **Audience:** that engineer, every day, on a laptop and a phone.
- **Primary job:** "what do I do now, and how far along am I?"

## Concept: a study logbook with a highlighter

Paper, ink and one highlighter. Ink blue is for things you can act on (links, buttons, checkboxes).
The yellow highlighter means **now** and only now: the current week and "you are here". Nothing else is yellow.

The one memorable element is the **route** on the dashboard: all 24 weeks as a numbered row under their four
phases, each cell filled as the week gets done, the current week highlighted. Weeks really are a sequence, so
numbering is earned. Everything around it stays quiet.

## Tokens (`src/app/globals.css`)

| Token | Light | Dark | Use |
|---|---|---|---|
| `background` (paper) | `#F2F4F1` | `#13171E` | page and sidebar |
| `surface` | `#FCFDFB` | `#1A2029` | panels that hold interactive lists |
| `line` | `#D7DDD5` | `#2C3544` | rules and borders |
| `foreground` (ink) | `#17213A` | `#E5E9EF` | text |
| `muted` | `#566175` | `#9AA4B3` | secondary text |
| `accent` (ink blue) | `#2A46C2` | `#93A7FF` | actions, links, focus |
| `highlight` (marker) | `#F6DE4C` | `#D8C048` | "now" only |

Track colours (violet, sky, amber, emerald, rose) stay: they identify tracks and come from `src/data/tracks.ts`.

## Type

- **Bricolage Grotesque** for headings and big numbers (`font-display`). Tight tracking, real weight contrast.
- **Atkinson Hyperlegible Next** for everything else (`font-sans`): designed for legibility, which matters for
  long task descriptions read late in the evening.
- Scale: 13 / 15 / 18 / 24 / 36 / 56 px. Body text 15 px, line length under 80 characters.

## Layout and rules

- Left sidebar on paper, separated by one rule; mobile gets a top bar and a drawer.
- Not everything is a card. Panels (border, 10 px radius, no shadow) only wrap interactive lists such as a
  week's tasks. Summaries like progress by track or phase are ruled lists straight on the paper.
- Controls use a 6 px radius; panels 10 px; only status dots and badges are round.
- Labels are sentence case. No all-caps eyebrows, no arrows appended to button text.
- Motion only in answer to an action (a bar filling after a tick). Reduced motion is respected.

## Review against the generic default

The first version was the default SaaS card kit: indigo accent, Geist, every section in an identical white card
with the same shadow, all-caps labels. Changed: palette is paper/ink/highlighter tied to studying; the
typefaces were chosen for this use; card chrome is reserved for task lists; the dashboard opens with the
route instead of a big percentage in a box.
