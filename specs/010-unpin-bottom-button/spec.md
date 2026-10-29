# Feature Specification (minimal)

## Intent

We believe unpinning the bottom workout button will make the list feel natural and give cards the
full viewport, because the button stops overlaying content and sits where the content ends.

## User stories

- As a user, I want the finish/next-section button to sit at the end of the page content and scroll
  with it, so that it no longer floats over the exercise cards.

## Owner decisions (2026-10-29)

- Confirmed the agent's recommended approach: move `.secfoot` inside `.body` in the HTML; static
  flow, no absolute positioning, no gradient overlay.

## Acceptance criteria

```gherkin
Scenario: Button scrolls with content
  Given any workout screen (build, active, habit)
  When the user scrolls
  Then the action button is the last element of the scrollable content and moves with it
    (no position:fixed/absolute, no gradient backdrop)

Scenario: Logic unchanged
  Given the button in its new position
  When the user taps it
  Then the same actions fire (nextsec / startworkout / resethabits) with same labels and classes
```

## Out of scope

- Header collapse (specs/009).
- Any change to button actions or progress gating.

## Open questions

- none
