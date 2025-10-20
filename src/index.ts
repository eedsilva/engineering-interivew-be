import { App } from './server';

// Instantiate the app in the module scope
const app = new App();

// Start the server
app.start();

// Graceful shutdown logic
const shutdown = (signal: string) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  app
    .stop()
    .then(() => {
      console.log('Server has been shut down gracefully.');
      process.exit(0);
    })
    .catch((e) => {
      console.error('Error during graceful shutdown:', e);
      process.exit(1);
    });
};

// Listen for termination signals
process.on('SIGTERM', () => shutdown('SIGTERM')); // From Docker, Kubernetes, etc.
process.on('SIGINT', () => shutdown('SIGINT')); // From Ctrl+C in the terminal
