#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises';
import { canonicalGithubAdvisoryId, classifyAuditPaths } from './check-osv-exceptions.mjs';

const [osvPath, auditPath, outputPath = 'osv-scanner.toml'] = process.argv.slice(2);
if (!osvPath || !auditPath) throw new Error('Usage: generate-osv-baseline.mjs <osv-json> <pnpm-audit-json> [output]');
const osv = JSON.parse(await readFile(osvPath, 'utf8'));
const audit = JSON.parse(await readFile(auditPath, 'utf8'));
const { unreviewed, legacyDocs } = classifyAuditPaths(audit);
if (unreviewed.length > 0) throw new Error(`Refusing to baseline ${unreviewed.length} release-reachable advisory paths.`);
const docsPackages = new Set(legacyDocs.map(({ package: name, version }) => `${name}@${version}`));
const ids = new Set();
for (const result of osv.results ?? []) {
  for (const entry of result.packages ?? []) {
    const key = `${entry.package?.name}@${entry.package?.version}`;
    for (const vulnerability of entry.vulnerabilities ?? []) {
      // The OSV input may predate a remediation. Only the post-remediation,
      // path-classified docs inventory is eligible for the generated baseline.
      if (!docsPackages.has(key)) continue;
      ids.add(canonicalGithubAdvisoryId(vulnerability));
    }
  }
}
const reason =
  'workspace=apps/rxjs.dev; owner=benlesh; tracking=docs/security/LEGACY_DOCS_VULNERABILITIES.md; reviewed=2026-08-03; unreachable=apps/rxjs.dev is excluded from RxJS 9 build, test, qualification, and publication';
const source =
  '# Generated from the reviewed 2026-08-03 OSV/npm path audit. Do not hand-edit.\n' +
  '# Regenerate only after scripts/security/check-osv-exceptions.mjs proves every path remains isolated.\n\n' +
  [...ids]
    .sort()
    .map((id) => `[[IgnoredVulns]]\nid = "${id}"\nignoreUntil = 2026-10-31\nreason = "${reason}"\n`)
    .join('\n');
await writeFile(outputPath, source);
process.stdout.write(`Recorded ${ids.size} reviewed legacy-docs advisory IDs in ${outputPath}.\n`);
