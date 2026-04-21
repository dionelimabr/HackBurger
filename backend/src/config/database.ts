import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { env } from './env';

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(env.DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    runMigrations(db);
  }
  return db;
}

function runMigrations(database: Database.Database): void {
  const migrationsDir = path.resolve(__dirname, '../../../database/migrations');
  if (!fs.existsSync(migrationsDir)) return;

  const files = fs
    .readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
    database.exec(sql);
  }
  console.log(`Migrations aplicadas: ${files.length} arquivo(s).`);
}

export default getDb;
