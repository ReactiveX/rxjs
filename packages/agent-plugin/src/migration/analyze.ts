import ts from 'typescript';
import { defaultCapabilityRegistry } from './capabilities.js';
import type { CapabilityRegistry, MigrationMode } from './types.js';

export interface TestSourceAnalysis {
  readonly mode: MigrationMode | 'unselected';
  readonly testSchedulerVariables: readonly string[];
  readonly helpers: readonly string[];
  readonly importedOperators: readonly string[];
  readonly missingCapabilities: readonly string[];
  readonly reviewFlags: readonly string[];
}

export function analyzeTestSource(
  source: string,
  options: { readonly mode?: MigrationMode; readonly capabilityRegistry?: CapabilityRegistry } = {}
): TestSourceAnalysis {
  const sourceFile = ts.createSourceFile('analysis-input.ts', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const available = new Set((options.capabilityRegistry ?? defaultCapabilityRegistry).capabilities.map(({ legacyName }) => legacyName));
  const testSchedulerVariables: string[] = [];
  const importedOperators: string[] = [];

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
    if (
      ts.isImportDeclaration(statement) &&
      ts.isStringLiteral(statement.moduleSpecifier) &&
      ['rxjs/operators', 'rxjs'].includes(statement.moduleSpecifier.text)
    ) {
      const bindings = statement.importClause?.namedBindings;
      if (bindings && ts.isNamedImports(bindings)) {
        for (const element of bindings.elements) importedOperators.push(element.propertyName?.text ?? element.name.text);
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

  return {
    mode: options.mode ?? 'unselected',
    testSchedulerVariables,
    helpers,
    importedOperators,
    missingCapabilities: importedOperators.filter((name) => !available.has(name)),
    reviewFlags,
  };
}
