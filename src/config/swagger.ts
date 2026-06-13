import swaggerJSDoc from 'swagger-jsdoc';

const appUrl = process.env.APP_URL || 'http://localhost:3000';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Canil Management API',
      version: '1.0.0',
      description: 'API RESTful para sistema de gerenciamento de canil',
    },
    servers: [
      {
        url: appUrl,
        description: appUrl.includes('localhost') ? 'Servidor Local' : 'Servidor de Produção',
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
  },
  // Path to the API docs (all routers)
  // In serverless (Vercel), the glob may resolve to nothing — that's fine
  apis: ['./src/modules/**/router.ts'],
};

// Wrap in try/catch to prevent module-level crash in serverless environments
// where source files may not exist on the filesystem
let spec: any = null;
try {
  spec = swaggerJSDoc(options);
} catch (err) {
  console.warn('[SWAGGER] Failed to generate swagger spec:', (err as Error)?.message || err);
}

// Fallback to empty object for type compatibility — swagger is only used in dev
export const swaggerSpec: object = spec || {};
