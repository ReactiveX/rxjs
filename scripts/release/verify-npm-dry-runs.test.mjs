import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import { releasePackages } from './release-config.mjs';
import { buildNpmDryRunCommands } from './verify-npm-dry-runs.mjs';

test('builds only explicit dry-run commands over the exact candidate tarballs', () => {
  const candidateRoot = '/candidate';
  const manifest = {
    version: '9.0.0-beta.0',
    channel: 'next',
    packages: releasePackages.map(({ name }, index) => ({ name, filename: `package-${index}.tgz` })),
  };
  const commands = buildNpmDryRunCommands(manifest, candidateRoot);

  assert.equal(commands.length, releasePackages.length * 4);
  assert.deepEqual(
    commands.map(({ packageName }) => packageName),
    releasePackages.flatMap(({ name }) => [name, name, name, name])
  );
  for (const [index, command] of commands.entries()) {
    assert.ok(command.args.includes('--dry-run'));
    const packageIndex = Math.floor(index / 4);
    if (command.operation === 'trust github') {
      assert.ok(command.args.includes(releasePackages[packageIndex].name));
      assert.ok(command.args.includes('--allow-stage-publish'));
      assert.ok(!command.args.includes('--allow-publish'));
      assert.deepEqual(command.args.slice(3, 10), [
        '--file',
        'release-stage.yml',
        '--repository',
        'ReactiveX/rxjs',
        '--environment',
        'npm-stage',
        '--allow-stage-publish',
      ]);
    } else {
      assert.ok(command.args.includes(path.join(candidateRoot, `package-${packageIndex}.tgz`)));
      if (command.operation !== 'pack') assert.deepEqual(command.args.slice(-2), ['--tag', 'next']);
    }
  }
  assert.deepEqual(
    commands.slice(0, 4).map(({ operation }) => operation),
    ['pack', 'publish', 'stage publish', 'trust github']
  );
});
