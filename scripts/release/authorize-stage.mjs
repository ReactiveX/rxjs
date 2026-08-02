#!/usr/bin/env node

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { releaseBranch, releaseOperatorLogin } from './release-config.mjs';
import { manifestDigest, verifyCandidate } from './release-candidate.mjs';

const maximumArtifactAgeMs = 30 * 24 * 60 * 60_000;

export function validateStageAuthorization({
  run,
  artifact,
  currentHead,
  actor,
  version,
  manifest,
  manifestSha512,
  replayed,
  now = Date.now(),
}) {
  assert.equal(actor, releaseOperatorLogin, `Only ${releaseOperatorLogin} may authorize npm staging.`);
  assert.equal(run.id, Number(run.id), 'Qualification run ID must be numeric.');
  assert.equal(run.name, 'Qualify RxJS 9 release', 'Referenced run is not the qualification workflow.');
  assert.equal(run.event, 'push', 'Qualification must originate from a protected master push.');
  assert.equal(run.head_branch, releaseBranch, 'Qualification run is not on master.');
  assert.equal(run.conclusion, 'success', 'Qualification run did not succeed.');
  assert.equal(run.head_sha, currentHead, 'Qualification run is not for the current master head.');
  assert.equal(manifest.sourceCommit, currentHead, 'Candidate source commit is not the current master head.');
  assert.equal(manifest.version, version, 'Typed version does not match the qualified candidate.');
  assert.match(manifestSha512, /^[0-9a-f]{128}$/, 'Manifest SHA-512 must be 128 lowercase hexadecimal characters.');
  assert.equal(manifest.reproducible, true, 'Candidate has not passed independent reproducibility.');
  assert.equal(manifest.independentBuilds?.length, 2, 'Candidate does not record two independent builds.');
  assert.equal(artifact.expired, false, 'Qualification artifact has expired.');
  assert.equal(artifact.name, `rxjs-release-candidate-${run.id}`, 'Qualification artifact name does not match the run ID.');
  assert.ok(now - Date.parse(run.created_at) <= maximumArtifactAgeMs, 'Qualification run is older than 30 days.');
  assert.equal(replayed, false, `${version} already has a tag or GitHub Release; staging replay is forbidden.`);
}

export async function validateDownloadedCandidate(candidateRoot, expectedVersion, expectedDigest) {
  const manifest = await verifyCandidate(candidateRoot);
  const actualDigest = await manifestDigest(candidateRoot);
  assert.equal(manifest.version, expectedVersion, 'Typed version does not match the downloaded candidate.');
  assert.equal(actualDigest, expectedDigest, 'Typed manifest SHA-512 does not match the downloaded candidate.');
  return manifest;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const [repository, runIdText, version, expectedDigest, candidateDirectory] = process.argv.slice(2);
  const token = process.env.GH_TOKEN;
  const actor = process.env.RELEASE_ACTOR;
  if (!repository || !/^\d+$/.test(runIdText ?? '') || !version || !expectedDigest || !candidateDirectory || !token || !actor) {
    throw new Error(
      'Usage: authorize-stage.mjs <repository> <run-id> <version> <manifest-sha512> <candidate-directory>; GH_TOKEN and RELEASE_ACTOR are required.'
    );
  }
  const runId = Number(runIdText);
  const [run, artifacts, reference, tag, release] = await Promise.all([
    github(`/repos/${repository}/actions/runs/${runId}`, token),
    github(`/repos/${repository}/actions/runs/${runId}/artifacts`, token),
    github(`/repos/${repository}/git/ref/heads/${releaseBranch}`, token),
    github(`/repos/${repository}/git/ref/tags/${encodeURIComponent(version)}`, token, [404]),
    github(`/repos/${repository}/releases/tags/${encodeURIComponent(version)}`, token, [404]),
  ]);
  const artifact = artifacts.artifacts?.find(({ name }) => name === `rxjs-release-candidate-${runId}`);
  if (!artifact) throw new Error(`Qualification run ${runId} does not contain its exact candidate artifact.`);
  const manifest = await validateDownloadedCandidate(path.resolve(candidateDirectory), version, expectedDigest);
  validateStageAuthorization({
    run,
    artifact,
    currentHead: reference.object.sha,
    actor,
    version,
    manifest,
    manifestSha512: expectedDigest,
    replayed: tag !== null || release !== null,
  });
  process.stdout.write(
    `${JSON.stringify({ runId, version, sourceCommit: manifest.sourceCommit, pullRequest: manifest.authorizingPullRequest })}\n`
  );
}

async function github(endpoint, token, nullableStatuses = []) {
  const response = await fetch(`https://api.github.com${endpoint}`, {
    headers: {
      accept: 'application/vnd.github+json',
      authorization: `Bearer ${token}`,
      'x-github-api-version': '2022-11-28',
    },
  });
  if (nullableStatuses.includes(response.status)) return null;
  if (!response.ok) throw new Error(`GitHub request ${endpoint} failed: ${response.status} ${await response.text()}`);
  return response.json();
}
