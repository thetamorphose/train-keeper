# Plan

## Architecture linkage

- `docs/constitution.md` — mobile-first principle, «Тренировочная сессия».
- `docs/contexts/*.yml` — workout context (screen layout).

## Approach

HTML: move `.secfoot` inside `#exBody` region — but `#exBody.innerHTML` is fully re-rendered by JS,
so the static HTML move is not enough: the button would be wiped on first render. Correct host move:
render the button HTML inside the body render (after cards, before `</div>` of exBody) and remove
the static `.secfoot` from the HTML. JS: keep updating `#secbtn` by id (element now inside exBody).
CSS: `.secfoot` loses absolute/gradient; `.body` padding-bottom back to normal.

## Steps

1. HTML: delete static `.secfoot` block after `.body`.
2. JS render(): append `<div class="secfoot">` markup after cards/addexc inside exBody HTML; guard `$('#secbtn')` uses.
3. CSS: `.secfoot{position:static;...}` no gradient, no z-index; `.body` padding-bottom 14px.
4. Tests: layout test asserting secfoot is inside exBody and CSS is static; suite green.
5. Suite + validator green; progress regen; commit.
