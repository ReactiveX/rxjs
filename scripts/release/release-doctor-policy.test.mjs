import assert from 'node:assert/strict';
import test from 'node:test';
import { requireWorkflowJobRunners } from './release-doctor-policy.mjs';

const privilegedRunners = { build: 'ubuntu-latest', stage: 'ubuntu-latest' };

test('accepts the required runner on each privileged release job', () => {
  const workflow = `jobs:
  build:
    runs-on: ubuntu-latest
  browser:
    runs-on: self-hosted
  stage:
    runs-on: ubuntu-latest
`;

  assert.deepEqual(requireWorkflowJobRunners(workflow, 'release-stage.yml', privilegedRunners), []);
});

test('rejects a privileged job on another runner even when a different job uses ubuntu-latest', () => {
  const workflow = `jobs:
  build:
    runs-on: self-hosted
  browser:
    runs-on: ubuntu-latest
  stage:
    runs-on: ubuntu-latest
`;

  assert.deepEqual(requireWorkflowJobRunners(workflow, 'release-stage.yml', privilegedRunners), [
    'release-stage.yml build job must run on ubuntu-latest; found self-hosted.',
  ]);
});

test('rejects a missing privileged job or runner', () => {
  const workflow = `jobs:
  build:
    name: Build
`;

  assert.deepEqual(requireWorkflowJobRunners(workflow, 'release-stage.yml', privilegedRunners), [
    'release-stage.yml build job must run on ubuntu-latest; found no runner.',
    'release-stage.yml is missing the stage job.',
  ]);
});
