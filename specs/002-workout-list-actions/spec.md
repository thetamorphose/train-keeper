# Feature Specification (minimal)

## Intent

We believe adding duplicate and delete actions to the workout/habit list cards will let the
owner manage their lists directly from the home screen, because today a list can only be
created but never removed or copied without touching the database.

## User stories

- As a user, I want to duplicate a workout or habit list from the home screen, so that I can
  reuse it as a starting point for a variation.
- As a user, I want to delete a list I no longer need, so that «Мои списки» stays uncluttered.

## Acceptance criteria

```gherkin
Scenario: Duplicate a list from the home screen
  Given the home screen shows a list card
  When the user opens the card's «⋯» menu and picks «Дублировать»
  Then a copy named «<Имя> (копия)» appears in the list with the same sections and fields,
    and the original is unchanged

Scenario: Delete a list from the home screen
  Given the home screen shows a list card
  When the user opens the card's «⋯» menu and picks «Удалить»
  Then a system confirm asks «Удалить „<Имя>“?»
  And on confirm the list disappears from «Мои списки»

Scenario: Duplicate unknown id
  Given no list with the requested id exists
  When POST /api/templates/:id/duplicate is called
  Then the server responds 404
```

## Out of scope

- Deleting or editing entries in workout history (separate backlog decision).
- Bulk operations on multiple lists.

## Open questions

- none (scope fixed by owner 2026-10-21: templates only, «⋯» menu, confirm, «(копия)» naming)
