# Bug: при старте тренировки подходы отображаются как уже выбранные

- Status: inbox (triage by owner)
- Reported: 2026-10-29, owner message in Hermes session 20261029_134711_abc123
- Backlog line: «[BUG] At workout start, exercise sets appear pre-selected» in `BACKLOG.md`

## Symptom

При начале тренировки подходы у любого упражнения с подходами отображаются как выбранные (done), хотя пользователь ещё не отмечал ни одного подхода.

## Agent root-cause analysis

- `startWorkout()` (`tk-focus.js:678-685`) сбрасывает только `e.done`/`e.skipped` и пересчитывает `f.plan = f.value`, но не сбрасывает `set.done`/`set.skipped` у подходов.
- `initSetsForExercise()` (`tk-focus.js:88-125`) меняет только количество подходов: если длина `ex.sets` уже совпадает с полем «подходы», существующие флаги `done` сохраняются как есть.
- Откуда берутся «грязные» флаги: шаблон может быть сохранён в активном режиме после отметки подходов (сохранение при дублировании карточки — `tk-focus.js:1048`, `tkLogic.saveTemplate(state)`), либо состояние из предыдущей тренировки осталось в `localStorage` (`tk_focus_v4`), если `finishWorkout` не отработал (закрытие вкладки на активной тренировке).

## Suggested fix (agent, for triage)

В `startWorkout()` после `initSetsForExercise(e)` добавить сброс `set.done = false; set.skipped = false;` для всех подходов (аналогично сбросу в `finishWorkout()`, `tk-focus.js:741-751`).
