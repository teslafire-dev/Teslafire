import { createClient } from "@supabase/supabase-js";

// Credenciales públicas oficiales del proyecto Tesla Fire (con fallback garantizado)
const DEFAULT_SUPABASE_URL = "https://yptwyaxocnobcrkfxrjc.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_ywkwavFc-HzRmz6LoZ2Xbw_24G0bTFI";

const supabaseUrl = 
  import.meta.env.VITE_SUPABASE_URL || 
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL || 
  DEFAULT_SUPABASE_URL;

const supabaseKey = 
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY || 
  DEFAULT_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage
  }
});
