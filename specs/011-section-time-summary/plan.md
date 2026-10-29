# Plan

## Architecture linkage

- `docs/constitution.md` — «Тренировочная сессия», «Секция».
- `docs/contexts/*.yml` — workout context (active mode state, summary).

## Approach

State: `state.sectionTimes` (array, seconds per section index) + `state.curSectionStartedAt`
(timestamp). All section switches in active mode go through one helper `switchSection(state, newIndex)`
which closes the current interval and opens the next; `startWorkout`/`finishWorkout` open/close.
Revisit-safe (sum). Persisted in localStorage like `startedAt`; history carries `sectionTimes`.
Summary renders a `⏱` badge in each `.sech` row (workout type only).

## Steps

1. JS logic: sectionTimes init/close in startWorkout/finishWorkout; switchSection helper; wire
   nextsec / prev-next arrows / dots.
2. summaryHTML: time badge per section header; history payload includes sectionTimes.
3. Jest: logic test (single section, switches with revisits, sum equals total) + summary badge contract.
4. Suite + validator green; progress regen; commit.
