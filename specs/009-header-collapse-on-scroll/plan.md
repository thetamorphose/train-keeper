# Plan

## Architecture linkage

- `docs/constitution.md` — «Тренировочная сессия» lifecycle, mobile-first principle.
- `docs/contexts/*.yml` — workout context (active mode UI).

## Approach

CSS class `scrolled` on `.screen` (active mode only) + a scroll listener on `.body` added in
tk-focus.js. Collapsing is pure CSS on `.wtop` (its inline rows fade/collapse) while `#wpill`
is pulled out of the collapse: the `.trow` keeps its place, `.crumb` and `.wtitle` collapse,
`.snav`/`.dots` collapse. No position:fixed, no DOM moves — the timer never changes position.

## Steps

1. CSS: `.screen.scrolled` collapse rules (wtop rows except timer, snav, dots → height 0/hidden, transition).
2. JS: scroll listener on `#exBody` — toggle class at 40px threshold, only when `state.mode === 'active'`;
   reset on render/mode change.
3. Jest: layout test asserting the toggle logic and build-mode immunity (existing layout.test.js pattern).
4. Suite + validator green; progress regen; commit.
