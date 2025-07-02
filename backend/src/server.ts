import app from './app';

const PORT = process.env['PORT'] || 3001;

// Graceful shutdown handling
const gracefulShutdown = (signal: string) => {
  console.log(`Recebido ${signal}. Iniciando graceful shutdown...`);
  
  server.close(() => {
    console.log('HTTP server fechado.');
    
    // Aqui poderia fechar conexões com banco, Redis, etc.
    process.exit(0);
  });

  // Force close server after 30 seconds
  setTimeout(() => {
    console.log('Forçando fechamento do servidor...');
    process.exit(1);
  }, 30000);
};

const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📍 Environment: ${process.env['NODE_ENV'] || 'development'}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
  
  if (process.env['NODE_ENV'] !== 'production') {
    console.log(`📝 API Base URL: http://localhost:${PORT}/api`);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Uncaught exception handler
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Unhandled promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export default server;