import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tnfnnzgkvbnctcnrytsq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuZm5uemdrdmJuY3RjbnJ5dHNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2NTg3MjUsImV4cCI6MjA5MDIzNDcyNX0.HQWuiYjmNX0spxL4kV9fRktjULgEY7hXvZgGo0s6Jt4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
