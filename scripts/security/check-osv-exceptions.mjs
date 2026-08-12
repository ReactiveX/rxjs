#!/usr/bin/env node

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';

const requiredWorkspace = 'apps/rxjs.dev';
const requiredTracker = 'docs/security/LEGACY_DOCS_VULNERABILITIES.md';

export function parseOsvExceptions(source) {
  return source
    .split('[[IgnoredVulns]]')
    .slice(1)
    .map((block) =>
      Object.fromEntries(
        [...block.matchAll(/^([A-Za-z]+)\s*=\s*(?:"([^"]*)"|(\d{4}-\d{2}-\d{2}))/gm)].map((match) => [match[1], match[2] ?? match[3]])
      )
    );
}

export function validateOsvExceptions(source, now = new Date()) {
  const errors = [];
  const seen = new Set();
  for (const [index, entry] of parseOsvExceptions(source).entries()) {
    const label = entry.id ?? `entry ${index + 1}`;
    if (!/^GHSA-[a-z0-9-]+$/i.test(entry.id ?? '')) errors.push(`${label} has no valid advisory ID.`);
    if (seen.has(entry.id)) errors.push(`${label} is duplicated.`);
    seen.add(entry.id);
    const expiry = Date.parse(`${entry.ignoreUntil ?? ''}T00:00:00Z`);
    const reviewed = /(?:^|;) reviewed=(\d{4}-\d{2}-\d{2})(?:;|$)/.exec(entry.reason ?? '')?.[1];
    const reviewedAt = Date.parse(`${reviewed ?? ''}T00:00:00Z`);
    if (!Number.isFinite(expiry) || expiry < now.getTime()) errors.push(`${label} is expired or has no expiry.`);
    if (!Number.isFinite(reviewedAt) || expiry - reviewedAt > 90 * 24 * 60 * 60_000)
      errors.push(`${label} exceeds the 90-day exception limit.`);
    if (!(entry.reason ?? '').includes(`workspace=${requiredWorkspace}`)) errors.push(`${label} has no affected workspace.`);
    if (!(entry.reason ?? '').includes(`owner=benlesh`)) errors.push(`${label} has no owner.`);
    if (!(entry.reason ?? '').includes(`tracking=${requiredTracker}`)) errors.push(`${label} has no tracking record.`);
    if (!(entry.reason ?? '').includes('unreachable=')) errors.push(`${label} has no reachability justification.`);
  }
  if (seen.size === 0) errors.push('No reviewed OSV exceptions are recorded.');
  return errors;
}

export function classifyAuditPaths(audit) {
  const unreviewed = [];
  const legacyDocs = [];
  for (const advisory of Object.values(audit.advisories ?? {})) {
    for (const finding of advisory.findings ?? []) {
      for (const dependencyPath of finding.paths ?? []) {
        const record = { id: advisory.github_advisory_id, package: advisory.module_name, version: finding.version, path: dependencyPath };
        (dependencyPath.startsWith('apps__rxjs.dev>') ? legacyDocs : unreviewed).push(record);
      }
    }
  }
  return { unreviewed, legacyDocs };
}

export function canonicalGithubAdvisoryId(vulnerability) {
  const githubIds = [vulnerability.id, ...(vulnerability.aliases ?? [])].filter((id) => /^GHSA-[a-z0-9-]+$/i.test(id));
  return githubIds.sort()[0] ?? vulnerability.id;
}

export function isCompleteAudit(audit) {
  return Boolean(
    audit &&
      typeof audit.advisories === 'object' &&
      audit.metadata &&
      Number.isSafeInteger(audit.metadata.totalDependencies) &&
      audit.metadata.totalDependencies > 0
  );
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const root = fileURLToPath(new URL('../..', import.meta.url));
  const source = await readFile(`${root}/osv-scanner.toml`, 'utf8');
  const errors = validateOsvExceptions(source);
  const auditPath = process.argv[2];
  if (auditPath) {
    const audit = JSON.parse(await readFile(auditPath, 'utf8'));
    if (!isCompleteAudit(audit)) {
      errors.push('The npm audit result is incomplete; vulnerability classification must fail closed.');
    }
    const { unreviewed, legacyDocs } = classifyAuditPaths(audit);
    if (unreviewed.length > 0) {
      errors.push(
        `Advisory paths reach release, build, or test tooling:\n${unreviewed
          .map(({ id, package: name, version, path }) => `  ${id} ${name}@${version} via ${path}`)
          .join('\n')}`
      );
    }
    process.stdout.write(`Classified ${legacyDocs.length} advisory paths as isolated legacy documentation tooling.\n`);
  }
  assert.deepEqual(errors, [], `OSV exception policy failed:\n- ${errors.join('\n- ')}`);
  process.stdout.write(`Validated ${parseOsvExceptions(source).length} time-bounded OSV exceptions.\n`);
}
