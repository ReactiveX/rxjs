#!/usr/bin/env bash

readonly projectId=rxjs-dev
readonly deployedUrl=https://rxjs-dev.firebaseapp.com
readonly firebaseToken=$FIREBASE_TOKEN

# Deploy
(
  cd "`dirname $0`/.."

  # Build the app
  yarn build --env=stable

  # Include any mode-specific files
  cp -rf src/extra-files/$deployEnv/. dist/

  # Deploy to Firebase
  yarn firebase -- login
  yarn firebase -- use "$projectId"
  yarn firebase -- deploy --message "Deploy docs automatically" --non-interactive
  yarn firebase -- logout
)
