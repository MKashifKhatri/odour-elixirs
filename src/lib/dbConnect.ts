// Database connection is now handled by Supabase client.
// Import from '@/lib/supabase/server' for server components/API routes.
// Import from '@/lib/supabase/client' for client components.

export { createClient as createServerSupabase, createAdminClient } from "./supabase/server";
export { createClient as createBrowserSupabase } from "./supabase/client";
