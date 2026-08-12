import assert from 'node:assert/strict';
import test from 'node:test';
import { canonicalGithubAdvisoryId, classifyAuditPaths, isCompleteAudit, validateOsvExceptions } from './check-osv-exceptions.mjs';

const valid = `[[IgnoredVulns]]
id = "GHSA-aaaa-bbbb-cccc"
ignoreUntil = 2026-10-31
reason = "workspace=apps/rxjs.dev; owner=benlesh; tracking=docs/security/LEGACY_DOCS_VULNERABILITIES.md; reviewed=2026-08-02; unreachable=excluded from build, qualification, and publication"
`;

test('requires owned, justified, tracked exceptions of at most 90 days', () => {
  assert.deepEqual(validateOsvExceptions(valid, new Date('2026-08-02T00:00:00Z')), []);
  assert.match(validateOsvExceptions(valid, new Date('2026-11-01T00:00:00Z')).join('\n'), /expired/);
  assert.match(validateOsvExceptions(valid.replace('2026-10-31', '2027-10-31'), new Date('2026-08-02T00:00:00Z')).join('\n'), /90-day/);
  assert.match(validateOsvExceptions(valid.replace('owner=benlesh; ', ''), new Date('2026-08-02T00:00:00Z')).join('\n'), /owner/);
});

test('separates the excluded docs app from every release-reachable path', () => {
  const audit = {
    advisories: {
      one: { github_advisory_id: 'GHSA-one', module_name: 'a', findings: [{ version: '1', paths: ['apps__rxjs.dev>a'] }] },
      two: { github_advisory_id: 'GHSA-two', module_name: 'b', findings: [{ version: '2', paths: ['.>b'] }] },
    },
  };
  const result = classifyAuditPaths(audit);
  assert.equal(result.legacyDocs.length, 1);
  assert.equal(result.unreviewed.length, 1);
});

test('uses one stable GitHub advisory ID for aliased OSV records', () => {
  assert.equal(
    canonicalGithubAdvisoryId({ id: 'GHSA-r5fr-rjxr-66jc', aliases: ['CVE-2026-4800', 'GHSA-35jh-r3h4-6jhm'] }),
    'GHSA-35jh-r3h4-6jhm'
  );
  assert.equal(canonicalGithubAdvisoryId({ id: 'GHSA-jhpw-976m-542j', aliases: ['CVE-2026-0001'] }), 'GHSA-jhpw-976m-542j');
});

test('fails closed when npm audit did not return a complete dependency result', () => {
  assert.equal(isCompleteAudit({ advisories: {}, metadata: { totalDependencies: 2237 } }), true);
  assert.equal(isCompleteAudit({ error: 'registry unavailable' }), false);
  assert.equal(isCompleteAudit({ advisories: {}, metadata: { totalDependencies: 0 } }), false);
});
