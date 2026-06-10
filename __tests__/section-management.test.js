/**
 * @jest-environment jsdom
 */
const fs = require('fs');
const path = require('path');

// Mock fetch for history sync
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([]),
  })
);

const code = fs.readFileSync(path.resolve(__dirname, '../tk-focus.js'), 'utf8');

describe('Section Management Logic', () => {
  let state;

  beforeAll(() => {
    // Setup minimal DOM required by tk-focus.js IIFE
    document.body.innerHTML = `
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
    
    // Execute the IIFE. It will attach __tkLogic to window.
    // We wrap in a try-catch because it might fail on initial render/sync calls in jsdom,
    // but __tkLogic should still be defined as it's at the top.
    try {
      eval(code);
    } catch (e) {
      // ignore initialization errors in jsdom if __tkLogic is defined
    }
  });

  beforeEach(() => {
    state = {
      i: 0,
      mode: 'build',
      sections: [
        { name: 'Sec 1', ex: [{ id: 100, name: 'Ex 1', fields: [] }] }
      ]
    };
  });

  test('tkLogic.addSection should add a section with one exercise and return its ID', () => {
    const logic = window.__tkLogic;
    const initialCount = state.sections.length;
    
    const newEditId = logic.addSection(state);
    
    expect(state.sections.length).toBe(initialCount + 1);
    expect(state.i).toBe(state.sections.length - 1);
    expect(state.sections[state.i].ex.length).toBe(1);
    expect(state.sections[state.i].ex[0].id).toBe(newEditId);
  });

  test('tkLogic.deleteExercise should remove exercise and keep section if not empty', () => {
    const logic = window.__tkLogic;
    state.sections[0].ex.push({ id: 101, name: 'Ex 2', fields: [] });
    
    const res = logic.deleteExercise(state, 100);
    
    expect(state.sections.length).toBe(1);
    expect(state.sections[0].ex.length).toBe(1);
    expect(state.sections[0].ex[0].id).toBe(101);
    expect(res.sectionDeleted).toBe(false);
  });

  test('tkLogic.deleteExercise should remove section if last exercise is deleted', () => {
    const logic = window.__tkLogic;
    // Add a second section
    state.sections.push({ name: 'Sec 2', ex: [{ id: 200, name: 'Ex 2.1', fields: [] }] });
    state.i = 0;
    
    const res = logic.deleteExercise(state, 100);
    
    expect(state.sections.length).toBe(1);
    expect(state.sections[0].name).toBe('Sec 2');
    expect(res.sectionDeleted).toBe(true);
    // After deleting first section, focus should stay at 0 which is now Sec 2
    expect(state.i).toBe(0);
  });

  test('tkLogic.deleteExercise should focus previous section if last section is deleted', () => {
    const logic = window.__tkLogic;
    state.sections.push({ name: 'Sec 2', ex: [{ id: 200, name: 'Ex 2.1', fields: [] }] });
    state.i = 1;
    
    const res = logic.deleteExercise(state, 200);
    
    expect(state.sections.length).toBe(1);
    expect(state.sections[0].name).toBe('Sec 1');
    expect(state.i).toBe(0);
  });

  test('tkLogic.deleteExercise should create a default section if all sections are gone', () => {
    const logic = window.__tkLogic;
    
    const res = logic.deleteExercise(state, 100);
    
    expect(state.sections.length).toBe(1);
    expect(res.sectionDeleted).toBe(true);
    expect(res.newEditId).toBeDefined();
    expect(state.sections[0].ex.length).toBe(1);
  });
});
