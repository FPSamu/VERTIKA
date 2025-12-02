import { Server as SocketServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';

let io: SocketServer | null = null;

export const initSocket = (server: HttpServer) => {
  io = new SocketServer(server, {
    cors: {
      origin: '*', 
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log('✅ Cliente conectado:', socket.id);

    // Unirse a room de usuario
    socket.on('join', (userId: string) => {
      socket.join(userId);
      console.log(`Usuario ${userId} se unió a su room`);
    });

    socket.on('disconnect', () => {
      console.log('❌ Cliente desconectado:', socket.id);
    });
  });

  return io;
};

export const getIO = (): SocketServer => {
  if (!io) {
    throw new Error('Socket.io no inicializado. Llama a initSocket primero.');
  }
  return io;
};
