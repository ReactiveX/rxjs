export { defaultCapabilityRegistry, defaultTestSchedulerCapabilities } from './capabilities.js';
export { analyzeTestSource } from './analyze.js';
export { migrateMochaChaiToVitest, mochaChaiToVitestAdapter } from './mocha-chai-vitest.js';
export { normalizeSelectedCase } from './normalize.js';
export { diagnosticForNode, diagnosticForOffsets, parseDiagnostics, sortDiagnostics, sourceSpan } from './diagnostics.js';
export {
  capabilityMappingSchema,
  capabilityRegistrySchema,
  migrationContractManifestSchema,
  migrationDiagnosticSchema,
  assessMigrationContractReadiness,
  parseCapabilityRegistry,
  parseMigrationContractManifest,
  sourcePositionSchema,
  sourceSpanSchema,
} from './schemas.js';
export { migrateTestSchedulerSemantics } from './semantics.js';
export { capabilityRegistrySchemaVersion, capabilityRegistryVersion, migrationContractSchemaVersion, migrationEngineVersion } from './version.js';
export type {
  ApprovalRecord,
  ApprovalState,
  ArgumentAdapter,
  CapabilityEvidence,
  CapabilityArity,
  CapabilityMapping,
  CapabilityPrecondition,
  CapabilityRegistry,
  CapabilityStatus,
  CompatibilityClassification,
  ContractReadinessAssessment,
  ContractReadinessCode,
  ContractReadinessFinding,
  ContractReadinessState,
  DiagnosticDisposition,
  DiagnosticNextAction,
  DiagnosticNextActionCode,
  DiagnosticSeverity,
  FrameworkAdapter,
  IntentionalDivergence,
  MigrationBlocker,
  MigrationContractManifest,
  MigrationContractUnit,
  MigrationDiagnostic,
  MigrationDiagnosticCode,
  MigrationMode,
  MigrationResult,
  ProjectMigrationOptions,
  SemanticMigrationOptions,
  SourcePosition,
  SourceProvenance,
  SourceSpan,
  TargetLifecycle,
  VerificationResult,
  VerificationStatus,
  RefusalScope,
} from './types.js';
export type { TestSourceAnalysis } from './analyze.js';

import { migrateTestSchedulerSemantics } from './semantics.js';
import { diagnosticForOffsets, sortDiagnostics } from './diagnostics.js';
import ts from 'typescript';
import type { MigrationResult, ProjectMigrationOptions } from './types.js';

export function migrateTestSource(source: string, options: ProjectMigrationOptions = {}): MigrationResult {
  const { provenance, ...semanticOptions } = options;
  const semanticResult = migrateTestSchedulerSemantics(source, semanticOptions);
  if (isFileRefusal(semanticResult)) return semanticResult;
  const frameworkResult =
    options.frameworkAdapter ? options.frameworkAdapter.adapt(semanticResult.code, { fileName: options.fileName }) : undefined;
  const migratedCode = frameworkResult?.code ?? semanticResult.code;
  const provenanceResult = applyProvenance(migratedCode, provenance, options.fileName);
  const diagnostics = sortDiagnostics([
    ...semanticResult.diagnostics,
    ...(frameworkResult?.diagnostics ?? []),
    ...provenanceResult.diagnostics,
  ]);
  const refused = diagnostics.some(({ disposition }) => disposition === 'refused');
  const changed =
    semanticResult.status === 'changed' || frameworkResult?.status === 'changed' || provenanceResult.changed;
  return {
    status: refused ? 'refused' : changed ? 'changed' : 'unchanged',
    code: provenanceResult.code,
    diagnostics,
    imports: deduplicateImports([...semanticResult.imports, ...(frameworkResult?.imports ?? [])]),
  };
}

function applyProvenance(
  source: string,
  provenance: ProjectMigrationOptions['provenance'],
  fileName = 'migration-input.ts'
): { readonly code: string; readonly changed: boolean; readonly diagnostics: MigrationResult['diagnostics'] } {
  if (!provenance) return { code: source, changed: false, diagnostics: [] };
  const header = `// Migrated from ${provenance.repository} @ ${provenance.sha}\n// Source: ${provenance.path}\n`;
  if (source.startsWith(header)) return { code: source, changed: false, diagnostics: [] };
  if (source.startsWith('// Migrated from ') && source.split('\n', 2)[1]?.startsWith('// Source: ')) {
    const sourceFile = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    return {
      code: source,
      changed: false,
      diagnostics: [
        diagnosticForOffsets(sourceFile, 0, source.indexOf('\n', source.indexOf('\n') + 1) + 1, {
          code: 'conflicting-provenance',
          message: 'The file already contains different migration provenance.',
          severity: 'error',
          disposition: 'refused',
          refusalScope: 'file',
          classification: 'harness-rewrite',
          nextAction: { code: 'review-source', message: 'Verify the existing provenance before replacing it.' },
        }),
      ],
    };
  }
  return { code: `${header}${source}`, changed: true, diagnostics: [] };
}

function isFileRefusal(result: MigrationResult): boolean {
  return result.diagnostics.some(({ disposition, refusalScope }) => disposition === 'refused' && refusalScope === 'file');
}

function deduplicateImports(
  imports: readonly { readonly module: string; readonly imported: string }[]
): readonly { readonly module: string; readonly imported: string }[] {
  const unique = new Map<string, { readonly module: string; readonly imported: string }>();
  for (const entry of imports) unique.set(`${entry.module}\0${entry.imported}`, entry);
  return [...unique.values()].sort((left, right) => left.module.localeCompare(right.module) || left.imported.localeCompare(right.imported));
}
