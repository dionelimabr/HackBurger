import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';

const db = new Database(path.resolve(__dirname, '../hackburger.db'));

const users = [
  {
    name: 'Admin HackBurger',
    email: 'admin@hackburger.com',
    password: bcrypt.hashSync('Admin@123', 12),
    role: 'admin',
    phone: '(11) 99999-0001',
    avatar_url: null,
    is_active: 1,
  },
  {
    name: 'João Silva',
    email: 'joao@example.com',
    password: bcrypt.hashSync('User@123', 12),
    role: 'customer',
    phone: '(11) 99999-0002',
    avatar_url: null,
    is_active: 1,
  },
  {
    name: 'Maria Oliveira',
    email: 'maria@example.com',
    password: bcrypt.hashSync('User@123', 12),
    role: 'customer',
    phone: '(11) 99999-0003',
    avatar_url: null,
    is_active: 1,
  },
];

const insertUser = db.prepare(`
  INSERT OR IGNORE INTO users (name, email, password, role, phone, avatar_url, is_active)
  VALUES (@name, @email, @password, @role, @phone, @avatar_url, @is_active)
`);

const seedUsers = db.transaction(() => {
  for (const user of users) {
    insertUser.run(user);
  }
});

seedUsers();
console.log('✅ Users seed concluído.');
