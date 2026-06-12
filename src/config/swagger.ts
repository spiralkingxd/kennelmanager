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
  apis: ['./src/modules/**/router.ts'],
};

export const swaggerSpec = swaggerJSDoc(options);
