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
