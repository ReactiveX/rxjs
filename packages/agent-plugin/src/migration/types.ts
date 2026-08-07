export const migrationModes = ['cold', 'platform'] as const;
export type MigrationMode = (typeof migrationModes)[number];

export const compatibilityClassifications = [
  'portable',
  'harness-rewrite',
  'compatibility-only',
  'intentional-divergence',
  'unsupported-or-obsolete',
] as const;
export type CompatibilityClassification = (typeof compatibilityClassifications)[number];

export const argumentAdapters = [
  'identity',
  'first-argument',
  'buffer-count',
  'concat-map',
  'concat-all',
  'switch-all',
  'audit',
  'audit-time',
] as const;
export type ArgumentAdapter = (typeof argumentAdapters)[number];

export const capabilityStatuses = ['exact', 'unified', 'partial'] as const;
export type CapabilityStatus = (typeof capabilityStatuses)[number];

export const capabilityPreconditions = [
  'direct-pipe-call',
  'unshadowed-import-binding',
  'supported-arity',
  'no-result-selector',
  'no-scheduler-argument',
] as const;
export type CapabilityPrecondition = (typeof capabilityPreconditions)[number];

export interface CapabilityEvidence {
  readonly fixtureIds: readonly string[];
  readonly classifications: readonly CompatibilityClassification[];
}

export interface CapabilityArity {
  readonly minimum: number;
  readonly maximum: number | null;
}

export interface CapabilityMapping {
  readonly id: string;
  readonly legacyName: string;
  readonly symbolName: string;
  readonly module: string;
  readonly argumentAdapter: ArgumentAdapter;
  readonly status: CapabilityStatus;
  readonly arity: CapabilityArity;
  readonly preconditions: readonly CapabilityPrecondition[];
  readonly review?: string;
  readonly evidence: CapabilityEvidence;
}

export interface CapabilityRegistry {
  readonly schemaVersion: 1;
  readonly registryVersion: string;
  readonly engineVersion: string;
  readonly capabilities: readonly CapabilityMapping[];
}

export interface SourceProvenance {
  readonly repository: string;
  readonly sha: string;
  readonly path: string;
}

export interface SourcePosition {
  readonly offset: number;
  readonly line: number;
  readonly column: number;
}

export interface SourceSpan {
  readonly file: string;
  readonly start: SourcePosition;
  readonly end: SourcePosition;
}

export const diagnosticSeverities = ['info', 'warning', 'error'] as const;
export type DiagnosticSeverity = (typeof diagnosticSeverities)[number];

export const diagnosticDispositions = ['informational', 'requires-review', 'refused'] as const;
export type DiagnosticDisposition = (typeof diagnosticDispositions)[number];

export const refusalScopes = ['none', 'transform', 'file', 'batch', 'write'] as const;
export type RefusalScope = (typeof refusalScopes)[number];

export const diagnosticNextActions = [
  'review-source',
  'choose-lifecycle',
  'remove-unsupported-overload',
  'migrate-manually',
  'add-characterization-test',
  'fix-input',
  'update-engine',
  'move-path-inside-root',
  'use-compatible-registry',
] as const;
export type DiagnosticNextActionCode = (typeof diagnosticNextActions)[number];

export interface DiagnosticNextAction {
  readonly code: DiagnosticNextActionCode;
  readonly message: string;
}

export const migrationDiagnosticCodes = [
  'manual-test-scheduler',
  'scheduler-argument',
  'lifecycle-review',
  'missing-capability',
  'unsupported-overload',
  'unsupported-framework-feature',
  'malformed-source',
  'unsafe-binding',
  'path-outside-root',
  'invalid-contract-manifest',
  'conflicting-provenance',
  'invalid-capability-registry',
] as const;
export type MigrationDiagnosticCode = (typeof migrationDiagnosticCodes)[number];

export interface MigrationDiagnostic {
  readonly id: string;
  readonly code: MigrationDiagnosticCode;
  readonly message: string;
  readonly severity: DiagnosticSeverity;
  readonly disposition: DiagnosticDisposition;
  readonly refusalScope: RefusalScope;
  readonly classification: CompatibilityClassification;
  readonly span: SourceSpan;
  readonly nextAction: DiagnosticNextAction;
  readonly capabilityId?: string;
}

