# Implementation Plan

## Architecture linkage (mandatory)

- Constitution sections: Architecture principle 5 (navigation logic testable before UI polish)
- Related ADR(s): ADR-0006 (supporting domain)
- Architecture docs touched (`docs/architecture/*`): none — new view mode, no structural change

## Core Domain check

- Touches Core Domain: no

## Technical decisions

| Decision | Record (ADR/AgDR) |
|---|---|
| Settings as a `state.mode = 'settings'` view (no URL routing — app is a single static page) | none needed: single alternative (hash routing) rejected — existing screens all use state.modes |

## Approach

New `state.mode = 'settings'` + `state.settingsTemplateId`. The card «⋯» menu gains «Настройки»
(`tset`) which opens the page for that template (title from the template; no data changes).
The page shows the title and a placeholder line; the section button («← К спискам», act
`closesettings`) returns home. `render()` gets a `settings` branch mirroring the `home` one.

## Test strategy

- `__tests__/settings-page.test.js` (jsdom): dispatch `tset` → mode is `settings`, title matches;
  `closesettings` → back to `home` (AC 1, 2).
- Run: `npm run test`.
