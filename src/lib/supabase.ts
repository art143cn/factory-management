import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://lkqjzquymzfetfarzixv.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxrcWp6cXV5bXpmZXRmYXJ6aXh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0NDIzMDMsImV4cCI6MjA5ODAxODMwM30.l5Xi6zBRyc-PXFHsIpOUitKqr3mu2wiRutEG426Gga8";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
