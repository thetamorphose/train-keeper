---
name: product-agent-governance
description: Govern AI-agent work with portable project artifacts.
version: 0.4.0
author: Rodion Sido, Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [governance, ai-agents, architecture, audit, sdd]
    related_skills: []
---

# Product Agent Governance

This skill provides a file-first governance workflow for software projects built with AI agents. It uses Markdown, YAML frontmatter, JSONL and Git; it does not require a particular agent platform.

## When to Use

- A project needs traceability from request to code, decisions, bugs and audit events.
- An AI agent is about to implement a feature, module, architectural change or bug fix.
- You need to initialize or validate governance artifacts in a project.

Do not use it in chat-only environments where the agent cannot read and write the project filesystem.

## Non-Negotiable Boundary

**Never modify Hermes core** (the Hermes profile directory - see the session environment) while applying this skill. Work exclusively through this tool repository, target-project files, Git, portable Markdown/templates, and read-only export of Hermes `state.db`.

A request that needs a core patch is out of scope. Record it as a separate task/ADR; do not perform it as part of this workflow.

## Task Protocol

1. Read the target project's `AGENTS.md`, `CORE.md`, constitution, and the generated `docs/progress.md` (state overview: done / in progress / specs / open items). Read full primary records (task/bug files, spec files) only for the change you are about to make. Completion: relevant boundaries are known before edits.
2. Create a task with `scripts/create_task.py` if one does not exist. Record checkpoint, session mapping and category. Completion: task has a unique `task_id`.
3. If `CORE.md` declares no core paths, or the constitution changed since the last proposal, run `scripts/propose_core.py` and present the candidate table to the owner. Completion: owner accepted/rejected rows before any Core Domain implementation work.
4. For a one-file/local bugfix, use task-only flow. For a new feature or module, create `specs/NNN-<slug>/` from `templates/spec.md`, `templates/plan.md` and `templates/spec-tasks.md` before implementation. The plan's **Architecture linkage** section must reference at least one of: `docs/constitution.md`, `docs/contexts/*.yml`, existing `docs/adr/*`. If nothing can be referenced, stop and propose an architecture discussion (ADR with status `proposed`) before writing code. Decomposition threshold: a spec with more than 8 steps or a `tasks.md` over 8 KB splits into sub-specs under `specs/NNN/`, each with its own spec/plan/tasks, linked from the parent spec. Artifact limits: spec <= 8 KB, plan <= 6 KB, tasks <= 8 KB. Completion: scope follows the SDD threshold and docking is explicit.
5. Route every decision by class:

| Decision class | Who decides | What the agent does |
|---|---|---|
| Business: domain vision, ubiquitous language, Core Domain, business rules, AC/scope, public UX contract | Owner (gate) | Presents alternatives, waits for the decision, writes an ADR |
| Technical: database, framework, libraries, internal contracts, deployment, refactoring | Agent | Decides alone, records an AgDR (recording != approval); the owner may veto at Gate 3 |

AgDR threshold: a technical choice between >= 2 alternatives -> AgDR (recorded, no owner wait).
Completion: decision is recorded, not inferred.
6. Do not refactor discovered architectural debt autonomously. Add it to `tech-debt.md` and propose a separate task. Stop for clarification if ubiquitous language is missing.
7. After work, record actual files, commit hash, test command/result and linked records in the task, and run `scripts/gen_progress.py` so `docs/progress.md` is regenerated in the same commit. When closing (`status: done`), update `updated` and fill the Acceptance-criteria checkboxes; record the result in the step commit or in one close-out commit - never in separate bookkeeping commits. Update Mermaid architecture docs whenever a structural change occurred. Update `docs/constitution.md` whenever language, vision or principles changed — this is part of the Definition of Done, not an afterthought. Completion: task is auditable and the memory bank reflects reality.
8. If an error is discovered, create a bug draft under `bugs/inbox/`; only the owner triages priority/status. Completion: defect is not lost in chat.
9. Run `validate_governance.py`. Export Hermes events only through the read-only exporter and review redacted log diffs before committing. Completion: validation passes and no raw known secret is present.

## Quick Reference

Run via `terminal` from the target project root:

```bash
python tools/ai-agent-governance/scripts/init_governance.py --project-root . --project-id <id> --mode dry-run
python tools/ai-agent-governance/scripts/gen_progress.py --project-root .   # first run right after init
python tools/ai-agent-governance/scripts/create_task.py --project-root . --title "<title>" --tag feature --session-id <session-id>
python tools/ai-agent-governance/scripts/propose_core.py --project-root . --mode dry-run
python tools/ai-agent-governance/scripts/validate_governance.py --project-root . --strict
python tools/ai-agent-governance/scripts/export_hermes_session.py --project-root . --state-db <path-to-state.db> --dry-run
```

## Pitfalls

- `session_id` is not a business `task_id`; maintain `logs/task-session-map.yml`.
- Read `state.db` only with SQLite read-only mode. Missing columns mean unknown values, never fabricated metrics.
- Redaction reduces risk but cannot prove all secrets are absent; inspect the first log diff of each new format.
- Do not mix governance work with unrelated dirty changes. Use a dedicated Git worktree.
- Specs are **spec-first and minimal, never spec-as-source** (see ADR-0003). A spec lives for the duration of the change; durable truth lives in constitution, ADR, architecture docs, code and tests. Write the minimum that removes ambiguity — a spec is not system documentation.
- `docs/constitution.md` is the project's memory bank. If it grows past ~3000 words, split it per ADR-0002 instead of letting it rot: stable architecture moves to `docs/architecture/system.md`, current state to `docs/progress.md`.
- `propose_core.py` suggests, never decides (see ADR-0004). Core Domain promotion happens only through owner-accepted rows plus an ADR. If the constitution term table is empty, the proposer's signals degrade — fill the table before trusting suggestions.
- `docs/progress.md` is generated by `gen_progress.py`, never edited by hand. Its `--check` (used by the validator) compares everything except the git-activity snapshot, which trails the last commit by design.
- Vendor subset for product repositories: `SKILL.md`, `scripts/`, `templates/`, `VERSION`, `LICENSE` (~40 KB). The tool's `tests/` and `docs/` stay in the tool repository.

## Verification

- `validate_governance.py --strict` exits `0`.
- `gen_progress.py --check` exits `0` (`docs/progress.md` is fresh).
- A completed task references its checkpoint, commit and test result.
- Re-exporting the same state creates no duplicate `event_id` values.
- `git diff -- <logs path>` contains no known raw secret patterns.
