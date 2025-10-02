import { SwaggerOptions } from "swagger-ui-express";
const port = process.env.PORT || 3000

const options: SwaggerOptions = {
    swaggerDefinition: {
       openapi: '3.1.0',
       info: {
            title: 'API VERTIKA',
            description: 'API de Vertika',
            version: '0.0.1'
       },
       servers: [
            { url: 'http://localhost:' + port}
        ]

    },
    apis: [
        './src/**/*.ts'
    ]
}

export default options;