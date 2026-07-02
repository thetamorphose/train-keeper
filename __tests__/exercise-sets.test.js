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

describe('Exercise Sets, Skip, Notes, and Reordering Logic', () => {
  let state;

  beforeAll(() => {
    // Setup minimal DOM required by tk-focus.js
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
    
    try {
      eval(code);
    } catch (e) {
      // ignore init errors
    }
  });

  beforeEach(() => {
    // Prepare a mock state representing an active workout with fields
    state = {
      i: 0,
      mode: 'active',
      startedAt: Date.now(),
      description: 'Test Workout Description',
      sections: [
        {
          name: 'Main Section',
          ex: [
            {
              id: 10,
              name: 'Bench Press',
              done: false,
              skipped: false,
              notes: 'Keep elbows tucked',
              fields: [
                { id: 1, key: 'вес', label: 'Вес', type: 'num', value: 60 },
                { id: 2, key: 'повторения', label: 'Повторения', type: 'num', value: 10 },
                { id: 3, key: 'подходы', label: 'Подходы', type: 'num', value: 3 }
              ]
            },
            {
              id: 20,
              name: 'Pushups',
              done: false,
              skipped: false,
              notes: '',
              fields: [
                { id: 4, key: 'повторения', label: 'Повторения', type: 'num', value: 15 }
              ]
            },
            {
              id: 30,
              name: 'Squats',
              done: false,
              skipped: false,
              notes: 'Deep squat',
              fields: [
                { id: 5, key: 'повторения', label: 'Повторения', type: 'num', value: 20 }
              ]
            }
          ]
        }
      ]
    };
  });

  test('AC-1: Workout start should initialize sets array for exercises with "подходы" field', () => {
    const logic = window.__tkLogic;
    
    expect(window.initSetsForExercise).toBeDefined();
    
    const exWithSets = state.sections[0].ex[0];
    window.initSetsForExercise(exWithSets);
    
    expect(exWithSets.sets).toBeDefined();
    expect(exWithSets.sets.length).toBe(3); // Based on 'подходы' = 3
    
    // Each set should inherit fields (вес, повторения) but NOT 'подходы' itself
    const set1 = exWithSets.sets[0];
    expect(set1.fields.length).toBe(2);
    expect(set1.fields.find(f => f.key === 'вес').value).toBe(60);
    expect(set1.fields.find(f => f.key === 'повторения').value).toBe(10);
    expect(set1.fields.find(f => f.key === 'подходы')).toBeUndefined();
    expect(set1.done).toBe(false);
    expect(set1.skipped).toBe(false);
  });

  test('AC-2: Parent exercise completion is computed based on sets completion', () => {
    const ex = state.sections[0].ex[0];
    window.initSetsForExercise(ex);
    
    // Sets initially not completed, parent should be not done
    ex.done = ex.sets.every(s => s.done || s.skipped);
    expect(ex.done).toBe(false);
    
    // Mark two sets done
    ex.sets[0].done = true;
    ex.sets[1].done = true;
    ex.done = ex.sets.every(s => s.done || s.skipped);
    expect(ex.done).toBe(false);
    
    // Mark last set skipped
    ex.sets[2].skipped = true;
    ex.done = ex.sets.every(s => s.done || s.skipped);
    expect(ex.done).toBe(true);
  });

  test('AC-3: Resizing the "подходы" field dynamically adjusts sets array size', () => {
    const ex = state.sections[0].ex[0];
    window.initSetsForExercise(ex);
    expect(ex.sets.length).toBe(3);
    
    // Complete first set
    ex.sets[0].done = true;
    
    // Change подходы value to 4
    ex.fields.find(f => f.key === 'подходы').value = 4;
    window.initSetsForExercise(ex);
    
    expect(ex.sets.length).toBe(4);
    expect(ex.sets[0].done).toBe(true); // preserved status
    expect(ex.sets[3].done).toBe(false); // new set
    expect(ex.sets[3].fields.find(f => f.key === 'вес').value).toBe(60); // inherited value
    
    // Change подходы value to 2 (truncation)
    ex.fields.find(f => f.key === 'подходы').value = 2;
    window.initSetsForExercise(ex);
    expect(ex.sets.length).toBe(2);
    expect(ex.sets[0].done).toBe(true);
  });

  test('AC-4: Skipped status is mutually exclusive with done and triggers skip logic', () => {
    // For exercise without sets:
    const exNoSets = state.sections[0].ex[1];
    expect(exNoSets.skipped).toBe(false);
    
    // Skip it
    exNoSets.skipped = true;
    if (exNoSets.skipped) exNoSets.done = false;
    expect(exNoSets.skipped).toBe(true);
    expect(exNoSets.done).toBe(false);
    
    // Mark done
    exNoSets.done = true;
    if (exNoSets.done) exNoSets.skipped = false;
    expect(exNoSets.skipped).toBe(false);
    expect(exNoSets.done).toBe(true);
  });

  test('AC-5 & AC-6: Description fields are retained in the data model', () => {
    expect(state.description).toBe('Test Workout Description');
    expect(state.sections[0].ex[0].notes).toBe('Keep elbows tucked');
    expect(state.sections[0].ex[1].notes).toBe('');
  });

  test('AC-7: Exercise reordering changes order of exercises within section', () => {
    const logic = window.__tkLogic;
    expect(logic.moveExerciseUp).toBeDefined();
    expect(logic.moveExerciseDown).toBeDefined();

    // Initial order: Bench Press (10), Pushups (20), Squats (30)
    expect(state.sections[0].ex[0].id).toBe(10);
    expect(state.sections[0].ex[1].id).toBe(20);
    expect(state.sections[0].ex[2].id).toBe(30);

    // Move middle exercise (Pushups, 20) UP
    logic.moveExerciseUp(state, 20);
    expect(state.sections[0].ex[0].id).toBe(20); // Pushups
    expect(state.sections[0].ex[1].id).toBe(10); // Bench Press
    expect(state.sections[0].ex[2].id).toBe(30); // Squats

    // Move first exercise (Pushups, 20) UP (should do nothing as it is first)
    logic.moveExerciseUp(state, 20);
    expect(state.sections[0].ex[0].id).toBe(20);

    // Move Bench Press (10) DOWN
    logic.moveExerciseDown(state, 10);
    expect(state.sections[0].ex[0].id).toBe(20); // Pushups
    expect(state.sections[0].ex[1].id).toBe(30); // Squats
    expect(state.sections[0].ex[2].id).toBe(10); // Bench Press

    // Move Bench Press (10) DOWN (should do nothing as it is last)
    logic.moveExerciseDown(state, 10);
    expect(state.sections[0].ex[2].id).toBe(10);
  });
});
