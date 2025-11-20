import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET;
if (!SECRET_KEY) {
  throw new Error('JWT_SECRET no definido en el archivo .env');
}

export interface AuthRequest extends Request {
  user?: any;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Token inválido' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    console.log("REQ.USER en auth:", req.user);
    next();
  } catch (err: any) {
    console.error('Error al verificar token:', err.message);
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expirado. Por favor inicia sesión nuevamente.' });
    }
    return res.status(401).json({ success: false, message: 'Token inválido' });
  }
};