-- Insertar las 4 categorías actuales
INSERT INTO categories (name, slug) VALUES
  ('Tatuajes', 'tatuajes'),
  ('Paisajes', 'paisajes'),
  ('Dibujos', 'dibujos'),
  ('Ropa', 'ropa');

-- Rellenar categoryId de los pins existentes según su enum
UPDATE pins
SET category_id = c.id
FROM categories c
WHERE c.slug = pins.category::text;

-- Verificar: debe dar 0
SELECT count(*) FROM pins WHERE category_id IS NULL;