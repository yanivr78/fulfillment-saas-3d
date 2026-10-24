#!/usr/bin/env bash
set -euo pipefail

REPO_OWNER="yanivr78"
REPO_NAME="${1:-fulfillment-saas-web}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${PROJECT_DIR}"

if [ ! -d ".git" ]; then
  git init -b main
fi

git add .
if ! git diff --cached --quiet; then
  git commit -m "feat: initial Fullfillment SaaS marketing & interactive control tower website"
fi

if gh repo view "${REPO_OWNER}/${REPO_NAME}" >/dev/null 2>&1; then
  echo "Repository ${REPO_OWNER}/${REPO_NAME} already exists; setting remote and pushing..."
  if git remote get-url origin >/dev/null 2>&1; then
    git remote set-url origin "https://github.com/${REPO_OWNER}/${REPO_NAME}.git"
  else
    git remote add origin "https://github.com/${REPO_OWNER}/${REPO_NAME}.git"
  fi
  git push -u origin main
else
  echo "Creating private repository ${REPO_OWNER}/${REPO_NAME} and pushing..."
  gh repo create "${REPO_OWNER}/${REPO_NAME}" --private --source=. --remote=origin --push
fi

echo "Published: https://github.com/${REPO_OWNER}/${REPO_NAME}"
