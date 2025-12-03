import { UserType } from '../varTypes';

declare global {
  namespace Express {
    // 1. AQUÍ DEFINIMOS CÓMO SE VE EL USUARIO DE PASSPORT (req.user)
    // Esto arreglará el error "Type 'User' is missing properties..."
    interface User {
      userId: string;
      email: string;
      roles: string[]; // O UserType[]
      emailVerified: boolean;
      // Agrega aquí cualquier otro dato que metas en el token
    }

    // 2. Mantenemos lo que ya tenías (propiedades sueltas en el Request)
    // por si alguna parte vieja de tu código las sigue usando.
    interface Request {
      userId?: string;
      userEmail?: string;
      userRoles?: UserType[];
    }
  }
}

export {};