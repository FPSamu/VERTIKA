import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET || 'clave_de_prueba';

const userPayload = {
  userId: '69151fa525a16fe4e4157cc9',
  roles: ['user'],
  emailVerified: true,
};

const token = jwt.sign(userPayload, SECRET_KEY, { expiresIn: '1h' });

console.log('Token JWT de prueba:', token);