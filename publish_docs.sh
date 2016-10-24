#!/usr/bin/env bash
#
# Generates documentation and pushes it up to the site
# WARNING: Do NOT run this script unless you have remote `upstream` set properly
#
rm -rf tmp/docs && \
  npm run build_docs && \
  git checkout gh-pages && \
  git fetch upstream && \
  git rebase upstream/gh-pages && \
  cp -r ./tmp/docs/ ./ && \
  rm -rf tmp/ && \
  git add . && \
  git commit -am "chore(docs): docs generated automatically" && \
  git push upstream gh-pages
