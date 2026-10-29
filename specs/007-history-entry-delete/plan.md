# Plan

## Architecture linkage

- `docs/constitution.md` — «История тренировок», ubiquitous language.
- `docs/contexts/*.yml` — history context (home screen list, server API).

## Approach

Thin vertical slice: one server endpoint + one row icon + local list update. Deletion is
irreversible by design, so the only guard is a native confirm() naming the workout.

## Steps

1. Server: `DELETE /api/history/:id` in `server.js` (remove from db, 404 on miss).
2. Front: delete icon on `.h-item` rows; `case 'delhistory'` handler — confirm, DELETE request,
   remove from `state.history`, toast, render.
3. Jest: server test for DELETE (success, 404); frontend test for confirm-cancel/no-delete path.
4. `npm run test`, validator, progress regen, commit.
