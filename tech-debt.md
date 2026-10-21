# Technical Debt Register

| ID | Status | Paths | Evidence | Proposed action | Owner decision |
|---|---|---|---|---|---|
| TD-001 | open | `node_modules/`, `.gitignore`, `package-lock.json` | `node_modules/` is gitignored yet hundreds of dependency files remain tracked; the tracked subset does not match the lockfile, so a fresh clone cannot run `npm test` until `npm install` (cross-env and others were missing) | `git rm -r --cached node_modules` and rely on `npm install`; keep the lockfile as the source of dependency truth | pending |
| TD-002 | open | `.cursorrules`, `GEMINI.md`, `.tdd-gate-passed` | Pre-governance agent-rule files duplicate each other and drift (e.g. `.cursorrules` says "NO SETS" while `GEMINI.md` and the implemented code treat sets as optional subtasks); `.tdd-gate-passed` is an empty marker from the retired TDD gate | Consolidate rules into `docs/constitution.md` + `AGENTS.md`, delete the duplicates and the marker | "NO SETS" line replaced under ADR-0006 (2026-10-21); rest pending |
| TD-003 | open | `claudecopycchat`, `INTERVIEW_STATE.md`, `AI_CONCEPT_RESULT.md`, `uploads/` | Session/design artifacts sit in the repository root and mix with source files | Move to `docs/history/` (or drop from version control) in a dedicated task | pending |
