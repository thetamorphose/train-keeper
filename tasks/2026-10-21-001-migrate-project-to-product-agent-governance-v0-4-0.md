---
id: task-2026-10-21-001
title: "Migrate project to product-agent-governance v0.4.0"
status: done
created: "2026-10-21T04:59:49Z"
updated: "2026-10-21T05:07:45Z"
hermes_sessions: ["20261021_074908_cf4a49"]
skill_version: "product-agent-governance@0.4.0"
tags: ["chore"]
checkpoint:
  git_head: "6bb7fbee3d4382cddd77a6e839d21599954bcc2e"
  git_status_clean: false
  backup_ref: ""
result:
  commits: ["5bfaa9e"]
  files_changed: ["tools/ai-agent-governance/**", ".governance.yml", "AGENTS.md", "BACKLOG.md", "CORE.md", "tech-debt.md", "docs/constitution.md", "docs/adr/**", "docs/agdr/**", "docs/architecture/**", "docs/contexts/**", "docs/core-proposals/2026-10-21-core-proposal.md", "docs/roadmap-legacy.md", "tasks/index.md", "bugs/index.md", "logs/exports/export-state.json", ".gitattributes", ".gitignore", ".cursorrules", "GEMINI.md"]
  test_command: "npm test"
  test_result: "Test Suites: 9 passed, 9 total; Tests: 49 passed, 49 total (2026-10-21)"
related:
  specs: []
  adr: []
  agdr: ["docs/agdr/0001-governance-v0-4-0-migration.md"]
  bugs: []
---

# Migrate project to product-agent-governance v0.4.0

## Input

Owner request (2026-10-21): migrate `train-keeper` to the current `product-agent-governance` version. Inspection showed the project had no vendored tool at all (last commit 2026-07-02 predates the tool) - only a pre-governance AI workflow (`.cursorrules`, `GEMINI.md`, `.agents/skills/tdd`, `.tdd-gate-passed`, `docs/ai/`). The migration is therefore a fresh adoption of v0.4.0 (upstream HEAD 883919f) plus consolidation of the legacy documents; decisions in `docs/agdr/0001-governance-v0-4-0-migration.md`.

## Acceptance criteria
- [x] Product-agent-governance v0.4.0 is active in the project (`tools/ai-agent-governance/`, `.governance.yml` with `tool_version: '0.4.0'`)
- [x] Legacy `docs/ai/` artifacts are consolidated into the governance structure (`docs/adr`, `docs/architecture`, `docs/roadmap-legacy.md`), with references updated
- [x] `docs/constitution.md`, `BACKLOG.md` and `tech-debt.md` are filled from the legacy documentation (roadmap open items moved into the backlog)
- [x] `npm test` is green (9 suites / 49 tests)
- [x] `validate_governance.py --strict` passes with no ERROR and no WARNING

## Output

Migration executed on branch `chore/governance-v0.4.0-migration` (base `6bb7fbe`). Work commit `5bfaa9e` carries the vendored tool subset, the seeded governance registers, the legacy document moves (ADR 0001-0005 to `docs/adr/`, `ARCHITECTURE.md` to `docs/architecture/system.md`, `DATA_MODEL.md` to `docs/architecture/data-model.md`, `ROADMAP.md` frozen to `docs/roadmap-legacy.md` with its 16 open items moved to `BACKLOG.md`), the transcribed constitution, debt entries TD-001..003 and AgDR-0001.

Test baseline before the migration was identical (9 suites / 49 tests) after `npm install` - a fresh clone cannot run tests directly because the tracked `node_modules` subset is incomplete (TD-001).

Open owner questions (AgDR-0001): (1) the "Set (подход)" language row vs the "NO SETS" line in `.cursorrules` - recommendation: keep the implemented meaning (optional subtask), fix the stale line in the TD-002 cleanup; (2) Core Domain classification - `docs/core-proposals/2026-10-21-core-proposal.md` proposes only `__tests__` as likely-supporting because the scanner examines top-level directories only and missed the flat modules (`server.js`, `tk-focus.js`, `tk-app.js`).

## Rollback

`git checkout main && git branch -D chore/governance-v0.4.0-migration` - the migration is pure documentation/tooling, no application code or data touched.
