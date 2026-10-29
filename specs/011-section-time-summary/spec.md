# Feature Specification (minimal)

## Intent

We believe showing the time spent in each section after finishing a workout will help the owner
understand where the session time actually goes, because total time alone hides the distribution.

## User stories

- As a user, I want to see per-section time in the finish summary, so that I know which section
  took the longest.

## Owner decisions (2026-10-29)

- During the active workout ONLY the total timer is shown — no per-section time UI mid-workout.
- Per-section time appears in the finish summary, as a compact `⏱ м:сс` badge next to each section
  name (agent recommended format, owner accepted implicitly via correction message scope).
- Habit lists do not show per-section time (elapsed is 0 there).

## Acceptance criteria

```gherkin
Scenario: Summary shows per-section time
  Given an active workout where the user spent time in several sections (including revisits)
  When the workout is finished
  Then each section header in the summary shows the total time actually spent in that section
    (summed across visits), and the section times sum to the total workout time (± rounding)

Scenario: Data persists
  Given a finished workout with per-section times
  When it is saved to history
  Then the history entry carries sectionTimes
```

## Out of scope

- Any per-section time display during the active workout (owner decision).
- Rest timer (separate backlog item).

## Open questions

- none
