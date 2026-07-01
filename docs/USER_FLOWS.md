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

## Flow 4: Workout Preparation Navigation
1. **Initiate:** User selects a Workout/Template from the list to prepare for the session.
2. **Review/Edit:** User reviews the sections and exercises in preparation mode.
3. **Cancel/Go Back:** User decides not to start the workout and taps the "Back" button.
    - *Result:* App returns user to the main Workout List view without creating an active workout session.

## Flow 5: Smart Progression and Plan Adjustment
1. **Actual vs. Plan Entry:** During active workout, user enters an actual (fact) value for a field (e.g., Weight).
2. **Exceeding Plan:** If the entered fact value is higher than the planned value:
    - *Logic:* The planned value is automatically updated to match this higher fact value (ensures plan catches up to actual capabilities).
    - *Constraint:* If the fact is lower than the planned value, the plan is NOT changed (remains as the target).
3. **Periodic Auto-Progression:**
    - *Configuration:* For each exercise, the user specifies a progression rule (e.g., "Increase weight by 2.5 kg every 3 workouts").
    - *Trigger:* When completing the Nth workout containing this exercise, the app automatically increments the planned values for the next workout template based on the rule.

## Flow 6: Habit Tracking (Checklist Mode)
1. **Habits View:** User opens the Habit Checklist tab/screen.
2. **Checklist:** User sees a list of daily habits (e.g., "Drink water", "Stretch").
3. **No Active Session:** User checkmarks completed habits directly on the list without starting a training session or timer.
4. **History:** Completion status is stored with a date timestamp for habit streak tracking.

## Flow 7: Post-Workout Well-Being Selection
1. **Completion:** User completes a workout or habit checklist and triggers the "Finish Workout" (summary) screen.
2. **Well-Being Screen:** App displays the post-workout self-rating / feedback form.
3. **Rating Scale:** User taps a well-being rating option from 1 (Poor/😞) to 5 (Excellent/🤩). The selected rating is visually highlighted and saved to state.
4. **Optional Note:** A text input is available for special or detailed comments.

