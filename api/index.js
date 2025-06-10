// This file is used by Vercel to handle API routes
const { app, server } = require('../Server/server.cjs');

// Export the Express app as a serverless function
module.exports = app;
