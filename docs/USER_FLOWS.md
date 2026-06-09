# User Flows: Train Keeper

## Flow 1: Active Workout (Focus Mode)
1. **Selection:** User opens a Workout.
2. **First Section:** App displays the first Section of exercises.
3. **Completion:** User performs an exercise and taps it.
    - *Visual Feedback:* Exercise card turns "Active/Completed" style.
    - *Logic:* `exercise.completed` is set to `true`.
4. **Section Progress:** User completes all exercises in the section.
5. **Transition:** The bottom action button changes from "In Progress" to "Next Section".
6. **Navigation:** User taps "Next Section" (or swipes `< >`) to move to the next set of exercises.

## Flow 2: Managing Exercise Cards
1. **Edit Mode:** User long-presses or taps an "Edit" icon on an exercise card.
2. **Field Adjustment:** User can add a new field (e.g., "Distance"), remove a field, or change field values.
3. **Duplication:** User selects "Duplicate" on an exercise card.
    - *Result:* A new card is created in the same section with identical fields but `completed: false`.

## Flow 3: Custom Field Creation
1. **Add Field:** User taps "+ Field" on an exercise.
2. **Selection:** User chooses from presets (Weight, Reps, Time, etc.) or "Custom".
3. **Configuration:** If "Custom", user enters Label and Unit.
4. **Integration:** New field appears on the card immediately for data entry.
