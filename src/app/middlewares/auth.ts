import { Request, Response, NextFunction } from "express";

/**
 * Middleware de autenticación (dummy)
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  next();
}