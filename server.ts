import 'dotenv/config';

import { configureApp, validateRequiredEnv, runStartupTasks } from './src/expressApp';
import type { Express } from 'express';

const isVercel = !!process.env.VERCEL;

// Cria o app Express (sync)
validateRequiredEnv();
const app: Express = configureApp();

// Startup tasks rodam em background (não bloqueiam)
runStartupTasks().catch(err => {
  console.error('[STARTUP] Background tasks failed:', err);
});

// Em execução local (não Vercel), inicia o servidor HTTP
if (!isVercel) {
  (async () => {
    const PORT = parseInt(process.env.PORT || '3000', 10);

    if (process.env.NODE_ENV !== 'production') {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://localhost:${PORT}`);
      if (process.env.NODE_ENV !== 'production') {
        console.log(`Swagger docs available at http://localhost:${PORT}/api/docs`);
      }
    });
  })();
}

export default app;
