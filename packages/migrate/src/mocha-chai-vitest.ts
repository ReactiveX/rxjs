import ts from 'typescript';
import { diagnosticForNode, diagnosticForOffsets, parseDiagnostics, sortDiagnostics } from './diagnostics.js';
import type { FrameworkAdapter, MigrationDiagnostic, MigrationResult } from './types.js';

const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
const vitestGlobals = new Set(['describe', 'it', 'test', 'beforeEach', 'afterEach', 'beforeAll', 'afterAll', 'expect']);

export const mochaChaiToVitestAdapter: FrameworkAdapter = {
  name: 'mocha-chai-to-vitest',
  adapt: migrateMochaChaiToVitest,
};

export function migrateMochaChaiToVitest(source: string, options: { readonly fileName?: string } = {}): MigrationResult {
  const sourceFile = ts.createSourceFile(options.fileName ?? 'framework-input.ts', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const syntaxDiagnostics = parseDiagnostics(sourceFile);
  if (syntaxDiagnostics.length > 0) return { status: 'refused', code: source, diagnostics: syntaxDiagnostics, imports: [] };
  const frameworkImports = collectFrameworkImports(sourceFile);
  if (!frameworkImports.hasSourceFramework) return { status: 'unchanged', code: source, diagnostics: [], imports: [] };

  const required = collectUsedVitestGlobals(sourceFile);
  const diagnostics: MigrationDiagnostic[] = [];
  const unsupported = findUnsupportedChaiAssertions(sourceFile, frameworkImports.expectLocal);
  const unsupportedProperties = findUnsupportedChaiProperties(sourceFile, frameworkImports.expectLocal);
  const unsupportedSinon = findUnsupportedSinonReferences(sourceFile, frameworkImports.sinonLocal);
  for (const node of [...unsupported, ...unsupportedProperties, ...unsupportedSinon]) {
    diagnostics.push(
      diagnosticForNode(sourceFile, node, {
        code: 'unsupported-framework-feature',
        message: `Review unsupported framework syntax: ${node.getText(sourceFile)}`,
        severity: 'error',
        disposition: 'refused',
        refusalScope: 'file',
        classification: 'harness-rewrite',
        nextAction: { code: 'migrate-manually', message: 'Convert the assertion explicitly before retrying the framework adapter.' },
      })
    );
  }
  if (frameworkImports.expectLocal && hasShadowingDeclaration(sourceFile, frameworkImports.expectLocal)) {
    const start = source.indexOf(frameworkImports.expectLocal);
    diagnostics.push(
      diagnosticForOffsets(sourceFile, Math.max(0, start), Math.max(0, start) + frameworkImports.expectLocal.length, {
        code: 'unsafe-binding',
        message: `The imported Chai binding ${frameworkImports.expectLocal} is shadowed in this file.`,
        severity: 'error',
        disposition: 'refused',
        refusalScope: 'file',
        classification: 'harness-rewrite',
        nextAction: { code: 'review-source', message: 'Rename the shadowing binding or migrate the framework syntax manually.' },
      })
    );
  }
  if (diagnostics.length > 0) return { status: 'refused', code: source, diagnostics: sortDiagnostics(diagnostics), imports: [] };

  let changed = false;

  const transformed = ts.transform(sourceFile, [
    (context) => {
      const { factory } = context;
      const visit: ts.Visitor = (node) => {
        if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
          if (node.moduleSpecifier.text === 'chai') {
            const retained = retainUnsupportedChaiImports(node);
            changed = true;
            return retained;
          }
          if (['mocha', 'sinon', 'sinon-chai'].includes(node.moduleSpecifier.text)) {
            changed = true;
            return undefined;
          }
          if (node.moduleSpecifier.text === 'vitest') {
            const bindings = node.importClause?.namedBindings;
            if (bindings && ts.isNamedImports(bindings)) {
              for (const element of bindings.elements) required.add(element.name.text);
            }
            changed = true;
            return undefined;
          }
        }

        if (ts.isCallExpression(node)) {
          const callsFake = convertSinonCallsFake(node, factory, visit, frameworkImports.sinonLocal);
          if (callsFake) {
            required.add('vi');
            changed = true;
            return callsFake;
          }
          const sinon = convertSinon(node, factory, visit, frameworkImports.sinonLocal);
          if (sinon) {
            required.add('vi');
            changed = true;
            return sinon;
          }

          const assertion = convertChaiAssertion(node, factory, visit, frameworkImports.expectLocal);
          if (assertion) {
            required.add('expect');
            changed = true;
            return assertion;
          }
        }

        if (ts.isPropertyAccessExpression(node)) {
          const spyAssertion = convertChaiSpyProperty(node, factory, visit, frameworkImports.expectLocal);
          if (spyAssertion) {
            required.add('expect');
            changed = true;
            return spyAssertion;
          }
        }

        return ts.visitEachChild(node, visit, context);
      };

      return (root) => {
        const visited = ts.visitNode(root, visit) as ts.SourceFile;
        const importDeclaration = required.size > 0 ? factory.createImportDeclaration(
          undefined,
          factory.createImportClause(
            false,
            undefined,
            factory.createNamedImports(
              [...required].sort().map((name) => factory.createImportSpecifier(false, undefined, factory.createIdentifier(name)))
            )
          ),
          factory.createStringLiteral('vitest')
        ) : undefined;
        return importDeclaration ? factory.updateSourceFile(visited, [importDeclaration, ...visited.statements]) : visited;
      };
    },
  ]);

  const transformedFile = transformed.transformed[0];
  if (!transformedFile) throw new Error('TypeScript did not return a transformed source file.');
  const code = printer.printFile(transformedFile);
  transformed.dispose();

  return {
    status: changed || code !== source ? 'changed' : 'unchanged',
    code,
    diagnostics,
    imports: [...required].sort().map((imported) => ({ module: 'vitest', imported })),
  };
}

