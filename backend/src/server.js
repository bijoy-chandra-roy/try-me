const app = require('./app');
const config = require('./config');
const { connectDatabase } = require('./config/database');

async function start() {
  await connectDatabase();
  app.listen(config.port, () => {
    console.log(`TryMe API listening on port ${config.port}`);
  });
}

start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
