import { releaseAdvisoryChecks, releaseRequiredMasterChecks, releaseRequiredPullRequestChecks } from './release-config.mjs';

export function parseConfiguredChecks(value) {
  let checks;
  try {
    checks = JSON.parse(value ?? '');
  } catch {
    throw new Error('RELEASE_REQUIRED_CHECKS must be a JSON array of exact check names.');
  }
  if (!Array.isArray(checks) || checks.some((check) => typeof check !== 'string' || check.trim() !== check || check.length === 0)) {
    throw new Error('RELEASE_REQUIRED_CHECKS must be a JSON array of non-empty, trimmed check names.');
  }
  return checks;
}

export function auditConfiguredMasterChecks(value) {
  const errors = [];
  let checks;
  try {
    checks = parseConfiguredChecks(value);
  } catch (error) {
    return [error.message];
  }
  if (checks.length === 0) return ['RELEASE_REQUIRED_CHECKS must list the protected master checks.'];
  if (new Set(checks).size !== checks.length) errors.push('RELEASE_REQUIRED_CHECKS contains duplicate check names.');

  const configured = new Set(checks);
  const missing = releaseRequiredMasterChecks.filter((check) => !configured.has(check));
  const unexpected = checks.filter((check) => !releaseRequiredMasterChecks.includes(check));
  if (missing.length > 0) errors.push(`RELEASE_REQUIRED_CHECKS is missing master checks: ${missing.join(', ')}.`);
  if (unexpected.length > 0) errors.push(`RELEASE_REQUIRED_CHECKS contains non-master checks: ${unexpected.join(', ')}.`);

  const pullRequestOnly = releaseRequiredPullRequestChecks.filter((check) => configured.has(check));
  if (pullRequestOnly.length > 0) {
    errors.push(`Pull-request-only checks belong in branch protection, not the master wait list: ${pullRequestOnly.join(', ')}.`);
  }
  const advisory = releaseAdvisoryChecks.filter((check) => configured.has(check));
  if (advisory.length > 0) errors.push(`Advisory checks must not block release generation: ${advisory.join(', ')}.`);
  return errors;
}

export function auditBranchRuleset(ruleset) {
  const errors = [];
  if (ruleset.target !== 'branch' || ruleset.enforcement !== 'active') {
    errors.push('The release branch ruleset must be an active branch ruleset.');
  }
  if (JSON.stringify(ruleset.conditions?.ref_name) !== JSON.stringify({ include: ['refs/heads/master'], exclude: [] })) {
    errors.push('The release branch ruleset must target only refs/heads/master.');
  }
  if ((ruleset.bypass_actors ?? []).length !== 0) {
    errors.push('The release branch ruleset must not allow bypass actors.');
  }

  const rules = new Map((ruleset.rules ?? []).map((rule) => [rule.type, rule]));
  for (const requiredRule of ['deletion', 'non_fast_forward', 'pull_request', 'required_status_checks', 'required_signatures']) {
    if (!rules.has(requiredRule)) errors.push(`The release branch ruleset is missing the ${requiredRule} rule.`);
  }

  const pullRequest = rules.get('pull_request')?.parameters ?? {};
  if (pullRequest.required_approving_review_count !== 0) {
    errors.push('The release branch ruleset must require zero approving reviews.');
  }
  if (JSON.stringify(pullRequest.allowed_merge_methods) !== JSON.stringify(['squash'])) {
    errors.push('The release branch ruleset must allow only squash merges.');
  }

  const statusParameters = rules.get('required_status_checks')?.parameters ?? {};
  if (statusParameters.strict_required_status_checks_policy !== true) {
    errors.push('The release branch ruleset must require branches to be up to date before merging.');
  }
  const configuredChecks = (statusParameters.required_status_checks ?? []).map(({ context }) => context);
  if (new Set(configuredChecks).size !== configuredChecks.length) {
    errors.push('The release branch ruleset contains duplicate required check names.');
  }
  const expectedChecks = [...releaseRequiredMasterChecks, ...releaseRequiredPullRequestChecks];
  const configured = new Set(configuredChecks);
  const missing = expectedChecks.filter((check) => !configured.has(check));
  const unexpected = configuredChecks.filter((check) => !expectedChecks.includes(check));
  if (missing.length > 0) errors.push(`The release branch ruleset is missing required checks: ${missing.join(', ')}.`);
  if (unexpected.length > 0) errors.push(`The release branch ruleset contains unexpected blocking checks: ${unexpected.join(', ')}.`);
  return errors;
}

