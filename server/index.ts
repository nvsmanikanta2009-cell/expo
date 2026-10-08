import { app, initDb } from './app.js';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

async function startServer() {
  try {
    await initDb();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`=======================================================`);
      console.log(`🚀 AI Accessibility Assistant Server running on port ${PORT}`);
      console.log(`🌐 Health endpoint: http://localhost:${PORT}/api/health`);
      console.log(`=======================================================`);
    });
  } catch (err) {
    console.error('Fatal error starting server:', err);
    process.exit(1);
  }
}

startServer();
