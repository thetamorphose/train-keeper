/**
 * @jest-environment jsdom
 */
import { jest, expect, describe, test, beforeAll, beforeEach } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Mock fetch for history sync and API calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([]),
  })
);

const code = fs.readFileSync(path.resolve(__dirname, '../tk-focus.js'), 'utf8');

describe('Navigation Back Logic', () => {
  beforeAll(() => {
    // Setup minimal DOM required by tk-focus.js
    document.body.innerHTML = `
      <div id="snav">
        <button data-prev></button>
        <button data-next></button>
      </div>
      <div id="exBody"></div>
      <div id="dots"></div>
      <div id="wtitle"></div>
      <div id="wpill"></div>
      <div id="crumb"></div>
      <div id="sname"></div>
      <div id="ssub"></div>
      <button id="secbtn"></button>
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
      // Ignore initial execution errors in JSDOM environment
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    // Set a default state matching tk-focus structure
    window.__tkState.mode = 'home';
    window.__tkState.activeTemplateId = null;
    window.__tkState.i = 0;
    window.__tkState.title = 'Кросс-день';
    window.__tkState.sections = [
      {
        name: 'Разминка',
        ex: [
          { id: 100, name: 'Упр 1', done: false, fields: [] }
        ]
      }
    ];
  });

  // Helper to trigger render() by dispatching a dot click that doesn't modify mode
  function forceRender() {
    const dummy = document.createElement('div');
    dummy.dataset.act = 'dot';
    dummy.dataset.i = '0';
    document.body.appendChild(dummy);
    dummy.click();
    dummy.remove();
  }

  // Helper to find the back button with label "← Назад"
  function findBackButton() {
    const elements = Array.from(document.querySelectorAll('*'));
    return elements.find(el => {
      if (el.textContent && el.textContent.trim() === '← Назад') {
        // Verify it's not hidden
        let current = el;
        while (current) {
          if (current.style && current.style.display === 'none') {
            return false;
          }
          current = current.parentElement;
        }
        return true;
      }
      return false;
    });
  }

  test('AC-1: A back button labeled "← Назад" is visible on the Workout Preparation screen (when state.mode === "build")', () => {
    window.__tkState.mode = 'build';
    forceRender();

    const backBtn = findBackButton();
    expect(backBtn).toBeTruthy();
    expect(backBtn.textContent.trim()).toBe('← Назад');
  });

  test('AC-2: The back button is not visible on the Workout List (home), Active Workout (active), or Workout Summary (summary) screens', () => {
    // Home mode
    window.__tkState.mode = 'home';
    forceRender();
    expect(findBackButton()).toBeFalsy();

    // Active mode
    window.__tkState.mode = 'active';
    forceRender();
    expect(findBackButton()).toBeFalsy();

    // Summary mode
    window.__tkState.mode = 'summary';
    forceRender();
    expect(findBackButton()).toBeFalsy();
  });

  test('AC-3: Clicking the back button resets state.activeTemplateId to null, state.i to 0, and transitions to home mode', () => {
    window.__tkState.mode = 'build';
    window.__tkState.activeTemplateId = 'temp-123';
    window.__tkState.i = 2;
    forceRender();

    const backBtn = findBackButton();
    expect(backBtn).toBeTruthy();

    backBtn.click();

    expect(window.__tkState.mode).toBe('home');
    expect(window.__tkState.activeTemplateId).toBeNull();
    expect(window.__tkState.i).toBe(0);
  });

  test('AC-4 & EC-1: Changes made during preparation mode are saved automatically to server and local storage when clicking the back button', async () => {
    window.__tkState.mode = 'build';
    window.__tkState.activeTemplateId = 'temp-456';
    window.__tkState.title = 'Initial Name';
    window.__tkState.sections = [{ name: 'Sec A', ex: [] }];
    forceRender();

    // Mock successful save API
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    // Simulate change
    window.__tkState.title = 'Changed Name';

    const backBtn = findBackButton();
    expect(backBtn).toBeTruthy();
    backBtn.click();

    // Verify local storage save
    const storedState = JSON.parse(localStorage.getItem('tk_focus_v4'));
    expect(storedState).toBeTruthy();
    expect(storedState.title).toBe('Changed Name');

    // Verify server save call
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/templates/temp-456'),
      expect.objectContaining({
        method: 'PUT',
        body: expect.stringContaining('"title":"Changed Name"')
      })
    );
  });

  test('ERR-1: If the back button action is triggered when state.mode is already home, it fails gracefully without throwing errors', () => {
    window.__tkState.mode = 'home';
    forceRender();

    // Even if not visible, trigger back action programmatically if action exists
    const dummyBack = document.createElement('button');
    dummyBack.dataset.act = 'back';
    document.body.appendChild(dummyBack);

    expect(() => {
      dummyBack.click();
    }).not.toThrow();

    dummyBack.remove();
  });
});