export function auditTagRuleset(ruleset, releaseAppId) {
  const errors = [];
  if (ruleset.target !== 'tag' || ruleset.enforcement !== 'active') {
    errors.push('The release tag ruleset must be an active tag ruleset.');
  }
  if (JSON.stringify(ruleset.conditions?.ref_name) !== JSON.stringify({ include: ['refs/tags/9.*'], exclude: [] })) {
    errors.push('The release tag ruleset must target only refs/tags/9.*.');
  }

  const configuredRules = (ruleset.rules ?? []).map(({ type }) => type).sort();
  const requiredRules = ['creation', 'deletion', 'non_fast_forward', 'update'];
  if (JSON.stringify(configuredRules) !== JSON.stringify(requiredRules)) {
    errors.push(`The release tag ruleset must contain exactly: ${requiredRules.join(', ')}.`);
  }

  const expectedBypass = [{ actor_id: Number(releaseAppId), actor_type: 'Integration', bypass_mode: 'always' }];
  if (!Array.isArray(ruleset.bypass_actors)) {
    errors.push('The release tag ruleset audit token cannot inspect bypass actors.');
  } else if (JSON.stringify(ruleset.bypass_actors) !== JSON.stringify(expectedBypass)) {
    errors.push('The release tag ruleset must allow only the release App integration to create protected tags.');
  }
  return errors;
}

export function auditStageEnvironment(environment) {
  const errors = [];
  if (environment.name !== 'npm-stage') errors.push('The protected release environment must be named npm-stage.');
  const protectionTypes = (environment.protection_rules ?? []).map(({ type }) => type);
  if (protectionTypes.some((type) => type !== 'branch_policy')) {
    errors.push('The npm-stage environment must not require reviewers, wait timers, or custom protection gates.');
  }
  if (
    JSON.stringify(environment.deployment_branch_policy) !== JSON.stringify({ protected_branches: true, custom_branch_policies: false })
  ) {
    errors.push('The npm-stage environment must allow only protected branches.');
  }
  return errors;
}

export function auditReleaseAppRepositories(payload) {
  const repositories = (payload.repositories ?? []).map(({ full_name }) => full_name);
  if (payload.total_count !== 1 || repositories.length !== 1 || repositories[0] !== 'ReactiveX/rxjs') {
    return ['The release App installation must have access only to ReactiveX/rxjs.'];
  }
  return [];
}

export function requireWorkflowJobRunners(source, workflowName, expectedRunners) {
  const lines = source.split(/\r?\n/);
  const errors = [];
  const jobsStart = lines.findIndex((line) => /^jobs:\s*(?:#.*)?$/.test(line));
  const jobsEnd =
    jobsStart === -1 ? -1 : lines.findIndex((line, index) => index > jobsStart && /^(?!#)[A-Za-z_][A-Za-z0-9_-]*:\s*/.test(line));
  const scopedEnd = jobsEnd === -1 ? lines.length : jobsEnd;

  for (const [jobName, expectedRunner] of Object.entries(expectedRunners)) {
    const jobPattern = new RegExp(`^ {2}${escapeRegExp(jobName)}:\\s*(?:#.*)?$`);
    const jobStarts = [];
    for (let index = jobsStart + 1; jobsStart !== -1 && index < scopedEnd; index += 1) {
      if (jobPattern.test(lines[index])) jobStarts.push(index);
    }
    if (jobStarts.length === 0) {
      errors.push(`${workflowName} is missing the ${jobName} job.`);
      continue;
    }
    if (jobStarts.length > 1) {
      errors.push(`${workflowName} defines the ${jobName} job more than once.`);
      continue;
    }

    const [jobStart] = jobStarts;
    let actualRunner;
    for (let index = jobStart + 1; index < scopedEnd; index += 1) {
      const line = lines[index];
      if (/^ {2}(?!#)\S/.test(line)) break;
      const runner = /^ {4}runs-on:\s*([^#]+?)(?:\s+#.*)?$/.exec(line)?.[1]?.trim();
      if (runner) {
        actualRunner = runner;
        break;
      }
    }

    if (actualRunner !== expectedRunner) {
      errors.push(`${workflowName} ${jobName} job must run on ${expectedRunner}; found ${actualRunner ?? 'no runner'}.`);
    }
  }

  return errors;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
