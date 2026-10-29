import request from 'supertest';
import { jest } from '@jest/globals';
import fs from 'fs/promises';

describe('History API — entry deletion (specs/007)', () => {
  let app;
  const DB_TEST_FILE = 'history-delete.test.json';

  beforeAll(async () => {
    try { await fs.unlink(DB_TEST_FILE); } catch (e) {}
    process.env.NODE_ENV = 'test';
    process.env.TK_DB_FILE = DB_TEST_FILE;
    const module = await import('../server.js');
    app = module.app;
  });

  afterAll(async () => {
    try { await fs.unlink(DB_TEST_FILE); } catch (e) {}
  });

  test('AC: DELETE removes an entry, subsequent GET lacks it', async () => {
    await request(app).post('/api/history').send({ title: 'ToDelete', comment: '', sections: [] });
    const list = await request(app).get('/api/history');
    const entry = list.body.find((h) => h.title === 'ToDelete');
    expect(entry).toBeDefined();

    const del = await request(app).delete(`/api/history/${entry.id}`);
    expect(del.status).toBe(200);
    expect(del.body.success).toBe(true);

    const after = await request(app).get('/api/history');
    expect(after.body.find((h) => h.id === entry.id)).toBeUndefined();
  });

  test('AC: DELETE with unknown id responds 404 and changes nothing', async () => {
    const before = await request(app).get('/api/history');
    const res = await request(app).delete('/api/history/no-such-id');
    expect(res.status).toBe(404);
    const after = await request(app).get('/api/history');
    expect(after.body.length).toBe(before.body.length);
  });
});
