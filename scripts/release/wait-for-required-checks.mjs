#!/usr/bin/env node

import { auditConfiguredMasterChecks, parseConfiguredChecks } from './release-doctor-policy.mjs';

const [repository, commit] = process.argv.slice(2);
const token = process.env.GH_TOKEN;
const requiredCheckErrors = auditConfiguredMasterChecks(process.env.RELEASE_REQUIRED_CHECKS);
if (!repository || !commit || !token) {
  throw new Error('Repository, commit, GH_TOKEN, and JSON-array RELEASE_REQUIRED_CHECKS are required.');
}
if (requiredCheckErrors.length > 0) throw new Error(`Invalid RELEASE_REQUIRED_CHECKS:\n- ${requiredCheckErrors.join('\n- ')}`);
const required = parseConfiguredChecks(process.env.RELEASE_REQUIRED_CHECKS);

const deadline = Date.now() + 30 * 60_000;
while (true) {
  const response = await fetch(`https://api.github.com/repos/${repository}/commits/${commit}/check-runs?per_page=100`, {
    headers: { accept: 'application/vnd.github+json', authorization: `Bearer ${token}`, 'x-github-api-version': '2022-11-28' },
  });
  if (!response.ok) throw new Error(`GitHub check-runs request failed: ${response.status} ${await response.text()}`);
  const payload = await response.json();
  const byName = new Map(payload.check_runs.map((check) => [check.name, check]));
  const failures = required.filter(
    (name) => byName.has(name) && byName.get(name).status === 'completed' && byName.get(name).conclusion !== 'success'
  );
  if (failures.length > 0) throw new Error(`Required master checks failed: ${failures.join(', ')}`);
  const pending = required.filter((name) => byName.get(name)?.conclusion !== 'success');
  if (pending.length === 0) {
    process.stdout.write(`All required checks passed for ${commit}: ${required.join(', ')}\n`);
    break;
  }
  if (Date.now() >= deadline) throw new Error(`Timed out waiting for required master checks: ${pending.join(', ')}`);
  process.stdout.write(`Waiting for required master checks: ${pending.join(', ')}\n`);
  await new Promise((resolve) => setTimeout(resolve, 15_000));
}
