import dotenv from 'dotenv';
import { z } from 'zod';

// Load .env file
dotenv.config();

const configSchema = z.object({
  DATABASE_URL: z.string().url(),
  PORT: z.coerce.number().int().positive().default(3000),
  LOG_LEVEL: z.enum(['info', 'warn', 'error']).default('warn'),
});

const parsedConfig = configSchema.safeParse(process.env);

if (!parsedConfig.success) {
  console.error(
    '❌ Invalid environment variables:',
    z.treeifyError(parsedConfig.error)
  );
  throw new Error('Invalid environment variables');
}

export const config = Object.freeze(parsedConfig.data);
