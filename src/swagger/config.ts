import swaggerAutogen from 'swagger-autogen';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const doc = {
  info: {
    title: 'Train Service API',
    description: 'API documentation for the Train Service',
    version: '0.0.1',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Local development server',
    },
  ],
  tags: [
    {
      name: 'Train Routes',
      description: 'API endpoints for train routes',
    },
  ],
  components: {
    schemas: {
      // Define your schemas here
    },
  },
};

const outputFile = join(__dirname, '../../swagger-output.json');
const endpointsFiles = [join(__dirname, '../../app.js')];

// Generate swagger.json
const generateSwagger = async () => {
  await swaggerAutogen()(outputFile, endpointsFiles, doc);
  console.log('Swagger documentation generated successfully');
};

export default generateSwagger;
