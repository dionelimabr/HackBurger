import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';

const db = new Database(path.resolve(__dirname, '../hackburger.db'));

// CTF users — intentionally weak passwords and guessable security questions
const ctfUsers = [
  { name: 'Jim',           email: 'jim@juice-sh.op',      password: 'ncc-1701',       role: 'customer', question: "Your eldest siblings middle name?", answer: 'Samuel' },
  { name: 'Bender',        email: 'bender@juice-sh.op',   password: 'OhG0dPlease1nsique',  role: 'customer', question: "Company you first worked for?", answer: 'Stop n Drop' },
  { name: 'Amy',           email: 'amy@juice-sh.op',      password: 'K1f...',         role: 'customer', question: "Your favorite movie?", answer: 'silence of the lambs' },
  { name: 'Bjoern',        email: 'bjoern@juice-sh.op',   password: 'monkey summer',  role: 'customer', question: "Name of your favorite pet?", answer: 'Zaya' },
  { name: 'MC SafeSearch',  email: 'mc.safesearch@juice-sh.op', password: 'Mr. N00dles', role: 'customer', question: "Name of your favorite pet?", answer: 'Mr. Noodles' },
  { name: 'Morty',         email: 'morty@juice-sh.op',    password: 'focusOnSciworthy', role: 'customer', question: "Mothers maiden name?", answer: 'Smith' },
  { name: 'Uvogin',        email: 'uvogin@juice-sh.op',   password: 'uvogin2023',     role: 'customer', question: "Your favorite movie?", answer: 'hunter x hunter' },
  { name: 'Support Team',  email: 'support@juice-sh.op',  password: 'J6aVjTgOpRs@?5l!Zkq2AYnCE8cC&omFB#Rt', role: 'admin', question: "Best friend in school?", answer: 'Robin' },
  { name: 'Accountant',    email: 'accountant@juice-sh.op', password: 'i am an ephemeral accountant created by SQL injection', role: 'customer', question: "Favorite color?", answer: 'green' },
  { name: 'Chris',         email: 'chris@juice-sh.op',    password: 'love2code',      role: 'customer', question: "Your favorite place to walk?", answer: 'Daniel Boone National Forest' },
  { name: 'GDPR Deleted',  email: 'gdpr-deleted@juice-sh.op', password: 'deletedUser123', role: 'customer', question: "Favorite car?", answer: 'tesla' },
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
