#!/usr/bin/env node

import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertNpmWebUrl, releaseOperatorLogin, releasePackages, releaseToolchain, stagedPackagesVariable } from './release-config.mjs';
import { auditBranchRuleset, auditConfiguredMasterChecks, requireWorkflowJobRunners } from './release-doctor-policy.mjs';

const root = fileURLToPath(new URL('../..', import.meta.url));
const strict = process.argv.includes('--strict');
const errors = [];
if (releaseOperatorLogin !== 'benlesh') errors.push('The sole release operator must remain benlesh unless D-057 is explicitly reopened.');
if (
  releaseToolchain.runner !== 'ubuntu-24.04' ||
  releaseToolchain.node !== '24.12.0' ||
  releaseToolchain.pnpm !== '10.34.5' ||
  releaseToolchain.npm !== '11.18.0' ||
  !/^sha512-[A-Za-z0-9+/]+={0,2}$/.test(releaseToolchain.npmIntegrity)
) {
  errors.push('The checked release toolchain or npm SHA-512 drifted.');
}

const workflowDirectory = path.join(root, '.github/workflows');
const workflowFiles = (await readdir(workflowDirectory)).filter((file) => /\.ya?ml$/.test(file));
const actionFiles = [...workflowFiles.map((file) => `.github/workflows/${file}`), '.github/actions/install-dependencies/action.yml'];
for (const relativePath of actionFiles) {
  const source = await readFile(path.join(root, relativePath), 'utf8');
  for (const match of source.matchAll(/^\s*-?\s*uses:\s*([^\s#]+)(?:\s*#.*)?$/gm)) {
    const reference = match[1];
    if (reference.startsWith('./')) continue;
    if (!/@[0-9a-f]{40}$/.test(reference)) errors.push(`${relativePath} does not pin ${reference} to a full commit SHA.`);
  }
}

for (const relativePath of [...workflowFiles.map((file) => `.github/workflows/${file}`), 'package.json']) {
  const source = await readFile(path.join(root, relativePath), 'utf8');
  if (/NPM_TOKEN|NODE_AUTH_TOKEN/.test(source)) errors.push(`${relativePath} contains a long-lived npm publishing token reference.`);
  if (/(^|\s)npm\s+publish(?:\s|$)/m.test(source)) errors.push(`${relativePath} can call direct npm publish.`);
  if (source.includes('pull_request_target')) errors.push(`${relativePath} uses pull_request_target.`);
}

const stageWorkflow = await readFile(path.join(root, '.github/workflows/release-stage.yml'), 'utf8').catch(() => '');
const qualificationWorkflow = await readFile(path.join(root, '.github/workflows/release-qualify.yml'), 'utf8').catch(() => '');
for (const requirement of [
  'id-token: write',
  'workflow_dispatch:',
  'qualification_run_id:',
  'manifest_sha512:',
  "github.actor == 'benlesh'",
  'Verify typed manual authorization without npm authority',
  'needs: authorize',
  'authorize-stage.mjs',
  'authorize-release-commit.mjs',
  'stage-release.mjs publish',
  'release-candidate.mjs verify',
]) {
  if (!stageWorkflow.includes(requirement)) errors.push(`release-stage.yml is missing ${requirement}.`);
}
errors.push(
  ...requireWorkflowJobRunners(stageWorkflow, 'release-stage.yml', {
    authorize: 'ubuntu-24.04',
    stage: 'ubuntu-24.04',
  })
);
for (const requirement of [
  'matrix: { build: [a, b] }',
  'compare-release-candidates.mjs',
  'Exact tarballs / package, type, import, and migration gates',
  'verify-npm-dry-runs.mjs',
  "node-version: '24.12.0'",
  'generate-release-evidence.mjs',
  'osv-scanner-action@',
  'release-candidate.mjs manifest-digest',
]) {
  if (!qualificationWorkflow.includes(requirement)) errors.push(`release-qualify.yml is missing ${requirement}.`);
}
errors.push(
  ...requireWorkflowJobRunners(qualificationWorkflow, 'release-qualify.yml', {
    build: 'ubuntu-24.04',
    compare: 'ubuntu-24.04',
    package: 'ubuntu-24.04',
    node: 'ubuntu-24.04',
    browser: 'ubuntu-24.04',
    'alternate-runtime': 'ubuntu-24.04',
    safari: 'macos-15',
    wpt: 'ubuntu-24.04',
    evidence: 'ubuntu-24.04',
  })
);
if (!stageWorkflow.includes('install-pinned-npm.mjs')) {
  errors.push('release-stage.yml must install the checked npm CLI through install-pinned-npm.mjs.');
}
if (!stageWorkflow.includes("node-version: '24.12.0'")) {
  errors.push('release-stage.yml must use exact Node 24.12.0.');
}
if (
  `${stageWorkflow}\n${qualificationWorkflow}`.includes('actions/cache') ||
  `${stageWorkflow}\n${qualificationWorkflow}`.includes('cache: pnpm')
) {
  errors.push('The privileged release workflow must not restore dependency or build caches.');
}
if (stageWorkflow.includes('registry-url:')) {
  errors.push('The staging workflow must not generate token-style npm registry authentication; trusted publishing uses OIDC only.');
}
const stageScript = await readFile(path.join(root, 'scripts/release/stage-release.mjs'), 'utf8').catch(() => '');
if (!stageScript.includes("['stage', 'download', stageId]")) {
  errors.push('stage-release.mjs must download each private npm stage before approval.');
}

const releasePullRequestWorkflow = await readFile(path.join(root, '.github/workflows/release-pr.yml'), 'utf8').catch(() => '');
errors.push(...requireWorkflowJobRunners(releasePullRequestWorkflow, 'release-pr.yml', { 'release-pr': 'ubuntu-24.04' }));
if (!releasePullRequestWorkflow.includes("node-version: '24.12.0'")) {
  errors.push('release-pr.yml must use exact Node 24.12.0.');
}
for (const trustCheck of [
  "github.event.workflow_run.event == 'push'",
  "github.event.workflow_run.head_branch == 'master'",
  'github.event.workflow_run.head_repository.full_name == github.repository',
]) {
  if (!releasePullRequestWorkflow.includes(trustCheck)) {
    errors.push(`release-pr.yml is missing the trusted workflow-run check: ${trustCheck}.`);
  }
}

const names = [];
const versions = new Set();
for (const { directory, name } of releasePackages) {
  const manifest = JSON.parse(await readFile(path.join(root, directory, 'package.json'), 'utf8'));
  names.push(manifest.name);
  versions.add(manifest.version);
  if (manifest.name !== name) errors.push(`${directory}/package.json must identify ${name}.`);
  if (manifest.repository?.url !== 'https://github.com/ReactiveX/rxjs.git') {
    errors.push(`${directory}/package.json must use the exact case-sensitive ReactiveX repository URL.`);
  }
}
if (versions.size !== 1) errors.push('The four release packages do not have one synchronized version.');

const runbook = await readFile(path.join(root, 'docs/RELEASE_PROCESS.md'), 'utf8').catch(() => '');
const normalizedRunbook = runbook.replaceAll('`', '');
if (!/^# RxJS 9 secure release process\n\n## Basic steps\n/.test(runbook)) errors.push('The public runbook must begin with Basic steps.');
if (runbook.indexOf('## Security considerations') < runbook.indexOf('## Basic steps')) {
  errors.push('Security considerations must follow Basic steps.');
}
for (const requiredText of [
  'one maintainer',
  'zero approvals',
  'automatically creates or refreshes the release PR',
  'release-manifest.json SHA-512',
  'WebAuthn',
]) {
  if (!normalizedRunbook.toLowerCase().includes(requiredText.toLowerCase())) errors.push(`The runbook is missing: ${requiredText}.`);
}
if (
  /@ReactiveX\/release-maintainers|add-reviewer|required code-owner|environment reviewer requirement/i.test(
    `${runbook}\n${stageWorkflow}\n${qualificationWorkflow}`
  )
) {
  errors.push('Release documentation or workflows still imply a second reviewer or release team.');
}
for (const { name } of releasePackages) {
  if (!runbook.includes(`\`${name}\``)) errors.push(`The public runbook does not identify ${name}.`);
}
const reviewed = /Last reviewed:\s*(\d{4}-\d{2}-\d{2})\./.exec(runbook)?.[1];
const reviewedAt = reviewed ? Date.parse(`${reviewed}T00:00:00Z`) : Number.NaN;
if (!Number.isFinite(reviewedAt) || reviewedAt > Date.now() + 24 * 60 * 60_000 || Date.now() - reviewedAt > 366 * 24 * 60 * 60_000) {
  errors.push('The public release runbook has not been reviewed within 366 days.');
}

if (strict || process.env[stagedPackagesVariable]) {
  try {
    const stagedUrl = assertNpmWebUrl(process.env[stagedPackagesVariable] ?? '', stagedPackagesVariable);
    if (strict) {
      const response = await fetch(stagedUrl, { method: 'HEAD', redirect: 'manual' });
      if (response.status === 404 || response.status >= 500) {
        errors.push(`${stagedPackagesVariable} returned HTTP ${response.status}; manually verify and update the authenticated route.`);
      }
    }
  } catch (error) {
    errors.push(error.message);
  }
}

if (strict) {
  if (!/^\d+$/.test(process.env.RELEASE_APP_ID ?? '')) errors.push('RELEASE_APP_ID must be configured as a numeric GitHub App ID.');
  if (process.env.RELEASE_APP_PRIVATE_KEY_PRESENT !== 'true') {
    errors.push('RELEASE_APP_PRIVATE_KEY must be configured without exposing its value to the release doctor.');
  }
  errors.push(...auditConfiguredMasterChecks(process.env.RELEASE_REQUIRED_CHECKS));
  await validateBranchRuleset();
  await validateTagRuleset();
}

if (errors.length > 0) throw new Error(`Release doctor found ${errors.length} problem(s):\n- ${errors.join('\n- ')}`);
process.stdout.write(
  `Release doctor passed for ${names.join(', ')} at ${[...versions][0]}.` +
    (strict ? ` ${stagedPackagesVariable} is configured on the required npm origin.` : '') +
    '\n'
);

async function validateTagRuleset() {
  const repository = process.env.GITHUB_REPOSITORY;
  const token = process.env.GH_TOKEN;
  const rulesetId = process.env.RELEASE_TAG_RULESET_ID;
  if (!repository || !token || !rulesetId) {
    errors.push('GITHUB_REPOSITORY, GH_TOKEN, and RELEASE_TAG_RULESET_ID are required to audit tag protection.');
    return;
  }
  try {
    const response = await fetch(`https://api.github.com/repos/${repository}/rulesets/${encodeURIComponent(rulesetId)}`, {
      headers: {
        accept: 'application/vnd.github+json',
        authorization: `Bearer ${token}`,
        'x-github-api-version': '2022-11-28',
      },
    });
    if (!response.ok) throw new Error(`GitHub returned HTTP ${response.status}.`);
    const ruleset = await response.json();
    if (ruleset.target !== 'tag' || ruleset.enforcement !== 'active') {
      errors.push(`Ruleset ${rulesetId} must be an active tag ruleset.`);
    }
    if (!ruleset.conditions?.ref_name?.include?.includes('refs/tags/9.*')) {
      errors.push(`Ruleset ${rulesetId} must include refs/tags/9.*.`);
    }
    const rules = new Set((ruleset.rules ?? []).map(({ type }) => type));
    for (const requiredRule of ['creation', 'update', 'deletion', 'non_fast_forward']) {
      if (!rules.has(requiredRule)) errors.push(`Ruleset ${rulesetId} is missing the ${requiredRule} rule.`);
    }
  } catch (error) {
    errors.push(`Could not audit release tag ruleset ${rulesetId}: ${error.message}`);
  }
}

async function validateBranchRuleset() {
  const rulesetId = process.env.RELEASE_BRANCH_RULESET_ID;
  if (!rulesetId) {
    errors.push('RELEASE_BRANCH_RULESET_ID is required to audit single-maintainer master protection.');
    return;
  }
  try {
    const ruleset = await readRuleset(rulesetId);
    errors.push(...auditBranchRuleset(ruleset).map((error) => `Ruleset ${rulesetId}: ${error}`));
  } catch (error) {
    errors.push(`Could not audit release branch ruleset ${rulesetId}: ${error.message}`);
  }
}

async function readRuleset(rulesetId) {
  const repository = process.env.GITHUB_REPOSITORY;
  const token = process.env.GH_TOKEN;
  if (!repository || !token) throw new Error('GITHUB_REPOSITORY and GH_TOKEN are required.');
  const response = await fetch(`https://api.github.com/repos/${repository}/rulesets/${encodeURIComponent(rulesetId)}`, {
    headers: {
      accept: 'application/vnd.github+json',
      authorization: `Bearer ${token}`,
      'x-github-api-version': '2022-11-28',
    },
  });
  if (!response.ok) throw new Error(`GitHub returned HTTP ${response.status}.`);
  return response.json();
}
