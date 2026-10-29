# Feature Specification (minimal)

## Intent

We believe letting the user leave an optional comment and emotional rating per exercise during an
active workout will capture in-the-moment feedback (how the exercise actually felt), because after
the workout this context is lost.

## User stories

- As a user, I want to optionally add a comment and an emoji rating to each exercise while working
  out, so that the history reflects how the exercise felt, not just the numbers.

## Owner decisions (2026-10-29)

- Per owner message: plan approved as proposed («по плану 7 задачи все ок»); tasks 8 (rest timer)
  and 9 (auto-progression) are postponed — backlog lines remain.
- The feedback block is optional and collapsed by default; the existing per-workout well-being
  rating stays unchanged; build-mode technique `notes` are not touched.

## Acceptance criteria

```gherkin
Scenario: Leave feedback during a workout
  Given an active workout
  When the user expands the feedback row on an exercise card
  Then a comment textarea and a 5-emoji rating row (😞😐🙂😃🤩) are available; both are optional

Scenario: Feedback survives to summary and history
  Given feedback was entered on some exercises
  When the workout is finished and saved
  Then the summary rows show the rating emoji (and comment text if present), and the history
    entry carries sessionNote/sessionRating on those exercises

Scenario: Clean slate next workout
  Given a workout was finished with session feedback
  When the next workout starts
  Then sessionNote/sessionRating are empty on all exercises (technique notes are preserved)

Scenario: Not available outside active mode
  Given build mode or a habit list
  Then the per-exercise feedback block is not rendered
```

## Out of scope

- Rest timer (backlog, postponed).
- Auto-progression (backlog, postponed).
- Changing the per-workout well-being rating or technique notes.

## Open questions

- none
