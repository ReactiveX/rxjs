#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { releasePackages } from './release-config.mjs';
import { verifyCandidate } from './release-candidate.mjs';

const root = fileURLToPath(new URL('../..', import.meta.url));
const args = parseArgs(process.argv.slice(2));
if (!args['acknowledge-irreversible-bootstrap']) {
  throw new Error('Refusing bootstrap without --acknowledge-irreversible-bootstrap. Read docs/RELEASE_PROCESS.md first.');
}
if (process.env.NPM_TOKEN || process.env.NODE_AUTH_TOKEN) {
  throw new Error('Bootstrap refuses long-lived npm token environment variables. Use the release maintainer account and interactive TFA.');
}

const candidateRoot = path.resolve(root, args.candidate ?? '.release/bootstrap-candidate');
if (args['run-id']) {
  run('gh', ['run', 'download', args['run-id'], '--name', `rxjs-release-candidate-${args['run-id']}`, '--dir', candidateRoot], root);
}
const manifest = await verifyCandidate(candidateRoot);
for (const entry of manifest.packages) {
  run(
    'gh',
    ['attestation', 'verify', path.join(candidateRoot, entry.filename), '--repo', process.env.GITHUB_REPOSITORY ?? 'ReactiveX/rxjs'],
    root
  );
}

process.stdout.write(
  `Verified ${manifest.version}. Interactive npm publication will now run in dependency order; rxjs is last. Every command must receive TFA.\n`
);
for (const expected of releasePackages) {
  const entry = manifest.packages.find(({ name }) => name === expected.name);
  run('npm', ['publish', path.join(candidateRoot, entry.filename), '--tag', manifest.channel], root, { inherit: true });
}

function parseArgs(values) {
  const parsed = {};
  for (let index = 0; index < values.length; index++) {
    const value = values[index];
    if (value === '--acknowledge-irreversible-bootstrap') parsed['acknowledge-irreversible-bootstrap'] = true;
    else if (value === '--candidate' || value === '--run-id') parsed[value.slice(2)] = values[++index];
    else throw new Error(`Unknown bootstrap argument: ${value}`);
  }
  return parsed;
}

function run(command, commandArgs, cwd, { inherit = false } = {}) {
  const result = spawnSync(command, commandArgs, { cwd, encoding: inherit ? undefined : 'utf8', stdio: inherit ? 'inherit' : 'pipe' });
  if (result.status !== 0) {
    throw new Error(`${command} ${commandArgs.join(' ')} failed (${result.status}).${inherit ? '' : `\n${result.stdout}${result.stderr}`}`);
  }
  return result;
}
