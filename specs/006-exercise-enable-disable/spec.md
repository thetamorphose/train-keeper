# Feature Specification (minimal)

## Intent

We believe letting the user temporarily disable an exercise (instead of deleting it) will make
session management flexible, because the exercise keeps all its parameters and can be re-enabled
later without retyping anything.

## User stories

- As a user, I want to disable an exercise from its card menu, so that it is excluded from the
  training session without losing its parameters.
- As a user, I want to re-enable a disabled exercise, so that it returns to the session as it was.

## Owner decisions (2026-10-29)

- Disable/enable is a build-mode action only; during an active workout the existing
  long-press «пропустить» covers temporary exclusion.
- A section whose exercises are all disabled counts as complete when reached (auto-complete,
  noted in progress label).
- Disabled exercises are NOT written to the workout history record.

## Acceptance criteria

```gherkin
Scenario: Disable an exercise in build mode
  Given the card menu of an enabled exercise is open in build mode
  When the user picks «Выключить»
  Then the exercise is marked disabled (ex.enabled = false), rendered dimmed with a menu item
    «Включить», is excluded from section progress counts, and the template is saved

Scenario: Active workout hides disabled exercises
  Given a workout has at least one disabled exercise
  When the workout starts
  Then disabled exercises are not rendered in the active list and do not block section
    completion; a section with only disabled exercises is immediately complete

Scenario: History excludes disabled exercises
  Given a finished workout had disabled exercises
  When the result is saved to history
  Then the history sections contain only exercises that were enabled during the workout
```

## Out of scope

- Deleting exercises (existing action, unchanged).
- Skip via long-press during an active workout (existing behaviour, unchanged).

## Open questions

- none
