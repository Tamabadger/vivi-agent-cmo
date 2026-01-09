import request from 'supertest';
import app from '../index';

describe('Health Routes', () => {
  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body.status).toBe('healthy');
    });
  });

  describe('GET /api/health/db', () => {
    it('should return database health status', async () => {
      const response = await request(app)
        .get('/api/health/db')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('database');
      expect(response.body.database).toBe('connected');
    });
  });
});
