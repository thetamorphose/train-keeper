/**
 * @jest-environment jsdom
 */
import { jest, expect, describe, test, beforeAll, beforeEach } from '@jest/globals';
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

describe('Skipped exercise counting (bug-2026-10-21-001)', () => {
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
  const ex = (props = {}) => ({ id: 1, name: 'X', done: false, skipped: false, fields: [], ...props });

  describe('exerciseStatus — no sets', () => {
    test('done flag → done', () => {
      expect(logic().exerciseStatus(ex({ done: true }))).toBe('done');
    });
    test('skipped flag → skipped (not done)', () => {
      expect(logic().exerciseStatus(ex({ skipped: true }))).toBe('skipped');
    });
    test('neither → open', () => {
      expect(logic().exerciseStatus(ex())).toBe('open');
    });
  });

  describe('exerciseStatus — with sets (majority rule, owner decision 2026-10-21)', () => {
    test('majority of sets done → done', () => {
      const sets = [1, 2, 3].map((i) => ({ id: i, done: true, skipped: false }));
      expect(logic().exerciseStatus(ex({ sets }))).toBe('done');
    });
    test('majority of sets skipped → skipped (workout stays finishable via gate)', () => {
      const sets = [
        { id: 1, done: false, skipped: true },
        { id: 2, done: false, skipped: true },
        { id: 3, done: true, skipped: false },
      ];
      expect(logic().exerciseStatus(ex({ sets }))).toBe('skipped');
    });
    test('tie done/skipped with all sets closed → done (optimistic, owner decision)', () => {
      const sets = [
        { id: 1, done: true, skipped: false },
        { id: 2, done: false, skipped: true },
        { id: 3, done: true, skipped: false },
        { id: 4, done: false, skipped: true },
      ];
      expect(logic().exerciseStatus(ex({ sets }))).toBe('done');
    });
    test('open sets remain → open even if done count leads', () => {
      const sets = [
        { id: 1, done: true, skipped: false },
        { id: 2, done: false, skipped: false },
        { id: 3, done: false, skipped: false },
        { id: 4, done: false, skipped: false },
      ];
      expect(logic().exerciseStatus(ex({ sets }))).toBe('open');
    });
  });

  describe('sectionProgress', () => {
    test('counts done, skipped and total separately', () => {
      const sec = {
        ex: [
          ex({ id: 1, done: true }),
          ex({ id: 2, skipped: true }),
          ex({ id: 3 }),
        ],
      };
      expect(logic().sectionProgress(sec)).toEqual({ done: 1, skipped: 1, total: 3 });
    });
  });

  describe('section button gate', () => {
    const renderActive = (sections, i = 0) => {
      window.__tkState.mode = 'active';
      window.__tkState.type = 'workout';
      window.__tkState.sections = sections;
      window.__tkState.i = i;
      logic().renderForTest ? logic().renderForTest() : window.__tkRender();
    };

    test('AC: skipped-only section unlocks finish button', () => {
      const sec = { name: 'S', ex: [ex({ id: 1, skipped: true }), ex({ id: 2, skipped: true })] };
      renderActive([sec]);
      const btn = document.querySelector('#secbtn');
      expect(btn.textContent).toContain('Завершить');
    });

    test('AC: button shows separate skipped counter while open work remains', () => {
      const sec = { name: 'S', ex: [ex({ id: 1, skipped: true }), ex({ id: 2 })] };
      renderActive([sec]);
      const btn = document.querySelector('#secbtn');
      expect(btn.textContent).toContain('пропущено');
      expect(btn.textContent).toMatch(/из 2/);
    });
  });
});
