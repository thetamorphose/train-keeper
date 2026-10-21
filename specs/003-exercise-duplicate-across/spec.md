# Feature Specification (minimal)

## Intent

We believe letting the user duplicate an exercise into another section or another workout list
will make building programs faster, because exercises can be reused across blocks and workouts
without retyping fields.

## User stories

- As a user, I want to duplicate the current exercise into a chosen section of the current
  workout, so that I reuse it in another block.
- As a user, I want to duplicate the current exercise into a chosen section of another workout
  or habit list, so that I can start a new list from existing exercises.

## Acceptance criteria

```gherkin
Scenario: Duplicate into another section of the current workout
  Given the build menu of an exercise is open
  When the user picks «В секцию…» and then a section
  Then a full clone of the exercise (fields, values, sets, notes) is appended to the end of
    that section, with fresh ids on the card, fields and sets, and done/skipped reset

Scenario: Duplicate into another workout list
  Given the build menu of an exercise is open
  When the user picks «В тренировку…», chooses a list and then one of its sections
  Then the clone is appended to that section of that list and saved server-side

Scenario: Original untouched
  Given a duplication has just happened
  When the user inspects the source exercise
  Then it is unchanged (shared references impossible)
```

## Out of scope

- Duplicating whole sections or whole workouts (separate backlog item, done in task-2026-10-21-006).
- Moving (cut/paste) an exercise — only copying.

## Open questions

- none (owner decisions 2026-10-21: two menu items; copy to end of chosen section; exact clone)
