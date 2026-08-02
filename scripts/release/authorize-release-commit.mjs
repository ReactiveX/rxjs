#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { releaseBranch, releasePullRequestBranch } from './release-config.mjs';

const root = fileURLToPath(new URL('../..', import.meta.url));

export function selectAuthorizingPullRequest(pullRequests, { commit, repository, version }) {
  const matches = pullRequests.filter(
    (pullRequest) =>
      pullRequest.merged_at &&
      pullRequest.merge_commit_sha === commit &&
      pullRequest.base?.ref === releaseBranch &&
      pullRequest.head?.ref === releasePullRequestBranch &&
      pullRequest.head?.repo?.full_name === repository &&
      pullRequest.title === `chore(release): ${version}`
  );
  if (matches.length !== 1) {
    throw new Error(`Expected exactly one merged, repository-owned ${releasePullRequestBranch} PR for ${commit}; found ${matches.length}.`);
  }
  return matches[0];
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const [repository, commit] = process.argv.slice(2);
  const token = process.env.GH_TOKEN;
  if (!repository || !commit || !token) throw new Error('Repository, commit, and GH_TOKEN are required.');
  const version = JSON.parse(await readFile(path.join(root, 'packages/rxjs/package.json'), 'utf8')).version;
  const response = await fetch(`https://api.github.com/repos/${repository}/commits/${commit}/pulls`, {
    headers: {
      accept: 'application/vnd.github+json',
      authorization: `Bearer ${token}`,
      'x-github-api-version': '2022-11-28',
    },
  });
  if (!response.ok) throw new Error(`GitHub pull-request lookup failed: ${response.status} ${await response.text()}`);
  const pullRequest = selectAuthorizingPullRequest(await response.json(), { commit, repository, version });
  process.stdout.write(`${pullRequest.number}\n`);
}
