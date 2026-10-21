import request from 'supertest';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs/promises';

// We need to import the app. Since it's not exported yet, 
// this test will initially fail to even import correctly or will start the server.
// For TDD, I'll first create the test assuming the API SHOULD exist.

// I'll use a dynamic import because server.js has top-level await and side effects
// In a real TDD, I'd refactor server.js first to export app, but let's stick to the spirit.

describe('Templates API', () => {
  let app;
  const DB_TEST_FILE = 'history.test.json';

  beforeAll(async () => {
    // Ensure we start with a clean test database
    try {
      await fs.unlink(DB_TEST_FILE);
    } catch (e) {}
    
    // Set env to test so server.js uses history.test.json
    process.env.NODE_ENV = 'test';
    
    // Import app from server.js
    // Note: server.js will need to be updated to export 'app'
    const module = await import('../server.js');
    app = module.app;
  });

  afterAll(async () => {
    // Clean up
    try {
      await fs.unlink(DB_TEST_FILE);
    } catch (e) {}
  });

  test('GET /api/templates should return an empty array initially', async () => {
    const res = await request(app).get('/api/templates');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  test('POST /api/templates should create a new template', async () => {
    const newTemplate = {
      title: 'New Workout List',
      sections: []
    };
    const res = await request(app)
      .post('/api/templates')
      .send(newTemplate);
    
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.title).toBe('New Workout List');
    expect(res.body.type).toBe('workout'); // default type
  });

  test('POST /api/templates with type habit should create a habit template', async () => {
    const newTemplate = {
      title: 'My Habits',
      type: 'habit',
      sections: []
    };
    const res = await request(app)
      .post('/api/templates')
      .send(newTemplate);
    
    expect(res.status).toBe(201);
    expect(res.body.type).toBe('habit');
  });

  test('PUT /api/templates/:id should update a template and support updating type', async () => {
    // Create one first
    const createRes = await request(app)
      .post('/api/templates')
      .send({ title: 'Old Title', sections: [] });
    const id = createRes.body.id;

    const updateRes = await request(app)
      .put(`/api/templates/${id}`)
      .send({ title: 'Updated Title', type: 'habit', sections: [] });
    
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.title).toBe('Updated Title');
    expect(updateRes.body.type).toBe('habit');
  });

  test('DELETE /api/templates/:id should delete a template', async () => {
    // Create one first
    const createRes = await request(app)
      .post('/api/templates')
      .send({ title: 'To Delete', sections: [] });
    const id = createRes.body.id;

    const deleteRes = await request(app).delete(`/api/templates/${id}`);
    expect(deleteRes.status).toBe(200);

    const getRes = await request(app).get('/api/templates');
    const found = getRes.body.find(t => t.id === id);
    expect(found).toBeUndefined();
  });

  describe('POST /api/templates/:id/duplicate', () => {
    test('AC-1: deep-copies sections/fields with a new id and « (копия)» title; original unchanged', async () => {
      const createRes = await request(app)
        .post('/api/templates')
        .send({
          title: 'Кросс-день',
          type: 'workout',
          sections: [{
            name: 'Основной блок',
            ex: [{ id: 'ex1', name: 'Отжимания', done: false, skipped: false, fields: [{ id: 'f1', label: 'Вес', value: 60 }] }]
          }]
        });
      const id = createRes.body.id;

      const dupRes = await request(app).post(`/api/templates/${id}/duplicate`);
      expect(dupRes.status).toBe(201);
      const copy = dupRes.body;
      expect(copy.id).toBeDefined();
      expect(copy.id).not.toBe(id);
      expect(copy.title).toBe('Кросс-день (копия)');
      expect(copy.type).toBe('workout');
      expect(copy.sections[0].name).toBe('Основной блок');
      expect(copy.sections[0].ex[0].fields[0].value).toBe(60);

      const listRes = await request(app).get('/api/templates');
      expect(listRes.body.some(t => t.id === id)).toBe(true);
      const orig = listRes.body.find(t => t.id === id);
      expect(orig.title).toBe('Кросс-день');
      const copies = listRes.body.filter(t => t.title === 'Кросс-день (копия)');
      expect(copies).toHaveLength(1);
    });

    test('AC-3: responds 404 for unknown id', async () => {
      const res = await request(app).post('/api/templates/no-such-id/duplicate');
      expect(res.status).toBe(404);
    });

    test('AC-2: deleted list disappears from GET /api/templates (reuse of DELETE)', async () => {
      const createRes = await request(app)
        .post('/api/templates')
        .send({ title: 'Временный список', sections: [] });
      const id = createRes.body.id;

      const dupRes = await request(app).post(`/api/templates/${id}/duplicate`);
      expect(dupRes.status).toBe(201);

      await request(app).delete(`/api/templates/${id}`);
      const listRes = await request(app).get('/api/templates');
      expect(listRes.body.some(t => t.id === id)).toBe(false);
      expect(listRes.body.some(t => t.title === 'Временный список (копия)')).toBe(true);
    });
  });
});
