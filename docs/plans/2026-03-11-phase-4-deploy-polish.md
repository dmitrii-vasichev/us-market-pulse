# Phase 4: Deploy + Polish

**Date:** 2026-03-11
**Phase:** 4 of 4
**Goal:** Production deployment, SEO, UX polish, documentation
**Estimated tasks:** 8

---

## Task 1: Loading skeletons for all data-fetching components

**Description:** Add animated skeleton placeholders that display while API data is loading. Create a reusable `ChartCardSkeleton` component and `KpiStripSkeleton`. Use Tailwind `animate-pulse` for consistency with existing design.

**Files:**
- `frontend/src/components/ChartCardSkeleton.tsx` (new)
- `frontend/src/components/KpiStripSkeleton.tsx` (new)
- `frontend/src/components/KpiStrip.tsx` (add loading state)
- `frontend/src/components/charts/*.tsx` (add loading state to each chart wrapper)
- `frontend/src/app/page.tsx` (use Suspense or conditional rendering)
- `frontend/src/app/labor-economy/page.tsx`
- `frontend/src/app/markets-sectors/page.tsx`

**Acceptance Criteria:**
- [ ] ChartCardSkeleton matches ChartCard dimensions and border-radius
- [ ] KpiStripSkeleton shows 5 placeholder cards
- [ ] All chart components show skeleton while data is `undefined`/loading
- [ ] Smooth transition from skeleton to real content
- [ ] Tests for skeleton components

**Verification:** Open app with throttled network — skeletons visible during load

---

## Task 2: Error boundaries and error states

**Description:** Add Next.js `error.tsx` files for each route segment and a global `not-found.tsx`. Add inline error state for individual chart components that fail to load data (show friendly message instead of crashing the whole page).

**Files:**
- `frontend/src/app/error.tsx` (new — global error boundary)
- `frontend/src/app/not-found.tsx` (new — 404 page)
- `frontend/src/components/ChartErrorFallback.tsx` (new — per-chart error UI)
- `frontend/src/components/charts/*.tsx` (wrap data fetching with error handling)

**Acceptance Criteria:**
- [ ] Global error.tsx catches unhandled errors with "Reset" button
- [ ] 404 page with link back to home
- [ ] Individual chart errors don't crash the whole page
- [ ] ChartErrorFallback shows friendly message inside ChartCard
- [ ] Tests for error boundary and fallback

**Verification:** Simulate API failure → charts show error state, page stays functional

---

## Task 3: OG meta tags + favicon + SEO

**Description:** Add comprehensive Open Graph and Twitter Card meta tags to layout.tsx. Add favicon, apple-touch-icon, theme-color. Add JSON-LD structured data for the dashboard.

**Files:**
- `frontend/src/app/layout.tsx` (metadata export)
- `frontend/public/favicon.ico` (new)
- `frontend/public/og-image.png` (new — 1200x630 OG image)
- `frontend/public/apple-touch-icon.png` (new)
- `frontend/src/app/robots.ts` (new)
- `frontend/src/app/sitemap.ts` (new)

**Acceptance Criteria:**
- [ ] og:title, og:description, og:image, og:url, og:type present
- [ ] Twitter card meta tags (twitter:card, twitter:title, twitter:image)
- [ ] Favicon visible in browser tab
- [ ] robots.txt allows crawling
- [ ] sitemap.xml lists all tab routes
- [ ] Theme-color meta tag matches design brief

**Verification:** Share URL on social media preview tool → correct title, description, image

---

## Task 4: Vercel deployment configuration

**Description:** Configure Next.js for Vercel deployment. Add environment variables config, API rewrites to proxy backend calls, and proper build settings.

**Files:**
- `frontend/next.config.ts` (add rewrites, images, headers)
- `frontend/.env.example` (new — document required env vars)
- `frontend/vercel.json` (new — if needed for headers/redirects)

**Acceptance Criteria:**
- [ ] `next.config.ts` has rewrite rules for `/api/*` → Railway backend
- [ ] Environment variable `NEXT_PUBLIC_API_URL` documented
- [ ] `npm run build` succeeds without errors
- [ ] CORS headers configured properly
- [ ] Build output optimized (no unnecessary bundles)

**Verification:** `npm run build` passes, deploy preview works on Vercel

**Dependencies:** Tasks 1-3 should be done first (they affect build)

---

## Task 5: Comprehensive README

