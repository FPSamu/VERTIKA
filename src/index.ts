import express, {static as static_} from 'express';
import path from 'path'
import dotenv from 'dotenv'
dotenv.config();

import swaggerJsDoc from 'swagger-jsdoc'
import { setup, serve} from  'swagger-ui-express'
import swaggerOptions  from './../swagger.config';
import dbConnect from './database/index'

//Http
import { Server } from 'http';
//Socket
import {Server as SocketServer, Socket} from 'socket.io'

import routes from './app/routes'

import { engine } from 'express-handlebars';


const port = process.env.PORT || 3000;
const app = express();


//Handlebars
app.engine('handlebars',engine());
app.set('view engine','handlebars');
app.set('views','./src/views')

// Middleware para parsear JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


//Public

app.use('/static', static_(path.join(__dirname, '..','public')));

// Rutas principales
app.use('/api', routes);

app.get('', (req, res)=> {
    res.send("Api funciona")
})

//Swagger
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/swagger', serve, setup(swaggerDocs))

//Socket
let io: SocketServer;

export const initSocket = (server: Server) => {
  io = new SocketServer(server, {
    cors: { origin: '*' },
  });

  io.on('connection', (socket: Socket) => {
    console.log('Cliente conectado:', socket.id);

    // Unirse a room de usuario
    socket.on('join', (userId: string) => {
      socket.join(userId);
      console.log(`Usuario ${userId} se unió a su room`);
    });

    socket.on('disconnect', () => {
      console.log('Cliente desconectado:', socket.id);
    });
  });
};

// Función para obtener io desde otras rutas
export const getIO = () => {
  if (!io) throw new Error('Socket.IO no inicializado');
  return io;
};


//Base de datos y listen 
dbConnect().then(() => {
    const server: Server = app.listen(port, ()=>{
         console.log(`API corriendo en puerto ${port}`)
    })
    initSocket(server);
//Catch no connect bd
}).catch(() => {
     console.log("Failed to connect to db ")
 })



