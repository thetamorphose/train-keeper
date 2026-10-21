import request from 'supertest';
import { jest } from '@jest/globals';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs/promises';

describe('History API — entry editing (specs/004)', () => {
  let app;
  const DB_TEST_FILE = 'history-api.test.json';

  beforeAll(async () => {
    try {
      await fs.unlink(DB_TEST_FILE);
    } catch (e) {}
    process.env.NODE_ENV = 'test';
    process.env.TK_DB_FILE = DB_TEST_FILE;
    const module = await import('../server.js');
    app = module.app;
  });

  afterAll(async () => {
    for (const f of [DB_TEST_FILE, 'history-legacy.test.json']) {
      try { await fs.unlink(f); } catch (e) {}
    }
  });

  test('AC-3: POST assigns a stable id to new history entries', async () => {
    const res = await request(app)
      .post('/api/history')
      .send({ title: 'T1', comment: '', wellBeingRating: 3, sections: [] });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    const list = await request(app).get('/api/history');
    const entry = list.body.find((h) => h.title === 'T1');
    expect(entry).toBeDefined();
    expect(typeof entry.id).toBe('string');
    expect(entry.id.length).toBeGreaterThan(8);


  });

  test('AC-1: PUT /api/history/:id updates wellBeingRating and comment', async () => {
    const list = await request(app).get('/api/history');
    const entry = list.body.find((h) => h.title === 'T1');
    expect(entry.wellBeingRating).toBe(3);

    const put = await request(app)
      .put(`/api/history/${entry.id}`)
      .send({ wellBeingRating: 5, comment: 'На самом деле прошло отлично' });
    expect(put.status).toBe(200);
    expect(put.body.wellBeingRating).toBe(5);
    expect(put.body.comment).toBe('На самом деле прошло отлично');

    const after = await request(app).get('/api/history');
    const updated = after.body.find((h) => h.id === entry.id);
    expect(updated.wellBeingRating).toBe(5);
    expect(updated.comment).toBe('На самом деле прошло отлично');
    expect(updated.title).toBe('T1'); // other fields untouched
  });

  test('AC-1/2: PUT clamps the rating to 1..5', async () => {
    const list = await request(app).get('/api/history');
    const entry = list.body.find((h) => h.title === 'T1');
    const put = await request(app)
      .put(`/api/history/${entry.id}`)
      .send({ wellBeingRating: 99 });
    expect(put.body.wellBeingRating).toBe(5);
  });

  test('AC-3: PUT with unknown id responds 404', async () => {
    const res = await request(app).put('/api/history/no-such-id').send({ wellBeingRating: 2 });
    expect(res.status).toBe(404);
  });

  test('AC-3: backfillHistoryIds assigns ids to legacy entries, keeps existing ones', async () => {
    // The startup wiring (`db.data.history = backfillHistoryIds(...).list`) is exercised on
    // every server start; ESM re-import in jest returns a cached module, so the pure
    // function is tested directly.
    const { backfillHistoryIds } = await import('../server.js');
    const legacy = [{ title: 'Legacy', comment: '' }, { id: 'keep-me', title: 'Fresh' }];
    const { list, changed } = backfillHistoryIds(legacy);
    expect(changed).toBe(true);
    expect(typeof list[0].id).toBe('string');
    expect(list[1].id).toBe('keep-me');
    expect(list[1]).toBe(legacy[1]); // untouched reference
  });
});
