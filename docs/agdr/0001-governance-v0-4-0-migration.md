---
id: AgDR-0001
timestamp: "2026-10-21T05:03:58Z"
agent: "Hermes Agent"
model: "xiaomi/mimo-v2.6-pro"
trigger: user-prompt
decision_class: technical
owner_veto: false
status: executed
task_id: "task-2026-10-21-001"
---

<!-- AgDR records the agent's technical decision. It requires no approval (recording != approval); the owner may veto at Gate 3. -->

# Governance v0.4.0 migration: how the tool is adopted and legacy docs are consolidated

## Context

The owner asked to migrate `train-keeper` to the current `product-agent-governance` version. Inspection showed the project contains **no vendored copy of the tool** at all (the tool appeared upstream on 2026-08-19, after this repository's last commit of 2026-07-02). What exists is a pre-governance AI workflow: `.cursorrules`, `GEMINI.md`, a `/tdd` skill under `.agents/skills/tdd`, an empty `.tdd-gate-passed` marker, and a `docs/ai/` documentation set (ADR 0001-0005, ARCHITECTURE.md, DATA_MODEL.md, ROADMAP.md). There is no `.governance.yml`, no `tasks/`, `specs/`, `bugs/` registers and no validator.

## Options considered

| Option | Pros | Cons |
|---|---|---|
| A. Update a vendored copy in place (`init_governance.py --upgrade`) | The tool's own upgrade path | Impossible: there is no vendored copy and no `.governance.yml` to upgrade |
| B. Fresh adoption of v0.4.0 + consolidation of legacy docs into the governance structure | One documentation system, validator-green project, tool's upgrade path available for the future | Moves documented files, requires reference updates |
| C. Add governance alongside `docs/ai/` untouched | Least file movement | Two homes for the same facts, violating constitution principle 2; permanent drift |

## Decision

Option B, as one migration task (`task-2026-10-21-001`, tag `chore`):

1. Vendor subset at `tools/ai-agent-governance/` (SKILL.md, scripts/, templates/, VERSION, LICENSE, owner-guide.md) from the tool at v0.4.0 (upstream HEAD 883919f), matching the vendor subset documented in the tool CHANGELOG and the `hermes-model-advisor` precedent.
2. `init_governance.py --project-root . --project-id train-keeper` seeds the registers; `.governance.yml` carries `tool_version: '0.4.0'` (the `--upgrade` mode is reserved for future in-place version bumps).
3. Legacy consolidation: ADR 0001-0005 `docs/ai/ADR/` -> `docs/adr/` (names already conform); `docs/ai/ADR/ADR_TEMPLATE.md` deleted (superseded by `tools/ai-agent-governance/templates/adr.md`); `docs/ai/ARCHITECTURE.md` -> `docs/architecture/system.md`; `docs/ai/DATA_MODEL.md` -> `docs/architecture/data-model.md`; `docs/ai/ROADMAP.md` -> `docs/roadmap-legacy.md`, frozen with a banner, its open items moved (not copied) into `BACKLOG.md`. The `docs/ai/` tree is gone.
4. Rule-file references in `.cursorrules` and `GEMINI.md` updated to the new paths; content consolidation of those files is deferred to TD-002 (debt register), not done autonomously.
5. `docs/constitution.md` filled by transcription of the pre-governance documents (vision and language table), not by new business invention. The one internal contradiction is surfaced to the owner below.
6. Repository debt discovered during migration is recorded in `tech-debt.md` (TD-001..003), not fixed here.

## Consequences

- Future work runs the tool protocol: task records, spec-first features, ADR (owner) / AgDR (agent) routing, `docs/progress.md` regeneration, `validate_governance.py --strict`.
- Version bumps are now one command: `init_governance.py --project-root . --project-id train-keeper --upgrade`.
- Historical ADRs keep their numbers; a next owner ADR must take number 0006.
- `npm test` requires `npm install` first in a fresh clone (TD-001); the migration was verified against 9 suites / 49 tests green.

## Owner questions

1. **Set (подход) in the ubiquitous language.** `.cursorrules` states "NO SETS. Hierarchy is Workout -> Section -> Exercise", while `GEMINI.md`, the implemented `tkLogic` set-subtasks completion, and the original product request ("внутри тренировки должна быть возможность упражнение и количество подходов") all treat sets as optional subtasks. The constitution table records the implemented meaning: *Set = optional checkable subtask of an exercise; an exercise without sets behaves as a single task*. Recommendation: confirm this wording and drop the "NO SETS" line during the TD-002 cleanup. **Owner decision (2026-10-21): accepted - the implemented wording stands (ADR-0006); the "NO SETS" line is corrected.**
2. **Core Domain classification** - see the `docs/core-proposals/` proposal produced by `propose_core.py` in this task; rows await owner accept/reject (ADR required for any promotion). **Owner decision (2026-10-21): all rows rejected - everything stays supporting domain (ADR-0006).**
