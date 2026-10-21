---
id: task-2026-10-21-010
title: "Add 5 new ubiquitous-language terms from tasks 005-009"
status: planned
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
  commits: []
  files_changed: []
  test_command: ""
  test_result: ""
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
- [ ] 5 terms (Copy, Skipped, Closed, History entry, Settings page) added to the Ubiquitous language
      table in docs/constitution.md with meanings and disallowed synonyms
- [ ] GEMINI.md not touched (owner keeps the legacy glossary unexpanded)
- [ ] Validator green

## Output

(work commit pending)

## Rollback

`git revert` the task's commits restores the previous table.

