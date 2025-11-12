import { UserType } from '../varTypes';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userEmail?: string;
      userRoles?: UserType[];
    }
  }
}

export {};
