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

  // Seed CTF users if they don't exist yet
  seedCtfUsers(database);
}

function seedCtfUsers(database: Database.Database): void {
  const bcrypt = require('bcryptjs');

  const ctfUsers = [
    { name: 'Jim',           email: 'jim@juice-sh.op',          password: 'ncc-1701',       role: 'customer', question: "Your eldest siblings middle name?", answer: 'Samuel' },
    { name: 'Bender',        email: 'bender@juice-sh.op',       password: 'OhG0dPlease1nsique', role: 'customer', question: "Company you first worked for?", answer: 'Stop n Drop' },
    { name: 'Amy',           email: 'amy@juice-sh.op',          password: 'K1f...',         role: 'customer', question: "Your favorite movie?", answer: 'silence of the lambs' },
    { name: 'Bjoern',        email: 'bjoern@juice-sh.op',       password: 'monkey summer',  role: 'customer', question: "Name of your favorite pet?", answer: 'Zaya' },
    { name: 'MC SafeSearch',  email: 'mc.safesearch@juice-sh.op', password: 'Mr. N00dles', role: 'customer', question: "Name of your favorite pet?", answer: 'Mr. Noodles' },
    { name: 'Morty',         email: 'morty@juice-sh.op',        password: 'focusOnSciworthy', role: 'customer', question: "Mothers maiden name?", answer: 'Smith' },
    { name: 'Uvogin',        email: 'uvogin@juice-sh.op',      password: 'uvogin2023',     role: 'customer', question: "Your favorite movie?", answer: 'hunter x hunter' },
    { name: 'Support Team',  email: 'support@juice-sh.op',      password: 'J6aVjTgOpRs@?5l!Zkq2AYnCE8cC&omFB#Rt', role: 'admin', question: "Best friend in school?", answer: 'Robin' },
    { name: 'Accountant',    email: 'accountant@juice-sh.op',   password: 'i am an ephemeral accountant', role: 'customer', question: "Favorite color?", answer: 'green' },
    { name: 'Chris',         email: 'chris@juice-sh.op',        password: 'love2code',      role: 'customer', question: "Your favorite place to walk?", answer: 'Daniel Boone National Forest' },
    { name: 'GDPR Deleted',  email: 'gdpr-deleted@juice-sh.op', password: 'deletedUser123', role: 'customer', question: "Favorite car?", answer: 'tesla', inactive: true },
  ];

  const insertUser = database.prepare(
    `INSERT OR IGNORE INTO users (name, email, password, role, is_active) VALUES (?, ?, ?, ?, ?)`
  );
  const insertQuestion = database.prepare(
    `INSERT OR IGNORE INTO security_questions (user_id, question, answer) VALUES (?, ?, ?)`
  );
  const insertCoupon = database.prepare(
    `INSERT OR IGNORE INTO coupons (code, discount, is_active, expires_at) VALUES (?, ?, ?, ?)`
  );

  const seed = database.transaction(() => {
    for (const u of ctfUsers) {
      const existing = database.prepare('SELECT id FROM users WHERE email = ?').get(u.email) as { id: number } | undefined;
      if (existing) continue;

      const hashed = bcrypt.hashSync(u.password, 10);
      const result = insertUser.run(u.name, u.email, hashed, u.role, (u as any).inactive ? 0 : 1);
      const userId = result.lastInsertRowid as number;

      if (u.question) {
        insertQuestion.run(userId, u.question, u.answer);
      }
    }

    // Seed coupons
    insertCoupon.run('HACKBURGER10', 10, 1, '2099-12-31');
    insertCoupon.run('XMAS2020', 25, 1, '2021-01-01');
    insertCoupon.run('PREMIUM50', 50, 0, '2099-12-31');
  });

  try { seed(); } catch { /* seed may have already run */ }
}

export default getDb;
