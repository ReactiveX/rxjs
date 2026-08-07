import generatedCatalog from '../../dist/migration-surface-catalog.json' with { type: 'json' };

export const migrationSurfaceDispositions = ['guided', 'manual-review', 'replace', 'unsupported'] as const;
export type MigrationSurfaceDisposition = (typeof migrationSurfaceDispositions)[number];

export const migrationAutomationLevels = ['fixture-proved', 'manual'] as const;
export type MigrationAutomationLevel = (typeof migrationAutomationLevels)[number];

export interface MigrationSurfaceGuidance {
  readonly disposition: MigrationSurfaceDisposition;
  readonly automation: MigrationAutomationLevel;
  readonly mechanicalCapabilityId: string | null;
  readonly target: string;
  readonly coldTarget: string;
  readonly platformTarget: string;
  readonly status: string;
  readonly note: string;
  readonly lifecycle: string;
  readonly platformMethod: string | null;
}

export interface MigrationSurface {
  readonly id: string;
  readonly name: string;
  readonly kind: string;
  readonly declarationKind: string;
  readonly importPaths: readonly string[];
  readonly sourceDeclaration: string;
  readonly migration: MigrationSurfaceGuidance;
}

export interface MigrationSurfaceCatalog {
  readonly schemaVersion: 1;
  readonly catalogVersion: string;
  readonly source: {
    readonly package: 'rxjs';
    readonly version: '7.8.2';
    readonly revision: string;
    readonly entrypoints: readonly string[];
  };
  readonly target: { readonly package: 'rxjs'; readonly version: '9.0.0-beta.1' };
  readonly lifecyclePolicy: {
    readonly defaultTarget: 'producer-per-direct-subscription';
    readonly defaultConstructor: 'ColdObservable';
    readonly rationale: string;
    readonly platformPromotionRequires: readonly string[];
    readonly platformMethodPolicy: string;
  };
  readonly counts: {
    readonly total: number;
    readonly operators: number;
    readonly functions: number;
    readonly nonOperatorFunctions: number;
    readonly types: number;
    readonly values: number;
    readonly mechanicallyProved: number;
  };
  readonly surfaces: readonly MigrationSurface[];
  readonly crossCutting: Readonly<Record<string, readonly unknown[]>>;
}

export const defaultMigrationSurfaceCatalog = deepFreeze(
  generatedCatalog as unknown as MigrationSurfaceCatalog
);

const surfacesByImportAndName = new Map<string, MigrationSurface>();
for (const surface of defaultMigrationSurfaceCatalog.surfaces) {
  for (const importPath of surface.importPaths) surfacesByImportAndName.set(`${importPath}\0${surface.name}`, surface);
}

export function findMigrationSurface(importPath: string, name: string): MigrationSurface | undefined {
  return surfacesByImportAndName.get(`${importPath}\0${name}`);
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}
