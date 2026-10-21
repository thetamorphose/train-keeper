# Feature Specification (minimal)

## Intent

We believe letting the user correct the post-workout well-being rating and comment after the
workout is already finished will make history trustworthy, because first impressions right
after a workout are often revised later.

## User stories

- As a user, I want to change the well-being rating of a finished workout while viewing it in
  history, so that the record reflects how I actually feel in retrospect.
- As a user, I want to fix the post-workout comment the same way, so that notes stay accurate.

## Acceptance criteria

```gherkin
Scenario: Change rating in history view
  Given the user is viewing a finished workout in history
  When the user taps a well-being rating button
  Then the rating is saved to that history entry on the server immediately
    and the ⭐ badge in the history list reflects the new value

Scenario: Edit comment in history view
  Given the user is viewing a finished workout in history
  When the user edits the comment and leaves the field
  Then the comment is saved to that history entry on the server

Scenario: History entries are addressable
  Given the history store contains entries without an id (legacy)
  When the server starts
  Then every entry gets a stable id and PUT /api/history/:id can update it
```

## Out of scope

- Editing exercise marks, elapsed time or title of a finished workout.
- Deleting history entries.

## Open questions

- none (owner decisions 2026-10-21: rating + comment; inline editing with immediate save;
  badge refresh immediately)
