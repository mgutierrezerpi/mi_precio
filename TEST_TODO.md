# Test TODO

Outstanding things to verify before shipping the current changes:

## Team and Members

- [ ] Invite a new member and confirm the member appears in the team list.
- [ ] Update a member role and confirm the API persists and returns the new role.
- [ ] Confirm non-owner users cannot perform owner-only team actions.
- [ ] Confirm owner/admin users can still update member details.
- [ ] Verify current user payload includes the expected team/member fields after login and refresh.

## Admin Navigation

- [ ] Open the simple admin layout on desktop and mobile and confirm the navigation still fits.
- [ ] Visit the compact lists route directly and through navigation.
- [ ] Confirm admin route switching sends each plan/role to the intended screen.
- [ ] Confirm the CRM top bar displays the right tenant/user state after auth refresh.

## Lists and Menu

- [ ] Test the public menu page for a published list with categories and product images.
- [ ] Test the public menu page for an empty or unpublished list.
- [ ] Confirm item ordering, category grouping, prices, and availability render correctly.
- [ ] Check mobile layout for long product names and long descriptions.

## Auth State

- [ ] Verify login, token restore, logout, and auth refresh flows.
- [ ] Confirm auth slice tests cover the new user/team fields.
- [ ] Confirm API client responses still normalize user and tenant data correctly.

## Regression Checks

- [ ] Run API unit tests.
- [ ] Run web app unit tests.
- [ ] Build production web assets.
- [ ] Rebuild Docker images and boot the compose stack.
- [ ] Smoke test `/health`, web app `/healthz`, landing page, and key admin/public routes.
