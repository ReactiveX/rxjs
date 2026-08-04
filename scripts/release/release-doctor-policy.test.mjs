import assert from 'node:assert/strict';
import test from 'node:test';
import { releaseAdvisoryChecks, releaseRequiredMasterChecks, releaseRequiredPullRequestChecks } from './release-config.mjs';
import {
  auditBranchRuleset,
  auditConfiguredMasterChecks,
  auditReleaseAppRepositories,
  auditStageEnvironment,
  auditTagRuleset,
  parseConfiguredChecks,
  requireWorkflowJobRunners,
} from './release-doctor-policy.mjs';

const privilegedRunners = { authorize: 'ubuntu-24.04', stage: 'ubuntu-24.04' };

function validBranchRuleset() {
  return {
    target: 'branch',
    enforcement: 'active',
    bypass_actors: [],
    conditions: { ref_name: { include: ['refs/heads/master'], exclude: [] } },
    rules: [
      { type: 'deletion' },
      { type: 'non_fast_forward' },
      { type: 'required_signatures' },
      { type: 'pull_request', parameters: { required_approving_review_count: 0, allowed_merge_methods: ['squash'] } },
      {
        type: 'required_status_checks',
        parameters: {
          strict_required_status_checks_policy: true,
          required_status_checks: [...releaseRequiredMasterChecks, ...releaseRequiredPullRequestChecks].map((context) => ({
            context,
            integration_id: 15368,
          })),
        },
      },
    ],
  };
}

function validTagRuleset() {
  return {
    target: 'tag',
    enforcement: 'active',
    bypass_actors: [{ actor_id: 1234, actor_type: 'Integration', bypass_mode: 'always' }],
    conditions: { ref_name: { include: ['refs/tags/9.*'], exclude: [] } },
    rules: [{ type: 'creation' }, { type: 'update' }, { type: 'deletion' }, { type: 'non_fast_forward' }],
  };
}

test('parses and accepts only the exact master check list', () => {
  const configured = JSON.stringify(releaseRequiredMasterChecks);
  assert.deepEqual(parseConfiguredChecks(configured), releaseRequiredMasterChecks);
  assert.deepEqual(auditConfiguredMasterChecks(configured), []);
});

test('rejects missing, duplicate, pull-request-only, and advisory master checks', () => {
  const configured = [
    ...releaseRequiredMasterChecks.slice(1),
    releaseRequiredMasterChecks[1],
    releaseRequiredPullRequestChecks[0],
    releaseAdvisoryChecks[0],
  ];
  const serialized = JSON.stringify(configured);
  const errors = auditConfiguredMasterChecks(serialized).join('\n');
  assert.match(errors, /duplicate check names/);
  assert.match(errors, /missing master checks/);
  assert.match(errors, /non-master checks/);
  assert.match(errors, /Pull-request-only checks/);
  assert.match(errors, /Advisory checks/);
});

test('rejects lossy comma-separated and malformed JSON check lists', () => {
  assert.match(auditConfiguredMasterChecks(releaseRequiredMasterChecks.join(',')).join('\n'), /JSON array/);
  assert.match(auditConfiguredMasterChecks(JSON.stringify([' Dependency review'])).join('\n'), /non-empty, trimmed/);
});

test('accepts the exact protected branch contract', () => {
  assert.deepEqual(auditBranchRuleset(validBranchRuleset()), []);
});

test('rejects missing pull-request checks and unexpected advisory blockers', () => {
  const ruleset = validBranchRuleset();
  const statusChecks = ruleset.rules.find(({ type }) => type === 'required_status_checks').parameters.required_status_checks;
  statusChecks.splice(
    statusChecks.findIndex(({ context }) => context === 'Dependency review'),
    1
  );
  statusChecks.push({ context: releaseAdvisoryChecks[0], integration_id: 15368 });
  const errors = auditBranchRuleset(ruleset).join('\n');
  assert.match(errors, /missing required checks: Dependency review/);
  assert.match(errors, /unexpected blocking checks: Node 26 package gates/);
});

test('rejects a non-strict or weak branch ruleset', () => {
  const ruleset = validBranchRuleset();
  ruleset.rules.find(({ type }) => type === 'required_status_checks').parameters.strict_required_status_checks_policy = false;
  ruleset.rules.find(({ type }) => type === 'pull_request').parameters.required_approving_review_count = 1;
  const errors = auditBranchRuleset(ruleset).join('\n');
  assert.match(errors, /zero approving reviews/);
  assert.match(errors, /up to date before merging/);
});

