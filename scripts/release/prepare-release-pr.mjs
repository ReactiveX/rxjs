#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertNpmWebUrl, firstReleaseVersion, releasePackages, stagedPackagesVariable, versionedFiles } from './release-config.mjs';
import { selectRelease } from './release-policy.mjs';

const root = fileURLToPath(new URL('../..', import.meta.url));
const args = parseArgs(process.argv.slice(2));
const mode = args.mode ?? 'auto';
const output = path.resolve(args.output ?? path.join(root, '.release-pr.md'));
const resultOutput = path.resolve(args.result ?? path.join(root, '.release-plan-result.json'));
const manifestVersion = JSON.parse(await readFile(path.join(root, 'packages/rxjs/package.json'), 'utf8')).version;
const currentTag = latestRxjs9Tag();
const range = currentTag ? `${currentTag}..HEAD` : 'D-054 approved beta.0 snapshot';
const commits = currentTag
  ? readCommits(range)
  : [{ body: '', sha: git(['rev-parse', 'HEAD']), subject: 'feat(release): begin the RxJS 9 public beta' }];
const headSubject = git(['log', '-1', '--format=%s']);
const plan =
  headSubject === `chore(release): ${manifestVersion}`
    ? { status: 'none', reason: 'The merged release commit is already being qualified.', commits: [] }
    : selectRelease({ currentTag, manifestVersion, commits, mode });

await writeFile(resultOutput, `${JSON.stringify({ ...plan, currentTag, range }, null, 2)}\n`);
if (plan.status !== 'planned') {
  process.stdout.write(`${plan.status}: ${plan.reason}\n`);
} else {
  await applyVersion(plan.version);
  await updateChangelog(plan);
  const stagedPackagesUrl = assertNpmWebUrl(process.env[stagedPackagesVariable] ?? '', stagedPackagesVariable);
  const affectedPackages = affectedReleasePackages(range);
  await writeFile(output, renderPullRequestBody({ ...plan, affectedPackages, currentTag, range, stagedPackagesUrl }));
  process.stdout.write(`${plan.version} on ${plan.channel}: ${plan.reason}\n`);
}

function parseArgs(values) {
  const parsed = {};
  for (let index = 0; index < values.length; index += 2) {
    const key = values[index]?.replace(/^--/, '');
    if (!key || values[index + 1] === undefined) throw new Error(`Invalid argument list: ${values.join(' ')}`);
    parsed[key] = values[index + 1];
  }
  return parsed;
}

function git(args, { allowFailure = false } = {}) {
  const result = spawnSync('git', args, { cwd: root, encoding: 'utf8' });
  if (result.status !== 0 && !allowFailure) throw new Error(`git ${args.join(' ')} failed:\n${result.stderr}`);
  return result.stdout.trim();
}

function latestRxjs9Tag() {
  return (
    git(['tag', '--list', '9.*', '--sort=-version:refname'], { allowFailure: true })
      .split('\n')
      .find((tag) => /^9\.\d+\.\d+(?:-beta\.\d+)?$/.test(tag)) ?? null
  );
}

function readCommits(range) {
  const log = git(['log', '--format=%H%x1f%s%x1f%b%x1e', range]);
  return log
    .split('\x1e')
    .map((record) => record.trim())
    .filter(Boolean)
    .map((record) => {
      const [sha, subject, body = ''] = record.split('\x1f');
      return { body: body.trim(), sha, subject };
    });
}

function affectedReleasePackages(range) {
  if (!currentTag) return releasePackages.map(({ name }) => name);
  const changed = git(['diff', '--name-only', range]).split('\n').filter(Boolean);
  return releasePackages.filter(({ directory }) => changed.some((file) => file.startsWith(`${directory}/`))).map(({ name }) => name);
}

