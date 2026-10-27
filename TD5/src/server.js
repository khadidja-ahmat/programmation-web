import express from 'express';
import connectDB from "./config/db.js";
import routes from './routes/index.js';
import swaggerJsDoc from 'swagger-jsdoc';
import { serve, setup } from 'swagger-ui-express';

process.loadEnvFile();

const host = process.env.HOST || 'localhost';
const port = process.env.PORT || 8080;

const app = express();
app.use(express.json());

// Configuration de la documentation OpenAPI
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Contact REST API',
            description: "A REST API built with Express and MongoDB.",
            version: '0.1',
        },
        servers: [
            {
                url: `http://${host}:${port}/api`,
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                Credentials: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email:    { type: 'string', example: 'test@test.com' },
                        password: { type: 'string', example: 'azerty123' },
                    },
                },
                Contact: {
                    type: 'object',
                    properties: {
                        _id:  { type: 'string', example: '65f1c2a4b8e9d1a2b3c4d5e6' },
                        name: { type: 'string', example: 'toto' },
                        age:  { type: 'number', example: 24 },
                    },
                },
                ContactInput: {
                    type: 'object',
                    properties: {
                        name: { type: 'string', example: 'tete' },
                        age:  { type: 'number', example: 30 },
                    },
                },
            },
        },
    },
    apis: ["./src/routes/*.js"],
};

const openapiSpecification = swaggerJsDoc(options);
app.use('/docs', serve, setup(openapiSpecification));

app.use('/api', routes);

// Route d'accueil
app.get('/', (req, res) => {
    res.json({
        message: 'Mon API REST fonctionne !',
        status: 'OK'
    });
});

// On attend que MongoDB soit connecté avant d'ouvrir le serveur
await connectDB();

app.listen(port, host, () => {
      console.log(`Server is running on http://${host}:${port}`)
});