export interface SemanticMigrationOptions {
  readonly mode?: MigrationMode;
  readonly capabilityRegistry?: CapabilityRegistry;
  readonly provenance?: SourceProvenance;
  readonly fileName?: string;
}

export interface MigrationResult {
  readonly status: 'unchanged' | 'changed' | 'refused';
  readonly code: string;
  readonly diagnostics: readonly MigrationDiagnostic[];
  readonly imports: readonly { module: string; imported: string }[];
}

export interface FrameworkAdapter {
  readonly name: string;
  adapt(source: string, options?: { readonly fileName?: string }): MigrationResult;
}

export interface ProjectMigrationOptions extends SemanticMigrationOptions {
  readonly frameworkAdapter?: FrameworkAdapter;
}

export const targetLifecycles = [
  'platform-shared',
  'producer-per-direct-subscription',
  'subject-hot',
  'not-applicable',
  'unsupported',
  'unresolved',
] as const;
export type TargetLifecycle = (typeof targetLifecycles)[number];

export const approvalStates = ['approved', 'pending', 'not-required'] as const;
export type ApprovalState = (typeof approvalStates)[number];

export interface ApprovalRecord {
  readonly status: ApprovalState;
  readonly approvedBy?: string;
  readonly approvedAt?: string;
  readonly rationale?: string;
}

export const verificationStatuses = ['passed', 'failed', 'accepted-failure', 'not-run'] as const;
export type VerificationStatus = (typeof verificationStatuses)[number];

export interface VerificationResult {
  readonly id: string;
  readonly command: string;
  readonly environment: Readonly<Record<string, string>>;
  readonly status: VerificationStatus;
  readonly exitCode: number | null;
  readonly summary: string;
}

export interface MigrationContractUnit {
  readonly id: string;
  readonly sourceLocations: readonly SourceSpan[];
  readonly lifecycle: TargetLifecycle;
  readonly evidenceClassification: CompatibilityClassification;
  readonly claims: readonly string[];
  readonly approval: ApprovalRecord;
}

export interface IntentionalDivergence {
  readonly unitIds: readonly string[];
  readonly previousClaim: string;
  readonly nextClaim: string;
  readonly userImpact: string;
  readonly evidence: readonly string[];
  readonly approval: ApprovalRecord;
}

export interface MigrationBlocker {
  readonly owner: string;
  readonly reason: string;
  readonly unitIds: readonly string[];
  readonly evidence: readonly string[];
  readonly accepted: boolean;
}

export interface MigrationContractManifest {
  readonly schemaVersion: 1;
  readonly engineVersion: string;
  readonly capabilityRegistryVersion: string;
  readonly skillDigest: string;
  readonly sourceRxjsVersion: string;
  readonly targetRxjsVersion: string;
  readonly baseline: readonly VerificationResult[];
  readonly units: readonly MigrationContractUnit[];
  readonly diagnostics: readonly MigrationDiagnostic[];
  readonly intentionalDivergences: readonly IntentionalDivergence[];
  readonly verification: readonly VerificationResult[];
  readonly blockers: readonly MigrationBlocker[];
}

export const contractReadinessStates = ['ready', 'ready-with-accepted-blockers', 'incomplete'] as const;
export type ContractReadinessState = (typeof contractReadinessStates)[number];

export const contractReadinessCodes = [
  'engine-version-mismatch',
  'capability-registry-version-mismatch',
  'skill-digest-mismatch',
  'baseline-not-green',
  'verification-missing',
  'verification-not-green',
  'unit-unresolved',
  'unit-unsupported',
  'approval-pending',
  'diagnostic-unresolved',
  'divergence-unapproved',
  'blocker-unaccepted',
  'blocker-accepted',
] as const;
export type ContractReadinessCode = (typeof contractReadinessCodes)[number];

export interface ContractReadinessFinding {
  readonly code: ContractReadinessCode;
  readonly path: string;
  readonly message: string;
}

export interface ContractReadinessAssessment {
  readonly state: ContractReadinessState;
  readonly findings: readonly ContractReadinessFinding[];
}
