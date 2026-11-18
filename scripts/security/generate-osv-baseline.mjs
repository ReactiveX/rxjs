#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises';
import { canonicalGithubAdvisoryId, classifyAuditPaths, isCompleteAudit, validateOsvExceptions } from './check-osv-exceptions.mjs';

const [osvPath, auditPath, outputPath = 'osv-scanner.toml', reviewed, ignoreUntil] = process.argv.slice(2);
if (!osvPath || !auditPath || !reviewed || !ignoreUntil)
  throw new Error('Usage: generate-osv-baseline.mjs <osv-json> <pnpm-audit-json> <output> <reviewed YYYY-MM-DD> <expires YYYY-MM-DD>');
function parseDate(value) {
  const date = new Date(`${value}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value)
    throw new Error('Review and expiry must be valid YYYY-MM-DD dates.');
  return date.getTime();
}
const reviewedAt = parseDate(reviewed);
const expiresAt = parseDate(ignoreUntil);
if (reviewedAt > Date.now() || expiresAt <= Date.now() || expiresAt <= reviewedAt || expiresAt - reviewedAt > 90 * 86400000)
  throw new Error('Review must not be in the future and expiry must be future, after review, and within 90 days.');
const osv = JSON.parse(await readFile(osvPath, 'utf8'));
const audit = JSON.parse(await readFile(auditPath, 'utf8'));
if (!isCompleteAudit(audit)) throw new Error('Refusing to baseline an incomplete npm audit.');
if (!Array.isArray(osv.results)) throw new Error('Refusing to baseline an incomplete OSV result.');
const { unreviewed, legacyDocs } = classifyAuditPaths(audit);
if (unreviewed.length > 0) throw new Error(`Refusing to baseline ${unreviewed.length} release-reachable advisory paths.`);
const docsPackages = new Set(legacyDocs.map(({ package: name, version }) => `${name}@${version}`));
const ids = new Set();
for (const result of osv.results ?? []) {
  for (const entry of result.packages ?? []) {
    const key = `${entry.package?.name}@${entry.package?.version}`;
    for (const vulnerability of entry.vulnerabilities ?? []) {
      // Require fresh matching scans: an OSV finding absent from the proven
      // docs-only inventory must be investigated, not silently ignored.
      if (!docsPackages.has(key)) throw new Error(`OSV finding outside the reviewed docs inventory: ${key}`);
      ids.add(canonicalGithubAdvisoryId(vulnerability));
    }
  }
}
const reason = `workspace=apps/rxjs.dev; owner=benlesh; tracking=docs/security/LEGACY_DOCS_VULNERABILITIES.md; reviewed=${reviewed}; unreachable=apps/rxjs.dev is excluded from RxJS 9 build, test, qualification, and publication`;
const source =
  `# Generated from the reviewed ${reviewed} OSV/npm path audit. Do not hand-edit.\n` +
  '# Regenerate only after scripts/security/check-osv-exceptions.mjs proves every path remains isolated.\n\n' +
  [...ids]
    .sort()
    .map((id) => `[[IgnoredVulns]]\nid = "${id}"\nignoreUntil = ${ignoreUntil}\nreason = "${reason}"\n`)
    .join('\n');
const errors = validateOsvExceptions(source);
if (errors.length) throw new Error(`Generated baseline is invalid: ${errors.join('; ')}`);
await writeFile(outputPath, source);
process.stdout.write(`Recorded ${ids.size} reviewed legacy-docs advisory IDs in ${outputPath}.\n`);
