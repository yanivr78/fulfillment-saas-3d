#!/usr/bin/env bash
set -euo pipefail

# Automated Free Hosting Deployment Script for fulfillment-saas-web
# Supports:
#   1. Vercel Free Tier (if `vercel` CLI is authenticated or via `npx vercel --prod --yes`)
#   2. Cloudflare Pages Free Tier (via `npx wrangler pages deploy out`)
#   3. GitHub Pages Free Tier (via `gh` CLI + GitHub Actions workflow)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
REPO_OWNER="yanivr78"
REPO_NAME="${1:-fulfillment-saas-web}"
PROVIDER="${DEPLOY_PROVIDER:-auto}"

cd "${PROJECT_DIR}"

echo "==> Step 1: Ensuring dependencies & building static Next.js bundle (./out)..."
if [ ! -d "node_modules" ]; then
  npm install
fi
npm run build
touch out/.nojekyll

deploy_vercel() {
  echo "==> Deploying to Vercel (Free Hobby Tier)..."
  npx --yes vercel deploy --prod --yes
}

deploy_cloudflare() {
  echo "==> Deploying to Cloudflare Pages (Free Tier)..."
  npx --yes wrangler pages deploy out --project-name="${REPO_NAME}"
}

deploy_github_pages() {
  echo "==> Publishing repository & enabling GitHub Pages..."
  bash "${SCRIPT_DIR}/create-and-push-repo.sh" "${REPO_NAME}"
  # Note: GitHub Pages is free on public repos or GitHub Pro/Team private repos
  gh api -X POST "repos/${REPO_OWNER}/${REPO_NAME}/pages" \
    -f build_type="workflow" >/dev/null 2>&1 || true
  gh workflow run "Deploy Next.js Static Site to GitHub Pages" \
    --repo "${REPO_OWNER}/${REPO_NAME}" >/dev/null 2>&1 || true
  echo "==> GitHub Actions Pages deployment triggered: https://${REPO_OWNER}.github.io/${REPO_NAME}/"
}

case "${PROVIDER}" in
  vercel)
    deploy_vercel
    ;;
  cloudflare)
    deploy_cloudflare
    ;;
  gh-pages)
    deploy_github_pages
    ;;
  auto)
    if command -v vercel >/dev/null 2>&1; then
      deploy_vercel
    elif command -v wrangler >/dev/null 2>&1; then
      deploy_cloudflare
    else
      deploy_github_pages
    fi
    ;;
  *)
    echo "Unknown DEPLOY_PROVIDER=${PROVIDER}. Use: auto | vercel | cloudflare | gh-pages" >&2
    exit 1
    ;;
esac
