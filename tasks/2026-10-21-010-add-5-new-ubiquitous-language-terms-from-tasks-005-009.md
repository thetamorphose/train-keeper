---
id: task-2026-10-21-010
title: "Add 5 new ubiquitous-language terms from tasks 005-009"
status: done
created: "2026-10-21T14:53:48Z"
updated: "2026-10-21T14:53:48Z"
hermes_sessions: ["20261021_153710_21176d"]
skill_version: "product-agent-governance@0.4.0"
tags: ["chore"]
checkpoint:
  git_head: "b281facabb6df331cc4adfff3e20ef82a708b8a2"
  git_status_clean: false
  backup_ref: ""
result:
  commits: [84a6da7]
  files_changed: ["docs/constitution.md", "tasks/2026-10-21-010-add-5-new-ubiquitous-language-terms-from-tasks-005-009.md", "logs/task-session-map.yml", "docs/progress.md"]
  test_command: "python tools/ai-agent-governance/scripts/validate_governance.py --project-root . --strict"
  test_result: "VALIDATION_OK tasks=10 warnings=0"
related:
  specs: []
  adr: []
  agdr: []
  bugs: []
---

# Add 5 new ubiquitous-language terms from tasks 005-009

## Input

- Owner's request (2026-10-21): propose and add glossary terms based on the features implemented
  in tasks 2026-10-21-005…009.
- Owner gate (language): accepted all 5 proposed terms, explicitly rejected adding Fluid Utility.

## Acceptance criteria
- [x] 5 terms (Copy, Skipped, Closed, History entry, Settings page) added to the Ubiquitous language
      table in docs/constitution.md with meanings and disallowed synonyms
- [x] GEMINI.md not touched (owner keeps the legacy glossary unexpanded)
- [x] Validator green

## Output

Work commit `84a6da7`.
- `docs/constitution.md`, Ubiquitous language table: +5 rows after Well-being rating — Copy (Копия),
  Skipped (Пропущено), Closed (Закрыто), History entry (Запись истории), Settings page (Страница
  настроек), each with meaning and disallowed synonyms.
- Definitions encode the owner's decisions from tasks 005–009 (skipped does not count as done and
  does not block completion; closed = done || skipped; only rating/comment editable in history).
- Fluid Utility was proposed and explicitly rejected by the owner — not added.


## Rollback

`git revert` the task's commits restores the previous table.

