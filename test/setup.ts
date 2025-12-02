// Configuración global para los tests
import dotenv from 'dotenv';

// Cargar variables de entorno para tests
dotenv.config();

// Aumentar timeout para operaciones de BD
jest.setTimeout(30000);

// Suprimir logs durante tests (opcional)
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  // Mantener error para ver fallos
  error: console.error,
};
