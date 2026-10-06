import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kirrbucipwasidhrpsrj.supabase.co';

const supabaseAnonKey = 'sb_publishable_3c1mLJUUOib7cMfhI9HBWg_6dA-8BvI';

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);