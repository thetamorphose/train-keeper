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

## Flow 2: Managing Exercise Cards & Sections
1. **Edit Mode:** User long-presses or taps an "Edit" icon on an exercise card.
2. **Field Adjustment:** User can add a new field (e.g., "Distance"), remove a field, or change field values.
3. **Duplication:** User selects "Duplicate" on an exercise card.
    - *Result:* A new card is created in the same section with identical fields but `completed: false`.
4. **Section Creation:** User taps the `+` icon in the dots navigation panel.
    - *Result:* A new section is created with one default exercise, and the app switches focus to this section.
5. **Section Auto-Deletion:** User deletes the last exercise in a section.
    - *Result:* The section is automatically removed. Focus shifts to the previous section or the first section. If no sections remain, a new default one is created.

## Flow 3: Custom Field Creation
1. **Add Field:** User taps "+ Field" on an exercise.
2. **Selection:** User chooses from presets (Weight, Reps, Time, etc.) or "Custom".
3. **Configuration:** If "Custom", user enters Label and Unit.
4. **Integration:** New field appears on the card immediately for data entry.
