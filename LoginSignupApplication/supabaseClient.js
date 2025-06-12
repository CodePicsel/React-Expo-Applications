import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nugqhxatwfchsxghxjnh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51Z3FoeGF0d2ZjaHN4Z2h4am5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzMDEzMTQsImV4cCI6MjA2NDg3NzMxNH0.38sLHQ4X5x1tMsCt4UyOSvt9Mbwl3ECxqFAQso3tdqU';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
