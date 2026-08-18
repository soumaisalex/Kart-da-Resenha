import { neon } from '@neondatabase/serverless';

// Uso dentro de qualquer function: const sql = getDb(context.env);
export function getDb(env) {
  if (!env.DATABASE_URL) {
    throw new Error('DATABASE_URL não configurada (Cloudflare Pages > Settings > Environment variables)');
  }
  return neon(env.DATABASE_URL);
}
