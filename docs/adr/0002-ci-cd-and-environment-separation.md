# ADR 0002: CI/CD Workflow and Environment Separation

## Status
Accepted

## Context
As the project moves towards having real users, we need to ensure that development activities do not interfere with production data. We also need a way to ensure code quality before merging changes into the main codebase.

## Decisions

### 1. Branching Strategy (GitHub Flow)
We will follow a simplified **GitHub Flow**:
- **`main`**: The "sacred" branch. Contains production-ready code. No direct commits allowed.
- **`feature/*` or `bugfix/*`**: Temporary branches for new features or fixes.
- **Pull Requests (PRs)**: All changes to `main` must happen via a Pull Request from a feature branch.

### 2. Environment Separation
We use `NODE_ENV` to separate data files:
- **Production (`NODE_ENV=production` or unset)**: Uses `history.json`.
- **Development (`NODE_ENV=development`)**: Uses `history.dev.json`.
- **Testing (`NODE_ENV=test`)**: Uses `history.test.json`.

### 3. Git Ignores
All `*.json` database files are excluded from Git (via `.gitignore`) to protect user privacy and prevent data loss during code updates.

### 4. Automated Testing (CI)
GitHub Actions is configured to run `npm test` on every Pull Request to `main`. 
- If tests fail, merging is blocked.
- This ensures that new releases do not break existing functionality.

### 5. Safe Deployment Process
1. Develop in a `feature/` branch.
2. Open a Pull Request to `main`.
3. Wait for GitHub Actions (CI) to turn green.
4. Merge the PR.
5. On the server (local host), pull the latest `main` branch.
6. Restart the server.

## Consequences
- Developers must use `npm run dev` for local work.
- Real user data remains safe in `history.json` and is never overwritten by test data.
- Increased confidence in code quality due to mandatory CI checks.
