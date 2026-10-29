---
id: task-2026-10-29-009
title: "Add 3 ubiquitous-language terms from tasks 006-008 to the constitution"
status: done
created: "2026-10-29T14:00:11Z"
updated: "2026-10-29T14:00:11Z"
hermes_sessions: ["20261029_134711_abc123"]
skill_version: "product-agent-governance@0.4.0"
tags: ["chore"]
checkpoint:
  git_head: "d051e914caaa20b6b6cf25cd5030f7d9881c4e17"
  git_status_clean: false
  backup_ref: ""
result:
  commits: [46e3330]
  files_changed: ["docs/constitution.md", "tasks/2026-10-29-009-add-3-ubiquitous-language-terms-from-tasks-006-008-to-the-co.md", "logs/task-session-map.yml", "docs/progress.md"]
  test_command: "python tools/ai-agent-governance/scripts/validate_governance.py --project-root . --strict"
  test_result: "VALIDATION_OK (docs-only task; no application code changed, npm suite untouched)"
related:
  specs: []
  adr: []
  agdr: []
  bugs: []
---

# Add 3 ubiquitous-language terms from tasks 006-008 to the constitution

## Input

- Owner request (2026-10-29): propose new glossary terms from the backlog items implemented in this
  session; owner accepted 3 of the 6 proposals («убери последние 3 термина... из предложенных тобой»):
  Disabled, Session feedback, Technique notes. Rejected: Section time, Collapsed header, In-flow button
  (UI conventions, not domain language).

## Acceptance criteria

- [x] 3 rows appended to the ubiquitous-language table in `docs/constitution.md` with disallowed synonyms
- [x] Rejected terms not added
- [x] No application code changed; validator green

## Output

3 rows appended to `docs/constitution.md`: Disabled (Выключено) — distinguishes owner-disabled
exercises from Skipped (execution status); Session feedback (Отметка о подходе) — transient per-session
comment + emoji rating, reset between workouts; Technique notes (Заметки по технике) — persistent
exercise text, contrasted with Session feedback.

## Rollback

`git revert` the commits of this task removes the 3 glossary rows.
