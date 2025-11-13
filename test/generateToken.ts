import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET || 'clave_de_prueba';

const userPayload = {
  _id: '64f123abc456def7890',
  roles: ['customer'],
  emailVerified: true,
};

const token = jwt.sign(userPayload, SECRET_KEY, { expiresIn: '1h' });

console.log('Token JWT de prueba:', token);