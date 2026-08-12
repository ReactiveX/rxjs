import ts from 'typescript';
import { defaultCapabilityRegistry } from './capabilities.js';
import { diagnosticForNode, diagnosticForOffsets, parseDiagnostics, sortDiagnostics } from './diagnostics.js';
import { capabilityRegistrySchema } from './schemas.js';
import { migrationEngineVersion } from './version.js';
import type {
  ArgumentAdapter,
  CapabilityMapping,
  MigrationDiagnostic,
  MigrationResult,
  SemanticMigrationOptions,
} from './types.js';

const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
const schedulerNames = new Set(['asyncScheduler', 'asapScheduler', 'animationFrameScheduler', 'queueScheduler']);

export function migrateTestSchedulerSemantics(source: string, options: SemanticMigrationOptions = {}): MigrationResult {
  const sourceFile = ts.createSourceFile(options.fileName ?? 'migration-input.ts', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const syntaxDiagnostics = parseDiagnostics(sourceFile);
  if (syntaxDiagnostics.length > 0) {
    return { status: 'refused', code: source, diagnostics: syntaxDiagnostics, imports: [] };
  }

  const registry = options.capabilityRegistry ?? defaultCapabilityRegistry;
  const registryValidation = capabilityRegistrySchema.safeParse(registry);
  if (!registryValidation.success || registry.engineVersion !== migrationEngineVersion) {
    const detail = !registryValidation.success
      ? registryValidation.error.issues[0]?.message ?? 'The registry does not match the supported schema.'
      : `Registry engine ${registry.engineVersion} does not match installed engine ${migrationEngineVersion}.`;
    return {
      status: 'refused',
      code: source,
      diagnostics: [
        diagnosticForOffsets(sourceFile, 0, source.length, {
          code: 'invalid-capability-registry',
          message: `The capability registry cannot govern this transform. ${detail}`,
          severity: 'error',
          disposition: 'refused',
          refusalScope: 'file',
          classification: 'harness-rewrite',
          nextAction: {
            code: 'use-compatible-registry',
            message: 'Use a schema-valid capability registry produced for the installed migration engine.',
          },
        }),
      ],
      imports: [],
    };
  }
  const capabilities = new Map(registryValidation.data.capabilities.map((entry) => [entry.legacyName, entry]));
  const operatorLocals = collectOperatorLocals(sourceFile, capabilities);
  const unsafeOperatorLocals = collectUnsafeOperatorLocals(sourceFile, operatorLocals);
  const testSchedulerTypeLocals = collectTestSchedulerTypeLocals(sourceFile);
  const schedulerIdentifiers = collectTestSchedulerIdentifiers(sourceFile, testSchedulerTypeLocals);
  const diagnostics: MigrationDiagnostic[] = [];
  const requiredImports = new Map<string, Set<string>>();
  const convertedOperatorLocals = new Set<string>();
  const preservedOperatorLocals = new Set<string>();
  let changed = false;
  let usesRxTest = false;
  let insideRxTestCallback = false;

  const mixedSchedulerDeclaration = findMixedTestSchedulerDeclaration(sourceFile, schedulerIdentifiers);
  if (mixedSchedulerDeclaration) {
    diagnostics.push(
      diagnosticForNode(sourceFile, mixedSchedulerDeclaration, {
        code: 'manual-test-scheduler',
        message: 'A variable statement mixes TestScheduler state with unrelated declarations.',
        severity: 'error',
        disposition: 'refused',
        refusalScope: 'file',
        classification: 'harness-rewrite',
        nextAction: { code: 'review-source', message: 'Separate the TestScheduler declaration before running the transform.' },
      })
    );
    return { status: 'refused', code: source, diagnostics, imports: [] };
  }

  const manualSetup = findManualTestSchedulerSetup(sourceFile, testSchedulerTypeLocals);
  if (manualSetup) {
    diagnostics.push(
      diagnosticForNode(sourceFile, manualSetup, {
        code: 'manual-test-scheduler',
        message: 'A TestScheduler setup hook has additional responsibilities, so this file was not transformed.',
        severity: 'error',
        disposition: 'refused',
        refusalScope: 'file',
        classification: 'harness-rewrite',
        nextAction: { code: 'migrate-manually', message: 'Separate the scheduler setup from the other hook work before retrying.' },
      })
    );
    return { status: 'refused', code: source, diagnostics, imports: [] };
  }

  if (schedulerIdentifiers.size > 0 && options.mode === undefined) {
    const firstScheduler = findFirstIdentifier(sourceFile, schedulerIdentifiers) ?? sourceFile;
    diagnostics.push(
      diagnosticForNode(sourceFile, firstScheduler, {
        code: 'lifecycle-review',
        message: 'TestScheduler migration requires an explicit cold or platform lifecycle selection.',
        severity: 'error',
        disposition: 'refused',
        refusalScope: 'file',
        classification: 'compatibility-only',
        nextAction: { code: 'choose-lifecycle', message: 'Classify the test as cold or platform before running the transform.' },
      })
    );
    return { status: 'refused', code: source, diagnostics, imports: [] };
  }

  collectLifecycleDiagnostics(sourceFile, diagnostics);
  if (diagnostics.some(({ disposition }) => disposition === 'refused')) {
    return { status: 'refused', code: source, diagnostics: sortDiagnostics(diagnostics), imports: [] };
  }

  const transformed = ts.transform(sourceFile, [
    (context) => {
      const { factory } = context;

      const visit: ts.Visitor = (node) => {
        if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
          const moduleName = node.moduleSpecifier.text;
          if (moduleName === 'rxjs/testing') {
            const retained = retainNonTestSchedulerImports(node);
            if (retained !== node) changed = true;
            return retained;
          }
          if (moduleName === 'rxjs/operators' || moduleName === 'rxjs') {
            const retained = retainUnconvertedOperatorImports(node, convertedOperatorLocals);
            if (retained !== node) changed = true;
            return retained;
          }
        }

        if (isTestSchedulerDeclaration(node, schedulerIdentifiers)) {
          changed = true;
          return undefined;
        }

        if (isTestSchedulerSetup(node, testSchedulerTypeLocals)) {
          changed = true;
          return undefined;
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
          const converted = convertPipeline({
            node,
            mappings: operatorLocals,
            unsafeOperatorLocals,
            imports: requiredImports,
            convertedOperatorLocals,
            preservedOperatorLocals,
            diagnostics,
            sourceFile,
            factory,
            visit,
          });
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
          return factory.updateBindingElement(node, node.dotDotDotToken, undefined, factory.createIdentifier('observable'), node.initializer);
        }

        if (isFunctionLike(node)) {
          const visited = ts.visitEachChild(node, visit, context) as ts.FunctionLikeDeclaration;
          return hasAwait(visited) ? makeAsync(visited, factory) : visited;
        }

        return ts.visitEachChild(node, visit, context);
      };

      return (root) => {
        let visited = ts.visitNode(root, visit) as ts.SourceFile;
        const removableOperatorLocals = new Set(
          [...convertedOperatorLocals].filter((local) => !preservedOperatorLocals.has(local))
        );
        if (removableOperatorLocals.size > 0) {
          visited = removeConvertedLegacyImports(visited, removableOperatorLocals, factory);
        }
        if (usesRxTest) addImport(requiredImports, '@rxjs/test', 'rxTest');
        return withRequiredImports(visited, requiredImports, factory);
      };
    },
  ]);

  const resultFile = transformed.transformed[0];
  if (!resultFile) throw new Error('TypeScript did not return a transformed source file.');
  const code = changed ? printer.printFile(resultFile) : source;
  transformed.dispose();

  const orderedDiagnostics = sortDiagnostics(diagnostics);
  const refused = orderedDiagnostics.some(({ disposition }) => disposition === 'refused');
  return {
    status: refused ? 'refused' : changed ? 'changed' : 'unchanged',
    code,
    diagnostics: orderedDiagnostics,
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
      if (element.isTypeOnly) continue;
      const imported = element.propertyName?.text ?? element.name.text;
      const mapping = capabilities.get(imported);
      if (mapping) result.set(element.name.text, mapping);
    }
  }
  return result;
}

