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
    { name: 'Lucas Faria',        email: 'lucas@hackburger.com',       password: 'flamengo1981',                                   role: 'customer', question: "Nome do meio do seu irmão mais velho?",   answer: 'Pedro' },
    { name: 'Roberto Mota',       email: 'roberto@hackburger.com',     password: 'R0b0SemVerg0nha!',                               role: 'customer', question: "Primeira empresa onde trabalhou?",         answer: 'Sucata Digital' },
    { name: 'Ana Carolina',       email: 'ana@hackburger.com',         password: 'B4n@n@Split',                                    role: 'customer', question: "Seu filme favorito?",                      answer: 'o silêncio das galinhas' },
    { name: 'Caio Andrade',       email: 'caio@hackburger.com',        password: 'verao canario',                                  role: 'customer', question: "Nome do seu pet favorito?",               answer: 'Bolota' },
    { name: 'DJ Trovão',          email: 'dj.trovao@hackburger.com',   password: 'Trovãozinho123',                                 role: 'customer', question: "Nome do seu pet favorito?",               answer: 'Trovãozinho' },
    { name: 'Gabriel Stein',      email: 'gabriel@hackburger.com',     password: 'focus!Ciencia',                                  role: 'customer', question: "Nome de solteira da sua mãe?",             answer: 'Alves' },
    { name: 'Viktor Sousa',       email: 'viktor@hackburger.com',      password: 'v1kt0r0sk4r',                                    role: 'customer', question: "Seu anime favorito?",                      answer: 'cavaleiros do zodiaco' },
    { name: 'Suporte HackBurger', email: 'suporte@hackburger.com',     password: 'Sup0rt3@HB!2024#Xk9mR',                         role: 'admin',    question: "Melhor amigo na escola?",                 answer: 'Carlos' },
    { name: 'Contador',           email: 'contador@hackburger.com',    password: 'eu sou um contador efemero criado por SQL injection', role: 'customer', question: "Cor favorita?",             answer: 'azul' },
    { name: 'Felipe Rocha',       email: 'felipe@hackburger.com',      password: 'trilhaDoBem',                                    role: 'customer', question: "Lugar favorito para caminhar?",           answer: 'Parque Estadual da Serra do Mar' },
    { name: 'LGPD Deletado',      email: 'lgpd-deletado@hackburger.com', password: 'lgpd2023del',                                  role: 'customer', question: "Carro favorito?",                         answer: 'fusca', inactive: true },
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
