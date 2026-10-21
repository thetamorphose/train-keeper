/**
 * @jest-environment jsdom
 */
import { jest, expect, describe, test, beforeAll } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([]),
  })
);

const code = fs.readFileSync(path.resolve(__dirname, '../tk-focus.js'), 'utf8');

describe('Exercise duplication across sections/workouts (specs/003)', () => {
  beforeAll(() => {
    document.body.innerHTML = `
      <div id="snav"></div>
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
    try {
      eval(code);
    } catch (e) {
      // ignore init errors
    }
  });

  const logic = () => window.__tkLogic;
  const mkEx = (id) => ({
    id,
    name: 'Отжимания',
    done: true,
    skipped: false,
    notes: 'локти прижаты',
    fields: [{ id: 'f1', label: 'Вес', value: 60 }, { id: 'f2', label: 'Повторы', value: 15 }],
    sets: [{ id: 's1', done: true, skipped: false }],
  });

  describe('cloneExercise (AC-1, AC-3)', () => {
    test('returns a full clone with fresh ids on card, fields and sets', () => {
      const src = mkEx('ex1');
      const c = logic().cloneExercise(src);
      expect(c.id).not.toBe(src.id);
      expect(c.fields.map((f) => f.id)).not.toEqual(src.fields.map((f) => f.id));
      expect(c.sets.map((s) => s.id)).not.toEqual(src.sets.map((s) => s.id));
      expect(c.name).toBe('Отжимания');
      expect(c.notes).toBe('локти прижаты');
      expect(c.fields.map((f) => f.value)).toEqual([60, 15]);
    });

    test('no shared references: mutating the clone does not touch the original (AC-3)', () => {
      const src = mkEx('ex1');
      const c = logic().cloneExercise(src);
      c.fields[0].value = 999;
      c.sets[0].done = false;
      c.notes = 'changed';
      expect(src.fields[0].value).toBe(60);
      expect(src.sets[0].done).toBe(true);
      expect(src.notes).toBe('локти прижаты');
    });

    test('done/skipped flags are reset on the clone', () => {
      const c = logic().cloneExercise(mkEx('ex1'));
      expect(c.done).toBe(false);
      expect(c.skipped).toBe(false);
    });
  });

  describe('addExerciseToSection (AC-1)', () => {
    test('appends to the end of the chosen section', () => {
      const sections = [
        { name: 'A', ex: [mkEx('a1')] },
        { name: 'B', ex: [mkEx('b1'), mkEx('b2')] },
      ];
      const clone = logic().cloneExercise(mkEx('ex1'));
      const ok = logic().addExerciseToSection(sections, 1, clone);
      expect(ok).toBe(true);
      expect(sections[1].ex).toHaveLength(3);
      expect(sections[1].ex[2]).toBe(clone);
    });

    test('rejects an invalid section index', () => {
      const sections = [{ name: 'A', ex: [] }];
      const clone = logic().cloneExercise(mkEx('ex1'));
      expect(logic().addExerciseToSection(sections, 5, clone)).toBe(false);
      expect(sections[0].ex).toHaveLength(0);
    });
  });
});
