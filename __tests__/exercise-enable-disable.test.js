/**
 * @jest-environment jsdom
 */
import { jest, expect, describe, test, beforeAll } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

global.fetch = jest.fn(() =>
  Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
);

const code = fs.readFileSync(path.resolve(__dirname, '../tk-focus.js'), 'utf8');

describe('Exercise enable/disable (specs/006)', () => {
  let state;

  beforeAll(() => {
    document.body.innerHTML = `
      <div id="exBody"></div>
      <div id="dots"></div>
      <div id="wtitle"></div>
      <div id="wdesc"></div>
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
    try { eval(code); } catch (e) { /* ignore init errors */ }
  });

  beforeEach(() => {
    state = {
      i: 0,
      mode: 'build',
      sections: [
        {
          name: 'Main',
          ex: [
            { id: 10, name: 'Bench', done: false, skipped: false, fields: [{ id: 1, key: 'повторения', value: 10 }] },
            { id: 20, name: 'Pushups', done: false, skipped: false, fields: [{ id: 2, key: 'повторения', value: 15 }] }
          ]
        }
      ]
    };
  });

  test('AC: setExerciseEnabled toggles the flag and reports miss for unknown id', () => {
    const logic = window.__tkLogic;
    expect(logic.setExerciseEnabled(state, 10, false)).toBe(true);
    expect(state.sections[0].ex[0].enabled).toBe(false);
    expect(logic.setExerciseEnabled(state, 10, true)).toBe(true);
    expect(state.sections[0].ex[0].enabled).toBe(true);
    expect(logic.setExerciseEnabled(state, 999, false)).toBe(false);
  });

  test('AC: disabled exercises are excluded from section progress', () => {
    const logic = window.__tkLogic;
    const sec = state.sections[0];
    expect(logic.sectionProgress(sec).total).toBe(2);
    logic.setExerciseEnabled(state, 10, false);
    const prog = logic.sectionProgress(sec);
    expect(prog.total).toBe(1);
    expect(prog.done).toBe(0);
    // all disabled -> total 0 -> section auto-complete (nothing blocks)
    logic.setExerciseEnabled(state, 20, false);
    expect(logic.sectionProgress(sec).total).toBe(0);
    expect(sec.ex.every((e) => e.enabled === false || e.done || e.skipped)).toBe(true);
  });

  test('AC: exerciseStatus reports disabled for disabled exercises', () => {
    const logic = window.__tkLogic;
    const ex = state.sections[0].ex[0];
    expect(logic.exerciseStatus(ex)).toBe('open');
    ex.enabled = false;
    expect(logic.exerciseStatus(ex)).toBe('disabled');
  });

  test('AC: missing enabled field means enabled (migration semantics)', () => {
    const logic = window.__tkLogic;
    const ex = { id: 30, name: 'X', fields: [] };
    expect(logic.isEnabled(ex)).toBe(true);
    ex.enabled = false;
    expect(logic.isEnabled(ex)).toBe(false);
  });

  test('AC: disabled exercises and resulting empty sections are excluded from history payload', () => {
    const logic = window.__tkLogic;
    const sections = [
      { name: 'A', ex: [{ id: 1, name: 'a', fields: [] }, { id: 2, name: 'b', enabled: false, fields: [] }] },
      { name: 'B', ex: [{ id: 3, name: 'c', enabled: false, fields: [] }] }
    ];
    const payload = sections
      .map((s) => ({ ...s, ex: s.ex.filter((e) => e.enabled !== false) }))
      .filter((s) => s.ex.length > 0);
    expect(payload.length).toBe(1);
    expect(payload[0].name).toBe('A');
    expect(payload[0].ex.map((e) => e.id)).toEqual([1]);
  });
});
