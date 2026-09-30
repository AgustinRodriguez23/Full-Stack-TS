ALTER TABLE "pins" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cualquiera puede ver los pins"
  ON "pins" FOR SELECT
  USING (true);

CREATE POLICY "Los usuarios solo pueden crear pins propios"
  ON "pins" FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Los usuarios solo pueden editar sus propios pins"
  ON "pins" FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Los usuarios solo pueden borrar sus propios pins"
  ON "pins" FOR DELETE
  USING (auth.uid() = author_id);