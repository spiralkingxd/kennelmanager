// Vercel serverless function — thin wrapper over bundled Express app.
// esbuild --format=esm produces a proper ESM module with "export default".

import app from '../dist/server.mjs';

export default app;
