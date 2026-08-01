import {
  defaultCapabilityRegistry,
  migrateTestSource,
  parseCapabilityRegistry,
  parseMigrationContractManifest,
  type CapabilityRegistry,
  type MigrationContractManifest,
  type MigrationResult,
} from '@rxjs/migrate';
import { migrateMochaChaiToVitest, mochaChaiToVitestAdapter } from '@rxjs/migrate/adapters/mocha-chai-vitest';
import { runCli } from '@rxjs/migrate/cli';
import { localSpecOutputName, migrateTestFiles, planMigrationFiles, type MigrateFilesOptions } from '@rxjs/migrate/node';
import { inspectSkillIntegrity, synchronizeSkillInstallation, type SkillIntegrity } from '@rxjs/migrate/skill';
import { runSkillCli } from '@rxjs/migrate/skill-cli';

const registry: CapabilityRegistry = parseCapabilityRegistry(defaultCapabilityRegistry);
const result: MigrationResult = migrateTestSource('const value = 1;');
const frameworkResult: MigrationResult = migrateMochaChaiToVitest("import { expect } from 'chai';");

const options: MigrateFilesOptions = {
  files: ['source.spec.ts'],
  sourceRoot: '.',
  sourceRepository: 'https://example.test/repository.git',
  sourceSha: '0123456789abcdef',
  frameworkAdapter: mochaChaiToVitestAdapter,
};

void registry;
void result;
void frameworkResult;
void planMigrationFiles(options);
void migrateTestFiles(options);
void localSpecOutputName({ sourcePath: 'source.spec.ts', sourceRoot: '.', mode: 'unselected' });
void runCli(['--help']);
void inspectSkillIntegrity('skill').then((integrity: SkillIntegrity) => integrity.digest);
void synchronizeSkillInstallation({
  operation: 'check',
  projectRoot: '.',
  canonicalSkillRoot: 'skill',
  harness: 'codex',
});
void runSkillCli(['check', '--harness', 'cursor']);

declare const manifestInput: unknown;
const manifest: MigrationContractManifest = parseMigrationContractManifest(manifestInput);
void manifest;
