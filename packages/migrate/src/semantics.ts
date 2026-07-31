import ts from 'typescript';
import { defaultTestSchedulerCapabilities } from './capabilities.js';
import type { ArgumentAdapter, CapabilityMapping, MigrationDiagnostic, MigrationResult, SemanticMigrationOptions } from './types.js';

const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

export function migrateTestSchedulerSemantics(source: string, options: SemanticMigrationOptions = {}): MigrationResult {
  const sourceFile = ts.createSourceFile('migration-input.ts', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const capabilities = new Map((options.capabilities ?? defaultTestSchedulerCapabilities).map((entry) => [entry.legacyName, entry]));
  const operatorLocals = collectOperatorLocals(sourceFile, capabilities);
  const schedulerIdentifiers = collectTestSchedulerIdentifiers(sourceFile);
  const diagnostics: MigrationDiagnostic[] = [];
  const requiredImports = new Map<string, Set<string>>();
  let changed = false;
  let usesRxTest = false;
  let insideRxTestCallback = false;

  const transformed = ts.transform(sourceFile, [
    (context) => {
      const { factory } = context;

      const visit: ts.Visitor = (node) => {
        if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
          const moduleName = node.moduleSpecifier.text;
          if (moduleName === 'rxjs/testing') {
            changed = true;
            return undefined;
          }
          if (moduleName === 'rxjs/operators' || moduleName === 'rxjs') {
            const retained = retainUnknownOperatorImports(node, operatorLocals);
            changed ||= retained !== node;
            return retained;
          }
        }

        if (isTestSchedulerDeclaration(node)) {
          changed = true;
          return undefined;
        }

        if (isTestSchedulerSetup(node)) {
          if (hasOnlyTestSchedulerSetup(node)) {
            changed = true;
            return undefined;
          }
          diagnostics.push({
            code: 'manual-test-scheduler',
            message: 'A TestScheduler setup hook has additional responsibilities and was preserved for manual review.',
            classification: 'harness-rewrite',
          });
        }

        if (ts.isCallExpression(node) && isRunCall(node, schedulerIdentifiers)) {
          usesRxTest = true;
          changed = true;
          insideRxTestCallback = true;
          const callback = node.arguments[0]
            ? (ts.visitNode(node.arguments[0], visit) as ts.Expression)
            : factory.createArrowFunction(
                undefined,
                undefined,
                [],
                undefined,
                factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                factory.createBlock([], true)
              );
          insideRxTestCallback = false;
          return factory.createAwaitExpression(factory.createCallExpression(factory.createIdentifier('rxTest'), undefined, [callback]));
        }

        if (insideRxTestCallback && ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 'flush') {
          changed = true;
          return factory.createAwaitExpression(factory.updateCallExpression(node, node.expression, node.typeArguments, node.arguments));
        }

        if (ts.isCallExpression(node) && isPipeCall(node)) {
          const converted = convertPipeline(node, operatorLocals, requiredImports, diagnostics, factory, visit);
          if (converted !== node) changed = true;
          return converted;
        }

        if (
          options.mode === 'platform' &&
          insideRxTestCallback &&
          ts.isCallExpression(node) &&
          ts.isIdentifier(node.expression) &&
          node.expression.text === 'cold'
        ) {
          changed = true;
          return factory.updateCallExpression(node, factory.createIdentifier('observable'), node.typeArguments, node.arguments);
        }

        if (
          options.mode === 'platform' &&
          insideRxTestCallback &&
          ts.isBindingElement(node) &&
          ts.isIdentifier(node.name) &&
          node.name.text === 'cold'
        ) {
          changed = true;
          return factory.updateBindingElement(
            node,
            node.dotDotDotToken,
            undefined,
            factory.createIdentifier('observable'),
            node.initializer
          );
        }

        if (isFunctionLike(node)) {
          const visited = ts.visitEachChild(node, visit, context) as ts.FunctionLikeDeclaration;
          return hasAwait(visited) ? makeAsync(visited, factory) : visited;
        }

        return ts.visitEachChild(node, visit, context);
      };

      return (root) => {
        const visited = ts.visitNode(root, visit) as ts.SourceFile;
        if (usesRxTest) addImport(requiredImports, '@rxjs/test', 'rxTest');
        return withRequiredImports(visited, requiredImports, factory);
      };
    },
  ]);

  const resultFile = transformed.transformed[0];
  if (!resultFile) throw new Error('TypeScript did not return a transformed source file.');
  let code = printer.printFile(resultFile);
  transformed.dispose();

  if (options.provenance) {
    const { repository, sha, path } = options.provenance;
    code = `// Migrated from ${repository} @ ${sha}\n// Source: ${path}\n${code}`;
  }

  if (/\b(asyncScheduler|asapScheduler|animationFrameScheduler|queueScheduler)\b/.test(source)) {
    diagnostics.push({
      code: 'scheduler-argument',
      message: 'A legacy scheduler is present; verify that the target API uses host time before removing it.',
      classification: 'compatibility-only',
    });
  }
  if ((source.match(/\bexpectObservable\s*\(/g) ?? []).length > 1) {
    diagnostics.push({
      code: 'lifecycle-review',
      message: 'Multiple observations may depend on producer multiplicity; review cold versus shared platform behavior.',
      classification: 'compatibility-only',
    });
  }

  return {
    code,
    changed: changed || code !== source,
    diagnostics,
    imports: flattenImports(requiredImports),
  };
}

function collectOperatorLocals(
  sourceFile: ts.SourceFile,
  capabilities: ReadonlyMap<string, CapabilityMapping>
): ReadonlyMap<string, CapabilityMapping> {
  const result = new Map<string, CapabilityMapping>();
  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) continue;
    if (!['rxjs/operators', 'rxjs'].includes(statement.moduleSpecifier.text)) continue;
    const bindings = statement.importClause?.namedBindings;
    if (!bindings || !ts.isNamedImports(bindings)) continue;
    for (const element of bindings.elements) {
      const imported = element.propertyName?.text ?? element.name.text;
      const mapping = capabilities.get(imported);
      if (mapping) result.set(element.name.text, mapping);
    }
  }
  return result;
}

