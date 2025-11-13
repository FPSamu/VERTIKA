import express from 'express';
import dotenv from 'dotenv'
dotenv.config();

import swaggerJsDoc from 'swagger-jsdoc'
import { setup, serve} from  'swagger-ui-express'
import swaggerOptions  from './../swagger.config';
import dbConnect from './database/index'

import routes from './app/routes'


const port = process.env.PORT || 3000;
const app = express();

app.use(express.json()); 
app.use(routes);

app.get('', (req, res)=> {

    res.send("Api funciona")
})
//Swagger
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/swagger', serve, setup(swaggerDocs))
//Base de datos y listen 
dbConnect().then(() => {

     app.listen(port, ()=>{
         console.log(`API corriendo en puerto ${port}`)
    })
 }).catch(() => {
     console.log("Failed to connect to db ")
 })

// app.listen(port, ()=>{
//         console.log(`API corriendo en puerto ${port}`)
//     })