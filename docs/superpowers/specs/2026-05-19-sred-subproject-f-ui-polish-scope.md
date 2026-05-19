# Sub-project F: UI Polish — Scope Notes

> This file captures the agreed scope for Sub-project F brainstorming.
> A full spec + plan has NOT been written yet — this is the starting point.
> To continue: start a new brainstorming session with this file as context.

## Items to address

1. **Quarterly timeline projections** — Q1–Q4 tabs currently show no projected value (only YTD does). Decide whether all tabs show a full-year projection on the right KPI, or only YTD.

2. **SredProjectsBar UX** — project name labels get cut off when segments are narrow. Fix: minimum segment width + tooltip on hover showing full project name + value.

3. **Drilled project header** — when drilled into a project, show the total value for that project in the header so the user has context while viewing employee breakdown.

4. **Employee modal fixes:**
   - Make it bigger / more spacious
   - Fix date display format (inconsistent)
   - Rename "SR&ED Hours" label → "SR&ED Value" (since in expenditures/credits mode it's not hours)
   - Bug: in expenditures mode, the SR&ED stat shows the wrong number (hours count displayed as cost)
   - Credits mode currently shows nothing in the SR&ED stat — needs to be wired up

5. **Staff salary table** — add column sorting; remove the "Special Employee" column

6. **Info tooltips** — `(i)` icon next to KPI labels (e.g., "Current YTD SR&ED") explaining what the value means

7. **Inter font** — apply globally across the app

## How to start the brainstorm

Start Claude Code from `/Users/kevinciang/Documents/Sredio` and use this prompt:

> I want to brainstorm Sub-project F (UI polish) for the SR&ED dashboard. The scope is in `docs/superpowers/specs/2026-05-19-sred-subproject-f-ui-polish-scope.md`. Use the brainstorming skill.
