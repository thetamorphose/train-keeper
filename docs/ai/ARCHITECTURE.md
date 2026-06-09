# Project Architecture: Train Keeper

## Overview
Train Keeper is a mobile-first workout tracker focused on a "Focus Mode" UX where exercises are grouped into sections.

## File Map
- `/server.js`: Entry point for the backend. Handles Express routes and LowDB persistence.
- `/tk-app.js`: Main frontend entry point and global state management.
- `/tk-focus.js`: Specialized logic for the Focus-mode UI (swiping between sections).
- `/tk-focus-tweaks.jsx`: React-based UI for real-time styling adjustments (Tweaks).
- `/tk-focus.css`: Styles specifically for the Focus mode.
- `/docs/ai/`: Detailed documentation for AI agents.

## Data Model (LowDB Schema)
The database (`db.json` / `history.json`) follows this structure:

```json
{
  "workoutLists": [
    {
      "id": "uuid",
      "name": "Yoga Programs"
    }
  ],
  "workouts": [
    {
      "id": "uuid",
      "listId": "uuid",
      "name": "Morning Yoga",
      "sections": [
        {
          "id": "uuid",
          "name": "Warm-up",
          "exercises": [
            {
              "id": "uuid",
              "name": "Sun Salutation",
              "completed": false,
              "fields": [
                { "label": "Pose", "type": "text", "value": "A", "unit": "" },
                { "label": "Time", "type": "time", "value": "60", "unit": "sec" }
              ]
            }
          ]
        }
      ]
    }
  ],
  "settings": {
    "theme": "light",
    "accentColor": "#00ced1"
  }
}
```

## API Routes
- `GET /api/workouts`: Fetch all workouts.
- `POST /api/workouts`: Create a new workout.
- `PATCH /api/workouts/:id`: Update workout/section/exercise state.
- `DELETE /api/workouts/:id`: Remove a workout.

## Interaction Flow
1. User selects a workout.
2. App enters "Focus Mode" on the first Section.
3. User taps exercises to toggle `completed: true`.
4. App monitors section completion.
5. Once all exercises in the current Section are `completed`, UI enables transition to the next Section.
