// Vercel serverless function — thin wrapper over bundled Express app.
// esbuild with --format=cjs wraps "export default" as module.exports.default,
// so we access the .default property to get the actual Express app.

import wrapper from '../dist/server.cjs';

const app = wrapper.default ?? wrapper;

export default app;
