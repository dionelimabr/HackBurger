import Database from 'better-sqlite3';
import path from 'path';

const db = new Database(path.resolve(__dirname, '../hackburger.db'));

// Busca IDs das categorias
const getCategory = (slug: string): number => {
  const row = db.prepare('SELECT id FROM categories WHERE slug = ?').get(slug) as { id: number };
  return row?.id ?? 1;
};

const products = [
  // Clássicos
  {
    category_slug: 'classicos',
    name: 'Classic Burger',
    slug: 'classic-burger',
    description: 'O clássico perfeito: blend de carne 180g, alface, tomate, cebola e molho especial.',
    price: 32.90,
    image_url: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?q=80&w=800&auto=format&fit=crop',
    rating: 4.8,
    rating_count: 320,
    ingredients: JSON.stringify(['blend 180g','alface','tomate','cebola','molho especial','pão brioche']),
    is_available: 1,
    is_featured: 1,
  },
  {
    category_slug: 'classicos',
    name: 'Cheeseburger Duplo',
    slug: 'cheeseburger-duplo',
    description: 'Dois blends de 120g, queijo cheddar derretido, picles, mostarda e ketchup.',
    price: 42.90,
    image_url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=800&auto=format&fit=crop',
    rating: 4.7,
    rating_count: 215,
    ingredients: JSON.stringify(['2x blend 120g','cheddar','picles','mostarda','ketchup','pão brioche']),
    is_available: 1,
    is_featured: 1,
  },
  // Especiais
  {
    category_slug: 'especiais',
    name: 'Black Sheep',
    slug: 'black-sheep',
    description: 'American cheese, relish de tomate, abacate, alface e cebola roxa.',
    price: 49.90,
    image_url: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?q=80&w=800&auto=format&fit=crop',
    rating: 4.5,
    rating_count: 188,
    ingredients: JSON.stringify(['blend 200g','american cheese','relish de tomate','abacate','alface','cebola roxa']),
    is_available: 1,
    is_featured: 1,
  },
  {
    category_slug: 'especiais',
    name: 'Ultimate Bacon',
    slug: 'ultimate-bacon',
    description: 'Blend premium, cheddar, bacon crocante, cebola caramelizada, mostarda e alface.',
    price: 52.90,
    image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=800&auto=format&fit=crop',
    rating: 4.6,
    rating_count: 302,
    ingredients: JSON.stringify(['blend 200g','cheddar','bacon','cebola caramelizada','mostarda','alface']),
    is_available: 1,
    is_featured: 1,
  },
  // Frangos
  {
    category_slug: 'frangos',
    name: 'Crispy Chicken',
    slug: 'crispy-chicken',
    description: 'Peito de frango empanado crocante, molho chilli, tomate, picles e coleslaw.',
    price: 38.90,
    image_url: 'https://images.unsplash.com/photo-1513185041617-8ab03f83d6c5?q=80&w=800&auto=format&fit=crop',
    rating: 5.0,
    rating_count: 410,
    ingredients: JSON.stringify(['frango empanado','molho chilli','tomate','picles','coleslaw','pão brioche']),
    is_available: 1,
    is_featured: 1,
  },
  // Veganos
  {
    category_slug: 'veganos',
    name: 'Vegan Burger',
    slug: 'vegan-burger',
    description: 'Blend plant-based, queijo vegano, bacon de cogumelo, cebola e mostarda dijon.',
    price: 44.90,
    image_url: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?q=80&w=800&auto=format&fit=crop',
    rating: 4.3,
    rating_count: 97,
    ingredients: JSON.stringify(['blend plant-based','queijo vegano','bacon de cogumelo','cebola','mostarda dijon']),
    is_available: 1,
    is_featured: 0,
  },
  // Combos
  {
    category_slug: 'combos',
    name: 'Combo Classic',
    slug: 'combo-classic',
    description: 'Classic Burger + Batata Frita M + Refrigerante 350ml.',
    price: 49.90,
    image_url: 'https://images.unsplash.com/photo-1586816001966-79b736744398?q=80&w=800&auto=format&fit=crop',
    rating: 4.9,
    rating_count: 560,
    ingredients: JSON.stringify(['classic burger','batata frita M','refrigerante 350ml']),
    is_available: 1,
    is_featured: 0,
  },
];

const insertProduct = db.prepare(`
  INSERT INTO products
    (category_id, name, slug, description, price, image_url, rating, rating_count, ingredients, is_available, is_featured)
  VALUES
    (@category_id, @name, @slug, @description, @price, @image_url, @rating, @rating_count, @ingredients, @is_available, @is_featured)
  ON CONFLICT(slug) DO UPDATE SET
    category_id   = excluded.category_id,
    name          = excluded.name,
    description   = excluded.description,
    price         = excluded.price,
    image_url     = excluded.image_url,
    rating        = excluded.rating,
    rating_count  = excluded.rating_count,
    ingredients   = excluded.ingredients,
    is_available  = excluded.is_available,
    is_featured   = excluded.is_featured
`);

const seedProducts = db.transaction(() => {
  for (const p of products) {
    const { category_slug, ...rest } = p;
    insertProduct.run({ ...rest, category_id: getCategory(category_slug) });
  }
});

seedProducts();
console.log('Products seed concluído.');