function collectTestSchedulerIdentifiers(sourceFile: ts.SourceFile): ReadonlySet<string> {
  const result = new Set<string>();
  const visit = (node: ts.Node): void => {
    if (ts.isVariableStatement(node)) {
      for (const declaration of node.declarationList.declarations) {
        if (!ts.isIdentifier(declaration.name)) continue;
        if (declaration.type?.getText().includes('TestScheduler') || declaration.initializer?.getText().includes('new TestScheduler')) {
          result.add(declaration.name.text);
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return result;
}

function retainUnknownOperatorImports(
  node: ts.ImportDeclaration,
  operatorLocals: ReadonlyMap<string, CapabilityMapping>
): ts.ImportDeclaration | undefined {
  const bindings = node.importClause?.namedBindings;
  if (!bindings || !ts.isNamedImports(bindings)) return node;
  const retained = bindings.elements.filter((element) => !operatorLocals.has(element.name.text));
  if (retained.length === bindings.elements.length) return node;
  const originalImportClause = node.importClause;
  if (!originalImportClause) return node;
  if (retained.length === 0 && !originalImportClause.name) return undefined;
  const namedBindings = ts.factory.updateNamedImports(bindings, retained);
  const importClause = ts.factory.updateImportClause(
    originalImportClause,
    originalImportClause.isTypeOnly,
    originalImportClause.name,
    namedBindings
  );
  return ts.factory.updateImportDeclaration(node, node.modifiers, importClause, node.moduleSpecifier, node.attributes);
}

function isTestSchedulerDeclaration(node: ts.Node): node is ts.VariableStatement {
  return (
    ts.isVariableStatement(node) &&
    node.declarationList.declarations.every(
      (declaration) =>
        declaration.type?.getText().includes('TestScheduler') || declaration.initializer?.getText().includes('new TestScheduler')
    )
  );
}

function isTestSchedulerSetup(node: ts.Node): node is ts.ExpressionStatement {
  if (!ts.isExpressionStatement(node) || !ts.isCallExpression(node.expression)) return false;
  const call = node.expression;
  if (!ts.isIdentifier(call.expression) || !['beforeEach', 'beforeAll'].includes(call.expression.text)) return false;
  return call.arguments.some((argument) => argument.getText().includes('new TestScheduler'));
}

function hasOnlyTestSchedulerSetup(node: ts.ExpressionStatement): boolean {
  const call = node.expression as ts.CallExpression;
  const hook = call.arguments[0];
  if (!hook || (!ts.isArrowFunction(hook) && !ts.isFunctionExpression(hook))) return false;
  if (!ts.isBlock(hook.body)) return hook.body.getText().includes('new TestScheduler');
  const onlyStatement = hook.body.statements[0];
  return hook.body.statements.length === 1 && !!onlyStatement?.getText().includes('new TestScheduler');
}

function isRunCall(node: ts.CallExpression, schedulerIdentifiers: ReadonlySet<string>): boolean {
  return (
    ts.isPropertyAccessExpression(node.expression) &&
    node.expression.name.text === 'run' &&
    ts.isIdentifier(node.expression.expression) &&
    schedulerIdentifiers.has(node.expression.expression.text)
  );
}

function isPipeCall(node: ts.CallExpression): boolean {
  return ts.isPropertyAccessExpression(node.expression) && node.expression.name.text === 'pipe';
}

function convertPipeline(
  node: ts.CallExpression,
  mappings: ReadonlyMap<string, CapabilityMapping>,
  imports: Map<string, Set<string>>,
  diagnostics: MigrationDiagnostic[],
  factory: ts.NodeFactory,
  visit: ts.Visitor
): ts.Expression {
  if (!ts.isPropertyAccessExpression(node.expression)) return node;
  let current = ts.visitNode(node.expression.expression, visit) as ts.Expression;
  for (const operator of node.arguments) {
    if (!ts.isCallExpression(operator) || !ts.isIdentifier(operator.expression)) {
      diagnostics.push({
        code: 'missing-capability',
        message: `Review non-call pipeline entry: ${operator.getText()}`,
        classification: 'harness-rewrite',
      });
      return node;
    }
    const mapping = mappings.get(operator.expression.text);
    if (!mapping) {
      diagnostics.push({
        code: 'missing-capability',
        message: `No configured RxJS Next capability for ${operator.expression.text}.`,
        classification: 'unsupported-or-obsolete',
      });
      return node;
    }
    addImport(imports, `rxjs/${mapping.module}`, mapping.symbolName);
    if (mapping.review) {
      diagnostics.push({
        code: 'scheduler-argument',
        message: `${mapping.legacyName}: ${mapping.review}`,
        classification: 'compatibility-only',
      });
    }
    const argumentsForSymbol = adaptArguments(mapping.argumentAdapter, operator.arguments, factory, visit);
    current = factory.createCallExpression(
      factory.createElementAccessExpression(current, factory.createIdentifier(mapping.symbolName)),
      operator.typeArguments,
      argumentsForSymbol
    );
  }
  return current;
}

function adaptArguments(
  adapter: ArgumentAdapter,
  argumentsList: ts.NodeArray<ts.Expression>,
  factory: ts.NodeFactory,
  visit: ts.Visitor
): readonly ts.Expression[] {
  const args = argumentsList.map((argument) => ts.visitNode(argument, visit) as ts.Expression);
  switch (adapter) {
    case 'identity':
      return args;
    case 'first-argument':
      return args.slice(0, 1);
    case 'buffer-count': {
      const size = args[0] ?? factory.createIdentifier('undefined');
      const startEvery = args[1] ?? size;
      return [
        factory.createObjectLiteralExpression(
          [
            factory.createPropertyAssignment('maxSize', size),
            factory.createPropertyAssignment('startEvery', startEvery),
            factory.createPropertyAssignment('emitRemainingOnError', factory.createFalse()),
          ],
          false
        ),
      ];
    }
    case 'concat-map':
      return [
        ...(args[0] ? [args[0]] : []),
        factory.createObjectLiteralExpression([factory.createPropertyAssignment('concurrent', factory.createNumericLiteral(1))]),
      ];
    case 'concat-all':
      return [
        factory.createArrowFunction(
          undefined,
          undefined,
          [factory.createParameterDeclaration(undefined, undefined, 'inner')],
          undefined,
          factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
          factory.createIdentifier('inner')
        ),
        factory.createObjectLiteralExpression([factory.createPropertyAssignment('concurrent', factory.createNumericLiteral(1))]),
      ];
    case 'switch-all':
      return [
        factory.createArrowFunction(
          undefined,
          undefined,
          [factory.createParameterDeclaration(undefined, undefined, 'inner')],
          undefined,
          factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
          factory.createIdentifier('inner')
        ),
      ];
    case 'audit':
    case 'audit-time':
      return [
        ...(args[0] ? [args[0]] : []),
        factory.createObjectLiteralExpression([
          factory.createPropertyAssignment('leading', factory.createFalse()),
          factory.createPropertyAssignment('trailing', factory.createTrue()),
          factory.createPropertyAssignment('restartOnTrailing', factory.createFalse()),
        ]),
      ];
  }
}

function isFunctionLike(node: ts.Node): node is ts.FunctionLikeDeclaration {
  return ts.isArrowFunction(node) || ts.isFunctionExpression(node) || ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node);
}

function hasAwait(node: ts.Node): boolean {
  let found = false;
  const inspect = (child: ts.Node): void => {
    if (child !== node && isFunctionLike(child)) return;
    if (ts.isAwaitExpression(child)) found = true;
    if (!found) ts.forEachChild(child, inspect);
  };
  ts.forEachChild(node, inspect);
  return found;
}

function makeAsync(node: ts.FunctionLikeDeclaration, factory: ts.NodeFactory): ts.FunctionLikeDeclaration {
  const modifiers = [...(node.modifiers ?? [])].filter((modifier): modifier is ts.Modifier => !ts.isDecorator(modifier));
  if (!modifiers.some((modifier) => modifier.kind === ts.SyntaxKind.AsyncKeyword)) {
    modifiers.push(factory.createModifier(ts.SyntaxKind.AsyncKeyword));
  }
  if (ts.isArrowFunction(node))
    return factory.updateArrowFunction(
      node,
      modifiers,
      node.typeParameters,
      node.parameters,
      node.type,
      node.equalsGreaterThanToken,
      node.body
    );
  if (ts.isFunctionExpression(node))
    return factory.updateFunctionExpression(
      node,
      modifiers,
      node.asteriskToken,
      node.name,
      node.typeParameters,
      node.parameters,
      node.type,
      node.body
    );
  if (ts.isFunctionDeclaration(node))
    return factory.updateFunctionDeclaration(
      node,
      modifiers,
      node.asteriskToken,
      node.name,
      node.typeParameters,
      node.parameters,
      node.type,
      node.body
    );
  if (ts.isMethodDeclaration(node))
    return factory.updateMethodDeclaration(
      node,
      modifiers,
      node.asteriskToken,
      node.name,
      node.questionToken,
      node.typeParameters,
      node.parameters,
      node.type,
      node.body
    );
  return node;
}

function addImport(imports: Map<string, Set<string>>, moduleName: string, imported: string): void {
  const names = imports.get(moduleName) ?? new Set<string>();
  names.add(imported);
  imports.set(moduleName, names);
}

function withRequiredImports(
  sourceFile: ts.SourceFile,
  imports: ReadonlyMap<string, ReadonlySet<string>>,
  factory: ts.NodeFactory
): ts.SourceFile {
  const additions: ts.ImportDeclaration[] = [];
  for (const [moduleName, names] of imports) {
    additions.push(
      factory.createImportDeclaration(
        undefined,
        factory.createImportClause(
          false,
          undefined,
          factory.createNamedImports(
            [...names].sort().map((name) => factory.createImportSpecifier(false, undefined, factory.createIdentifier(name)))
          )
        ),
        factory.createStringLiteral(moduleName)
      )
    );
  }
  return factory.updateSourceFile(sourceFile, [...additions, ...sourceFile.statements]);
}

function flattenImports(imports: ReadonlyMap<string, ReadonlySet<string>>): readonly { module: string; imported: string }[] {
  const result: { module: string; imported: string }[] = [];
  for (const [module, names] of imports) {
    for (const imported of names) result.push({ module, imported });
  }
  return result;
}
