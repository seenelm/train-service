declare module 'swagger-autogen' {
  interface SwaggerOptions {
    openapi?: string;
    language?: 'en-US' | 'pt-BR' | string;
    disableLogs?: boolean;
    autoHeaders?: boolean;
    autoQuery?: boolean;
    autoBody?: boolean;
  }

  interface SwaggerDocument {
    info: {
      title: string;
      description?: string;
      version: string;
      [key: string]: any;
    };
    host?: string;
    basePath?: string;
    schemes?: string[];
    consumes?: string[];
    produces?: string[];
    tags?: Array<{ name: string; description?: string }>;
    securityDefinitions?: Record<string, any>;
    definitions?: Record<string, any>;
    components?: {
      schemas?: Record<string, any>;
      securitySchemes?: Record<string, any>;
      [key: string]: any;
    };
    servers?: Array<{ url: string; description?: string }>;
    [key: string]: any;
  }

  type SwaggerAutogenFunction = (
    outputFile: string,
    endpointsFiles: string[],
    data?: SwaggerDocument,
    options?: SwaggerOptions
  ) => Promise<void>;

  interface SwaggerAutogen {
    (options?: SwaggerOptions): SwaggerAutogenFunction;
  }

  const swaggerAutogen: SwaggerAutogen;
  export default swaggerAutogen;
}
