-- Add llama_file_id column to documents table
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS llama_file_id TEXT;

-- Create function to increment document count
CREATE OR REPLACE FUNCTION increment_document_count(project_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE projects 
  SET document_count = document_count + 1 
  WHERE id = project_id;
END;
$$;
