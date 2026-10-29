# Backlog

Not specced, not scheduled - reminders only. One line per item; when picked up, an item MOVES into a task record and/or specs/NNN/ (deleted here, never copied).

<!-- Open items migrated from the pre-governance ROADMAP.md on 2026-10-21 (task-2026-10-21-001). -->
<!-- Code-audited 2026-10-21 (task-2026-10-21-003): 3 de-facto done items closed with evidence, 3 partials trimmed to remaining scope. -->

- [ ] Refactor codebase and tests using Context-7 documentation and Agent Skills
- [ ] Create a "Meta-Skill" (Skill of Skills) for intelligent multi-skill orchestration
- [ ] Expand and complete the Domain Glossary in GEMINI.md
- [ ] Dynamic Field Management: field duplication (add/remove/edit of fields already implemented - see task-2026-10-21-003)
- [ ] "Next Section" navigation logic (enabled only after section completion)
- [ ] Auto-progression: increase values every N workouts based on exercise progression rules (owner detail 2026-10-29: автоувеличение количества повторений на заданный % после заданного числа проведённых тренировок)
- [ ] Smart plan adjustment: update planned values when actual performance exceeds the plan (never the reverse); owner detail 2026-10-29: planned-vs-actual mapping — по умолчанию запланированное значение = фактически выполненному на прошлой тренировке (фактическое сейчас сохраняется в полях и не сбрасывается), чтобы не править план вручную; связка с rest-timer (отдых считается по общему времени тренировки)
- [ ] Exercise enable/disable toggle (временно исключить упражнение из тренировочной сессии без удаления, параметры сохраняются; в дополнение к удалению)
- [ ] Delete individual entries from workout history (удаление тестовых/лишних записей из истории)
- [ ] [BUG] At workout start, exercise sets appear pre-selected — bug draft `bugs/inbox/2026-10-29-sets-appear-preselected-at-workout-start.md`
- [ ] Hide top panel on scroll down (заголовок тренировки, назад, переключение секций; при скролле виден только таймер)
- [ ] Unpin bottom workout button (кнопка завершения тренировки / перехода к следующей секции — обычный поток внизу страницы, без фиксации)
- [ ] Show time spent per section on workout finish (подсчёт времени в каждой секции при завершении)
- [ ] Per-exercise comments and emotional rating during an active workout (по желанию, для каждого упражнения)
- [ ] Rest timer per exercise: настраиваемый отдых между подходами; запускается при отметке подхода выполненным, звук по завершении; реализация — расчёт по общему времени тренировки
- [ ] High-Fi Glassmorphism styling (only 2 ad-hoc backdrop-filter uses in tk-focus.css today)
- [ ] Mobile-first responsive optimization
- [ ] Workout analytics (history save/view already shipped via /api/history - analytics and charts missing)
- [ ] User authentication & sync
- [ ] Offline mode (Service Workers)
- [ ] Exercise library / standalone exercise templates (workout-template CRUD already shipped via /api/templates)
