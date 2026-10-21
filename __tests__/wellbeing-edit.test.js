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

describe('Inline editing of history rating/comment (specs/004)', () => {
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

  const state = () => window.__tkState;

  function enterHistoryView() {
    const s = state();
    s.mode = 'home';
    s.history = [
      { id: 'h1', title: 'Кросс-день', comment: 'старый комментарий', wellBeingRating: 3, sections: [] },
    ];
    s.isViewingHistory = false;
    // open the history entry like the home screen click would
    document.querySelector('#exBody');
    const click = { target: null, preventDefault() {}, stopPropagation() {} };
    // direct state setup instead of DOM dispatch (history case uses index i from dots-free path)
    s.viewingHistoryIndex = 0;
    s.isViewingHistory = true;
    s.mode = 'summary';
    s.title = s.history[0].title;
    s.comment = s.history[0].comment;
    s.wellBeingRating = s.history[0].wellBeingRating;
    window.__tkRender();
  }

  test('AC-1: tapping a rating button in history view updates the history entry and PUTs to server', async () => {
    enterHistoryView();
    const btn = Array.from(document.querySelectorAll('.wb-btn')).find((b) => b.dataset.val === '5');
    expect(btn).toBeDefined();
    expect(btn.disabled).toBe(false); // buttons are enabled in history view now

    btn.click();
    await Promise.resolve(); // let fetch promise settle

    expect(state().wellBeingRating).toBe(5);
    expect(state().history[0].wellBeingRating).toBe(5);
    const calls = global.fetch.mock.calls.filter((c) => c[0] === '/api/history/h1');
    expect(calls.length).toBeGreaterThan(0);
    expect(calls[calls.length - 1][1].method).toBe('PUT');
    expect(JSON.parse(calls[calls.length - 1][1].body).wellBeingRating).toBe(5);
  });

  test('AC-1: rating buttons are not disabled in history view (readonly class removed)', () => {
    enterHistoryView();
    expect(document.querySelector('.wb-rating.readonly')).toBeNull();
  });

  test('AC-2: editing the comment and leaving the field syncs it to the history entry', async () => {
    enterHistoryView();
    const ta = document.querySelector('textarea.comment');
    expect(ta).toBeDefined();
    ta.value = 'пересмотрел: было тяжелее, чем казалось';
    ta.dispatchEvent(new window.Event('input', { bubbles: true }));
    ta.dispatchEvent(new window.Event('focusout', { bubbles: true }));
    await Promise.resolve();

    expect(state().history[0].comment).toBe('пересмотрел: было тяжелее, чем казалось');
    const calls = global.fetch.mock.calls.filter((c) => c[0] === '/api/history/h1');
    expect(calls.length).toBeGreaterThan(0);
    expect(JSON.parse(calls[calls.length - 1][1].body).comment).toBe('пересмотрел: было тяжелее, чем казалось');
  });
});
