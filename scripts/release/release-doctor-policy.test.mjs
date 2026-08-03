import assert from 'node:assert/strict';
import test from 'node:test';
import { requireWorkflowJobRunners } from './release-doctor-policy.mjs';

const privilegedRunners = { authorize: 'ubuntu-24.04', stage: 'ubuntu-24.04' };

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
