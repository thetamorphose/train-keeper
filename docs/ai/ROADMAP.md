
# Project Roadmap: Train Keeper

## 🎯 Current Milestone: MVP Prototype
Focus on the core "Focus Mode" workout experience with section-based navigation and dynamic fields.

## 📋 Task List

### Infrastructure
- [x] Initial Project Setup (Node.js, Express, LowDB)
- [x] AI Documentation Framework (Rules, Architecture, Roadmap)
- [x] Jest Testing Environment Setup
- [x] Implement Comprehensive Tests for core User Flows (TDD)
- [ ] Refactor codebase and tests using Context-7 documentation and Agent Skills
- [ ] Create a "Meta-Skill" (Skill of Skills) for intelligent multi-skill orchestration
- [x] Install and configure a TDD Development skill to automate the Red-Green-Refactor cycle
- [ ] Expand and complete the Domain Glossary in GEMINI.md
- [ ] Basic API for Workout Management (CRUD)

### Core Features (Focus Mode)
- [x] Reordering Exercise Cards in Build Mode (Move Up/Down)
- [x] Exercise Completion Logic (Tap to toggle / Sets subtasks tree completion)
- [ ] Dynamic Field Management (Add/Edit/Duplicate fields)
- [ ] "Next Section" Navigation logic (Enabled only after section completion)
- [ ] Duplicate/Edit Exercise Card functionality
- [x] Section Management (Add/Delete sections within a workout)
- [x] Navigation back from Workout Preparation screen to Workout List
- [x] Skip Exercise/Sets option ("Not Done" / "Skipped" status instead of decrementing reps to 0)
- [x] Post-workout well-being quick options (multi-choice options instead of text-only)

### Workout Organization
- [x] Workout Lists/Groups (Create, delete, and organize workouts into folders/lists)
- [x] Server-backed Templates (CRUD API and real-time frontend sync)
- [x] Workout/Template Description field for recording technique nuances and tips
- [ ] Auto-progression: increase values every N workouts based on exercise progression rules
- [ ] Smart plan adjustment: automatically update planned values when actual performance (fact) exceeds the plan (but not vice versa)

### UI/UX (Fluid Utility)
- [x] Lo-Fi Interactive Wireframes
- [ ] High-Fi Glassmorphism Styling
- [ ] Real-time "Tweaks" Panel integration
- [ ] Mobile-first Responsive Optimization
- [x] Remove mobile wireframe layout wrapper

### Future Goals
- [ ] Workout History & Analytics
- [ ] User Authentication & Sync
- [ ] Offline Mode (Service Workers)
- [ ] Exercise Library / Templates
- [x] Habit Tracking: simple checklist functionality without starting a full workout session

