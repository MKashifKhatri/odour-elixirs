# Odour Elixirs

An English-language fragrance storefront built with Next.js, React and Supabase. It supports customer accounts, Google sign-in, guest order inquiries, a private admin area and WhatsApp ordering. It does not take online payments.

## Preview

1. Use Node.js 20 or newer.
2. In this folder, run **npm ci**.
3. Copy **.env.example** to **.env.local**.
4. Run **npm run dev** and open http://localhost:3000.

Sample fragrance cards appear when the database has no products, so you can preview the design before adding inventory. Product visuals remain neutral until real fragrance photography is added.

## Connect Supabase

1. Create a Supabase project. In Project Settings → API, copy the Project URL, publishable/anon key and secret/service-role key into .env.local:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY — server-only; never add a NEXT_PUBLIC_ prefix or share/commit it.
2. Set NEXT_PUBLIC_SITE_URL to http://localhost:3000 for local work. Set it to your production site URL after deployment.
3. In Supabase SQL Editor, run these scripts in order:
   - supabase-schema.sql
   - supabase/odour-elixirs-migration.sql
   - supabase/auth-profile-trigger-fix.sql
   - supabase/storefront-content-controls.sql
   - supabase-newsletter.sql — enables email capture for the homepage newsletter.
   If you already ran the older setup scripts, do not rerun the base schema. If `public.customers` is missing, run `supabase/repair-customer-tables.sql` instead of rerunning the full business migration. The customer repair script is safe to run more than once and refreshes the Supabase API schema cache.
4. In Authentication → URL Configuration, add http://localhost:3000/auth/callback to the allowed redirect URLs. Add https://your-domain/auth/callback when deployed.
5. To enable Google sign-in:
   - Create a Web OAuth client in Google Cloud Console.
   - Add your site origin (for local testing, http://localhost:3000) as an authorized JavaScript origin.
   - Add https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback as an authorized redirect URI in Google.
   - In Supabase → Authentication → Providers → Google, enable Google and enter the OAuth client ID and secret.
6. Set NEXT_PUBLIC_ADMIN_SECRET_PATH to a private URL segment, for example oe-manage-7x4p. Restart the dev server after changing .env.local.
7. Create your first account, verify its email, then promote it in Supabase SQL Editor with:

   update public.profiles set is_admin = true where email = 'your-email@example.com';

8. Open /admin/YOUR_PRIVATE_PATH to manage products, categories, featured products, customers, order requests and storefront content.

If Supabase still reports that a table is missing from its schema cache after creating it, open SQL Editor and run `NOTIFY pgrst, 'reload schema';`. Supabase documents this as the schema-cache refresh command: https://supabase.com/docs/guides/troubleshooting/refresh-postgrest-schema.

### Email verification

Email/password registration sends a six-digit verification code through Gmail SMTP. Set EMAIL to the sending Gmail address and EMAIL_PASSWORD to a Google App Password (not the normal account password). Enable two-step verification on the Google account before creating an App Password. Keep both values server-side and private. For production, use a dedicated transactional email provider if desired.

### Leaked password protection

In Supabase Authentication settings, enable leaked password protection under password security. Supabase currently offers this feature on Pro and higher plans; it cannot be enabled by this project’s SQL migrations on the Free plan.

### Product photos

Product records accept a public image URL or a path to a public Supabase Storage object. Create a public bucket such as product-images in Storage, upload photos, and paste each public URL into the product editor. Supabase Storage is separate from database storage.

The newsletter form stores consented email addresses in Supabase. It does not send campaigns; connect an email marketing provider before using the list for mailouts.

## Store operation

- Customers browse products, build a cart and submit contact/delivery details.
- The request is saved in Supabase when configured, then WhatsApp opens with the order summary addressed to +91 94278 68790.
- Guests can order without creating an account. Signed-in customers can reuse their persisted Supabase session and saved details on the same device.
- There is no payment gateway. Confirm stock, delivery and payment directly with the customer on WhatsApp.
- Admins can add customers manually, review order inquiries, change inquiry status, edit products and categories, choose featured products, and publish homepage, About, Products and Contact page copy. Homepage imagery, highlights, FAQs, genuine testimonials, SEO copy, business address and WhatsApp contact details are editable too.
