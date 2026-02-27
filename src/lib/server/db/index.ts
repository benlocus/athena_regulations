import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/regulations';

const client = postgres(connectionString, {
  max: process.env.DATABASE_URL?.includes('neon.tech') ? 1 : 10,
});

export const db = drizzle(client, { schema });
