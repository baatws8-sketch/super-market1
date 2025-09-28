import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://gapxatditpmzcdfntacl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhcHhhdGRpdHBtemNkZm50YWNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5OTQ3NTcsImV4cCI6MjA3NDU3MDc1N30.C21Zame7fCcGZbgnQj8VF3RpxCQT5mX00DhCtjObzk0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
