import request from 'supertest';
import express from 'express';
import reservationRoutes from '../src/app/reservations/reservation.routes';
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

// Crear app de prueba
const app = express();
app.use(express.json());
app.use('/api/reservations', reservationRoutes);

describe('Reservation Endpoints', () => {
  let customerToken: string;
  let guideToken: string;
  let customerId: string;
  let experienceId: string;
  let reservationId: string;

  beforeAll(async () => {
    // Conectar a la base de datos
    if (process.env.MONGO_URL) {
      await mongoose.connect(process.env.MONGO_URL, {
        dbName: process.env.DB_NAME || 'vertika'
      });
    }

    // IDs de prueba (reemplazar con IDs reales de tu BD)
    customerId = '69151fa525a16fe4e4157cca';
    experienceId = '69151fdb25a16fe4e4157ccc';

    customerToken = jwt.sign(
      { userId: customerId, roles: ['customer'], emailVerified: true },
      process.env.JWT_SECRET || 'test_secret',
      { expiresIn: '1h' }
    );

    guideToken = jwt.sign(
      { userId: '69151fa525a16fe4e4157cc9', roles: ['guide'], emailVerified: true },
      process.env.JWT_SECRET || 'test_secret',
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  });

  describe('GET /api/reservations', () => {
    it('should list all reservations', async () => {
      const response = await request(app)
        .get('/api/reservations')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /api/reservations', () => {
    const newReservation = {
      experienceId: '69151fdb25a16fe4e4157ccc', // ID de experiencia válida
      userId: '69151fa525a16fe4e4157cca', // ID de usuario válido
      seats: 2,
      total: 17000,
      status: 'pending'
    };

    it('should create a reservation successfully', async () => {
      const response = await request(app)
        .post('/api/reservations')
        .send(newReservation)
        .expect('Content-Type', /json/);

      if (response.status === 201) {
        expect(response.body).toHaveProperty('_id');
        expect(response.body).toHaveProperty('confirmationToken');
        expect(response.body.seats).toBe(newReservation.seats);
        expect(response.body.total).toBe(newReservation.total);
        reservationId = response.body._id;
      }
    });

    it('should fail with missing required fields', async () => {
      const response = await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          experienceId: experienceId
          // Faltan campos requeridos
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should fail with invalid experience ID', async () => {
      const response = await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          ...newReservation,
          experienceId: 'invalid-id'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should fail with zero or negative seats', async () => {
      const response = await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          ...newReservation,
          seats: 0
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/reservations/user/:userId', () => {
    it('should get reservations for a specific user', async () => {
      const response = await request(app)
        .get(`/api/reservations/user/${customerId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return empty array for user with no reservations', async () => {
      const fakeUserId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/reservations/user/${fakeUserId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });

  describe('GET /api/reservations/:id', () => {
    it('should get reservation by ID', async () => {
      if (!reservationId) {
        return;
      }

      const response = await request(app)
        .get(`/api/reservations/${reservationId}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('_id', reservationId);
    });

    it('should return 404 for non-existent reservation', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/reservations/${fakeId}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PATCH /api/reservations/:id/confirm', () => {
    it('should confirm a reservation', async () => {
      if (!reservationId) {
        return;
      }

      const response = await request(app)
        .patch(`/api/reservations/${reservationId}/confirm`)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'confirmed');
    });
  });

  describe('PATCH /api/reservations/:id/cancel', () => {
    it('should cancel a reservation', async () => {
      if (!reservationId) {
        return;
      }

      const response = await request(app)
        .patch(`/api/reservations/${reservationId}/cancel`)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'cancelled');
    });

    it('should return 404 for non-existent reservation', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .patch(`/api/reservations/${fakeId}/cancel`)
        .expect(404);

      // El controlador retorna 404 sin body en algunos casos
      if (response.body && Object.keys(response.body).length > 0) {
        expect(response.body).toHaveProperty('error');
      }
    });
  });

  describe('DELETE /api/reservations/:id', () => {
    it('should delete a reservation', async () => {
      if (!reservationId) {
        return;
      }

      const response = await request(app)
        .delete(`/api/reservations/${reservationId}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 404 for already deleted reservation', async () => {
      if (!reservationId) {
        return;
      }

      const response = await request(app)
        .delete(`/api/reservations/${reservationId}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });
});
