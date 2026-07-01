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

describe('Post-workout Well-being Rating Scale', () => {
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
      // ignore init errors
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset state to active workout before each test
    window.__tkState.mode = 'active';
    window.__tkState.templates = [];
    window.__tkState.activeTemplateId = 'workout-123';
    window.__tkState.type = 'workout';
    window.__tkState.wellBeingRating = 0;
    window.__tkState.comment = '';
    window.__tkState.sections = [
      {
        name: 'Главная',
        ex: [{ id: 101, name: 'Жим лежа', done: true, skipped: false, fields: [] }]
      }
    ];
  });

  test('AC-1: Summary screen displays 5 rating buttons with correct emojis and data-val attributes', () => {
    window.__tkState.mode = 'summary';
    window.__tkRender();

    const exBody = document.getElementById('exBody');
    const buttons = exBody.querySelectorAll('.wb-btn');
    
    // There must be exactly 5 buttons
    expect(buttons.length).toBe(5);

    // Each button must have data-val 1 to 5
    const values = Array.from(buttons).map(btn => Number(btn.dataset.val));
    expect(values).toEqual([1, 2, 3, 4, 5]);

    // Check presence of emojis
    const textContent = exBody.innerHTML;
    expect(textContent).toContain('😞'); // 1
    expect(textContent).toContain('😐'); // 2
    expect(textContent).toContain('🙂'); // 3
    expect(textContent).toContain('😃'); // 4
    expect(textContent).toContain('🤩'); // 5
  });

  test('AC-2: Clicking a rating button updates state.wellBeingRating and applies active class', () => {
    window.__tkState.mode = 'summary';
    window.__tkRender();

    const exBody = document.getElementById('exBody');
    const rateButtons = exBody.querySelectorAll('.wb-btn');
    
    // Initial rating is 0, so none of the buttons should be active
    const activeButtonsBefore = exBody.querySelectorAll('.wb-btn.active');
    expect(activeButtonsBefore.length).toBe(0);

    // Click rating button for 4
    const btn4 = Array.from(rateButtons).find(btn => btn.dataset.val === '4');
    btn4.click();

    // Verify rating state was updated
    expect(window.__tkState.wellBeingRating).toBe(4);

    // Verify active class is added to the 4 button in the updated DOM
    const updatedBtn4 = exBody.querySelector('.wb-btn[data-val="4"]');
    expect(updatedBtn4.classList.contains('active')).toBe(true);

    // Click rating button for 2
    const currentRateButtons = exBody.querySelectorAll('.wb-btn');
    const btn2 = Array.from(currentRateButtons).find(btn => btn.dataset.val === '2');
    btn2.click();

    // Verify rating state was updated
    expect(window.__tkState.wellBeingRating).toBe(2);
    
    const updatedBtn2 = exBody.querySelector('.wb-btn[data-val="2"]');
    const finalBtn4 = exBody.querySelector('.wb-btn[data-val="4"]');
    expect(updatedBtn2.classList.contains('active')).toBe(true);
    expect(finalBtn4.classList.contains('active')).toBe(false);
  });

  test('AC-3: Closing summary screen saves wellBeingRating to history database', async () => {
    window.__tkState.mode = 'summary';
    window.__tkState.wellBeingRating = 4;
    window.__tkState.comment = 'Чувствую прилив сил';
    window.__tkState.isViewingHistory = false;

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    const btn = document.getElementById('secbtn');
    expect(btn.dataset.act).toBe('closesummary');
    
    await btn.click();

    // Verify POST payload contains wellBeingRating
    expect(global.fetch).toHaveBeenCalledWith('/api/history', expect.objectContaining({
      method: 'POST',
      body: expect.stringContaining('"wellBeingRating":4')
    }));

    // Local state should be reset
    expect(window.__tkState.wellBeingRating).toBe(0);
    expect(window.__tkState.comment).toBe('');
    expect(window.__tkState.mode).toBe('home');
  });

  test('AC-4: History list displays wellbeing rating if present', () => {
    window.__tkState.mode = 'home';
    window.__tkState.history = [
      { id: 'h-1', title: 'Утренняя', type: 'workout', date: Date.now(), elapsed: 60000, comment: '', wellBeingRating: 5, sections: [] },
      { id: 'h-2', title: 'Дневная', type: 'workout', date: Date.now(), elapsed: 60000, comment: '', sections: [] } // No rating
    ];

    window.__tkRender();
    const homeHtml = document.getElementById('exBody').innerHTML;

    // First item should display star rating
    expect(homeHtml).toContain('⭐ 5/5');
    
    // Second item should not contain rating display, only duration
    expect(homeHtml).not.toContain('⭐ 0/5');
  });

  test('AC-5: Viewing a past history item displays saved wellBeingRating and disables rating buttons (read-only)', () => {
    window.__tkState.mode = 'home';
    window.__tkState.history = [
      { id: 'h-1', title: 'Утренняя', type: 'workout', date: Date.now(), elapsed: 60000, comment: 'Nice', wellBeingRating: 3, sections: [] }
    ];
    
    window.__tkRender();
    
    // Click on history item
    const historyItem = document.querySelector('[data-act="viewhistory"]');
    expect(historyItem).toBeTruthy();
    historyItem.click();

    // Now state mode should be summary and isViewingHistory true
    expect(window.__tkState.mode).toBe('summary');
    expect(window.__tkState.isViewingHistory).toBe(true);
    expect(window.__tkState.wellBeingRating).toBe(3);

    // Verify rating buttons are disabled and readonly class is added
    const exBody = document.getElementById('exBody');
    const ratingContainer = exBody.querySelector('.wb-rating');
    expect(ratingContainer.classList.contains('readonly')).toBe(true);

    const buttons = exBody.querySelectorAll('.wb-btn');
    buttons.forEach(btn => {
      expect(btn.disabled).toBe(true);
    });

    // Button 3 should be active
    const btn3 = Array.from(buttons).find(btn => btn.dataset.val === '3');
    expect(btn3.classList.contains('active')).toBe(true);
  });

  test('EC-1: Completing workout without rating defaults to 0 and is saved', async () => {
    window.__tkState.mode = 'summary';
    window.__tkState.wellBeingRating = 0;
    window.__tkState.isViewingHistory = false;

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    const btn = document.getElementById('secbtn');
    await btn.click();

    // Verify POST payload contains wellBeingRating of 0
    expect(global.fetch).toHaveBeenCalledWith('/api/history', expect.objectContaining({
      method: 'POST',
      body: expect.stringContaining('"wellBeingRating":0')
    }));
  });
});
