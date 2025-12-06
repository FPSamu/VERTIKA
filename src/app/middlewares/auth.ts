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
  let token = null;
  
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    // Si la petición viene de un navegador esperando ver una página web,
    // lo redirigimos al login en lugar de mostrar JSON.
    if (req.accepts('html') && !req.accepts('json')) {
       return res.redirect('/api/auth/login');
    }
    
    return res.status(401).json({ success: false, message: 'Token no proporcionado' });
  }


  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    console.log("REQ.USER en auth:", req.user);
    next();
  } catch (err: any) {
    console.error('Error al verificar token:', err.message);
    //Manejo de redireccion
    if (req.accepts('html') && !req.accepts('json')) {
       return res.redirect('/api/auth/login');
    }
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expirado. Por favor inicia sesión nuevamente.' });
    }
    return res.status(401).json({ success: false, message: 'Token inválido' });
  }
};

export const optionalAuthMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  let token = null;
  
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    next();
  }
};