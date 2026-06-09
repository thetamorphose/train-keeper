# AI Coding Rules & Project Guidelines: Train Keeper

## 🚀 Tech Stack
- **Backend:** Node.js, Express, LowDB (JSON-based database).
- **Frontend:** Vanilla JavaScript, JSX (for UI components), Vanilla CSS.
- **Testing:** Jest (TDD Workflow).
- **Architecture:** Minimalist, functional, no heavy frameworks.

## 🎨 Design System: "Fluid Utility"
Follow these visual guidelines for all UI generation:
- **Metaphor:** "Crystal Stream" (Transparency, flow, no pressure).
- **Styles:** Glassmorphism, soft organic shapes, blurred ethereal backgrounds.
- **Components:** High border-radius (16px to 24px) for all cards and buttons.
- **Colors:** Primary: Vibrant Teal/Electric Cyan. Accents: Warm Coral/Soft Gold.
- **Typography:** Large, clear headers. Sans-serif (Inter/Geist).

## 🧠 Business Logic & Constraints
- **NO "SETS" (Подходы):** Crucial rule. Unlike standard fitness apps, Train Keeper does NOT use the concept of sets. 
- **Hierarchy:** Workout -> Sections -> Exercises.
- **Focus UI:** Exercises are organized into sections. Users swipe or tap `< >` to navigate between sections.
- **Completion Logic:** Tapping an exercise marks it as done. When all exercises in a section are done, the navigation button switches to "Next Section".
- **Flexible Fields:** Every exercise has dynamic fields (Weight, Reps, Distance, Time, Pose, or Custom). AI must support adding/editing/duplicating these fields.

## 📝 Continuous Documentation (Mandatory)
The AI is responsible for keeping documentation up-to-date as the project evolves. 
**Rule:** If a code change affects the data schema, API routes, user flows, adds a new feature, or introduces a new dependency:
1. **Pause and Inform:** The AI MUST explicitly inform the user: *"I need to update the documentation [filename] to reflect this change."*
2. **Update Docs:** Update `DATA_MODEL.md`, `ROADMAP.md`, `CHANGELOG.md`, `DEPENDENCIES.md`, or create an `ADR` *before* finalizing the task.
3. **Never let docs drift from code.**

## 🛠 TDD Workflow (Mandatory)
1. **Red Phase:** Write a failing Jest test for the requested feature/bugfix.
2. **Green Phase:** Implement only the minimum code required to pass the test.
3. **Refactor Phase:** Clean up the code while ensuring tests remain green.
*Never implement features without corresponding tests.*

## 📂 File Structure Conventions
- `server.js`: Express API and LowDB integration.
- `tk-app.js`: Main application logic.
- `tk-focus.js`: Focus-mode UI and interaction logic.
- `docs/ai/`: AI-specific documentation (Architecture, Roadmap, ADRs).
- `__tests__/`: All Jest tests.

## 📖 Glossary (Domain Language)
- **Workout (Тренировка):** A complete training session containing multiple sections.
- **Section (Секция):** A logical grouping of exercises (e.g., "Warm-up", "Main block").
- **Exercise (Упражнение):** A single activity within a section (e.g., "Push-ups").
- **Field (Поле):** A specific metric for an exercise (Weight, Reps, Time, etc.).
- **Focus Mode (Фокус-режим):** The UI state where the user concentrates on one section at a time.
- **Fluid Utility:** The design language combining high-density data entry with a calm, liquid aesthetic.
