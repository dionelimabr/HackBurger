import Database from 'better-sqlite3';
import path from 'path';

const db = new Database(path.resolve(__dirname, '../hackburger.db'));

const categories = [
  { name: 'Clássicos',    slug: 'classicos',    description: 'Os hambúrgueres tradicionais que nunca saem de moda.',  icon: '🍔' },
  { name: 'Especiais',    slug: 'especiais',    description: 'Criações exclusivas do Chef com ingredientes premium.', icon: '⭐' },
  { name: 'Veganos',      slug: 'veganos',      description: 'Hambúrgueres 100% plant-based deliciosos.',             icon: '🌱' },
  { name: 'Frangos',      slug: 'frangos',      description: 'Opções crocantes e saborosas com frango.',               icon: '🐓' },
  { name: 'Combos',       slug: 'combos',       description: 'Hambúrguer + batata + bebida com desconto.',             icon: '🍟' },
];

const insertCategory = db.prepare(`
  INSERT OR IGNORE INTO categories (name, slug, description, icon)
  VALUES (@name, @slug, @description, @icon)
`);

const seedCategories = db.transaction(() => {
  for (const cat of categories) {
    insertCategory.run(cat);
  }
});

seedCategories();
console.log('✅ Categories seed concluído.');
