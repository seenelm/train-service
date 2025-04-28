import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { readFile } from 'fs/promises';
import { join } from 'path';

/**
 * Sets up Swagger UI for the Express application
 * @param app Express application instance
 * @param basePath Base path for the application
 */
export const setupSwaggerUI = async (app: express.Application, basePath: string) => {
  try {
    const swaggerFile = join(basePath, 'swagger-output.json');
    const swaggerData = await readFile(swaggerFile, 'utf8');
    const swaggerDocument = JSON.parse(swaggerData);
    
    app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Train Service API Documentation',
    }));
    
    console.log('Swagger UI initialized at /swagger');
  } catch (error) {
    console.error('Failed to initialize Swagger UI:', error);
    console.log('Run `npm run swagger` to generate the swagger documentation first');
  }
};
