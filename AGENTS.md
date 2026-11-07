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
