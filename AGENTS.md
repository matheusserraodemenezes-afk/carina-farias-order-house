<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep recommendations in a public, validated TanStack server function using AI Gateway; customers can request suggestions without creating an account.
- Use the shared menu for recommendations and checkout, and validate model item IDs, quantities and totals before rendering; AI must not control prices or add unlisted products.
- Keep preference and output validation in a client-safe pure module with focused unit tests; model calls remain inside server execution boundaries.
- Restrict meal recommendation candidates to main dishes and juices, excluding unrelated menu categories so new catalog entries cannot silently alter the combination rules.
- Keep sales analysis stateless with no customer identifiers or shared persistence; its public validated server function only analyzes submitted aggregates, never reads private owner data.
- Persist sales periods and profiles through authenticated server functions with owner-scoped RLS; the public sales page only fetches private history after sign-in, never in its loader.
- Compute sales co-occurrence per order and promotion prices from the shared catalog in a pure tested module; AI proposes hypothetical promotions but cannot activate discounts or alter checkout.
- Keep illustrative product images in a client-safe ID-to-image map separate from catalog business data; menu and cart reuse it without sending media through AI analysis.
- Payment options and statuses live in the pure `src/lib/payments.ts` (manual provider today); future automatic gateways add a provider there plus a webhook that sets payment_status, so checkout never blocks on a gateway.
- The order admin panel uses authenticated server functions that verify `has_role(admin)` via the user's client; admin access is granted only through `user_roles`.
- The public order tracking page /pedido/$id looks orders up by their random UUID and returns only status, items and totals, never customer phone or address.
- The sitemap is router-derived: every route declares staticData.sitemap; only public pages (currently the menu home) are true, private/admin/order pages false.
- Order status checks are recorded server-side from the order's DB state (never client input) into an admin-only table; owner insights aggregate them in a pure tested module and send only aggregates to AI.
- Order completion uses an admin-only atomic RPC with a row lock and persistent completed_at; emit the completion analytics event in the existing admin success handler only when the RPC reports the first qualifying transition, preventing repeat counts across sessions.
- Daily sales use paginated admin-authenticated order reads and pure cent-based aggregation in Belém time; group sales by creation date, completions by completed_at, and exclude cancelled/refunded orders from paid and pending revenue.
- Customer history uses paginated admin-authenticated order reads and pure phone-based grouping with customer/order ID fallbacks; preserve all historical orders while excluding cancelled/refunded amounts from payable totals.
- New-order panel alerts poll an admin-authenticated number cursor across all admin pages; baseline old orders on mount, deduplicate new IDs, and refresh the order list on arrivals without granting public reads.
- Offline orders are account-keyed validated local snapshots of the full order history, cleared on sign-out or failed online role verification; offline reads never authorize server actions and mutations require connectivity. Generate the app worker with vite-plugin-pwa, cache only admin navigation and hashed assets, and register only through the preview-safe wrapper.
- Home-screen installation uses two static manifests with local PNG icons: manifest.webmanifest launches /admin (owner panel, linked in __root) and manifest-cliente.webmanifest launches / (customer menu, linked in the index route head). Preserve the existing guarded offline worker without adding another registration path.
