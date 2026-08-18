export { analyzeTestSource } from './analyze.js';
export { defaultCapabilityRegistry, defaultTestSchedulerCapabilities } from './capabilities.js';
export { migrateMochaChaiToVitest, mochaChaiToVitestAdapter } from './mocha-chai-vitest.js';
export { migrateTestSource } from './project.js';
export {
  assessMigrationContractReadiness,
  capabilityRegistrySchema,
  migrationContractManifestSchema,
  parseMigrationContractManifest,
} from './schemas.js';
export {
  capabilityRegistrySchemaVersion,
  capabilityRegistryVersion,
  migrationContractSchemaVersion,
  migrationEngineVersion,
} from './version.js';
export { defaultMigrationSurfaceCatalog, findMigrationSurface } from './surface-catalog.js';
export type {
  ArgumentAdapter,
  DiagnosticDisposition,
  DiagnosticNextActionCode,
  DiagnosticSeverity,
  MigrationContractManifest,
  MigrationDiagnosticCode,
  MigrationMode,
  ProjectMigrationOptions,
  RefusalScope,
  SourceProvenance,
} from './types.js';
export type {
  MigrationAutomationLevel,
  MigrationSurface,
  MigrationSurfaceCatalog,
  MigrationSurfaceDisposition,
  MigrationSurfaceGuidance,
} from './surface-catalog.js';
