export type PortMode = 'cold' | 'polyfill' | 'native';

export type CompatibilityClassification =
  | 'portable'
  | 'harness-rewrite'
  | 'compatibility-only'
  | 'intentional-divergence'
  | 'unsupported-or-obsolete';

export type PortDisposition = 'active' | 'expected-failure' | 'missing-api' | 'deduplicated' | 'unsupported-or-obsolete';

export interface PortedImport {
  readonly module: string;
  readonly imported: string;
  readonly local: string;
  readonly usage: 'operator' | 'value';
}

export interface PortedMarbleCase {
  readonly id: string;
  readonly source: {
    readonly ref: string;
    readonly commit: string;
    readonly path: string;
    readonly line: number;
    readonly suite: readonly string[];
    readonly title: string;
  };
  readonly behavioralClaim: string;
  readonly classification: CompatibilityClassification;
  readonly disposition: PortDisposition;
  readonly modes: readonly PortMode[];
  readonly reason: string;
  readonly duplicateOf: string | null;
  readonly imports: readonly PortedImport[];
  readonly helpers: readonly string[];
  readonly reviewFlags: readonly string[];
  readonly migratedProgram: string | null;
  readonly originalSource: string;
}

export interface PortManifest {
  readonly schemaVersion: 1;
  readonly generatedAt: string;
  readonly sourceRef: string;
  readonly sourceCommit: string;
  readonly totals: {
    readonly cases: number;
    readonly active: number;
    readonly expectedFailure: number;
    readonly missingApi: number;
    readonly deduplicated: number;
    readonly unsupportedOrObsolete: number;
  };
  readonly cases: readonly PortedMarbleCase[];
}
