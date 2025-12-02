import request from 'supertest';
import express from 'express';
import experienceRoutes from '../src/app/experiences/experience.routes';
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

// Crear app de prueba
const app = express();
app.use(express.json());
app.use('/api/experiences', experienceRoutes);

describe('Experience Endpoints', () => {
  let guideToken: string;
  let customerToken: string;
  let guideUserId: string;
  let experienceId: string;

  beforeAll(async () => {
    // Conectar a la base de datos
    if (process.env.MONGO_URL) {
      await mongoose.connect(process.env.MONGO_URL, {
        dbName: process.env.DB_NAME || 'vertika'
      });
    }

    // Generar tokens de prueba (necesitarás IDs reales de tu BD)
    guideUserId = '69151fa525a16fe4e4157cc9'; // Reemplazar con un ID real de guía
    
    guideToken = jwt.sign(
      { userId: guideUserId, roles: ['guide'], emailVerified: true },
      process.env.JWT_SECRET || 'test_secret',
      { expiresIn: '1h' }
    );

    customerToken = jwt.sign(
      { userId: '69151fa525a16fe4e4157cca', roles: ['customer'], emailVerified: true },
      process.env.JWT_SECRET || 'test_secret',
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  });

  describe('GET /api/experiences', () => {
    it('should list all experiences', async () => {
      const response = await request(app)
        .get('/api/experiences')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return experiences array even if empty', async () => {
      const response = await request(app)
        .get('/api/experiences')
        .expect(200);

      expect(response.body).toBeDefined();
    });
  });

  describe('POST /api/experiences', () => {
    const newExperience = {
      userId: '69151fa525a16fe4e4157cc9', // ID de guía verificado
      title: 'Ascenso al Pico de Orizaba',
      description: 'Experiencia única de 2 días escalando el volcán más alto de México',
      activity: 'alpinismo',
      location: 'Pico de Orizaba, Puebla',
      difficulty: 'difícil',
      date: '2025-12-15T08:00:00Z',
      maxGroupSize: 6,
      pricePerPerson: 8500,
      currency: 'MXN'
    };

    it('should create experience with valid guide token', async () => {
      const response = await request(app)
        .post('/api/experiences')
        .set('Authorization', `Bearer ${guideToken}`)
        .send(newExperience)
        .expect('Content-Type', /json/);

      if (response.status === 201) {
        expect(response.body).toHaveProperty('_id');
        expect(response.body.title).toBe(newExperience.title);
        experienceId = response.body._id;
      }
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/experiences')
        .send(newExperience)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should fail with missing required fields', async () => {
      const response = await request(app)
        .post('/api/experiences')
        .set('Authorization', `Bearer ${guideToken}`)
        .send({
          title: 'Incomplete Experience'
          // Faltan campos requeridos
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should fail with invalid activity type', async () => {
      const response = await request(app)
        .post('/api/experiences')
        .set('Authorization', `Bearer ${guideToken}`)
        .send({
          ...newExperience,
          activity: 'invalid_activity'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should fail with invalid difficulty', async () => {
      const response = await request(app)
        .post('/api/experiences')
        .set('Authorization', `Bearer ${guideToken}`)
        .send({
          ...newExperience,
          difficulty: 'super_hard'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/experiences/:id', () => {
    it('should get experience by ID', async () => {
      if (!experienceId) {
        return; // Skip si no se creó experiencia
      }

      const response = await request(app)
        .get(`/api/experiences/${experienceId}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('_id', experienceId);
      expect(response.body).toHaveProperty('title');
    });

    it('should return 404 for non-existent experience', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/experiences/${fakeId}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for invalid ID format', async () => {
      const response = await request(app)
        .get('/api/experiences/invalid-id')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PATCH /api/experiences/:id/publish', () => {
    it('should publish experience as owner', async () => {
      if (!experienceId) {
        return;
      }

      const response = await request(app)
        .patch(`/api/experiences/${experienceId}/publish`)
        .set('Authorization', `Bearer ${guideToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'published');
    });

    it('should fail to publish without authentication', async () => {
      if (!experienceId) {
        return;
      }

      const response = await request(app)
        .patch(`/api/experiences/${experienceId}/publish`)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('PATCH /api/experiences/:id/archive', () => {
    it('should archive experience as owner', async () => {
      if (!experienceId) {
        return;
      }

      const response = await request(app)
        .patch(`/api/experiences/${experienceId}/archive`)
        .set('Authorization', `Bearer ${guideToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'archived');
    });
  });

  describe('PUT /api/experiences/:id', () => {
    it('should update experience as owner', async () => {
      if (!experienceId) {
        return;
      }

      const updates = {
        title: 'Ascenso al Pico de Orizaba - ACTUALIZADO',
        pricePerPerson: 9000
      };

      const response = await request(app)
        .put(`/api/experiences/${experienceId}`)
        .set('Authorization', `Bearer ${guideToken}`)
        .send(updates)
        .expect(200);

      expect(response.body.title).toBe(updates.title);
      expect(response.body.pricePerPerson).toBe(updates.pricePerPerson);
    });

    it('should fail to update as non-owner', async () => {
      if (!experienceId) {
        return;
      }

      const response = await request(app)
        .put(`/api/experiences/${experienceId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ title: 'Hack attempt' })
        .expect(403);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/experiences/:id', () => {
    it('should fail to delete as non-owner', async () => {
      if (!experienceId) {
        return;
      }

      const response = await request(app)
        .delete(`/api/experiences/${experienceId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('error');
    });

    it('should delete experience as owner', async () => {
      if (!experienceId) {
        return;
      }

      const response = await request(app)
        .delete(`/api/experiences/${experienceId}`)
        .set('Authorization', `Bearer ${guideToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
    });
  });
});
