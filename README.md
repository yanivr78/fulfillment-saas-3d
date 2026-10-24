# Fullfillment SaaS — Marketing & Operations Control Tower Website (`fulfillment-saas-web`)

Modern Next.js + TypeScript showcase and interactive Operations Control Tower sandbox for the Multi-Tenant 3PL Fulfillment SaaS platform (`yanivr78/fulfillment-saas-web`).

## What's Inside (Initial Release)
- **Hero & Real-Time Platform Invariants**: Showcases the core conservation invariant (`available = on_hand - reserved - quarantined - damaged`), inbound quarantine-first ASN receiving, and 100-way concurrent order allocation.
- **Interactive Warehouse Control Tower Simulator**:
  - **Live Inventory & Order Floor Simulator**: Receive ASNs into quarantine, complete putaway into storage bins, allocate orders with atomic reservation locks, and step orders through `ALLOCATED -> PICKED -> PACKED -> SHIPPED`.
  - **Multi-Tenant RBAC & PostgreSQL RLS Scope Tester**: Switch between `TENANT_ADMIN`, `WAREHOUSE_OPERATOR`, `MERCHANT_USER`, and a cross-tenant principal to inspect RLS policy enforcement.
  - **Interactive API & Webhook Payload Explorer**: Inspect JSON contracts for `/api/v1/orders`, `/api/v1/asns/:id/receive`, and HMAC-verified `/api/v1/webhooks/carrier/fedex`.
- **Six Architectural Bento Pillars & Protected API Surface Matrix**
- **3PL SaaS Pricing Tiers**: Growth 3PL Node, Enterprise Control Tower, and Dedicated Sovereign Cloud.

## Local Development

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:3000` in your browser.

## Publishing to `https://github.com/yanivr78/fulfillment-saas-web`

Run the included helper script to initialize the standalone Git repository, create the private repository under `yanivr78`, and push `main`:

```bash
bash scripts/create-and-push-repo.sh
```

## Free Hosting & One-Command Deployment

The project is pre-configured for static export (`output: 'export'` in `next.config.mjs`) and supports the three best free Next.js/static hosting platforms out of the box:

1. **Vercel (Hobby Free Tier — supports private GitHub repos for free)**:
   ```bash
   DEPLOY_PROVIDER=vercel bash scripts/deploy-free-hosting.sh
   ```
2. **Cloudflare Pages (Free Tier — unlimited static bandwidth & private GitHub repo integration)**:
   ```bash
   DEPLOY_PROVIDER=cloudflare bash scripts/deploy-free-hosting.sh
   ```
3. **GitHub Pages (Free via included `.github/workflows/deploy-pages.yml`)**:
   ```bash
   DEPLOY_PROVIDER=gh-pages bash scripts/deploy-free-hosting.sh
   ```

