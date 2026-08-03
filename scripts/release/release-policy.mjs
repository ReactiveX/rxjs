import { firstReleaseVersion } from './release-config.mjs';

const conventionalTitle =
  /^(?<type>feat|fix|perf|revert|docs|chore|refactor|test|build|ci|style)(?:\([^)\r\n]+\))?(?<breaking>!)?: (?<description>\S.*)$/;

export function parseVersion(version) {
  const match = /^(?<major>0|[1-9]\d*)\.(?<minor>0|[1-9]\d*)\.(?<patch>0|[1-9]\d*)(?:-beta\.(?<beta>0|[1-9]\d*))?$/.exec(version);
  if (!match?.groups) throw new Error(`Unsupported RxJS 9 version: ${version}`);
  return {
    major: Number(match.groups.major),
    minor: Number(match.groups.minor),
    patch: Number(match.groups.patch),
    beta: match.groups.beta === undefined ? null : Number(match.groups.beta),
  };
}

export function classifyConventionalCommit(subject, body = '') {
  const match = conventionalTitle.exec(subject);
  if (!match?.groups) return { level: 'invalid', subject, reason: 'title is not a supported Conventional Commit' };
  const breaking = match.groups.breaking === '!' || hasPopulatedBreakingFooter(body);
  const level = breaking
    ? 'breaking'
    : match.groups.type === 'feat'
    ? 'feature'
    : ['fix', 'perf', 'revert'].includes(match.groups.type)
    ? 'fix'
    : 'none';
  return { description: match.groups.description, level, subject, type: match.groups.type };
}

function hasPopulatedBreakingFooter(body) {
  const footerPattern = /(?:^|\n)(?:\*\*)?BREAKING CHANGES?:(?:\*\*)?[^\S\r\n]*([^\r\n]*(?:\r?\n[ \t]+[^\r\n]*)*)/gi;
  for (const match of body.matchAll(footerPattern)) {
    if (hasTextOutsideHtmlComments(match[1])) return true;
  }
  return false;
}

function hasTextOutsideHtmlComments(value) {
  let index = 0;
  while (index < value.length) {
    if (value.startsWith('<!--', index)) {
      const commentEnd = value.indexOf('-->', index + 4);
      if (commentEnd === -1) return false;
      index = commentEnd + 3;
    } else if (/\S/.test(value[index])) {
      return true;
    } else {
      index += 1;
    }
  }
  return false;
}

export function selectRelease({ currentTag, manifestVersion = firstReleaseVersion, commits, mode = 'auto' }) {
  const classified = commits.map((commit) => ({ ...commit, classification: classifyConventionalCommit(commit.subject, commit.body) }));
  const invalid = classified.filter(({ classification }) => classification.level === 'invalid');
  if (invalid.length > 0) {
    return { status: 'blocked', reason: `Invalid Conventional Commit title: ${invalid[0].subject}`, commits: classified };
  }

  const releasable = classified.filter(({ classification }) => classification.level !== 'none');
  if (mode === 'promote-stable') {
    const current = parseVersion(currentTag ?? manifestVersion);
    if (current.beta === null) return { status: 'blocked', reason: 'Stable promotion is available only from a beta.', commits: classified };
    return releaseResult(`${current.major}.${current.minor}.${current.patch}`, 'latest', 'explicit stable promotion', classified);
  }
  if (mode !== 'auto') return { status: 'blocked', reason: `Unknown release mode: ${mode}`, commits: classified };
  if (releasable.length === 0) return { status: 'none', reason: 'No release-relevant commits accumulated.', commits: classified };

  if (!currentTag) {
    return releaseResult(manifestVersion, 'next', 'first RxJS 9 beta', classified);
  }

  const current = parseVersion(currentTag);
  if (current.major !== 9)
    return { status: 'blocked', reason: `The latest release tag is not an RxJS 9 version: ${currentTag}`, commits: classified };
  if (current.beta !== null) {
    return releaseResult(
      `${current.major}.${current.minor}.${current.patch}-beta.${current.beta + 1}`,
      'next',
      'beta counter increment',
      classified
    );
  }

  const levels = new Set(releasable.map(({ classification }) => classification.level));
  if (levels.has('breaking')) {
    return {
      status: 'blocked',
      reason: 'A breaking change after stable RxJS 9 requires 10.0.0; the 9.x release train is blocked.',
      commits: classified,
    };
  }
  if (levels.has('feature')) {
    return releaseResult(`${current.major}.${current.minor + 1}.0`, 'latest', 'highest accumulated change is a feature', classified);
  }
  return releaseResult(
    `${current.major}.${current.minor}.${current.patch + 1}`,
    'latest',
    'highest accumulated change is a fix',
    classified
  );
}

function releaseResult(version, channel, reason, commits) {
  return { channel, commits, reason, status: 'planned', version };
}

export function validatePullRequestTitle(title) {
  const classification = classifyConventionalCommit(title);
  if (classification.level === 'invalid') throw new Error(classification.reason);
  return classification;
}
