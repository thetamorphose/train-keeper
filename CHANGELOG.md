# Changelog: Train Keeper

All notable changes to this project will be documented in this file.

## [Unreleased]
### Added
- Habit Tracking checklist functionality:
  - Supports creating "habit lists" distinct from workout templates.
  - Merges Build and Focus/Active modes, allowing habits to be checked/skipped directly in build mode without starting a workout session.
  - Adds visual differentiation with type badges ("привычки" vs "тренировка").
  - Includes a "Сбросить отметки" button to clear completion statuses on habits and sets.
  - Integrates section-by-section completion navigation for habit lists.
  - Adds a finishing (summary) screen on final section completion, including well-being selection, comments, and saving to history (with hidden duration timer).
  - Automatically resets checklist states on the template upon completing and saving the checklist.
  - Exposes templates with `type: 'habit'` via POST and PUT API.
  - Covers habit checklist flows with automated tests in `__tests__/habits.test.js`.
- Optional Sets (Подходы) modeled as a Task-Subtask tree:
  - If the "Подходы" (Sets) field is present, the app initializes checkable set subtasks inside the exercise card.
  - Subtask sets inherit fields (weight, reps, time, etc.) from the parent exercise card.
  - Set completion statuses are toggled individually; the parent exercise is complete when all sets are done or skipped.
  - Adjusting the sets field size dynamically scales the subtasks list, preserving existing set progress.
  - Sets can be edited individually with compact field steppers and text inputs.
- Exercise Card Reordering in Build Mode:
  - Added "Переместить вверх" (Move Up) and "Переместить вниз" (Move Down) buttons inside the kebab menu (`⋯`) to easily swap exercise positions in Build Mode.
- Skipping Logic for Exercises and Sets:
  - Long press on a card (no sets) or set row (with sets) toggles a `skipped: true` status.
  - Skipped status is styled with muted colors and is mutually exclusive with done.
  - Skip status is displayed in the final summary table and factored into section completion.
- Workout and Exercise Description Fields:
  - Added a workout-level description field editable in Build Mode.
  - Added an exercise-level description/notes field editable in Build/Edit Mode and displayed read-only in Active Mode.
- TDD Tests Coverage:
  - Added `__tests__/exercise-sets.test.js` verifying the state changes of sets, reordering, skip, and notes logic.
- Navigation Back from Workout Preparation Screen:
  - Added a "← Назад" back button on the Workout Preparation screen (when in `build` mode).
  - Configured auto-saving to local storage and the server when returning from prep mode.
  - Reset activeTemplateId and section index state back to 0 on exit.
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
