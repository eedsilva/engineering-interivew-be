import { execSync } from 'child_process';
import dotenv from 'dotenv';
import path from 'path';

export default async () => {
  dotenv.config({ path: path.resolve(__dirname, '../.env.test') });
  execSync('npx prisma db push --accept-data-loss --skip-generate', {
    stdio: 'inherit',
  });
};
