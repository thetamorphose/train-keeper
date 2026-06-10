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
  });

  test('PUT /api/templates/:id should update a template', async () => {
    // Create one first
    const createRes = await request(app)
      .post('/api/templates')
      .send({ title: 'Old Title', sections: [] });
    const id = createRes.body.id;

    const updateRes = await request(app)
      .put(`/api/templates/${id}`)
      .send({ title: 'Updated Title', sections: [] });
    
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.title).toBe('Updated Title');
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
});
