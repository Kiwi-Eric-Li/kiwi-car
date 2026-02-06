import * as fs from 'fs';
import * as path from 'path';

/**
 * Database Migration Helper
 *
 * The SQL migration must be run directly in the Supabase SQL Editor
 * because Supabase JS client does not support arbitrary SQL execution.
 *
 * Usage:
 *   npm run migrate
 *
 * This script prints the migration SQL to stdout so you can copy it,
 * or you can run it directly in:
 *   https://supabase.com/dashboard/project/YOUR_PROJECT/sql
 */

const migrationPath = path.resolve(__dirname, '../../database/migrations/001_initial_schema.sql');

try {
  const sql = fs.readFileSync(migrationPath, 'utf-8');
  console.log('='.repeat(60));
  console.log('KiwiCar Database Migration');
  console.log('='.repeat(60));
  console.log();
  console.log('Copy the SQL below and run it in the Supabase SQL Editor:');
  console.log('https://supabase.com/dashboard/project/_/sql');
  console.log();
  console.log('-'.repeat(60));
  console.log(sql);
  console.log('-'.repeat(60));
  console.log();
  console.log('After running the migration, also create storage buckets:');
  console.log('1. Go to Storage in your Supabase dashboard');
  console.log('2. Create a bucket named "listings" (public)');
  console.log('3. Create a bucket named "avatars" (public)');
  console.log();
} catch (err) {
  console.error('Failed to read migration file:', err);
  process.exit(1);
}
