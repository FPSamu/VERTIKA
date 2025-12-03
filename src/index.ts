import express, {static as static_} from 'express';
import path from 'path'
import dotenv from 'dotenv'
dotenv.config();

import swaggerJsDoc from 'swagger-jsdoc'
import { setup, serve} from  'swagger-ui-express'
import swaggerOptions  from './../swagger.config';
import dbConnect from './database/index'
import { initGoogleStrategy } from './app/auth/google/google.strategy';
//Http
import { Server } from 'http';
//Socket
import { initSocket } from './socket';

import routes from './app/routes'

import { engine } from 'express-handlebars';

//Passport
import passport from 'passport';


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

//Google passport
app.use(passport.initialize());
console.log("🔵 1. Inicializando Middleware de Passport...");
initGoogleStrategy(app);
console.log("🔵 Estrategias cargadas:", (passport as any)._strategies);

app.get('', (req, res)=> {
    res.send("Api funciona")
})

//Swagger
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/swagger', serve, setup(swaggerDocs))

//Socket - Importado desde socket/index.ts para evitar dependencias circulares


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



