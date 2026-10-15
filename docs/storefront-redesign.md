# Storefront redesign

## Architecture and scope

The storefront is a Next.js App Router application. AppShell owns the single main landmark, Redux, authentication, navigation and footer. Product and account APIs remain in place; the WhatsApp order submission handler is retained.

The prior interface loaded globals, foundation, redesign, system, navigation, components and polish CSS with overlapping selectors. The replacement has three responsibilities:

- globals.css: Tailwind, document shell and existing admin compatibility rules.
- foundation.css + components.css: shared tokens and accessible form/dialog primitives.
- storefront.css: storefront compositions and responsive layouts, replacing the three tracked legacy stylesheets and the previous untracked polish sheet.

A full pre-edit source snapshot was saved outside the repository at C:/Users/mkkha/AppData/Local/Temp/odour-before-redesign-W9I70I. Existing admin inventory, product API and site-content edits were preserved.

## Experience

- Campaign photography fills the opening, with a dark editorial caption and one shopping action. Mobile gives the photograph and message separate full-width positions.
- Discovery is a numbered index of actual catalogue families. The collection combines a featured product spread with four open product cards.
- Catalogue filters expose family, size and availability directly. Cards show identity, available size, price and stock without hover-dependent actions.
- Product detail pairs the gallery with tactile size/price/stock choices and a compact quantity/purchase row. Available variants take precedence over sold-out first variants.
- Bag review precedes delivery entry. Existing guest details, saved details and WhatsApp submission are retained. The drawer uses compact product rows and stock-limited quantity controls.
- Account navigation sits beside open profile sections on desktop and becomes a horizontal section list on mobile.
- Search focuses the input when opened and offers families drawn from the actual catalogue.
- FAQ uses every supplied question, grouped by subject. Multiple answers can remain open so another answer does not collapse above the current reading position. Questions have explicit controls/region relationships and plus/minus states.
- Footer is reduced to exploration, customer care and contact; configured newsletter remains supported.
- Decorative scroll reveals were removed. Images, disclosure state and control feedback retain short transitions and reduced-motion support.

## Validation

Run `npm.cmd run lint`, `npx.cmd tsc --noEmit`, `npm.cmd run build`, `node scripts/storefront-check.cjs` and `git diff --check`.

Regression checks cover cart inventory caps, separate variants, persistence, totals, public inventory serialization, selecting available sizes/colours, missing stock, inactive variants, complete FAQ content and ARIA relationships, plus CSS parsing.

Browser inventory returned no available browser, and creating an in-app browser returned `Browser is not available: iab`. No desktop/tablet/mobile screenshots or browser interaction checks were performed. Visual comparison, image cropping at actual viewport sizes, keyboard focus traversal, authenticated account edits and live WhatsApp submission remain manual verification items. No real order or customer data was submitted during verification.

Final verification: production build, lint, standalone typecheck, regression checks and diff check passed. A temporary production server returned HTTP 200 for 16 storefront routes: home, catalogue, demo PDP, bag, bag success, login, signup, profile, orders, wishlist, search, category, about, journal, contact and privacy. No server errors were emitted during those requests. Catalogue, login and search retain their existing client-rendered Suspense shells; HTTP checks do not verify their hydrated interactions. The homepage build reports 223 kB first-load JS after removing scroll reveals (262 kB in the first redesign build).
