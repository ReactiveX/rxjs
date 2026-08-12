import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

import * as migrate from '@rxjs/migrate';
import * as frameworkAdapter from '@rxjs/migrate/adapters/mocha-chai-vitest';
import * as cli from '@rxjs/migrate/cli';
import * as nodeAdapter from '@rxjs/migrate/node';
import * as skill from '@rxjs/migrate/skill';
import * as skillCli from '@rxjs/migrate/skill-cli';

const packageJson = createRequire(import.meta.url)('@rxjs/migrate/package.json');

assert.equal(packageJson.name, '@rxjs/migrate');
assert.equal(typeof migrate.migrateTestSource, 'function');
assert.equal(typeof migrate.parseCapabilityRegistry, 'function');
assert.equal(typeof frameworkAdapter.migrateMochaChaiToVitest, 'function');
assert.equal(typeof nodeAdapter.planMigrationFiles, 'function');
assert.equal(typeof cli.runCli, 'function');
assert.equal(typeof skill.inspectSkillIntegrity, 'function');
assert.equal(typeof skill.synchronizeSkillInstallation, 'function');
assert.equal(typeof skillCli.runSkillCli, 'function');
