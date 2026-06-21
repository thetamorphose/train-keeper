# Changelog: Train Keeper

All notable changes to this project will be documented in this file.

## [Unreleased]
### Added
- Section Management in Build Mode:
  - Add new sections with a default exercise via the `+` button in the dots navigation.
  - Automatic deletion of empty sections when the last exercise is removed.
  - Smart focus management after section addition or deletion.
- Amvera.ru Deployment Integration:
  - Created `amvera.yml` config specifying Node.js 20, starting script (`server.js`), and port 3000.
  - Implemented dynamic database path resolution in `server.js` to automatically use Amvera's persistent volume `/data` when available, protecting workout history from dataloss.
  - Added ADR 0005 documenting the deployment architecture and database migration steps.
- Comprehensive AI Documentation system (`GEMINI.md`, `.cursorrules`, `docs/ai/`).
- Architectural mapping and LowDB schema definition.
- Interactive Lo-Fi prototypes for Focus Mode (from previous session).
- Project Roadmap and User Flows documentation.
- ADR system for recording technical decisions.
- Initial Jest test suite with sanity test to fix CI pipeline.
