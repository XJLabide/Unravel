-- Enable pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Create vector similarity search function
CREATE OR REPLACE FUNCTION match_document_chunks(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter_project_id uuid
)
RETURNS TABLE (
  id uuid,
  document_id uuid,
  content text,
  page_number integer,
  chunk_index integer,
  similarity float,
  metadata jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id,
    dc.document_id,
    dc.content,
    dc.page_number,
    dc.chunk_index,
    1 - (dc.embedding <=> query_embedding) AS similarity,
    dc.metadata
  FROM document_chunks dc
  INNER JOIN documents d ON dc.document_id = d.id
  WHERE 
    d.project_id = filter_project_id
    AND 1 - (dc.embedding <=> query_embedding) > match_threshold
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Create index for vector similarity search
CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding ON document_chunks 
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
