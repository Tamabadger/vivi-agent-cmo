import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Database connection
const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/vivi_cmo_agent';

// Create postgres client
const client = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

// Create drizzle instance
export const db = drizzle(client, { schema });

// Export schema for migrations
export { schema };

// Close connection on process exit
process.on('SIGINT', () => {
  client.end();
  process.exit(0);
});

process.on('SIGTERM', () => {
  client.end();
  process.exit(0);
});
