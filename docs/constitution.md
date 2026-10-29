# Project Constitution

## Domain vision

Train Keeper is a mobile-first web application for tracking training progress across workout types. A workout is composed of sections with exercises; each exercise carries dynamic fields (weight, reps, distance, time, pose, custom) and may have optional sets. The core experience is "Focus Mode": calm, section-by-section workout execution in the "Fluid Utility" design language. Reusable templates (workout lists) and habits let the user organize training and track checklists without starting a full workout session.

_(Transcribed from the pre-governance project documents during the v0.4.0 migration, task-2026-10-21-001; sources: `GEMINI.md`, `.cursorrules`, `docs/architecture/system.md`.)_

## Ubiquitous language

| Term | Meaning | Disallowed synonyms |
|---|---|---|
| Workout | One training session; root entity. Hierarchy: Workout → Section → Exercise | training, session |
| Section | Group of exercises inside a workout; the navigation unit of Focus Mode | block, chapter |
| Exercise | An item with dynamic fields; completed by tapping | movement, item |
| Set (подход) | Optional checkable subtask of an exercise; an exercise without sets behaves as a single task | approach, subset |
| Template | Server-backed reusable workout blueprint (LowDB `templates` collection); type `workout` or `habit` | workout list, folder, group |
| Habit | Checklist-type template completed without a full workout session | routine, checklist |
| Dynamic field | Per-exercise value: Weight, Reps, Distance, Time, Pose or Custom | parameter, attribute |
| Focus Mode | The section-based workout execution UI | focus view |
| Well-being rating | 5-point post-workout self-rating | mood, feeling |
| Copy (Копия) | Full clone of a template or exercise with fresh ids on every level (card, fields, sets); a list copy's title is suffixed «(копия)» | клон, дубль |
| Skipped (Пропущено) | Status of an exercise or set: marked as skipped; not counted as done and does not block section completion | отменено, игнор |
| Closed (Закрыто) | An exercise that is done or skipped; a section is finishable when all its exercises are closed | завершено, пройдено |
| History entry (Запись истории) | A saved finished workout with a stable id; only the well-being rating and comment are editable after the fact | лог, журнал |
| Settings page (Страница настроек) | Per-list settings screen (currently a stub without parameters); opened from the list card menu | preferences, опции |
| Disabled (Выключено) | Состояние упражнения: временно исключено из сессии владельцем в режиме построения; параметры сохраняются, из прогресса секции не считается, в историю не попадает. Отсутствие поля = включено | скрыто, удалено, отключено |
| Session feedback (Отметка о подходе) | Опциональные поля упражнения активной сессии: комментарий (sessionNote) и эмоциональная оценка 1–5 эмодзи (sessionRating); заполняются только во время тренировки, сбрасываются при старте следующей | заметка, комментарий (для rating) |
| Technique notes (Заметки по технике) | Постоянный текст упражнения, редактируемый в режиме построения; в отличие от session feedback не сбрасывается между тренировками | описание, session note |

## Architecture principles

1. Documentation in this repository is the source of truth.
2. One fact has one canonical home.
3. Structural code changes update relevant architecture documentation in the same commit.
4. Missing domain terminology blocks implementation until clarified by the owner.
5. State-changing logic lives in pure functions (`tkLogic` in `tk-focus.js`) covered by Jest tests before UI integration (TDD).

## Maintenance rules (memory bank)

This constitution is the project's memory bank — durable context read by every agent session.

1. Updating it is part of every task's Definition of Done: if a task changed the language, vision or principles, the constitution changes in the same commit.
2. If this file grows past ~3000 words, split it: stable architecture detail moves to `docs/architecture/system.md`, current project state to `docs/progress.md`; this file keeps only vision, language and principles.
3. Per-feature specifications live under `specs/` and are spec-first: they describe a change while it is implemented. They never replace this file, ADR, architecture docs, code or tests as the durable record.
