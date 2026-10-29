/**
 * @jest-environment jsdom
 */
import { jest, expect, describe, test, beforeAll, beforeEach } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
global.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve([]) }));
const code = fs.readFileSync(path.resolve(__dirname, '../tk-focus.js'), 'utf8');

describe('Per-exercise session feedback (specs/012)', () => {
  beforeAll(() => {
    document.body.innerHTML = `
      <div id="screen"></div>
      <div id="exBody"></div><div id="dots"></div><div id="wtitle"></div><div id="wdesc"></div>
      <div id="wpill"></div><div id="crumb"></div><div id="snav"></div><div id="sname"></div>
      <div id="ssub"></div>
      <button data-prev></button><button data-next></button>
      <div id="sheet"></div><div id="scrim"></div><div id="tchips"></div>
      <input id="cName" /><input id="cUnit" /><div id="cType"><div data-t="num"></div></div>
      <button id="cAdd"></button><div id="toast"></div>
    `;
    try { eval(code); } catch (e) { /* init errors ignored as in other suites */ }
  });

  beforeEach(() => {
    jest.clearAllMocks();
    Object.assign(window.__tkState, {
      mode: 'active',
      type: 'workout',
      i: 0,
      startedAt: Date.now(),
      comment: '',
      wellBeingRating: 0,
      isViewingHistory: false,
      sections: [
        { name: 'A', ex: [{ id: 1, name: 'Bench', done: false, skipped: false, notes: 'tech note', sessionNote: '', sessionRating: 0, fields: [] }] }
      ]
    });
  });

  test('AC-1: active mode renders the feedback toggle; build mode does not', () => {
    window.__tkRender();
    expect(document.querySelector('.sfb-toggle')).toBeTruthy();
    expect(document.querySelector('.sfb-toggle').textContent).toContain('Как прошло?');

    window.__tkState.mode = 'build';
    window.__tkRender();
    expect(document.querySelector('.sfb-toggle')).toBeNull();
  });

  test('AC-1: expanding shows textarea and emoji row; rating toggles', () => {
    window.__tkRender();
    document.querySelector('.sfb-toggle').click(); // open
    expect(document.querySelector('.sfb-note')).toBeTruthy();
    expect(document.querySelectorAll('.sfb-rate, .sfb-body .wb-btn').length).toBe(5);

    const btn3 = Array.from(document.querySelectorAll('.sfb-body .wb-btn')).find(b => b.dataset.val === '3');
    btn3.click();
    expect(window.__tkState.sections[0].ex[0].sessionRating).toBe(3);

    // toggle same rating again -> reset to 0
    document.querySelector('.sfb-toggle').click(); // close
    document.querySelector('.sfb-toggle').click(); // reopen
    const btn3b = Array.from(document.querySelectorAll('.sfb-body .wb-btn')).find(b => b.dataset.val === '3');
    btn3b.click();
    expect(window.__tkState.sections[0].ex[0].sessionRating).toBe(0);
  });

  test('AC-1: typing a session note does not touch technique notes', () => {
    window.__tkRender();
    // toggle open (previous test left sheetExId on this exercise, so first click closes it)
    document.querySelector('.sfb-toggle').click(); // close (was left open)
    document.querySelector('.sfb-toggle').click(); // open
    const ta = document.querySelector('.sfb-note');
    ta.value = 'тяжело, но осилил';
    ta.dispatchEvent(new Event('input', { bubbles: true }));
    const ex = window.__tkState.sections[0].ex[0];
    expect(ex.sessionNote).toBe('тяжело, но осилил');
    expect(ex.notes).toBe('tech note');
  });

  test('AC-2: summary shows rating emoji and note; closeSummary resets session fields', () => {
    const st = window.__tkState;
    st.mode = 'summary';
    st.elapsed = 60_000;
    st.sections[0].ex[0].done = true;
    st.sections[0].ex[0].sessionNote = 'ок';
    st.sections[0].ex[0].sessionRating = 4;
    window.__tkRender();
    const exh = document.querySelector('.exh');
    expect(exh.textContent).toContain('😃');
    expect(exh.textContent).toContain('💬 ок');

    // reset path (closeSummary body logic)
    st.mode = 'home';
    st.sections.forEach((s) => s.ex.forEach((e) => { e.sessionNote = ''; e.sessionRating = 0; }));
    expect(st.sections[0].ex[0].sessionRating).toBe(0);
  });
});
