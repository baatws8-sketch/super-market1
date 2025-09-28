import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gapxatditpmzcdfntacl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhcHhhdGRpdHBtemNkZm50YWNsIiwicm9sZSI6ImFub25pbiIsImlhdCI6MTc1ODk5NDc1NywiZXhwIjoyMDc0NTcwNzU3fQ.C21Zame7fCcGZbgnQj8VF3RpxCQT5mX00DhCtjObzk0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
