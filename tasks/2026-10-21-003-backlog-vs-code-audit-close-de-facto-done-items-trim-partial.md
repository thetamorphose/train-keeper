---
id: task-2026-10-21-003
title: "Backlog vs code audit: close de-facto done items, trim partials"
status: in_progress
created: "2026-10-21T12:42:28Z"
updated: "2026-10-21T12:55:00Z"
hermes_sessions: ["20261021_153710_21176d"]
skill_version: "product-agent-governance@0.4.0"
tags: ["chore"]
checkpoint:
  git_head: "dd549d1e666b2c82643358b3892dcc042119dd84"
  git_status_clean: false
  backup_ref: ""
result:
  commits: []
  files_changed: []
  test_command: "npm run test"
  test_result: ""
related:
  specs: []
  adr: []
  agdr: []
  bugs: []
---

# Backlog vs code audit: close de-facto done items, trim partials

## Input

- Owner's directive in Hermes session `20261021_153710_21176d` (2026-10-21): after the
  agent presented the backlog-vs-code analysis, the owner approved the recommended
  action with «сделай» — formally close the backlog items already implemented before
  governance adoption, and trim partial items to their remaining scope.
- Sources: `BACKLOG.md` (16 open items, migrated from `docs/roadmap-legacy.md` by
  task-2026-10-21-001), code inspection of `server.js`, `tk-focus.js`, `tk-focus.css`,
  `tk-styles.css`, `tweaks-panel.jsx`, `tk-focus-tweaks.jsx`, `__tests__/`, `GEMINI.md`.
- Decision class: business (backlog scope) — decided by the owner's approval of the
  presented recommendation, not by the agent silently.

## Acceptance criteria

- [ ] Items closed as de-facto done and removed from `BACKLOG.md` (moved here per backlog protocol):
      Basic API for Workout Management (CRUD); Duplicate/Edit Exercise Card; Real-time Tweaks panel.
- [ ] Partial items trimmed in `BACKLOG.md` to the remaining scope only: Dynamic Field Management
      (duplication of fields remains); Workout history & analytics (analytics remains);
      Exercise library / templates (library remains).
- [ ] Every closed/trimmed claim carries code evidence (file:line) recorded in Output.
- [ ] `npm run test` green; `validate_governance.py --strict` green; `docs/progress.md` regenerated.
- [ ] No changes to application code; `IDEA.md` (unrelated untracked file) not committed.

## Output

Audit of 16 open backlog items against the codebase (pre-governance work was never closed formally):

Closed as done (evidence):
1. Basic API for Workout Management (CRUD) — `server.js` routes: `GET /api/templates` (L66),
   `POST /api/templates` (L73), `PUT /api/templates/:id` (L90), `DELETE /api/templates/:id` (L103),
   plus `GET/POST /api/history` (L46, L56); workouts are persisted through this API
   (`tkLogic.saveTemplate` calls in `tk-focus.js`); covered by `__tests__/templates-api.test.js`.
2. Duplicate/Edit Exercise Card — `tk-focus.js` L350 (Дублировать/Изменить/Удалить buttons),
   L902 `case 'dup'` (deep clone, fresh ids for card and fields, saveTemplate), L903 `case 'edit'`.
3. Real-time Tweaks panel — `tweaks-panel.jsx` + `tk-focus-tweaks.jsx` loaded by
   `Train Keeper - Фокус.html` L84–85; mounted via `ReactDOM.createRoot(document.getElementById('panel-root'))`
   (`tk-focus-tweaks.jsx` L44); live CSS-variable updates through `useTweaks`;
   persisted to localStorage (`tk_focus_v3`, `tk_focus_v3_draft`).

Trimmed to remaining scope:
4. Dynamic Field Management — done: add (`addfield`, `tk-focus.js` L342, L900), remove
   (`rmfield`, L272, L899), edit value/label (`val`/`label`/`text` actions); remaining: field duplication.
5. Workout history & analytics — done: history save (`/api/history` POST, `tk-focus.js` L653),
   list and view (`h-list`/`viewhistory`, L470–477, L820); remaining: analytics.
6. Exercise library / templates — done: workout-template CRUD (see item 1); remaining: exercise library.

Left unchanged (verified absent in code): Context-7 refactor, Meta-Skill, glossary expansion,
Next Section logic, auto-progression, smart plan adjustment, glassmorphism (only 2 ad-hoc
`backdrop-filter` uses in `tk-focus.css` L230–231 — noted on the backlog line), mobile-first,
auth & sync, offline/service worker (0 matches).

Not specced (no `specs/NNN/`): audit-only chore, no new feature work.
No AgDR: no technical choice between >=2 alternatives was made; all classifications rest on
direct code evidence and the owner's approved recommendation.

## Rollback

`git revert` the two commits of this task restores the 16-item `BACKLOG.md` and the prior
`docs/progress.md`; no code was touched.
