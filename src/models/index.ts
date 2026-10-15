// Models are now defined as Supabase database types.
// See src/lib/supabase/database.types.ts for the full type definitions.
// See supabase-schema.sql for the database schema.
//
// Use Supabase client for all database operations:
//   import { createClient } from "@/lib/supabase/server";  // server-side
//   import { createClient } from "@/lib/supabase/client";  // client-side
//
// Example:
//   const supabase = createClient();
//   const { data, error } = await supabase.from("profiles").select("*");

export type { Database } from "@/lib/supabase/database.types";
