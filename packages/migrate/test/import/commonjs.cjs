const assert = require('node:assert/strict');

const migrate = require('@rxjs/migrate');
const frameworkAdapter = require('@rxjs/migrate/adapters/mocha-chai-vitest');
const cli = require('@rxjs/migrate/cli');
const nodeAdapter = require('@rxjs/migrate/node');
const skill = require('@rxjs/migrate/skill');
const skillCli = require('@rxjs/migrate/skill-cli');
const packageJson = require('@rxjs/migrate/package.json');

assert.equal(packageJson.name, '@rxjs/migrate');
assert.equal(typeof migrate.migrateTestSource, 'function');
assert.equal(typeof migrate.parseCapabilityRegistry, 'function');
assert.equal(typeof frameworkAdapter.migrateMochaChaiToVitest, 'function');
assert.equal(typeof nodeAdapter.planMigrationFiles, 'function');
assert.equal(typeof cli.runCli, 'function');
assert.equal(typeof skill.inspectSkillIntegrity, 'function');
assert.equal(typeof skill.synchronizeSkillInstallation, 'function');
assert.equal(typeof skillCli.runSkillCli, 'function');
