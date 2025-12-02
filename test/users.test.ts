import request from 'supertest';
import express from 'express';
import userRoutes from '../src/app/users/user.routes';
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

// Crear app de prueba
const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);

describe('User Endpoints', () => {
  let authToken: string;
  let testUserId: string;

  beforeAll(async () => {
    // Conectar a la base de datos
    if (process.env.MONGO_URL) {
      await mongoose.connect(process.env.MONGO_URL, {
        dbName: process.env.DB_NAME || 'vertika'
      });
    }

    // Generar token de prueba
    testUserId = '69151fa525a16fe4e4157cc9'; // Reemplazar con ID real
    authToken = jwt.sign(
      { userId: testUserId, roles: ['customer'], emailVerified: true },
      process.env.JWT_SECRET || 'test_secret',
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  });

  describe('GET /api/users', () => {
    it('should list all users with authentication', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/users')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should get user by ID with authentication', async () => {
      const response = await request(app)
        .get(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('email');
      expect(response.body).not.toHaveProperty('password'); // No debe exponer password
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/users/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get(`/api/users/${testUserId}`)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('PATCH /api/users/:id', () => {
    it('should update user profile', async () => {
      const updates = {
        name: 'Updated Name'
      };

      const response = await request(app)
        .patch(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updates)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('name', updates.name);
    });

    it('should fail to update without authentication', async () => {
      const response = await request(app)
        .patch(`/api/users/${testUserId}`)
        .send({ name: 'Hacker' })
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should fail to update with invalid data', async () => {
      const response = await request(app)
        .patch(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ email: 'invalid-email' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should fail to delete without proper authorization', async () => {
      const response = await request(app)
        .delete(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('error');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .delete(`/api/users/${testUserId}`)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });
});
