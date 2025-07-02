declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      PORT?: string;
      DATABASE_URL: string;
      JWT_SECRET: string;
      JWT_REFRESH_SECRET: string;
      JWT_EXPIRES_IN?: string;
      JWT_REFRESH_EXPIRES_IN?: string;
      REDIS_URL?: string;
      FRONTEND_URL?: string;
      SMTP_HOST?: string;
      SMTP_PORT?: string;
      SMTP_USER?: string;
      SMTP_PASS?: string;
      DO_SPACES_ENDPOINT?: string;
      DO_SPACES_KEY?: string;
      DO_SPACES_SECRET?: string;
      DO_SPACES_BUCKET?: string;
      WEBHOOK_SECRET?: string;
    }
  }
}

export {};