# Feature Specification (minimal)

## Intent

We believe letting the user delete individual entries from the workout history will keep the
history meaningful, because test and junk workouts do not accumulate.

## User stories

- As a user, I want to delete a single history entry from the history list, so that test or
  mistaken workouts do not clutter the history.

## Owner decisions (2026-10-29)

- A dedicated delete icon (✕) on each history row on the home screen (not hidden behind long-press).
- Deletion requires confirmation (confirm() with workout title and date).
- Per-entry deletion only; no "clear all history" action.

## Acceptance criteria

```gherkin
Scenario: Delete a history entry
  Given the home screen shows the history list
  When the user taps the delete icon on an entry and confirms
  Then the entry is removed server-side (DELETE /api/history/:id) and from the local list
    without a page reload, and a toast «Запись удалена» is shown

Scenario: Cancelled deletion
  Given the confirm dialog is open
  When the user cancels
  Then the entry stays in the history

Scenario: Server rejects unknown id
  Given DELETE /api/history/:id is called with an unknown id
  Then the server responds 404 and the local list is unchanged
```

## Out of scope

- Bulk delete / clear-all.
- Editing history sections (already shipped via specs/004 for rating/comment).

## Open questions

- none
