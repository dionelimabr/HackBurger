import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const dbPath = path.resolve(__dirname, '../hackburger.db');
const migrationsDir = path.resolve(__dirname, '../migrations');

// Garante que o schema esteja aplicado antes de semear
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

const migrationFiles = fs
  .readdirSync(migrationsDir)
  .filter((f) => f.endsWith('.sql'))
  .sort();

for (const file of migrationFiles) {
  const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
  db.exec(sql);
}
db.close();

console.log(`Migrations aplicadas: ${migrationFiles.length} arquivo(s).`);

// Ordem importante: categorias antes de produtos
require('./categories.seed');
require('./products.seed');
require('./users.seed');

console.log('Seeds finalizados.');