test('rejects branch ruleset scope or bypass drift', () => {
  const ruleset = validBranchRuleset();
  ruleset.conditions.ref_name.include.push('refs/heads/release/*');
  ruleset.bypass_actors.push({ actor_id: 1, actor_type: 'RepositoryRole', bypass_mode: 'always' });
  const errors = auditBranchRuleset(ruleset).join('\n');
  assert.match(errors, /target only refs\/heads\/master/);
  assert.match(errors, /must not allow bypass actors/);
});

test('accepts only release App bypass for the exact RxJS 9 tag contract', () => {
  assert.deepEqual(auditTagRuleset(validTagRuleset(), '1234'), []);
});

test('rejects uninspectable or broadened tag protection', () => {
  const ruleset = validTagRuleset();
  ruleset.conditions.ref_name.include.push('refs/tags/10.*');
  ruleset.rules.push({ type: 'required_signatures' });
  delete ruleset.bypass_actors;
  const errors = auditTagRuleset(ruleset, '1234').join('\n');
  assert.match(errors, /target only refs\/tags\/9/);
  assert.match(errors, /contain exactly/);
  assert.match(errors, /cannot inspect bypass actors/);
});

test('rejects a tag bypass actor other than the release App', () => {
  const ruleset = validTagRuleset();
  ruleset.bypass_actors[0].actor_id = 5678;
  assert.match(auditTagRuleset(ruleset, '1234').join('\n'), /allow only the release App integration/);
});

test('accepts the protected npm-stage environment without reviewers', () => {
  assert.deepEqual(
    auditStageEnvironment({
      name: 'npm-stage',
      protection_rules: [{ type: 'branch_policy' }],
      deployment_branch_policy: { protected_branches: true, custom_branch_policies: false },
    }),
    []
  );
});

test('rejects npm-stage reviewers and unprotected branches', () => {
  const errors = auditStageEnvironment({
    name: 'npm-stage',
    protection_rules: [{ type: 'required_reviewers' }],
    deployment_branch_policy: { protected_branches: false, custom_branch_policies: true },
  }).join('\n');
  assert.match(errors, /must not require reviewers/);
  assert.match(errors, /only protected branches/);
});

test('accepts a release App installation limited to ReactiveX/rxjs', () => {
  assert.deepEqual(auditReleaseAppRepositories({ total_count: 1, repositories: [{ full_name: 'ReactiveX/rxjs' }] }), []);
  assert.match(
    auditReleaseAppRepositories({
      total_count: 2,
      repositories: [{ full_name: 'ReactiveX/rxjs' }, { full_name: 'ReactiveX/other' }],
    }).join('\n'),
    /only to ReactiveX\/rxjs/
  );
});

test('accepts the required runner on each privileged release job', () => {
  const workflow = `jobs:
  authorize:
    runs-on: ubuntu-24.04
  browser:
    runs-on: self-hosted
  stage:
    runs-on: ubuntu-24.04
`;

  assert.deepEqual(requireWorkflowJobRunners(workflow, 'release-stage.yml', privilegedRunners), []);
});

test('rejects a privileged job on another runner even when a different job uses the expected runner', () => {
  const workflow = `jobs:
  authorize:
    runs-on: self-hosted
  browser:
    runs-on: ubuntu-24.04
  stage:
    runs-on: ubuntu-24.04
`;

  assert.deepEqual(requireWorkflowJobRunners(workflow, 'release-stage.yml', privilegedRunners), [
    'release-stage.yml authorize job must run on ubuntu-24.04; found self-hosted.',
  ]);
});

test('does not accept a runner from a similarly named value outside the jobs mapping', () => {
  const workflow = `env:
  authorize:
    runs-on: ubuntu-24.04
jobs:
  authorize:
    runs-on: self-hosted
  stage:
    runs-on: ubuntu-24.04
`;

  assert.deepEqual(requireWorkflowJobRunners(workflow, 'release-stage.yml', privilegedRunners), [
    'release-stage.yml authorize job must run on ubuntu-24.04; found self-hosted.',
  ]);
});

test('rejects duplicate privileged job definitions', () => {
  const workflow = `jobs:
  authorize:
    runs-on: ubuntu-24.04
  authorize:
    runs-on: ubuntu-24.04
  stage:
    runs-on: ubuntu-24.04
`;

  assert.deepEqual(requireWorkflowJobRunners(workflow, 'release-stage.yml', privilegedRunners), [
    'release-stage.yml defines the authorize job more than once.',
  ]);
});

test('rejects a missing privileged job or runner', () => {
  const workflow = `jobs:
  authorize:
    name: Build
`;

  assert.deepEqual(requireWorkflowJobRunners(workflow, 'release-stage.yml', privilegedRunners), [
    'release-stage.yml authorize job must run on ubuntu-24.04; found no runner.',
    'release-stage.yml is missing the stage job.',
  ]);
});
