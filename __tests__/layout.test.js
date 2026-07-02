/**
 * @jest-environment jsdom
 */
import { expect, describe, test, beforeAll } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.resolve(__dirname, '../Train Keeper - Фокус.html');
const cssPath = path.resolve(__dirname, '../tk-focus.css');

describe('Mobile Wireframe Layout Wrapper Removal', () => {
  let html;
  let css;

  beforeAll(() => {
    html = fs.readFileSync(htmlPath, 'utf8');
    css = fs.readFileSync(cssPath, 'utf8');
    document.body.innerHTML = html;
  });

  test('AC-1: The DOM does not contain any elements with the .phone class', () => {
    const phoneEl = document.querySelector('.phone');
    expect(phoneEl).toBeNull();
  });

  test('AC-2: The DOM does not contain any elements with the .notch class', () => {
    const notchEl = document.querySelector('.notch');
    expect(notchEl).toBeNull();
  });

  test('AC-3: The main application container (#screen) remains in the DOM and is not inside .phone', () => {
    const screenEl = document.getElementById('screen');
    expect(screenEl).not.toBeNull();
    
    // Check it's not wrapped in a .phone element
    let current = screenEl.parentElement;
    let foundPhone = false;
    while (current) {
      if (current.classList && current.classList.contains('phone')) {
        foundPhone = true;
        break;
      }
      current = current.parentElement;
    }
    expect(foundPhone).toBe(false);
  });

  test('AC-4: tk-focus.css does not contain the old phone fixed-width layout rules', () => {
    // Check that standard mobile mock size constraints (like .phone { width: 320px; height: 660px }) are removed
    expect(css).not.toMatch(/\.phone\s*\{\s*width:\s*320px/);
    expect(css).not.toMatch(/\.notch\s*\{\s*height:\s*24px/);
  });

  test('AC-5 & EC-1: tk-focus.css contains responsive style rules using media queries for .screen', () => {
    // Verify css has media queries
    expect(css).toMatch(/@media/);
    expect(css).toMatch(/\.screen/);
  });
});
