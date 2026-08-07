import ts from 'typescript';
import { defaultCapabilityRegistry } from './capabilities.js';
import { findMigrationSurface, type MigrationSurfaceGuidance } from './surface-catalog.js';
import type { CapabilityRegistry, MigrationMode } from './types.js';

export interface ImportedMigrationSurface {
  readonly importPath: string;
  readonly importedName: string;
  readonly localName: string;
  readonly surfaceId: string | null;
  readonly kind: string | null;
  readonly migration: MigrationSurfaceGuidance | null;
}

export interface ImportMigrationFinding {
  readonly code: 'deep-import' | 'default-import' | 'namespace-import' | 'unknown-public-surface';
  readonly importPath: string;
  readonly importedName: string | null;
  readonly localName: string | null;
  readonly message: string;
}

export interface SubscriberTopologyAnalysis {
  readonly classification: 'not-observed-in-file' | 'single-subscriber-candidate' | 'multiple-subscriber-review';
  readonly directSubscribeCalls: number;
  readonly receivers: readonly string[];
  readonly requiresRepositoryProof: true;
}

export interface TestSourceAnalysis {
  readonly mode: MigrationMode;
  readonly testSchedulerVariables: readonly string[];
  readonly helpers: readonly string[];
  readonly importedOperators: readonly string[];
  readonly importedSurfaces: readonly ImportedMigrationSurface[];
  readonly importFindings: readonly ImportMigrationFinding[];
  readonly missingCapabilities: readonly string[];
  readonly reviewFlags: readonly string[];
  readonly subscriberTopology: SubscriberTopologyAnalysis;
  readonly sharingIndicators: readonly string[];
  readonly lifecycleRecommendation: {
    readonly target: 'producer-per-direct-subscription' | 'platform-shared';
    readonly constructor: 'ColdObservable' | 'Observable';
    readonly explicitMode: boolean;
    readonly platformCandidateReasons: readonly string[];
    readonly rationale: readonly string[];
  };
}

