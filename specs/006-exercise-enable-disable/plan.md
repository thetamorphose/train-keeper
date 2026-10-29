# Plan

## Architecture linkage

- `docs/constitution.md` — ubiquitous language: «Упражнение», «Секция», «Тренировочная сессия».
- `docs/contexts/*.yml` — workout context (exercise card actions, session lifecycle).

## Approach

Data-first: a single boolean `ex.enabled` (absent = enabled) on the exercise object, persisted with
the existing template PUT and localStorage state. All consumers derive behaviour from it:

- `tkLogic.sectionProgress` / completion checks count only enabled exercises.
- `cardHTML` renders disabled cards dimmed in build mode with a «Включить» menu item;
  active mode filters disabled exercises out of the render.
- `finishWorkout` filters disabled exercises (and empty sections) out of the history payload.
- State migration: `enabled === undefined → true` on load and on clone-in.

## Steps

1. Add `tkLogic.setExerciseEnabled(state, id, enabled)` + `enabledEx(sec)` helper; state-load migration.
2. Menu item «Выключить/Включить» in `cardHTML` + `case 'toggle-en'` in the action handler.
3. Progress/completion/dots: exclude disabled; all-disabled section auto-completes.
4. Active render and history payload filter disabled exercises; CSS `.card.disabled`.
5. Jest tests `__tests__/exercise-enable-disable.test.js` (logic-level, mirroring spec AC).
6. `npm run test`, validator, progress regen, commit.
