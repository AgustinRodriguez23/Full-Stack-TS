-- Habilitar RLS en ambas tablas
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "posts" ENABLE ROW LEVEL SECURITY;

-- Políticas para "profiles"
CREATE POLICY "Los usuarios pueden ver todos los profiles"
  ON "profiles"
  FOR SELECT
  USING (true);

CREATE POLICY "Los usuarios solo pueden crear su propio profile"
  ON "profiles"
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Los usuarios solo pueden actualizar su propio profile"
  ON "profiles"
  FOR UPDATE
  USING (auth.uid() = id);

-- Políticas para "posts"
CREATE POLICY "Cualquiera puede ver los posts"
  ON "posts"
  FOR SELECT
  USING (true);

CREATE POLICY "Los usuarios solo pueden crear posts propios"
  ON "posts"
  FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Los usuarios solo pueden editar sus propios posts"
  ON "posts"
  FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Los usuarios solo pueden borrar sus propios posts"
  ON "posts"
  FOR DELETE
  USING (auth.uid() = author_id);