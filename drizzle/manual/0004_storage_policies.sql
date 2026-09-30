-- Cualquiera puede ver las imágenes
CREATE POLICY "Imágenes públicas de pins"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'pins');

-- Solo usuarios logueados pueden subir, y solo dentro de su propia carpeta
CREATE POLICY "Usuarios suben en su carpeta"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'pins'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Solo pueden borrar sus propios archivos
CREATE POLICY "Usuarios borran sus archivos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'pins'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );