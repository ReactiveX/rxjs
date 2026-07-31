export type MigrationMode = 'cold' | 'platform';

export type CompatibilityClassification =
  | 'portable'
  | 'harness-rewrite'
  | 'compatibility-only'
  | 'intentional-divergence'
  | 'unsupported-or-obsolete';

export type ArgumentAdapter =
  | 'identity'
  | 'first-argument'
  | 'buffer-count'
  | 'concat-map'
  | 'concat-all'
  | 'switch-all'
  | 'audit'
  | 'audit-time';

export interface CapabilityMapping {
  readonly legacyName: string;
  readonly symbolName: string;
  readonly module: string;
  readonly argumentAdapter: ArgumentAdapter;
  readonly status: 'exact' | 'unified' | 'partial';
  readonly review?: string;
}

export interface SourceProvenance {
  readonly repository: string;
  readonly sha: string;
  readonly path: string;
}

export interface MigrationDiagnostic {
  readonly code:
    | 'manual-test-scheduler'
    | 'scheduler-argument'
    | 'lifecycle-review'
    | 'missing-capability'
    | 'unsupported-framework-feature';
  readonly message: string;
  readonly line?: number;
  readonly classification: CompatibilityClassification;
}

export interface SemanticMigrationOptions {
  readonly mode?: MigrationMode;
  readonly capabilities?: readonly CapabilityMapping[];
  readonly provenance?: SourceProvenance;
}

export interface MigrationResult {
  readonly code: string;
  readonly changed: boolean;
  readonly diagnostics: readonly MigrationDiagnostic[];
  readonly imports: readonly { module: string; imported: string }[];
}

export interface FrameworkAdapter {
  readonly name: string;
  adapt(source: string): MigrationResult;
}

export interface ProjectMigrationOptions extends SemanticMigrationOptions {
  readonly frameworkAdapter?: FrameworkAdapter;
}
