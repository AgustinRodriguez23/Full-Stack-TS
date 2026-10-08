SET ROLE postgres;

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cualquiera puede ver las categorías"
  ON categories FOR SELECT
  USING (true);

RESET ROLE;