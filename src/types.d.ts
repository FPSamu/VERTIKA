import { UserType } from './app/varTypes';

declare module 'express-serve-static-core' {
  interface Request {
    userId?: string;
    userEmail?: string;
    userRoles?: UserType[];
  }
}
