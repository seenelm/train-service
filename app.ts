import express from 'express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { setupSwaggerUI } from './src/swagger/ui.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Basic route
app.get('/', (req, res) => {
  res.send('Hello, world! Check out /swagger for the API documentation');
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Setup Swagger UI
const setupSwagger = async () => {
  await setupSwaggerUI(app, __dirname);
};

// Start the server
app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  await setupSwagger();
});

export default app;
