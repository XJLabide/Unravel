-- Insert a test user (for development)
INSERT INTO users (id, email) 
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'test@example.com')
ON CONFLICT (email) DO NOTHING;

-- Insert sample projects
INSERT INTO projects (id, user_id, name, description, document_count) 
VALUES 
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Thesis Research', 'Research papers and thesis documents', 5),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Company Policies', 'HR and company policy documents', 12),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Q3 Reports', 'Quarterly financial and business reports', 3)
ON CONFLICT (id) DO NOTHING;
