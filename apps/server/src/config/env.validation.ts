export interface EnvironmentVariables {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  CORS_ORIGIN: string;
  REDIS_URL?: string;
}

export function validateEnvironment(): EnvironmentVariables {
  const errors: string[] = [];

  // NODE_ENV
  const nodeEnv = process.env.NODE_ENV || 'development';
  if (!['development', 'production', 'test'].includes(nodeEnv)) {
    errors.push('NODE_ENV must be one of: development, production, test');
  }

  // PORT
  const port = parseInt(process.env.PORT || '3001', 10);
  if (isNaN(port) || port < 1 || port > 65535) {
    errors.push('PORT must be a valid port number (1-65535)');
  }

  // DATABASE_URL
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    errors.push('DATABASE_URL is required');
  } else if (!databaseUrl.startsWith('postgresql://') && !databaseUrl.startsWith('postgres://')) {
    errors.push('DATABASE_URL must be a valid PostgreSQL connection string');
  }

  // JWT_SECRET
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    errors.push('JWT_SECRET is required');
  } else if (jwtSecret.length < 32) {
    errors.push('JWT_SECRET must be at least 32 characters long for security');
  } else if (jwtSecret === 'your-super-secret-jwt-key-change-this-in-production') {
    errors.push('JWT_SECRET must be changed from the default value');
  }

  // JWT_REFRESH_SECRET
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
  if (!jwtRefreshSecret) {
    errors.push('JWT_REFRESH_SECRET is required');
  } else if (jwtRefreshSecret.length < 32) {
    errors.push('JWT_REFRESH_SECRET must be at least 32 characters long for security');
  } else if (jwtRefreshSecret === 'your-super-secret-refresh-key-change-this-in-production') {
    errors.push('JWT_REFRESH_SECRET must be changed from the default value');
  } else if (jwtRefreshSecret === jwtSecret) {
    errors.push('JWT_REFRESH_SECRET must be different from JWT_SECRET');
  }

  // CORS_ORIGIN
  const corsOrigin = process.env.CORS_ORIGIN;
  if (!corsOrigin) {
    errors.push('CORS_ORIGIN is required');
  } else {
    try {
      new URL(corsOrigin);
    } catch {
      errors.push('CORS_ORIGIN must be a valid URL');
    }
  }

  // Throw error if validation failed
  if (errors.length > 0) {
    console.error('❌ Environment variable validation failed:');
    errors.forEach((error) => console.error(`  - ${error}`));
    throw new Error(
      `Environment validation failed with ${errors.length} error(s). Please check your .env file.`
    );
  }

  console.log('✅ Environment variables validated successfully');

  return {
    NODE_ENV: nodeEnv as 'development' | 'production' | 'test',
    PORT: port,
    DATABASE_URL: databaseUrl!,
    JWT_SECRET: jwtSecret!,
    JWT_REFRESH_SECRET: jwtRefreshSecret!,
    CORS_ORIGIN: corsOrigin!,
    REDIS_URL: process.env.REDIS_URL,
  };
}