**Description:** Write a professional README.md with project overview, screenshots, tech stack, architecture diagram (text-based), setup instructions, and deployment guide. This is the portfolio showpiece — should be polished.

**Files:**
- `README.md` (rewrite)
- `docs/screenshots/` (new directory — add screenshots after deploy)

**Acceptance Criteria:**
- [ ] Hero section with project name and one-line description
- [ ] Feature highlights with chart type count (14+ types)
- [ ] Tech stack table
- [ ] Architecture overview (data flow: FRED → GitHub Actions → PostgreSQL → FastAPI → Next.js)
- [ ] Local development setup instructions (backend + frontend)
- [ ] Environment variables reference
- [ ] Deployment section (Vercel + Railway)
- [ ] Screenshot placeholders (to be filled after deploy)
- [ ] License section

**Verification:** README renders correctly on GitHub, all links work

---

## Task 6: Frontend tests for Phase 3 + Phase 4 components

**Description:** Close open issue #43 (Phase 3 tests) and add tests for new Phase 4 components (skeletons, error boundaries). Ensure all existing tests still pass.

**Files:**
- `frontend/__tests__/components/UnemploymentBump.test.tsx` (new)
- `frontend/__tests__/components/CpiHeatmap.test.tsx` (new)
- `frontend/__tests__/components/StateScatter.test.tsx` (new)
- `frontend/__tests__/components/RatesLine.test.tsx` (new)
- `frontend/__tests__/components/SectorTreemap.test.tsx` (new)
- `frontend/__tests__/components/SentimentRadial.test.tsx` (new)
- `frontend/__tests__/components/Sp500Area.test.tsx` (new)
- `frontend/__tests__/components/ChartCardSkeleton.test.tsx` (new)
- `frontend/__tests__/components/ChartErrorFallback.test.tsx` (new)

**Acceptance Criteria:**
- [ ] Each Phase 3 chart component has at least 1 render test
- [ ] Skeleton and error fallback components tested
- [ ] All tests pass: `npm test`
- [ ] No lint errors: `npm run lint`
- [ ] Closes #43

**Verification:** `npm test` — all green, `npm run lint` — no errors

**Dependencies:** Tasks 1-2 (skeletons and error states must exist first)

---

## Task 7: Lighthouse audit + performance fixes

**Description:** Run Lighthouse audit on the deployed app. Fix any critical issues: performance, accessibility, best practices, SEO. Target scores: Performance 90+, Accessibility 90+, SEO 95+.

**Files:** Various — depends on audit findings. Likely:
- Image optimization in `next.config.ts`
- ARIA labels on interactive elements
- Font display optimization
- Bundle size improvements

**Acceptance Criteria:**
- [ ] Lighthouse Performance ≥ 85
- [ ] Lighthouse Accessibility ≥ 90
- [ ] Lighthouse Best Practices ≥ 90
- [ ] Lighthouse SEO ≥ 95
- [ ] Page load < 3s (PRD requirement)
- [ ] No critical accessibility violations

**Verification:** Lighthouse CLI or Chrome DevTools audit

**Dependencies:** Task 4 (must be deployed to test real performance)

---

## Task 8: End-to-end pipeline test + cleanup

**Description:** Verify the full data pipeline works: GitHub Actions → FRED API → PostgreSQL → FastAPI → Next.js frontend. Close any remaining open issues from previous phases. Clean up workflow state.

**Files:**
- `.workflow-state.json` (update to completed)
- Close issues #7, #8, #9, #10 if already resolved

**Acceptance Criteria:**
- [ ] Manual trigger of GitHub Actions workflow succeeds
- [ ] Fresh data appears in PostgreSQL
- [ ] API returns updated data
- [ ] Frontend displays new data
- [ ] All previous phase issues reviewed and closed
- [ ] No open issues remain

**Verification:** Trigger workflow → check frontend shows today's data

---

## Execution Order

```
Task 1 (Skeletons) ──┐
Task 2 (Errors)   ───┼── can run in parallel
                      │
Task 3 (SEO/OG)  ────┘
                      │
Task 4 (Vercel)  ─────┤  depends on 1-3 (affects build)
                      │
Task 5 (README)  ─────┤  can run parallel with Task 4
                      │
Task 6 (Tests)   ─────┤  depends on 1-2 (tests new components)
                      │
Task 7 (Lighthouse) ──┤  depends on 4 (needs deployed app)
                      │
Task 8 (E2E + cleanup) ─  last task, after everything
```
