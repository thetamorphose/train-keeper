---
id: task-2026-10-21-002
title: "Record owner decisions on governance migration questions"
status: done
created: "2026-10-21T05:21:18Z"
updated: "2026-10-21T05:22:45Z"
hermes_sessions: ["20261021_074908_cf4a49"]
skill_version: "product-agent-governance@0.4.0"
tags: ["chore"]
checkpoint:
  git_head: "5849928d5e94b95fd5e3835d6d06b5674e1611b8"
  git_status_clean: true
  backup_ref: ""
result:
  commits: ["520c113"]
  files_changed: ["docs/adr/0006-core-domain-stays-supporting.md", "docs/core-proposals/2026-10-21-core-proposal.md", "docs/agdr/0001-governance-v0-4-0-migration.md", ".cursorrules", "tech-debt.md"]
  test_command: "python tools/ai-agent-governance/scripts/validate_governance.py --project-root . --strict"
  test_result: "VALIDATION_OK tasks=2 warnings=0 (2026-10-21)"
related:
  specs: []
  adr: ["docs/adr/0006-core-domain-stays-supporting.md"]
  agdr: ["docs/agdr/0001-governance-v0-4-0-migration.md"]
  bugs: []
---

# Record owner decisions on governance migration questions

## Input

Owner gate answers for the two questions left open by `task-2026-10-21-001` (AgDR-0001, 2026-10-21):
1. Set (подход) language - "принять реализованную формулировку";
2. Core Domain proposal - "отклонить строку";
plus approval to push the migration branch and open a PR.

## Acceptance criteria
- [x] Both owner decisions are recorded on the record trail: ADR-0006, AgDR-0001 owner questions closed, proposal rows marked
- [x] `CORE.md` stays "None declared" (all modules supporting domain), as decided
- [x] The "NO SETS" contradiction in `.cursorrules` is corrected to the confirmed Set wording
- [x] `validate_governance.py --strict` passes (VALIDATION_OK, 0 warnings)

## Output

ADR-0006 (`docs/adr/0006-core-domain-stays-supporting.md`) records both decisions: the `propose_core.py` row `__tests__` is rejected and Core Domain stays unclassified (promotion only by a future owner ADR); the Set wording from `docs/constitution.md` is confirmed as the ubiquitous language. The proposal file carries "rejected (2026-10-21, ADR-0006)" on the row, AgDR-0001's owner questions carry the decisions, TD-002 notes the corrected line. Work commit `520c113`; the branch is then pushed to `origin` and a PR into `main` is opened (per ADR-0002 flow, merging stays with the owner).

## Rollback

Revert commit `520c113` (documentation only).
