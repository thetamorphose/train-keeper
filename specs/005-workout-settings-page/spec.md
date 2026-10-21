# Feature Specification (minimal)

## Intent

We believe a dedicated (still empty) settings page per workout list will give the owner a
visible place to grow per-workout options later, because settings are expected as a separate
screen rather than buried in menus.

## User stories

- As a user, I want to open a settings page for a workout list from its card menu, so that I
  have a predictable place for future per-workout options.

## Acceptance criteria

```gherkin
Scenario: Open settings from the card menu
  Given the home screen shows a list card with its «⋯» menu open
  When the user picks «Настройки»
  Then a dedicated settings page for that list opens, showing its title and a placeholder
    («настройки появятся позже»)

Scenario: Return from settings
  Given the settings page of a list is open
  When the user presses the back action
  Then the home screen is shown again, with no state changed
```

## Out of scope

- Any actual settings parameters (explicitly deferred by the owner — the page is a stub).

## Open questions

- none (owner decision 2026-10-21: stub page, entry from the card «⋯» menu)
