/**
 * @jest-environment jsdom
 */
import { jest, expect, describe, test, beforeAll, beforeEach } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Mock fetch for API calls
global.fetch = jest.fn();

const code = fs.readFileSync(path.resolve(__dirname, '../tk-focus.js'), 'utf8');

describe('Frontend Habit Tracking State & UI Logic', () => {
  beforeAll(() => {
    // Setup minimal DOM required by tk-focus.js
    document.body.innerHTML = `
      <div id="exBody"></div>
      <div id="dots"></div>
      <div id="wtitle"></div>
      <div id="wpill"></div>
      <div id="crumb"></div>
      <div id="snav"></div>
      <div id="sname"></div>
      <div id="ssub"></div>
      <div id="wdesc"></div>
      <button id="secbtn"></button>
      <button data-prev></button>
      <button data-next></button>
      <div id="sheet"></div>
      <div id="scrim"></div>
      <div id="tchips"></div>
      <input id="cName" />
      <input id="cUnit" />
      <div id="cType"><div data-t="num"></div></div>
      <button id="cAdd"></button>
      <div id="toast"></div>
    `;
    
    try {
      eval(code);
    } catch (e) {
      // ignore init errors in test run if any
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset state to a default workout list state
    window.__tkState.mode = 'home';
    window.__tkState.templates = [];
    window.__tkState.activeTemplateId = null;
    window.__tkState.type = 'workout';
  });

  test('state.type should default to workout', () => {
    expect(window.__tkState.type).toBe('workout');
  });

  test('createNewTemplate with type habit should set type to habit and set initial template state', async () => {
    const newTemplate = { 
      id: 'habit-123', 
      title: 'Новый список привычек', 
      type: 'habit', 
      sections: [
        { name: 'Привычки', ex: [{ id: 999, name: 'Новая привычка', done: false, skipped: false, fields: [] }] }
      ] 
    };
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(newTemplate),
    });

    await window.__tkLogic.createNewTemplate(window.__tkState, 'habit');

    expect(global.fetch).toHaveBeenCalledWith('/api/templates', expect.objectContaining({
      method: 'POST',
      body: expect.stringContaining('"type":"habit"')
    }));
    
    expect(window.__tkState.type).toBe('habit');
    expect(window.__tkState.activeTemplateId).toBe('habit-123');
    expect(window.__tkState.mode).toBe('build');
  });

  test('saveTemplate should serialize the type property', async () => {
    window.__tkState.activeTemplateId = 'habit-123';
    window.__tkState.title = 'Daily Habits';
    window.__tkState.type = 'habit';
    window.__tkState.sections = [];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    await window.__tkLogic.saveTemplate(window.__tkState);

    expect(global.fetch).toHaveBeenCalledWith('/api/templates/habit-123', expect.objectContaining({
      method: 'PUT',
      body: expect.stringContaining('"type":"habit"')
    }));
  });

  test('habit list items on home screen should show type badge', () => {
    window.__tkState.mode = 'home';
    window.__tkState.templates = [
      { id: '1', title: 'Gym Workout', type: 'workout', sections: [] },
      { id: '2', title: 'Hydration Tracker', type: 'habit', sections: [] }
    ];

    // Trigger render
    window.__tkRender();
    // Let's call the exposed render or check elements
    const homeHtmlStr = document.getElementById('exBody').innerHTML;
    
    expect(homeHtmlStr).toContain('привычки');
    expect(homeHtmlStr).toContain('тренировка');
  });

  test('home actions should render two separate creation buttons', () => {
    window.__tkState.mode = 'home';
    window.__tkState.templates = [];
    
    // Force render
    window.__tkRender();

    const homeHtmlStr = document.getElementById('exBody').innerHTML;
    expect(homeHtmlStr).toContain('data-act="createtemplate"');
    expect(homeHtmlStr).toContain('data-type="workout"');
    expect(homeHtmlStr).toContain('data-type="habit"');
  });

  describe('Habits Build/Focus Combined Mode', () => {
    beforeEach(() => {
      window.__tkState.mode = 'build';
      window.__tkState.type = 'habit';
      window.__tkState.activeTemplateId = 'habit-123';
      window.__tkState.title = 'My Daily Checklist';
      window.__tkState.sections = [
        {
          name: 'Morning',
          ex: [
            { id: 101, name: 'Drink water', done: false, skipped: false, fields: [] },
            { id: 102, name: 'Stretch', done: true, skipped: false, fields: [] }
          ]
        }
      ];
      window.__tkState.i = 0;
    });

    test('should render status pill with "привычки" and subtitle with progress', () => {
      window.__tkRender();

      expect(document.getElementById('wpill').textContent).toBe('привычки');
      expect(document.getElementById('ssub').textContent).toContain('выполнено 1/2');
    });

    test('bottom button should show Сбросить отметки if 0 done, Выполнено X из Y if partial, and Следующая секция / Завершить when completed', () => {
      // 0 done out of 2
      window.__tkState.sections[0].ex[0].done = false;
      window.__tkState.sections[0].ex[1].done = false;
      window.__tkRender();
      let btn = document.getElementById('secbtn');
      expect(btn.textContent).toBe('Сбросить отметки');
      expect(btn.dataset.act).toBe('resethabits');

      // 1 done out of 2 (partial)
      window.__tkState.sections[0].ex[0].done = true;
      window.__tkRender();
      btn = document.getElementById('secbtn');
      expect(btn.textContent).toBe('Выполнено 1 из 2');
      expect(btn.classList.contains('ghost')).toBe(true);

      // 2 done out of 2 (completed, not last section)
      window.__tkState.sections.push({ name: 'Evening', ex: [{ id: 103, name: 'Meditate', done: false, skipped: false, fields: [] }] });
      window.__tkState.sections[0].ex[1].done = true;
      window.__tkRender();
      btn = document.getElementById('secbtn');
      expect(btn.textContent).toBe('Следующая секция →');
      expect(btn.dataset.act).toBe('nextsec');

      // 2 done out of 2 (completed, last section)
      window.__tkState.sections.pop(); // remove Evening section
      window.__tkRender();
      btn = document.getElementById('secbtn');
      expect(btn.textContent).toBe('✓ Завершить');
      expect(btn.dataset.act).toBe('nextsec'); // nextsec action will call finish
    });

    test('clicking Завершить on the last section should transition to summary screen', () => {
      window.__tkState.sections[0].ex[0].done = true;
      window.__tkState.sections[0].ex[1].done = true;
      window.__tkRender();

      const btn = document.getElementById('secbtn');
      expect(btn.textContent).toBe('✓ Завершить');

      btn.click();
      expect(window.__tkState.mode).toBe('summary');
    });

    test('summary screen for habit lists should hide the duration timer', () => {
      window.__tkState.mode = 'summary';
      window.__tkState.type = 'habit';
      window.__tkState.title = 'My Daily Checklist';
      window.__tkState.elapsed = 0;
      window.__tkState.sections = [
        {
          name: 'Morning',
          ex: [
            { id: 101, name: 'Drink water', done: true, skipped: false, fields: [] }
          ]
        }
      ];

      window.__tkRender();
      const sumHtml = document.getElementById('exBody').innerHTML;
      // Duration timer (⏱) should not be in the summary details
      expect(sumHtml).not.toContain('⏱');
    });

    test('closing summary screen should save history with type habit and reset template checks', async () => {
      window.__tkState.mode = 'summary';
      window.__tkState.type = 'habit';
      window.__tkState.activeTemplateId = 'habit-123';
      window.__tkState.isViewingHistory = false;
      window.__tkState.sections = [
        {
          name: 'Morning',
          ex: [
            { id: 101, name: 'Drink water', done: true, skipped: false, fields: [] }
          ]
        }
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      // Click the finish/close button on summary
      const btn = document.getElementById('secbtn');
      expect(btn.dataset.act).toBe('closesummary');
      
      await btn.click();

      // Should POST to /api/history with type habit
      expect(global.fetch).toHaveBeenCalledWith('/api/history', expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"type":"habit"')
      }));

      // Checklist template states should be reset
      expect(window.__tkState.sections[0].ex[0].done).toBe(false);
      expect(window.__tkState.mode).toBe('home');
    });

    test('history items on home screen representing habit checklists should display "привычки" badge or text', () => {
      window.__tkState.mode = 'home';
      window.__tkState.history = [
        { id: 'h-1', title: 'Daily Habits', type: 'habit', date: Date.now(), elapsed: 0, sections: [] },
        { id: 'h-2', title: 'Chest Workout', type: 'workout', date: Date.now(), elapsed: 300000, sections: [] }
      ];

      window.__tkRender();
      const homeHtmlStr = document.getElementById('exBody').innerHTML;

      // History item for chest workout should show duration (⏱ 05:00)
      expect(homeHtmlStr).toContain('⏱ 05:00');
      // History item for habits should NOT show duration ⏱ 00:00, but rather "привычки" or "Чек-лист"
      expect(homeHtmlStr).toContain('привычки');
    });

    test('clicking Сбросить отметки should reset all done and skipped flags and save', () => {
      window.__tkState.sections[0].ex[0].done = false;
      window.__tkState.sections[0].ex[1].done = false;
      window.__tkRender();

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const btn = document.getElementById('secbtn');
      expect(btn.dataset.act).toBe('resethabits');
      btn.click();

      // Both exercises should be reset to false
      expect(window.__tkState.sections[0].ex[0].done).toBe(false);
      expect(window.__tkState.sections[0].ex[1].done).toBe(false);
      expect(global.fetch).toHaveBeenCalledWith('/api/templates/habit-123', expect.objectContaining({
        method: 'PUT',
        body: expect.stringContaining('"done":false')
      }));
    });
  });
});
