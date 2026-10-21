# Implementation Plan

## Architecture linkage (mandatory)

- Constitution sections: Architecture principles (pure logic in `tkLogic` tested before UI; documentation is source of truth)
- Related ADR(s): ADR-0006 (all current modules supporting domain)
- Architecture docs touched (`docs/architecture/*`): none — no structural change (one endpoint + card menu reusing the existing `.kmenu` pattern)

## Core Domain check

- Touches Core Domain: no (CORE.md declares none; ADR-0006 keeps everything supporting)

## Technical decisions

| Decision | Record (ADR/AgDR) |
|---|---|
| Duplicate via server endpoint `POST /api/templates/:id/duplicate` instead of client-side re-POST | docs/agdr/0002-template-duplicate-endpoint.md |

## Approach

Server: deep-copy endpoint inserting the copy right after the source (201, 404 on unknown id).
Home UI: each card gets a «⋯» button (`data-act="tmenu"`) reusing the `menuId` mechanism and
`.kmenu` markup of the exercise menu; «Дублировать» POSTs the endpoint and refreshes templates;
«Удалить» asks `confirm('Удалить «Имя»?')`, DELETEs and refreshes; activeTemplateId is cleared
if it pointed at the deleted list; toast on both actions.

## Test strategy

- `__tests__/templates-api.test.js` (supertest): duplicate copies sections/fields with new id and
  « (копия)» title, original unchanged, 404 on unknown id, delete removes the list (AC 1, 2, 3).
- UI menu wiring exercised through the existing jsdom harness pattern (data-act dispatch) where
  cheap; visual menu verified by code review of the `.kmenu` reuse.
- Run: `npm run test`.
