# Feature Specification (minimal)

## Intent

We believe hiding the top panel when scrolling down in an active workout will give more room to
exercise cards, because on small screens the fixed header takes a large share of the viewport.

## User stories

- As a user, I want the header (crumb, title, section nav, dots) to hide when I scroll down during
  a workout, so that only the timer stays visible.

## Owner decisions (2026-10-29)

- Applies to the ACTIVE workout mode only (build/habit lists unchanged).
- The timer must NOT move to a new position: it keeps its place (top-right of the header zone)
  visually while the rest of the header zone collapses/hides.

## Acceptance criteria

```gherkin
Scenario: Scroll down collapses the header
  Given an active workout with enough cards to scroll
  When the user scrolls the body down beyond ~40px
  Then the crumb, workout title, section arrows, section name and dots are hidden
    (header zone collapses with a short transition), and the timer pill stays visible
    in its usual top-right position

Scenario: Scroll back re-expands
  When the user scrolls back to the top (< 40px)
  Then the full header zone is visible again

Scenario: Build mode unaffected
  Given build mode or a habit list
  When the user scrolls
  Then the header zone behaves exactly as before (always visible)
```

## Out of scope

- Sticky/pinned repositioning of any header element (timer keeps its position, owner decision).
- Bottom button changes (separate backlog item).

## Open questions

- none