function retainUnsupportedChaiImports(node: ts.ImportDeclaration): ts.ImportDeclaration | undefined {
  const clause = node.importClause;
  const bindings = clause?.namedBindings;
  if (!clause || !bindings || !ts.isNamedImports(bindings)) return node;
  const retained = bindings.elements.filter((element) => (element.propertyName?.text ?? element.name.text) !== 'expect');
  if (retained.length === 0 && !clause.name) return undefined;
  return ts.factory.updateImportDeclaration(
    node,
    node.modifiers,
    ts.factory.updateImportClause(clause, clause.isTypeOnly, clause.name, ts.factory.updateNamedImports(bindings, retained)),
    node.moduleSpecifier,
    node.attributes
  );
}

function collectUsedVitestGlobals(sourceFile: ts.SourceFile): Set<string> {
  const result = new Set<string>();
  const visit = (node: ts.Node): void => {
    if (ts.isIdentifier(node) && vitestGlobals.has(node.text)) result.add(node.text);
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return result;
}

function convertSinon(
  node: ts.CallExpression,
  factory: ts.NodeFactory,
  visit: ts.Visitor,
  sinonLocal: string | undefined
): ts.Expression | undefined {
  if (!sinonLocal) return undefined;
  if (!ts.isPropertyAccessExpression(node.expression) || !ts.isIdentifier(node.expression.expression)) return undefined;
  if (node.expression.expression.text !== sinonLocal) return undefined;
  const method = node.expression.name.text;
  const args = node.arguments.map((argument) => ts.visitNode(argument, visit) as ts.Expression);
  if (method === 'spy' && args.length >= 2)
    return factory.createCallExpression(factory.createPropertyAccessExpression(factory.createIdentifier('vi'), 'spyOn'), undefined, args);
  if (method === 'stub' && args.length >= 2)
    return factory.createCallExpression(factory.createPropertyAccessExpression(factory.createIdentifier('vi'), 'spyOn'), undefined, args);
  if (method === 'spy' || method === 'stub')
    return factory.createCallExpression(factory.createPropertyAccessExpression(factory.createIdentifier('vi'), 'fn'), undefined, args);
  return undefined;
}

function convertSinonCallsFake(
  node: ts.CallExpression,
  factory: ts.NodeFactory,
  visit: ts.Visitor,
  sinonLocal: string | undefined
): ts.Expression | undefined {
  if (!sinonLocal) return undefined;
  if (!ts.isPropertyAccessExpression(node.expression) || node.expression.name.text !== 'callsFake') return undefined;
  const receiver = node.expression.expression;
  if (!ts.isCallExpression(receiver) || !ts.isPropertyAccessExpression(receiver.expression)) return undefined;
  if (!ts.isIdentifier(receiver.expression.expression) || receiver.expression.expression.text !== sinonLocal) return undefined;
  if (!['stub', 'spy'].includes(receiver.expression.name.text) || receiver.arguments.length !== 0) return undefined;
  return factory.createCallExpression(
    factory.createPropertyAccessExpression(factory.createIdentifier('vi'), 'fn'),
    undefined,
    node.arguments.map((argument) => ts.visitNode(argument, visit) as ts.Expression)
  );
}

function convertChaiAssertion(
  node: ts.CallExpression,
  factory: ts.NodeFactory,
  visit: ts.Visitor,
  expectLocal: string | undefined
): ts.Expression | undefined {
  if (!ts.isPropertyAccessExpression(node.expression)) return undefined;
  const matcher = node.expression.name.text;
  const chain = unwrapExpectChain(node.expression.expression, expectLocal);
  if (!chain) return undefined;
  const matcherMap: Readonly<Record<string, string>> = {
    equal: chain.deep ? 'toEqual' : 'toBe',
    equals: chain.deep ? 'toEqual' : 'toBe',
    eq: chain.deep ? 'toEqual' : 'toBe',
    eql: 'toEqual',
    instanceof: 'toBeInstanceOf',
    instanceOf: 'toBeInstanceOf',
    match: 'toMatch',
    throw: 'toThrow',
    throws: 'toThrow',
    a: 'toBeTypeOf',
    an: 'toBeTypeOf',
    callCount: 'toHaveBeenCalledTimes',
    calledWithExactly: 'toHaveBeenCalledWith',
    property: 'toHaveProperty',
  };
  const targetMatcher = matcherMap[matcher];
  if (!targetMatcher) return undefined;
  const expectCall = factory.createCallExpression(factory.createIdentifier('expect'), undefined, [ts.visitNode(chain.actual, visit) as ts.Expression]);
  const expectation = chain.negated ? factory.createPropertyAccessExpression(expectCall, 'not') : expectCall;
  return factory.createCallExpression(
    factory.createPropertyAccessExpression(expectation, targetMatcher),
    node.typeArguments,
    node.arguments.map((argument) => ts.visitNode(argument, visit) as ts.Expression)
  );
}

function convertChaiSpyProperty(
  node: ts.PropertyAccessExpression,
  factory: ts.NodeFactory,
  visit: ts.Visitor,
  expectLocal: string | undefined
): ts.Expression | undefined {
  const matcher = node.name.text;
  const matcherMap: Readonly<Record<string, string>> = {
    called: 'toHaveBeenCalled',
    calledOnce: 'toHaveBeenCalledOnce',
    calledTwice: 'toHaveBeenCalledTimes',
    true: 'toBe',
    false: 'toBe',
    empty: 'toHaveLength',
  };
  const target = matcherMap[matcher];
  if (!target) return undefined;
  const chain = unwrapExpectChain(node.expression, expectLocal);
  if (!chain) return undefined;
  const expectCall = factory.createCallExpression(factory.createIdentifier('expect'), undefined, [ts.visitNode(chain.actual, visit) as ts.Expression]);
  const expectation = chain.negated ? factory.createPropertyAccessExpression(expectCall, 'not') : expectCall;
  const args =
    matcher === 'calledTwice'
      ? [factory.createNumericLiteral(2)]
      : matcher === 'true'
        ? [factory.createTrue()]
      : matcher === 'false'
          ? [factory.createFalse()]
          : matcher === 'empty'
            ? [factory.createNumericLiteral(0)]
          : [];
  return factory.createCallExpression(factory.createPropertyAccessExpression(expectation, target), undefined, args);
}

function unwrapExpectChain(
  node: ts.Expression,
  expectLocal: string | undefined
): { actual: ts.Expression; deep: boolean; negated: boolean } | undefined {
  if (!expectLocal) return undefined;
  let current = node;
  let deep = false;
  let negated = false;
  while (ts.isPropertyAccessExpression(current)) {
    deep ||= current.name.text === 'deep';
    negated ||= current.name.text === 'not';
    current = current.expression;
  }
  if (!ts.isCallExpression(current) || !ts.isIdentifier(current.expression) || current.expression.text !== expectLocal) return undefined;
  const actual = current.arguments[0];
  return actual ? { actual, deep, negated } : undefined;
}

function findUnsupportedChaiAssertions(sourceFile: ts.SourceFile, expectLocal: string | undefined): readonly ts.CallExpression[] {
  if (!expectLocal) return [];
  const supported = new Set([
    'equal',
    'equals',
    'eq',
    'eql',
    'instanceof',
    'instanceOf',
    'match',
    'throw',
    'throws',
    'a',
    'an',
    'callCount',
    'calledWithExactly',
    'property',
  ]);
  const result: ts.CallExpression[] = [];
  const visit = (node: ts.Node): void => {
    if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)) {
      const chain = unwrapExpectChain(node.expression.expression, expectLocal);
      if (chain && !supported.has(node.expression.name.text)) result.push(node);
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return result;
}

function findUnsupportedChaiProperties(
  sourceFile: ts.SourceFile,
  expectLocal: string | undefined
): readonly ts.PropertyAccessExpression[] {
  if (!expectLocal) return [];
  const supported = new Set(['called', 'calledOnce', 'calledTwice', 'true', 'false', 'empty']);
  const result: ts.PropertyAccessExpression[] = [];
  const visit = (node: ts.Node): void => {
    if (ts.isPropertyAccessExpression(node) && unwrapExpectChain(node.expression, expectLocal)) {
      const parentContinuesChain =
        (ts.isPropertyAccessExpression(node.parent) && node.parent.expression === node) ||
        (ts.isCallExpression(node.parent) && node.parent.expression === node);
      if (!parentContinuesChain && !supported.has(node.name.text)) result.push(node);
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return result;
}

function findUnsupportedSinonReferences(sourceFile: ts.SourceFile, sinonLocal: string | undefined): readonly ts.Identifier[] {
  if (!sinonLocal) return [];
  const result: ts.Identifier[] = [];
  const visit = (node: ts.Node): void => {
    if (ts.isIdentifier(node) && node.text === sinonLocal && !isSinonImportIdentifier(node) && !isSupportedSinonReference(node)) {
      result.push(node);
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return result;
}

function isSinonImportIdentifier(node: ts.Identifier): boolean {
  return ts.isImportClause(node.parent) && node.parent.name === node;
}

function isSupportedSinonReference(node: ts.Identifier): boolean {
  const access = node.parent;
  if (!ts.isPropertyAccessExpression(access) || access.expression !== node || !['spy', 'stub'].includes(access.name.text)) return false;
  const call = access.parent;
  if (!ts.isCallExpression(call) || call.expression !== access) return false;
  const callsFake = call.parent;
  if (!ts.isPropertyAccessExpression(callsFake) || callsFake.expression !== call) return true;
  return callsFake.name.text === 'callsFake' && ts.isCallExpression(callsFake.parent) && callsFake.parent.expression === callsFake;
}

function collectFrameworkImports(sourceFile: ts.SourceFile): {
  readonly hasSourceFramework: boolean;
  readonly expectLocal?: string;
  readonly sinonLocal?: string;
} {
  let hasSourceFramework = false;
  let expectLocal: string | undefined;
  let sinonLocal: string | undefined;
  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) continue;
    if (!['chai', 'mocha', 'sinon', 'sinon-chai'].includes(statement.moduleSpecifier.text)) continue;
    hasSourceFramework = true;
    if (statement.moduleSpecifier.text === 'sinon') {
      sinonLocal = statement.importClause?.name?.text;
      continue;
    }
    if (statement.moduleSpecifier.text !== 'chai') continue;
    const bindings = statement.importClause?.namedBindings;
    if (!bindings || !ts.isNamedImports(bindings)) continue;
    for (const element of bindings.elements) {
      if ((element.propertyName?.text ?? element.name.text) === 'expect') expectLocal = element.name.text;
    }
  }
  return { hasSourceFramework, expectLocal, sinonLocal };
}

function hasShadowingDeclaration(sourceFile: ts.SourceFile, name: string): boolean {
  let declarations = 0;
  const visit = (node: ts.Node): void => {
    if (
      (ts.isParameter(node) ||
        ts.isVariableDeclaration(node) ||
        ts.isFunctionDeclaration(node) ||
        ts.isClassDeclaration(node) ||
        ts.isBindingElement(node)) &&
      node.name &&
      ts.isIdentifier(node.name) &&
      node.name.text === name
    ) {
      declarations++;
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return declarations > 0;
}
