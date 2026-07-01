# Data Model & Schema: Train Keeper

## Overview
This document serves as the Single Source of Truth for all data structures within the LowDB `history.json` and internal state.

## 1. Template Object
A reusable blueprint for a workout (Workout List). Stored in the `templates` collection.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string (uuid)` | Unique identifier. |
| `title` | `string` | Name of the template (e.g., "Leg Day"). |
| `description` | `string` | Notes/technique tips for the workout template. |
| `sections` | `Array<Section>` | Blueprint of sections and exercises. |
| `createdAt` | `number (timestamp)` | Creation time. |

## 2. Workout Object
The root entity representing a single training session.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string (uuid)` | Unique identifier. |
| `listId` | `string (uuid)` | ID of the Workout List it belongs to (optional). |
| `title` | `string` | User-defined name of the workout. |
| `description` | `string` | Description or technique tips inherited from template. |
| `date` | `number (timestamp)` | When the workout was completed (only in history). |
| `startedAt` | `number (timestamp)` | When the workout was started. |
| `elapsed` | `number (ms)` | Total duration of the workout. |
| `comment` | `string` | User notes about the session. |
| `wellBeingRating` | `string` | Post-workout well-being quick choice rating (e.g. "strong", "exhausted"). |
| `sections` | `Array<Section>` | List of exercise groupings. |

## 3. Section Object
A logical group of exercises (e.g., "Warm-up").

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string (uuid)` | Unique identifier. |
| `name` | `string` | Name of the section (e.g., "Main block"). |
| `ex` | `Array<Exercise>` | List of exercises in this section. |

## 4. Exercise Object
A specific activity within a section.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string (uuid)` | Unique identifier. |
| `name` | `string` | Name of the exercise. |
| `done` | `boolean` | Completion status (computed from sets if sets are present). |
| `skipped` | `boolean` | True if the exercise was skipped ("not done"). |
| `notes` | `string` | Notes or technique tips for the exercise. |
| `fields` | `Array<Field>` | Dynamic metrics associated with the exercise (e.g. Weight, Reps, Sets/Подходы). |
| `sets` | `Array<Set>` | List of set subtasks if "Подходы" field is present. |
| `progression` | `Object` | Progression rule (field key, increment step, N frequency, counter). |

## 5. Field Object
A specific metric for an exercise (e.g., Weight, Time).

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string (uuid)` | Unique identifier. |
| `key` | `string` | Template key (e.g., "вес", "повторения", "подходы", "custom"). |
| `label` | `string` | Display label (e.g., "Weight"). |
| `type` | `enum` | One of: `num`, `time`, `text`. |
| `value` | `any` | The actual recorded value (number or string). |
| `plan` | `any` | The target value set during the "Build" phase. |
| `unit` | `string` | Unit of measurement (e.g., "kg"). |
| `step` | `number` | Increment/decrement step for `num` types. |

## 6. Set Object
A subtask of an exercise representing a single set/approach ("подход").

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string (uuid)` | Unique identifier. |
| `done` | `boolean` | Completion status of this set. |
| `skipped` | `boolean` | True if this specific set was skipped. |
| `fields` | `Array<Field>` | Fields inherited from the parent exercise card (excluding 'подходы'). |

## 7. Habit Object
A habit tracking checklist item. Stored in the `habits` collection.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string (uuid)` | Unique identifier. |
| `title` | `string` | Habit name (e.g., "Drink 2L water"). |
| `completedDates` | `Array<string>` | List of dates completed (formatted as "YYYY-MM-DD"). |
| `createdAt` | `number` | Timestamp of creation. |

## Data Integrity Rules
- **No Nulls:** Prefer empty strings `""` or `0` over `null`.
- **Unique IDs:** Use UUIDs for all IDs to prevent collisions when merging history.
- **Timestamps:** Always use Unix timestamps in milliseconds.