function collectUnsafeOperatorLocals(sourceFile: ts.SourceFile, mappings: ReadonlyMap<string, CapabilityMapping>): ReadonlySet<string> {
  const result = new Set<string>();
  const visit = (node: ts.Node): void => {
    if (ts.isCallExpression(node) && isPipeCall(node)) {
      const fullyMapped = node.arguments.every(
        (argument) => ts.isCallExpression(argument) && ts.isIdentifier(argument.expression) && mappings.has(argument.expression.text)
      );
      if (!fullyMapped) {
        for (const argument of node.arguments) {
          if (ts.isCallExpression(argument) && ts.isIdentifier(argument.expression) && mappings.has(argument.expression.text)) {
            result.add(argument.expression.text);
          }
        }
      }
    }
    const name = declarationName(node);
    if (name && mappings.has(name.text)) result.add(name.text);
    if (ts.isImportSpecifier(node)) {
      for (const [local, mapping] of mappings) {
        if (node.name.text === mapping.symbolName && node.name.text !== local) result.add(local);
      }
    }
    if (ts.isIdentifier(node) && mappings.has(node.text) && isValueReference(node) && !isDirectPipeOperatorReference(node)) {
      result.add(node.text);
    }
    if (name) {
      for (const [local, mapping] of mappings) {
        if (name.text === mapping.symbolName && name.text !== local) result.add(local);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return result;
}

function isValueReference(node: ts.Identifier): boolean {
  const parent = node.parent;
  if (ts.isImportSpecifier(parent) || ts.isImportClause(parent) || ts.isNamespaceImport(parent)) return false;
  if (declarationName(parent) === node) return false;
  if (ts.isPropertyAccessExpression(parent) && parent.name === node) return false;
  if (ts.isPropertyAssignment(parent) && parent.name === node) return false;
  if (ts.isTypeReferenceNode(parent) || ts.isQualifiedName(parent)) return false;
  return true;
}

function isDirectPipeOperatorReference(node: ts.Identifier): boolean {
  const operatorCall = node.parent;
  if (!ts.isCallExpression(operatorCall) || operatorCall.expression !== node) return false;
  const pipeCall = operatorCall.parent;
  return ts.isCallExpression(pipeCall) && isPipeCall(pipeCall) && pipeCall.arguments.includes(operatorCall);
}

function declarationName(node: ts.Node): ts.Identifier | undefined {
  if (
    (ts.isParameter(node) ||
      ts.isVariableDeclaration(node) ||
      ts.isFunctionDeclaration(node) ||
      ts.isClassDeclaration(node) ||
      ts.isBindingElement(node)) &&
    node.name &&
    ts.isIdentifier(node.name)
  ) {
    return node.name;
  }
  if (ts.isCatchClause(node) && node.variableDeclaration && ts.isIdentifier(node.variableDeclaration.name)) {
    return node.variableDeclaration.name;
  }
  return undefined;
}

function collectTestSchedulerTypeLocals(sourceFile: ts.SourceFile): ReadonlySet<string> {
  const result = new Set<string>();
  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) continue;
    if (statement.moduleSpecifier.text !== 'rxjs/testing') continue;
    const bindings = statement.importClause?.namedBindings;
    if (!bindings || !ts.isNamedImports(bindings)) continue;
    for (const element of bindings.elements) {
      if ((element.propertyName?.text ?? element.name.text) === 'TestScheduler') result.add(element.name.text);
    }
  }
  return result;
}

function collectTestSchedulerIdentifiers(sourceFile: ts.SourceFile, typeLocals: ReadonlySet<string>): ReadonlySet<string> {
  const result = new Set<string>();
  const visit = (node: ts.Node): void => {
    if (ts.isVariableStatement(node)) {
      for (const declaration of node.declarationList.declarations) {
        if (!ts.isIdentifier(declaration.name)) continue;
        const typeName = declaration.type && ts.isTypeReferenceNode(declaration.type) && ts.isIdentifier(declaration.type.typeName)
          ? declaration.type.typeName.text
          : undefined;
        const constructorName =
          declaration.initializer && ts.isNewExpression(declaration.initializer) && ts.isIdentifier(declaration.initializer.expression)
            ? declaration.initializer.expression.text
            : undefined;
        if ((typeName && typeLocals.has(typeName)) || (constructorName && typeLocals.has(constructorName))) {
          result.add(declaration.name.text);
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return result;
}

function findFirstIdentifier(sourceFile: ts.SourceFile, names: ReadonlySet<string>): ts.Identifier | undefined {
  let result: ts.Identifier | undefined;
  const visit = (node: ts.Node): void => {
    if (!result && ts.isIdentifier(node) && names.has(node.text)) result = node;
    if (!result) ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return result;
}

function retainNonTestSchedulerImports(node: ts.ImportDeclaration): ts.ImportDeclaration | undefined {
  const clause = node.importClause;
  const bindings = clause?.namedBindings;
  if (!clause || !bindings || !ts.isNamedImports(bindings)) return node;
  const retained = bindings.elements.filter((element) => (element.propertyName?.text ?? element.name.text) !== 'TestScheduler');
  if (retained.length === bindings.elements.length) return node;
  if (retained.length === 0 && !clause.name) return undefined;
  return ts.factory.updateImportDeclaration(
    node,
    node.modifiers,
    ts.factory.updateImportClause(clause, clause.isTypeOnly, clause.name, ts.factory.updateNamedImports(bindings, retained)),
    node.moduleSpecifier,
    node.attributes
  );
}

function retainUnconvertedOperatorImports(
  node: ts.ImportDeclaration,
  convertedOperatorLocals: ReadonlySet<string>
): ts.ImportDeclaration | undefined {
  if (convertedOperatorLocals.size === 0) return node;
  const clause = node.importClause;
  const bindings = clause?.namedBindings;
  if (!clause || !bindings || !ts.isNamedImports(bindings)) return node;
  const retained = bindings.elements.filter((element) => !convertedOperatorLocals.has(element.name.text));
  if (retained.length === bindings.elements.length) return node;
  if (retained.length === 0 && !clause.name) return undefined;
  return ts.factory.updateImportDeclaration(
    node,
    node.modifiers,
    ts.factory.updateImportClause(clause, clause.isTypeOnly, clause.name, ts.factory.updateNamedImports(bindings, retained)),
    node.moduleSpecifier,
    node.attributes
  );
}

function removeConvertedLegacyImports(
  sourceFile: ts.SourceFile,
  convertedOperatorLocals: ReadonlySet<string>,
  factory: ts.NodeFactory
): ts.SourceFile {
  const statements: ts.Statement[] = [];
  for (const statement of sourceFile.statements) {
    if (
      ts.isImportDeclaration(statement) &&
      ts.isStringLiteral(statement.moduleSpecifier) &&
      ['rxjs', 'rxjs/operators'].includes(statement.moduleSpecifier.text)
    ) {
      const retained = retainUnconvertedOperatorImports(statement, convertedOperatorLocals);
      if (retained) statements.push(retained);
      continue;
    }
    statements.push(statement);
  }
  return factory.updateSourceFile(sourceFile, statements);
}

function isTestSchedulerDeclaration(node: ts.Node, schedulerIdentifiers: ReadonlySet<string>): node is ts.VariableStatement {
  return (
    ts.isVariableStatement(node) &&
    node.declarationList.declarations.every((declaration) => ts.isIdentifier(declaration.name) && schedulerIdentifiers.has(declaration.name.text))
  );
}

function isTestSchedulerSetup(node: ts.Node, typeLocals: ReadonlySet<string>): node is ts.ExpressionStatement {
  if (!ts.isExpressionStatement(node) || !ts.isCallExpression(node.expression)) return false;
  const call = node.expression;
  if (!ts.isIdentifier(call.expression) || !['beforeEach', 'beforeAll'].includes(call.expression.text)) return false;
  return call.arguments.some((argument) => containsNewExpression(argument, typeLocals));
}

function findManualTestSchedulerSetup(
  sourceFile: ts.SourceFile,
  typeLocals: ReadonlySet<string>
): ts.ExpressionStatement | undefined {
  let result: ts.ExpressionStatement | undefined;
  const visit = (node: ts.Node): void => {
    if (!result && isTestSchedulerSetup(node, typeLocals) && !hasOnlyTestSchedulerSetup(node, typeLocals)) result = node;
    if (!result) ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return result;
}

function hasOnlyTestSchedulerSetup(node: ts.ExpressionStatement, typeLocals: ReadonlySet<string>): boolean {
  const call = node.expression as ts.CallExpression;
  const hook = call.arguments[0];
  if (!hook || (!ts.isArrowFunction(hook) && !ts.isFunctionExpression(hook))) return false;
  if (!ts.isBlock(hook.body)) return containsNewExpression(hook.body, typeLocals);
  const onlyStatement = hook.body.statements[0];
  return hook.body.statements.length === 1 && !!onlyStatement && containsNewExpression(onlyStatement, typeLocals);
}

function containsNewExpression(node: ts.Node, typeLocals: ReadonlySet<string>): boolean {
  let found = false;
  const visit = (child: ts.Node): void => {
    if (ts.isNewExpression(child) && ts.isIdentifier(child.expression) && typeLocals.has(child.expression.text)) found = true;
    if (!found) ts.forEachChild(child, visit);
  };
  visit(node);
  return found;
}

function findMixedTestSchedulerDeclaration(
  sourceFile: ts.SourceFile,
  schedulerIdentifiers: ReadonlySet<string>
): ts.VariableStatement | undefined {
  let result: ts.VariableStatement | undefined;
  const visit = (node: ts.Node): void => {
    if (result || !ts.isVariableStatement(node)) {
      if (!result) ts.forEachChild(node, visit);
      return;
    }
    const schedulerCount = node.declarationList.declarations.filter(
      (declaration) => ts.isIdentifier(declaration.name) && schedulerIdentifiers.has(declaration.name.text)
    ).length;
    if (schedulerCount > 0 && schedulerCount !== node.declarationList.declarations.length) result = node;
    if (!result) ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return result;
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

interface ConvertPipelineContext {
  readonly node: ts.CallExpression;
  readonly mappings: ReadonlyMap<string, CapabilityMapping>;
  readonly unsafeOperatorLocals: ReadonlySet<string>;
  readonly imports: Map<string, Set<string>>;
  readonly convertedOperatorLocals: Set<string>;
  readonly preservedOperatorLocals: Set<string>;
  readonly diagnostics: MigrationDiagnostic[];
  readonly sourceFile: ts.SourceFile;
  readonly factory: ts.NodeFactory;
  readonly visit: ts.Visitor;
}

function convertPipeline(context: ConvertPipelineContext): ts.Expression {
  const { node, mappings, unsafeOperatorLocals, diagnostics, sourceFile, factory, visit } = context;
  if (!ts.isPropertyAccessExpression(node.expression)) return node;

  const entries: Array<{ readonly call: ts.CallExpression; readonly local: string; readonly mapping: CapabilityMapping }> = [];
  let refused = false;
  for (const operator of node.arguments) {
    if (!ts.isCallExpression(operator) || !ts.isIdentifier(operator.expression)) {
      diagnostics.push(
        diagnosticForNode(sourceFile, operator, {
          code: 'missing-capability',
          message: `Only direct imported operator calls can be transformed: ${operator.getText(sourceFile)}`,
          severity: 'error',
          disposition: 'refused',
          refusalScope: 'transform',
          classification: 'harness-rewrite',
          nextAction: { code: 'migrate-manually', message: 'Keep this pipeline unchanged or rewrite the unsupported entry manually.' },
        })
      );
      refused = true;
      continue;
    }
    const local = operator.expression.text;
    const mapping = mappings.get(local);
    if (!mapping) {
      diagnostics.push(
        diagnosticForNode(sourceFile, operator, {
          code: 'missing-capability',
          message: `No fixture-proved RxJS Next capability is configured for ${local}.`,
          severity: 'error',
          disposition: 'refused',
          refusalScope: 'transform',
          classification: 'unsupported-or-obsolete',
          nextAction: { code: 'update-engine', message: 'Preserve this pipeline and wait for or implement a fixture-proved mapping.' },
        })
      );
      refused = true;
      continue;
    }
    if (unsafeOperatorLocals.has(local)) {
      diagnostics.push(
        diagnosticForNode(sourceFile, operator.expression, {
          code: 'unsafe-binding',
          message: `${local} has references that cannot all be transformed safely in this file.`,
          severity: 'error',
          disposition: 'refused',
          refusalScope: 'transform',
          classification: 'harness-rewrite',
          nextAction: { code: 'review-source', message: 'Review the binding and migrate every remaining use before removing its legacy import.' },
          capabilityId: mapping.id,
        })
      );
      refused = true;
      continue;
    }
    const arityDiagnostic = validateArity(sourceFile, operator, mapping);
    if (arityDiagnostic) {
      diagnostics.push(arityDiagnostic);
      refused = true;
      continue;
    }
    const schedulerArgument = operator.arguments.find(containsLegacyScheduler);
    if (schedulerArgument) {
      diagnostics.push(
        diagnosticForNode(sourceFile, schedulerArgument, {
          code: 'scheduler-argument',
          message: `${mapping.legacyName} contains a legacy scheduler argument outside the fixture-proved target contract.`,
          severity: 'error',
          disposition: 'refused',
          refusalScope: 'transform',
          classification: 'compatibility-only',
          nextAction: { code: 'remove-unsupported-overload', message: 'Characterize the timing behavior before removing or replacing the scheduler.' },
          capabilityId: mapping.id,
        })
      );
      refused = true;
      continue;
    }
    entries.push({ call: operator, local, mapping });
  }
  if (refused || entries.length !== node.arguments.length) {
    for (const entry of entries) context.preservedOperatorLocals.add(entry.local);
    return node;
  }

  let current = ts.visitNode(node.expression.expression, visit) as ts.Expression;
  for (const { call, local, mapping } of entries) {
    addImport(context.imports, `rxjs/${mapping.module}`, mapping.symbolName);
    context.convertedOperatorLocals.add(local);
    current = factory.createCallExpression(
      factory.createElementAccessExpression(current, factory.createIdentifier(mapping.symbolName)),
      call.typeArguments,
      adaptArguments(mapping.argumentAdapter, call.arguments, factory, visit)
    );
  }
  return current;
}

function validateArity(
  sourceFile: ts.SourceFile,
  call: ts.CallExpression,
  mapping: CapabilityMapping
): MigrationDiagnostic | undefined {
  const count = call.arguments.length;
  const { minimum, maximum } = mapping.arity;
  if (count >= minimum && (maximum === null || count <= maximum)) return undefined;
  const node = maximum !== null && count > maximum ? (call.arguments[maximum] ?? call) : call;
  return diagnosticForNode(sourceFile, node, {
    code: 'unsupported-overload',
    message: `${mapping.legacyName} expects ${formatArity(minimum, maximum)} in the mechanically supported form; received ${count}.`,
    severity: 'error',
    disposition: 'refused',
    refusalScope: 'transform',
    classification: 'compatibility-only',
    nextAction: { code: 'remove-unsupported-overload', message: 'Preserve the unsupported overload and migrate it manually after characterization.' },
    capabilityId: mapping.id,
  });
}

function formatArity(minimum: number, maximum: number | null): string {
  if (maximum === null) return `at least ${minimum} argument${minimum === 1 ? '' : 's'}`;
  if (minimum === maximum) return `${minimum} argument${minimum === 1 ? '' : 's'}`;
  return `${minimum} to ${maximum} arguments`;
}

function containsLegacyScheduler(node: ts.Node): boolean {
  let found = false;
  const visit = (child: ts.Node): void => {
    if (ts.isIdentifier(child) && (schedulerNames.has(child.text) || /Scheduler$/.test(child.text))) found = true;
    if (!found) ts.forEachChild(child, visit);
  };
  visit(node);
  return found;
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

function collectLifecycleDiagnostics(sourceFile: ts.SourceFile, diagnostics: MigrationDiagnostic[]): void {
  const observations: ts.CallExpression[] = [];
  const visit = (node: ts.Node): void => {
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 'expectObservable') observations.push(node);
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  if (observations.length <= 1) return;
  for (const observation of observations.slice(1)) {
    diagnostics.push(
      diagnosticForNode(sourceFile, observation, {
        code: 'lifecycle-review',
        message: 'Multiple observations may depend on producer multiplicity.',
        severity: 'error',
        disposition: 'refused',
        refusalScope: 'file',
        classification: 'compatibility-only',
        nextAction: { code: 'add-characterization-test', message: 'Verify cold versus shared platform behavior before accepting the migration.' },
      })
    );
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
    return factory.updateArrowFunction(node, modifiers, node.typeParameters, node.parameters, node.type, node.equalsGreaterThanToken, node.body);
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
    if (names.size === 0) continue;
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
  return additions.length === 0 ? sourceFile : factory.updateSourceFile(sourceFile, [...additions, ...sourceFile.statements]);
}

function flattenImports(imports: ReadonlyMap<string, ReadonlySet<string>>): readonly { module: string; imported: string }[] {
  const result: { module: string; imported: string }[] = [];
  for (const [module, names] of [...imports].sort(([left], [right]) => left.localeCompare(right))) {
    for (const imported of [...names].sort()) result.push({ module, imported });
  }
  return result;
}
