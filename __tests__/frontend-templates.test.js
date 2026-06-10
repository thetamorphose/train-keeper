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

describe('Frontend Template State Logic', () => {
  let state;

  beforeAll(() => {
    // Setup minimal DOM
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
    
    try {
      eval(code);
    } catch (e) {}
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // We'll test the logic that we EXPECT to be in tkLogic or reachable via state
  });

  test('should have a templates array in state', () => {
    // This assumes we expose state or use tkLogic to get it
    // For now, let's assume we'll add a way to check templates in state
    expect(window.__tkState.templates).toBeDefined();
    expect(Array.isArray(window.__tkState.templates)).toBe(true);
  });

  test('fetchTemplates should populate state.templates', async () => {
    const mockTemplates = [{ id: '1', title: 'Test Template', sections: [] }];
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockTemplates),
    });

    await window.__tkLogic.fetchTemplates(window.__tkState);
    expect(window.__tkState.templates).toEqual(mockTemplates);
  });

  test('createNewTemplate should create template on server and set as active', async () => {
    const newTemplate = { id: 'new-id', title: 'Новый список', sections: [] };
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(newTemplate),
    });

    await window.__tkLogic.createNewTemplate(window.__tkState);
    
    expect(window.__tkState.templates[0]).toEqual(newTemplate);
    expect(window.__tkState.activeTemplateId).toBe('new-id');
    expect(window.__tkState.mode).toBe('build');
  });

  test('saveTemplate should call PUT API with current template data', async () => {
    window.__tkState.activeTemplateId = '123';
    window.__tkState.title = 'Updated Title';
    window.__tkState.sections = [{ name: 'Sec', ex: [] }];
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    await window.__tkLogic.saveTemplate(window.__tkState);

    expect(global.fetch).toHaveBeenCalledWith('/api/templates/123', expect.objectContaining({
      method: 'PUT',
      body: expect.stringContaining('"title":"Updated Title"')
    }));
  });
});
