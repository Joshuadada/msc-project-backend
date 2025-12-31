import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  url: process.env.DATABASE_URL ?? "postgresql://postgres.ljnschouqwyowelqrtaz:United7061654399@aws-1-eu-north-1.pooler.supabase.com:6543/postgres",
  poolSize: parseInt(process.env.DB_POOL_SIZE ?? "10", 10) || 10,
}));
