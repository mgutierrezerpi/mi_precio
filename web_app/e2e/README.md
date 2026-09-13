# Browser tests

From the repository root, the simplest way to run the entire stack with a
visible browser is:

```sh
bin/e2e
```

Use `bin/e2e --lemon` for the Lemon Squeezy test-mode journey,
`bin/e2e --ui` for Playwright's interactive UI, or `bin/e2e --debug` to step
through each action. Run `bin/e2e --help` for all options.

`yarn test:e2e` starts an isolated Docker Compose project, uses high ports, and
runs the main user journey in Chromium. The API database is a fresh tmpfs and
is deleted with the containers after the run.

Override ports when CI allocates them:

```sh
E2E_WEB_PORT=45117 E2E_API_PORT=45118 \
E2E_STORAGE_PORT=45119 E2E_STORAGE_CONSOLE_PORT=45120 yarn test:e2e
```

By default billing uses the application's local provider-free path so the full
post-payment journey stays deterministic. To exercise the hosted Lemon Squeezy
checkout in test mode, provide test-mode API/store/variant/webhook secrets and
opt in explicitly:

```sh
E2E_LEMONSQUEEZY=true \
LEMONSQUEEZY_API_KEY=... LEMONSQUEEZY_STORE_ID=... \
LEMONSQUEEZY_VARIANT_PLUS=... LEMONSQUEEZY_WEBHOOK_SECRET=... \
yarn test:e2e
```

Provider mode verifies the real test-mode checkout, plan, test-card fields and
submit readiness. It then posts a correctly signed `subscription_created`
fixture to the normal webhook endpoint, follows the checkout return route, and
runs the complete application journey. Only the final payment click is
substituted because Stripe protects it with an invisible hCaptcha in automated
browsers.

Install the browser once on a new machine with `yarn playwright install chromium`.