export function analyzeTestSource(
  source: string,
  options: { readonly mode?: MigrationMode; readonly capabilityRegistry?: CapabilityRegistry } = {}
): TestSourceAnalysis {
  const sourceFile = ts.createSourceFile('analysis-input.ts', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const available = new Set((options.capabilityRegistry ?? defaultCapabilityRegistry).capabilities.map(({ legacyName }) => legacyName));
  const testSchedulerVariables: string[] = [];
  const importedOperators: string[] = [];
  const importedSurfaces: ImportedMigrationSurface[] = [];
  const importFindings: ImportMigrationFinding[] = [];
  const importedNamesByLocal = new Map<string, string>();
  const publicEntrypoints = new Set(['rxjs', 'rxjs/operators', 'rxjs/ajax', 'rxjs/fetch', 'rxjs/webSocket', 'rxjs/testing']);

  for (const statement of sourceFile.statements) {
    if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (
          ts.isIdentifier(declaration.name) &&
          (declaration.type?.getText().includes('TestScheduler') || declaration.initializer?.getText().includes('new TestScheduler'))
        ) {
          testSchedulerVariables.push(declaration.name.text);
        }
      }
    }
    if (ts.isImportDeclaration(statement) && ts.isStringLiteral(statement.moduleSpecifier)) {
      const importPath = statement.moduleSpecifier.text;
      if (importPath !== 'rxjs' && !importPath.startsWith('rxjs/')) continue;
      const isPublicEntrypoint = publicEntrypoints.has(importPath);
      const importClause = statement.importClause;
      if (!isPublicEntrypoint) {
        importFindings.push({
          code: 'deep-import',
          importPath,
          importedName: null,
          localName: null,
          message: `${importPath} is not a supported RxJS 7 public entrypoint; replace the deep import through cataloged public APIs.`,
        });
      }
      if (importClause?.name) {
        importFindings.push({
          code: 'default-import',
          importPath,
          importedName: 'default',
          localName: importClause.name.text,
          message: `Default imports from ${importPath} have no public RxJS 7-to-9 surface mapping.`,
        });
      }
      const bindings = importClause?.namedBindings;
      if (bindings && ts.isNamespaceImport(bindings)) {
        importFindings.push({
          code: 'namespace-import',
          importPath,
          importedName: '*',
          localName: bindings.name.text,
          message: `Inventory each member used through the ${bindings.name.text} namespace before migration.`,
        });
      } else if (bindings && ts.isNamedImports(bindings) && isPublicEntrypoint) {
        for (const element of bindings.elements) {
          const importedName = element.propertyName?.text ?? element.name.text;
          const surface = findMigrationSurface(importPath, importedName);
          importedNamesByLocal.set(element.name.text, importedName);
          importedSurfaces.push({
            importPath,
            importedName,
            localName: element.name.text,
            surfaceId: surface?.id ?? null,
            kind: surface?.kind ?? null,
            migration: surface?.migration ?? null,
          });
          if (surface?.kind === 'operator') importedOperators.push(importedName);
          if (!surface) {
            importFindings.push({
              code: 'unknown-public-surface',
              importPath,
              importedName,
              localName: element.name.text,
              message: `${importedName} is not present in the pinned RxJS 7.8.2 ${importPath} declaration catalog.`,
            });
          }
        }
      }
    }
  }

  const helpers = ['cold', 'hot', 'time', 'expectObservable', 'expectSubscriptions', 'animate', 'flush'].filter((helper) =>
    new RegExp(`\\b${helper}\\s*\\(`).test(source)
  );
  const reviewFlags: string[] = [];
  if (/\bflush\s*\(/.test(source)) reviewFlags.push('await-flush');
  if (/\b(frameTimeFactor|maxFrames)\b|\.frame\b/.test(source)) reviewFlags.push('scheduler-internals');
  if (/\b(asyncScheduler|asapScheduler|animationFrameScheduler|queueScheduler)\b/.test(source)) reviewFlags.push('scheduler-argument');
  if ((source.match(/\bexpectObservable\s*\(/g) ?? []).length > 1) reviewFlags.push('multiple-observers');
  if (/\bsubscribe\s*\(/.test(source)) reviewFlags.push('direct-subscription');
  for (const finding of importFindings) if (!reviewFlags.includes(finding.code)) reviewFlags.push(finding.code);

  const directSubscriptionReceivers: string[] = [];
  const calledImports = new Set<string>();
  const visit = (node: ts.Node): void => {
    if (ts.isCallExpression(node)) {
      if (ts.isPropertyAccessExpression(node.expression) && node.expression.name.text === 'subscribe') {
        directSubscriptionReceivers.push(node.expression.expression.getText(sourceFile));
      }
      if (ts.isIdentifier(node.expression)) {
        const imported = importedNamesByLocal.get(node.expression.text);
        if (imported) calledImports.add(imported);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);

  const sharingNames = new Set([
    'share',
    'shareReplay',
    'multicast',
    'publish',
    'publishBehavior',
    'publishLast',
    'publishReplay',
    'refCount',
    'connect',
    'connectable',
  ]);
  const sharingIndicators = [...calledImports].filter((name) => sharingNames.has(name)).sort();
  const subscriberTopology: SubscriberTopologyAnalysis = {
    classification:
      directSubscriptionReceivers.length === 0
        ? 'not-observed-in-file'
        : directSubscriptionReceivers.length === 1
          ? 'single-subscriber-candidate'
          : 'multiple-subscriber-review',
    directSubscribeCalls: directSubscriptionReceivers.length,
    receivers: directSubscriptionReceivers,
    requiresRepositoryProof: true,
  };
  const platformCandidateReasons: string[] = [];
  if (sharingIndicators.length > 0) {
    platformCandidateReasons.push(
      `RxJS 7 sharing is explicit (${sharingIndicators.join(', ')}); compare its connector, replay, reset, and ref-count behavior with the platform lifecycle.`
    );
  }
  if (directSubscriptionReceivers.length === 1) {
    platformCandidateReasons.push(
      'This file contains one direct subscriber; prove repository-wide that no concurrent framework, template, helper, retry, or exported consumer exists.'
    );
  }
  const mode = options.mode ?? 'cold';

  return {
    mode,
    testSchedulerVariables,
    helpers,
    importedOperators,
    importedSurfaces,
    importFindings,
    missingCapabilities: importedOperators.filter((name) => !available.has(name)),
    reviewFlags,
    subscriberTopology,
    sharingIndicators,
    lifecycleRecommendation: {
      target: mode === 'platform' ? 'platform-shared' : 'producer-per-direct-subscription',
      constructor: mode === 'platform' ? 'Observable' : 'ColdObservable',
      explicitMode: options.mode !== undefined,
      platformCandidateReasons,
      rationale:
        mode === 'platform'
          ? [
              'Platform mode was explicitly selected; verify the recorded sharing or single-subscriber proof before applying output.',
              'Use platform string methods only where the catalog records a semantic match.',
            ]
          : [
              'ColdObservable is the conservative default because an ordinary RxJS 7 Observable creates producer work per direct subscription.',
              'Exact Symbol operators preserve ColdObservable construction; native string methods would cross to the platform lifecycle.',
            ],
    },
  };
}
