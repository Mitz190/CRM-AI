const { port } = require('./config/env'); // must load first (dotenv + validation)
const connectDB = require('./config/db');
const app = require('./app');

const start = async () => {
  await connectDB();
  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`ClientIQ server listening on 0.0.0.0:${port}`);
  });

  const shutdown = (signal) => {
    console.log(`${signal} received. Shutting down gracefully...`);
    server.close(() => process.exit(0));
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
  process.exit(1);
});

start().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});