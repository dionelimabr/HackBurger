import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';

const db = new Database(path.resolve(__dirname, '../hackburger.db'));

// CTF users — intentionally weak passwords and guessable security questions
const ctfUsers = [
  { name: 'Lucas Faria',         email: 'lucas@hackburger.com',       password: 'flamengo1981',                                   role: 'customer', question: "Nome do meio do seu irmão mais velho?",   answer: 'Pedro' },
  { name: 'Roberto Mota',        email: 'roberto@hackburger.com',     password: 'R0b0SemVerg0nha!',                               role: 'customer', question: "Primeira empresa onde trabalhou?",         answer: 'Sucata Digital' },
  { name: 'Ana Carolina',        email: 'ana@hackburger.com',         password: 'B4n@n@Split',                                    role: 'customer', question: "Seu filme favorito?",                      answer: 'o silêncio das galinhas' },
  { name: 'Caio Andrade',        email: 'caio@hackburger.com',        password: 'verao canario',                                  role: 'customer', question: "Nome do seu pet favorito?",               answer: 'Bolota' },
  { name: 'DJ Trovão',           email: 'dj.trovao@hackburger.com',   password: 'Trovãozinho123',                                 role: 'customer', question: "Nome do seu pet favorito?",               answer: 'Trovãozinho' },
  { name: 'Gabriel Stein',       email: 'gabriel@hackburger.com',     password: 'focus!Ciencia',                                  role: 'customer', question: "Nome de solteira da sua mãe?",             answer: 'Alves' },
  { name: 'Viktor Sousa',        email: 'viktor@hackburger.com',      password: 'v1kt0r0sk4r',                                    role: 'customer', question: "Seu anime favorito?",                      answer: 'cavaleiros do zodiaco' },
  { name: 'Suporte HackBurger',  email: 'suporte@hackburger.com',     password: 'Sup0rt3@HB!2024#Xk9mR',                         role: 'admin',    question: "Melhor amigo na escola?",                 answer: 'Carlos' },
  { name: 'Contador',            email: 'contador@hackburger.com',    password: 'eu sou um contador efemero criado por SQL injection', role: 'customer', question: "Cor favorita?",              answer: 'azul' },
  { name: 'Felipe Rocha',        email: 'felipe@hackburger.com',      password: 'trilhaDoBem',                                    role: 'customer', question: "Lugar favorito para caminhar?",           answer: 'Parque Estadual da Serra do Mar' },
  { name: 'LGPD Deletado',       email: 'lgpd-deletado@hackburger.com', password: 'lgpd2023del',                                  role: 'customer', question: "Carro favorito?",                         answer: 'fusca' },
];

const insertUser = db.prepare(`
  INSERT OR IGNORE INTO users (name, email, password, role, phone, avatar_url, is_active)
  VALUES (@name, @email, @password, @role, NULL, NULL, @is_active)
`);

const insertQuestion = db.prepare(`
  INSERT OR IGNORE INTO security_questions (user_id, question, answer)
  VALUES (@user_id, @question, @answer)
`);

// Mark GDPR user as inactive (soft-deleted)
const deactivateUser = db.prepare(`UPDATE users SET is_active = 0 WHERE email = ?`);

const seedCtfUsers = db.transaction(() => {
  for (const u of ctfUsers) {
    const hashed = bcrypt.hashSync(u.password, 12);
    const is_active = u.email === 'gdpr-deleted@juice-sh.op' ? 0 : 1;
    const result = insertUser.run({
      name: u.name,
      email: u.email,
      password: hashed,
      role: u.role,
      is_active,
    });

    // Get user id for security question (might already exist)
    const userId = result.lastInsertRowid ||
      (db.prepare('SELECT id FROM users WHERE email = ?').get(u.email) as { id: number })?.id;

    if (userId && u.question) {
      insertQuestion.run({
        user_id: userId,
        question: u.question,
        answer: u.answer,
      });
    }
  }

  // Seed coupons
  db.prepare(`INSERT OR IGNORE INTO coupons (code, discount, is_active, expires_at) VALUES ('HACKBURGER10', 10, 1, '2099-12-31')`).run();
  db.prepare(`INSERT OR IGNORE INTO coupons (code, discount, is_active, expires_at) VALUES ('XMAS2020', 25, 1, '2021-01-01')`).run();
  db.prepare(`INSERT OR IGNORE INTO coupons (code, discount, is_active, expires_at) VALUES ('PREMIUM50', 50, 0, '2099-12-31')`).run();

  // Seed some notifications for mass_dispel challenge
  const admin = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@hackburger.com') as { id: number } | undefined;
  if (admin) {
    for (let i = 1; i <= 5; i++) {
      db.prepare(`INSERT OR IGNORE INTO notifications (user_id, message) VALUES (?, ?)`).run(
        admin.id,
        `Notificação de teste CTF #${i} — feche todas de uma vez!`
      );
    }
  }
});

seedCtfUsers();
console.log('CTF users seed concluído.');
