INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow public uploads" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Allow public reads" ON storage.objects
  FOR SELECT USING (bucket_id = 'documents');

CREATE POLICY "Allow public deletes" ON storage.objects
  FOR DELETE USING (bucket_id = 'documents');