async function applyVersion(version) {
  const manifests = Object.fromEntries(
    await Promise.all(
      releasePackages.map(async ({ directory, name }) => [
        name,
        JSON.parse(await readFile(path.join(root, directory, 'package.json'), 'utf8')),
      ])
    )
  );
  for (const { directory, name } of releasePackages) {
    const manifest = manifests[name];
    manifest.version = version;
    for (const field of ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']) {
      for (const dependency of releasePackages) {
        if (manifest[field]?.[dependency.name] !== undefined) manifest[field][dependency.name] = version;
      }
    }
    await writeFile(path.join(root, directory, 'package.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  }

  for (const relativePath of versionedFiles) {
    const absolutePath = path.join(root, relativePath);
    const source = await readFile(absolutePath, 'utf8');
    const replaced = source.replaceAll(firstReleaseVersion, version).replace(/9\.\d+\.\d+(?:-beta\.\d+)?/g, version);
    if (source === replaced && !source.includes(version)) throw new Error(`Could not update the release identity in ${relativePath}.`);
    await writeFile(absolutePath, replaced);
  }

  const provenancePath = path.join(root, '.agents/skills/rxjs-next-migration/.rxjs-migrate-skill.json');
  const provenance = JSON.parse(await readFile(provenancePath, 'utf8'));
  provenance.packageVersion = version;
  await writeFile(provenancePath, `${JSON.stringify(provenance, null, 2)}\n`);
}

async function updateChangelog(plan) {
  const changelogPath = path.join(root, 'CHANGELOG.md');
  const previous = await readFile(changelogPath, 'utf8').catch(() => '# Changelog\n\n');
  const withoutSameVersion = previous.replace(new RegExp(`## ${escapeRegExp(plan.version)}[\\s\\S]*?(?=\\n## |$)`), '').trimEnd();
  const sections = [
    ['Breaking changes', 'breaking'],
    ['Features', 'feature'],
    ['Fixes', 'fix'],
  ]
    .map(([heading, level]) => {
      const entries = plan.commits.filter(({ classification }) => classification.level === level);
      if (entries.length === 0) return '';
      return `### ${heading}\n\n${entries
        .map(({ classification, sha }) => `- ${classification.description} (${sha.slice(0, 7)})`)
        .join('\n')}\n`;
    })
    .filter(Boolean)
    .join('\n');
  await writeFile(
    changelogPath,
    `# Changelog\n\n## ${plan.version}\n\n${sections}\n${withoutSameVersion.replace(/^# Changelog\s*/, '')}`.trimEnd() + '\n'
  );
}

function renderPullRequestBody(plan) {
  const packages = releasePackages.map(({ name }) => `- \`${name}@${plan.version}\``).join('\n');
  const affected =
    plan.affectedPackages.length > 0 ? plan.affectedPackages.map((name) => `\`${name}\``).join(', ') : 'release metadata only';
  const categorized = [
    ['Breaking changes', 'breaking'],
    ['Features', 'feature'],
    ['Fixes', 'fix'],
  ]
    .map(([heading, level]) => {
      const entries = plan.commits.filter(({ classification }) => classification.level === level);
      return entries.length ? `### ${heading}\n\n${entries.map(({ classification }) => `- ${classification.description}`).join('\n')}` : '';
    })
    .filter(Boolean)
    .join('\n\n');
  return (
    `# RxJS ${plan.version} release\n\n` +
    `> [!CAUTION]\n> npm publication is irreversible for RxJS. Merging this PR authorizes qualification and npm staging; publication still requires TFA approval in npm.\n\n` +
    `## Proposed release\n\n- Version: \`${plan.version}\`\n- npm channel: \`${plan.channel}\`\n- Selection reason: ${plan.reason}\n- Commit range: \`${plan.range}\`\n- Affected packages: ${affected}\n\n` +
    `## Synchronized package train\n\n${packages}\n\n## Changelog\n\n${categorized}\n\n` +
    `## Approval\n\n[**Open npm Staged Packages**](${plan.stagedPackagesUrl})\n\n` +
    `After this PR is merged, GitHub will build and pack once, attest and qualify those exact tarballs, create the protected tag, and stage the same files. Approve \`@rxjs/observable-polyfill\`, \`@rxjs/test\`, and \`@rxjs/migrate\` before approving \`rxjs\` last.\n`
  );
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
