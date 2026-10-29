/**
 * @jest-environment jsdom
 */
import { expect, describe, test, beforeAll } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const css = fs.readFileSync(path.resolve(__dirname, '../tk-focus.css'), 'utf8');

describe('Header collapse on scroll (specs/009)', () => {
  test('AC-1/2: CSS collapses crumb, title, wdesc, snav, dots under .screen.scrolled but not the timer', () => {
    expect(css).toMatch(/\.screen\.scrolled \.wtop \.crumb/);
    expect(css).toMatch(/\.screen\.scrolled \.wtop \.wtitle/);
    expect(css).toMatch(/\.screen\.scrolled \.snav/);
    expect(css).toMatch(/\.screen\.scrolled \.dots/);
    // timer stays visible: explicit opacity rule, and no .screen.scrolled .timer hide rule
    expect(css).toMatch(/\.screen\.scrolled \.timer\{opacity:1;\}/);
    expect(css).not.toMatch(/\.screen\.scrolled \.timer\{[^}]*opacity:\s*0/);
  });

  test('AC-3: collapse is active-mode only (no .scrolled without .screen active gating in JS)', () => {
    const js = fs.readFileSync(path.resolve(__dirname, '../tk-focus.js'), 'utf8');
    // updateHeaderCollapse removes the class unless mode is 'active'
    expect(js).toMatch(/if \(state\.mode !== 'active'\) \{ screen\.classList\.remove\('scrolled'\); return; \}/);
    // threshold 40px
    expect(js).toMatch(/exBody\.scrollTop > 40/);
    // render re-evaluates collapse (mode switches reset it)
    expect(js).toMatch(/function render\(\) \{\s*const mode = state\.mode;\s*updateHeaderCollapse\(\);/);
  });
});
