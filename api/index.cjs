// Vercel serverless function — thin CJS wrapper over bundled Express app.
// Uses .cjs extension because the project has "type": "module" in package.json,
// but this file must use require() to import the CJS bundle.
//
// esbuild with --format=cjs wraps "export default" as module.exports.default,
// so we destructure the .default property to get the actual Express app.

const { default: app } = require('../dist/server.cjs');

module.exports = app;
