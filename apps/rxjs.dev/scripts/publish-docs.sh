#!/usr/bin/env bash

readonly projectId=rxjs-dev
readonly deployedUrl=https://rxjs-dev.firebaseapp.com
readonly firebaseToken=$FIREBASE_TOKEN

# Deploy
(
  cd "$(dirname "$0")/.."

  # Build the app
  pnpm run build -- --env=stable

  # Include any mode-specific files
  cp -rf src/extra-files/$deployEnv/. dist/

  # Deploy to Firebase
  pnpm run firebase -- login
  pnpm run firebase -- use "$projectId"
  pnpm run firebase -- deploy --message "Deploy docs automatically" --non-interactive
  pnpm run firebase -- logout
)
