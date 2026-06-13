import 'dotenv/config';
import { createServer as createViteServer } from 'vite';

import { configureApp, validateRequiredEnv, runStartupTasks } from './src/expressApp';

async function main() {
  // Validate environment variables
  try {
    validateRequiredEnv();
  } catch (err: any) {
    console.error('FATAL:', err.message);
    process.exit(1);
  }

  // Configure the Express app
  const app = configureApp();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  // In development, add Vite middleware for HMR and TSX compilation
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  // Run background startup tasks (token cleanup, etc.)
  runStartupTasks().catch(err => {
    console.error('[STARTUP] Background tasks failed:', err);
  });

  // Start listening
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
    if (process.env.NODE_ENV !== 'production') {
      console.log(`Swagger docs available at http://localhost:${PORT}/api/docs`);
    }
  });
}

main().catch(err => {
  console.error('Failed to start server', err);
  process.exit(1);
});
