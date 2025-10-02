export type Env = {
  PORT: number;
  DATABASE_URL: string;
  JWT_SECRET: string;
  CORS_ORIGIN: string;
};

export function getEnv(): Env {
  const {
    PORT = '4000',
    DATABASE_URL,
    JWT_SECRET,
    CORS_ORIGIN = 'http://localhost:5173'
  } = process.env;

  const dbUrl = DATABASE_URL || 'file:./dev.db';
  const jwt = JWT_SECRET || 'devsecret_change_me';

  return {
    PORT: Number(PORT),
    DATABASE_URL: dbUrl,
    JWT_SECRET: jwt,
    CORS_ORIGIN
  };
}


