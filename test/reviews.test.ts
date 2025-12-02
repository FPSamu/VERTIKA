import request from 'supertest';
import express from 'express';
import reviewRoutes from '../src/app/reviews/review.routes';
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

// Crear app de prueba
const app = express();
app.use(express.json());
app.use('/api/reviews', reviewRoutes);

describe('Review Endpoints', () => {
  let authToken: string;
  let userId: string;
  let reviewId: string;

  beforeAll(async () => {
    // Conectar a la base de datos
    if (process.env.MONGO_URL) {
      await mongoose.connect(process.env.MONGO_URL, {
        dbName: process.env.DB_NAME || 'vertika'
      });
    }

    userId = '69151fa525a16fe4e4157ccb';
    authToken = jwt.sign(
      { userId, roles: ['customer'], emailVerified: true },
      process.env.JWT_SECRET || 'test_secret',
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  });

  describe('GET /api/reviews', () => {
    it('should list all reviews', async () => {
      const response = await request(app)
        .get('/api/reviews')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /api/reviews', () => {
    const newReview = {
      reservationId: '69151fdb25a16fe4e4157ccc',
      userId: '69151fa525a16fe4e4157ccb',
      experienceId: '69151fdb25a16fe4e4157ccc',
      guideId: '69151fa525a16fe4e4157cca',
      experienceRating: 5,
      guideRating: 5,
      comment: '¡Excelente experiencia! Lo recomiendo totalmente.'
    };

    it('should create a review successfully', async () => {
      const response = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newReview)
        .expect('Content-Type', /json/);

      if (response.status === 201) {
        expect(response.body).toHaveProperty('_id');
        expect(response.body.comment).toBe(newReview.comment);
        expect(response.body.experienceRating).toBe(newReview.experienceRating);
        expect(response.body.guideRating).toBe(newReview.guideRating);
        reviewId = response.body._id;
      }
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/reviews')
        .send(newReview)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should fail with rating out of range', async () => {
      const response = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ...newReview,
          experienceRating: 6 // Fuera de rango 0-5
        })
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });

    it('should fail with negative rating', async () => {
      const response = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ...newReview,
          guideRating: -1
        })
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });

    it('should fail with missing required fields', async () => {
      const response = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          comment: 'Review incompleta'
        })
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/reviews/experience/:experienceId', () => {
    it('should get reviews for specific experience', async () => {
      const experienceId = '69151fdb25a16fe4e4157ccc';
      const response = await request(app)
        .get(`/api/reviews/experience/${experienceId}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return empty array for experience with no reviews', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/reviews/experience/${fakeId}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });

  describe('GET /api/reviews/guide/:guideId', () => {
    it('should get reviews for specific guide', async () => {
      const guideId = '69151fa525a16fe4e4157cca';
      const response = await request(app)
        .get(`/api/reviews/guide/${guideId}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /api/reviews/user/:userId', () => {
    it('should get reviews by specific user', async () => {
      const response = await request(app)
        .get(`/api/reviews/user/${userId}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /api/reviews/:id', () => {
    it('should get review by ID', async () => {
      if (!reviewId) {
        return;
      }

      const response = await request(app)
        .get(`/api/reviews/${reviewId}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('_id', reviewId);
    });

    it('should return 404 for non-existent review', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/reviews/${fakeId}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/reviews/:id', () => {
    it('should update review as owner', async () => {
      if (!reviewId) {
        return;
      }

      const updates = {
        comment: 'Comentario actualizado - ¡Increíble aventura!',
        experienceRating: 4
      };

      const response = await request(app)
        .put(`/api/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updates)
        .expect(200);

      expect(response.body.comment).toBe(updates.comment);
      expect(response.body.experienceRating).toBe(updates.experienceRating);
    });

    it('should fail without authentication', async () => {
      if (!reviewId) {
        return;
      }

      const response = await request(app)
        .put(`/api/reviews/${reviewId}`)
        .send({ comment: 'Hack attempt' })
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('DELETE /api/reviews/:id', () => {
    it('should delete review as owner', async () => {
      if (!reviewId) {
        return;
      }

      const response = await request(app)
        .delete(`/api/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 404 for already deleted review', async () => {
      if (!reviewId) {
        return;
      }

      const response = await request(app)
        .delete(`/api/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });
});
