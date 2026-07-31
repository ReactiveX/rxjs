export { defaultTestSchedulerCapabilities } from './capabilities.js';
export { analyzeTestSource } from './analyze.js';
export { migrateMochaChaiToVitest, mochaChaiToVitestAdapter } from './mocha-chai-vitest.js';
export { normalizeSelectedCase } from './normalize.js';
export { migrateTestSchedulerSemantics } from './semantics.js';
export type {
  ArgumentAdapter,
  CapabilityMapping,
  CompatibilityClassification,
  FrameworkAdapter,
  MigrationDiagnostic,
  MigrationMode,
  MigrationResult,
  ProjectMigrationOptions,
  SemanticMigrationOptions,
  SourceProvenance,
} from './types.js';
export type { TestSourceAnalysis } from './analyze.js';

import { migrateTestSchedulerSemantics } from './semantics.js';
import type { MigrationResult, ProjectMigrationOptions } from './types.js';

export function migrateTestSource(source: string, options: ProjectMigrationOptions = {}): MigrationResult {
  const { provenance, ...semanticOptions } = options;
  const semanticResult = migrateTestSchedulerSemantics(source, semanticOptions);
  const frameworkResult = options.frameworkAdapter?.adapt(semanticResult.code);
  const migratedCode = frameworkResult?.code ?? semanticResult.code;
  const code = provenance
    ? `// Migrated from ${provenance.repository} @ ${provenance.sha}\n// Source: ${provenance.path}\n${migratedCode}`
    : migratedCode;
  return {
    code,
    changed: semanticResult.changed || !!frameworkResult?.changed || !!provenance,
    diagnostics: [...semanticResult.diagnostics, ...(frameworkResult?.diagnostics ?? [])],
    imports: [...semanticResult.imports, ...(frameworkResult?.imports ?? [])],
  };
}
