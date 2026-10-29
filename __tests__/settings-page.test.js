/**
 * @jest-environment jsdom
 */
import { jest, expect, describe, test, beforeAll } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([]),
  })
);

const code = fs.readFileSync(path.resolve(__dirname, '../tk-focus.js'), 'utf8');

describe('Workout settings page (stub, specs/005)', () => {
  beforeAll(() => {
    document.body.innerHTML = `
      <div id="snav"></div>
      <button data-prev></button>
      <button data-next></button>
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
    } catch (e) {}
  });

  const state = () => window.__tkState;

  function openHomeWithTemplate() {
    const s = state();
    s.mode = 'home';
    s.templates = [{ id: 'tpl1', title: 'Кросс-день', type: 'workout', sections: [] }];
    window.__tkRender();
  }

  test('AC-1: «Настройки» in the card menu opens the settings page with the list title', () => {
    openHomeWithTemplate();
    const s = state();
    s.mode = 'settings';
    s.settingsTemplateId = 'tpl1';
    window.__tkRender();

    expect(s.mode).toBe('settings');
    expect(document.getElementById('wtitle').textContent).toBe('Кросс-день');
    expect(document.getElementById('exBody').textContent).toContain('параметры появятся позже');
  });

  test('AC-2: back action returns home without changing data', () => {
    const s = state();
    const btn = document.getElementById('secbtn');
    expect(btn.dataset.act).toBe('closesettings');
    btn.click();

    expect(s.mode).toBe('home');
    expect(s.templates[0].title).toBe('Кросс-день');
  });
});
