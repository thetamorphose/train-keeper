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

describe('Per-section time tracking (specs/011)', () => {
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

  let base;
  beforeEach(() => {
    jest.clearAllMocks();
    base = {
      mode: 'active',
      startedAt: 1000_000,
      i: 0,
      type: 'workout',
      sections: [
        { name: 'A', ex: [{ id: 1, name: 'x', done: true, skipped: false, fields: [] }] },
        { name: 'B', ex: [{ id: 2, name: 'y', done: true, skipped: false, fields: [] }] }
      ]
    };
    Object.assign(window.__tkState, base);
  });

  test('AC: time accumulates in the current section and switches correctly', () => {
    const st = window.__tkState;
    st.sectionTimes = [0]; st.curSectionStartedAt = st.startedAt; // as startWorkout does

    // 60s in section 0, then switch to 1
    window.__tkSwitchSection(st, 1, st.startedAt + 60_000);
    expect(st.sectionTimes[0]).toBe(60);
    expect(st.i).toBe(1);

    // 30s in section 1, back to 0 (revisit)
    window.__tkSwitchSection(st, 0, st.startedAt + 90_000);
    expect(st.sectionTimes[1]).toBe(30);

    // another 10s in section 0 -> summed across visits
    window.__tkSwitchSection(st, 1, st.startedAt + 100_000);
    expect(st.sectionTimes[0]).toBe(70);
  });

  test('AC: finishWorkout closes the current section (sum == elapsed within rounding)', () => {
    const st = window.__tkState;
    st.sectionTimes = [0]; st.curSectionStartedAt = st.startedAt;
    // emulate finish at +90s without clicking through (call track + compute like finishWorkout)
    window.__tkTrackSectionTime(st, st.startedAt + 90_000);
    const sum = st.sectionTimes.reduce((a, b) => a + (b || 0), 0);
    expect(sum).toBe(90);
  });

  test('AC: tracking is inert outside active mode', () => {
    const st = window.__tkState;
    st.mode = 'build'; st.startedAt = 1000_000; st.i = 0;
    st.sectionTimes = []; st.curSectionStartedAt = st.startedAt;
    window.__tkTrackSectionTime(st, st.startedAt + 50_000);
    expect(st.sectionTimes[0]).toBeUndefined();
  });

  test('AC: summary badge contract — sec-time rendered for workout, not for habit', () => {
    const st = window.__tkState;
    st.mode = 'summary'; st.type = 'workout';
    st.elapsed = 90_000;
    st.sectionTimes = [60, 30];
    st.comment = ''; st.wellBeingRating = 0; st.isViewingHistory = false;
    window.__tkRender();
    expect(document.querySelectorAll('.sec-time').length).toBe(2);

    st.type = 'habit';
    window.__tkRender();
    expect(document.querySelectorAll('.sec-time').length).toBe(0);
  });
});
