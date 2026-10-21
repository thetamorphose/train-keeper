# Owner Guide: How to Use the Governance Toolkit

This guide answers one question: **what do you, the product owner, need to do so that any AI agent (Hermes, Claude Code, Codex, Cursor) actually applies the workflow described in this tool?**

The tool does the heavy lifting. Your job is four things: **set up once, state intent, decide at gates, accept at close-out.** Budget: 10–15 minutes per day.

---

## 1. One-time setup per project (15–20 min, once)

```bash
# From your project root, with the tool vendored at tools/ai-agent-governance
python tools/ai-agent-governance/scripts/init_governance.py --project-root . --project-id <your-project-id>
```

Vendor the subset `SKILL.md`, `scripts/`, `templates/`, `VERSION`, `LICENSE` (~40 KB) into `tools/ai-agent-governance/`; the tool's `tests/` and `docs/` stay in the tool repository.

Then fill in **two files that only you can write** — the agent cannot invent them:

| File | What you write | Source |
|---|---|---|
| `docs/constitution.md` → *Domain vision* | 1 page: what makes this product unique. No UI, no tech. | Your Domain Vision Statement practice |
| `docs/constitution.md` → *Ubiquitous language* | The term table: 5–15 core terms, their strict meanings, forbidden synonyms | Your Ubiquitous Language practice |
| `CORE.md` | Which paths are Core Domain (change requires your approval) — **you don't derive this alone**: run the proposer and accept/reject its rows (see below) | Your Distillation / Flagged Core practice |

### Discovering the Core Domain (owner time: ~10 min)

The tool **proposes** Core Domain candidates from objective signals; you **decide**:

```bash
python tools/ai-agent-governance/scripts/propose_core.py --project-root .
```

It scans top-level modules, scores them (ubiquitous-language term density, domain-type definitions, generic-name penalty) and writes `docs/core-proposals/<date>-core-proposal.md` — one row per module with evidence. **Nothing enters `CORE.md` automatically.** You mark each row accept/reject based on business value (your judgment, not the score); the agent then applies accepted rows to `CORE.md` and writes an ADR per promoted path. Re-runs show only new candidates — you review deltas.

Two consequences:

1. The proposer is only as good as your term table — fill *Ubiquitous language* before trusting suggestions (the proposal warns you if the table is empty).
2. Rows marked `likely-supporting` are your Generic Subdomains: hand their implementation fully to the agent and don't spend review time there.

Everything else (`tasks/`, `bugs/`, `docs/adr/`, architecture diagrams, logs) the agent maintains.

> If the constitution is not filled in, the workflow still runs, but the agent has no "why" — expect generic proposals. Ten minutes here saves hours of correction later.

## 2. How agents find the workflow

The tool is discovered two ways, no manual pointing needed:

1. **Hermes**: the skill is in your profile (`skills/` or project `.hermes/skills/`); its description triggers automatically on feature/refactor/bugfix requests.
2. **Any agent**: the project's `AGENTS.md` (created by init) points to `SKILL.md` as the canonical workflow. Agents that read AGENTS.md (Codex, Cursor, Aider, Claude Code) pick it up on their own.

If an agent ignores it, one sentence fixes the session: *"Follow `tools/ai-agent-governance/SKILL.md` for this task."*

## 3. Working a feature — your role at each gate

The agent runs the pipeline; you appear at exactly four gates.

### Gate 0 — You state intent (write-first, ~15 min)
Before any agent session, write the feature as one paragraph:

> **We believe [change] will produce [outcome] because [reason].**

If you can't write this sentence, you don't understand the task yet — no agent should start. This becomes the head of `spec.md`.

### Gate 1 — You review the plan (5 min)
For anything bigger than a one-file fix, the agent must produce `specs/NNN-<slug>/` with `spec.md`, `plan.md`, `tasks.md` **before code**. Review only `plan.md`:

- **Architecture linkage** section — does it reference the right constitution sections, bounded contexts, existing ADRs? This is the docking point between the new feature and the existing system. If the agent writes "nothing to reference" and proceeds — reject; the rule is: *no linkage → architecture discussion first*.
- **Core Domain check** — if it touches a path in `CORE.md`, it needs your explicit approval.

### Gate 2 — You decide business questions only (2–5 min, sporadic)
You are asked only about business matters: domain vision, ubiquitous language, Core Domain, business rules, AC/scope, public UX contract. Everything technical — database, framework, libraries, internal contracts, deployment, refactoring — the agent decides by itself and records as an AgDR (recording != approval). You see those technical decisions only if you want to (they live in `docs/agdr/` and in the task record); your veto is possible at Gate 3. Business decisions become ADR — you never write decision records, you only make decisions.

### Gate 3 — You accept the business result (5–10 min)
Don't review code line-by-line. Review the business outcome and the governance diff:

- Acceptance criteria — did the work deliver what you asked (AC checkboxes in the task record and spec)?
- Core Domain — was anything touched that is listed in `CORE.md` without your approval?
- New/changed ADR (your business decisions) — accept or reject. AgDR records are agent-owned; you may veto any technical decision here.
- `docs/constitution.md` — did the language drift? If a term changed meaning, the model changed, and code must be renamed in the same commit.
- Bugs — triage anything new in `bugs/inbox/` (priority/severity/status are always yours).
- `docs/architecture/*` diagrams — do they match what was built?

## 4. Working a bugfix — the short path

One-file/local fixes skip specs entirely: the agent creates only a task record (checkpoint → fix → test → record). If the agent detects a new defect along the way, it files a draft in `bugs/inbox/`. **Triage (priority, severity, status) is always yours** — the agent is never its own judge.

## 5. Keeping the system honest (weekly, 10 min)

```bash
python tools/ai-agent-governance/scripts/validate_governance.py --project-root . --strict
```

- Errors = broken artifacts, fix immediately.
- Warnings = drift signals (feature task without specs, plan without Architecture linkage). Treat them as a to-do list for the next session.

Skim `docs/constitution.md` at the start of each work cycle. If it passed ~3000 words, tell the agent to split it per ADR-0002 — don't let the memory bank rot.

## 6. What the agent does without you (don't do these manually)

- Task records, checkpoints, commit trailers (`Task: <task-id>`)
- Spec/plan/tasks drafts from your intent paragraph
- Core Domain candidate proposals (`propose_core.py`) — you only accept/reject rows
- ADR and AgDR documents (after your decisions)
- Mermaid architecture diagrams, updated in the same commit as structural changes
- Bug drafts in `bugs/inbox/`
- Redacted audit-log export from Hermes `state.db` (read-only)
- `tech-debt.md` entries for violations it found but is forbidden to refactor autonomously
- All technical decisions — database, framework, libraries, internal contracts, deployment, refactoring — recorded as AgDR without waiting for you

## 7. Red lines (both sides)

- The agent never modifies Hermes core — governance lives in project files only.
- The agent never refactors architectural debt on its own — it registers and proposes.
- The agent stops (doesn't guess) when domain terminology is missing — that's your signal to extend the Ubiquitous Language table.
- You never let a structural change land without its doc update in the same commit — that's the one rule that keeps the whole system from decaying.

---

*Decisions behind this guide: [ADR-0001](adr/0001-spec-templates-architecture-linkage.md), [ADR-0002](adr/0002-memory-bank-definition-of-done.md), [ADR-0003](adr/0003-spec-first-not-spec-as-source.md), [ADR-0004](adr/0004-core-domain-proposer.md), [ADR-0005](adr/0005-owner-gates-business-only.md).*
