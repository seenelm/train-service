import generateSwagger from './config.js';

// Generate Swagger documentation
const runSwaggerGeneration = async () => {
  try {
    await generateSwagger();
  } catch (error) {
    console.error('Error generating Swagger documentation:', error);
  }
};

export { runSwaggerGeneration, generateSwagger };
