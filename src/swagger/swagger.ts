import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Application, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';

// Swagger definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Train Service API',
    version: '1.0.0',
    description: 'API documentation for the Train Service application',
    license: {
      name: 'ISC',
    },
    contact: {
      name: 'SeenElm',
    },
  },
  servers: [
    {
      url: '/api',
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
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

// Options for the swagger docs
const options = {
  swaggerDefinition,
  // Paths to files containing OpenAPI definitions
  apis: ['./src/routes/*.ts', './src/app/**/*.ts', './src/swagger/definitions/*.ts'],
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJSDoc(options);

// Load environment variables
dotenv.config();

// Basic authentication middleware for Swagger docs
const swaggerAuth = (req: Request, res: Response, next: NextFunction) => {
  // Get credentials from environment variables or use defaults
  const SWAGGER_USER = process.env.SWAGGER_USER || 'admin';
  const SWAGGER_PASSWORD = process.env.SWAGGER_PASSWORD || 'password';

  // Check for basic auth header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic');
    res.status(401).json({ message: 'Authentication required to access API documentation' });
    return;
  }

  // Verify credentials
  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  const [username, password] = credentials.split(':');

  if (username !== SWAGGER_USER || password !== SWAGGER_PASSWORD) {
    res.setHeader('WWW-Authenticate', 'Basic');
    res.status(401).json({ message: 'Invalid credentials' });
    return;
  }

  next();
};

export const setupSwagger = (app: Application): void => {
  // Apply authentication middleware to Swagger routes
  app.use('/api-docs', swaggerAuth, swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  
  // Secure the JSON spec endpoint as well
  app.get('/api-docs.json', swaggerAuth, (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
  
  console.log('Secured Swagger documentation available at /api-docs');
};
