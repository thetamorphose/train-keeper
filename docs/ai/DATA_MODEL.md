# Data Model & Schema: Train Keeper

## Overview
This document serves as the Single Source of Truth for all data structures within the LowDB `history.json` and internal state.

## 1. Workout List Object (New)
A folder or group to organize multiple workouts.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string (uuid)` | Unique identifier. |
| `name` | `string` | Name of the list (e.g., "Strength Programs", "Yoga"). |

## 2. Workout Object
The root entity representing a single training session.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string (uuid)` | Unique identifier. |
| `listId` | `string (uuid)` | ID of the Workout List it belongs to (optional). |
| `title` | `string` | User-defined name of the workout. |
| `date` | `number (timestamp)` | When the workout was completed (only in history). |
| `startedAt` | `number (timestamp)` | When the workout was started. |
| `elapsed` | `number (ms)` | Total duration of the workout. |
| `comment` | `string` | User notes about the session. |
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
| `done` | `boolean` | Completion status. |
| `fields` | `Array<Field>` | Dynamic metrics associated with the exercise. |

## 5. Field Object
A specific metric for an exercise (e.g., Weight, Time).

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string (uuid)` | Unique identifier. |
| `key` | `string` | Template key (e.g., "вес", "custom"). |
| `label` | `string` | Display label (e.g., "Weight"). |
| `type` | `enum` | One of: `num`, `time`, `text`. |
| `value` | `any` | The actual recorded value (number or string). |
| `plan` | `any` | The target value set during the "Build" phase. |
| `unit` | `string` | Unit of measurement (e.g., "kg"). |
| `step` | `number` | Increment/decrement step for `num` types. |

## Data Integrity Rules
- **No Nulls:** Prefer empty strings `""` or `0` over `null`.
- **Unique IDs:** Use UUIDs for all IDs to prevent collisions when merging history.
- **Timestamps:** Always use Unix timestamps in milliseconds.
