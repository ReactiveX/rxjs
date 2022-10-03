#!/usr/bin/env bash

readonly projectId=rxjs-dev
readonly deployedUrl=https://rxjs-dev.firebaseapp.com
readonly firebaseToken=$FIREBASE_TOKEN

# Deploy
(
  cd "`dirname $0`/.."

  # Build the app
  npm run build --env=stable

  # Include any mode-specific files
  cp -rf src/extra-files/$deployEnv/. dist/

  # Deploy to Firebase
  npm run firebase -- login
  npm run firebase -- use "$projectId"
  npm run firebase -- deploy --message "Deploy docs automatically" --non-interactive
  npm run firebase -- logout
)
