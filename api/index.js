// Vercel Serverless Function Entry
// Plain JS — no TypeScript compilation needed.
// Loads the pre-compiled Express server from dist/server.cjs
// which calls configureApp() + app.listen(). @vercel/node's bridge
// intercepts app.listen() and creates the serverless handler.

require('../dist/server.cjs');
