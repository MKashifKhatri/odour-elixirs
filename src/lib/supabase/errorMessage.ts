type SupabaseError = { code?: string; message?: string } | null | undefined;

export function supabaseErrorMessage(error: SupabaseError, fallback: string) {
  const message = error?.message || "";
  const normalized = message.toLowerCase();
  if (error?.code === "PGRST205" || normalized.includes("schema cache")) {
    const table = message.match(/public\.([a-z_]+)/i)?.[1];
    if (table && ["customers", "customer_orders", "customer_order_items", "customer_payments"].includes(table)) {
      return `Supabase cannot find public.${table}. Run supabase/repair-customer-tables.sql in your Supabase SQL Editor, then refresh the API schema cache.`;
    }
    if (table) return `Supabase cannot find public.${table}. Confirm the table exists in the public schema, then refresh the API schema cache.`;
    return "Supabase cannot find a required table in its API schema cache. Confirm the database migrations have run, then refresh the API schema cache.";
  }
  return fallback;
}
