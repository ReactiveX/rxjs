#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import capabilityRegistry from '../capability-registry.json' with { type: 'json' };
import verifiedColdPasses from '../verified-cold-passes.json' with { type: 'json' };

const sourceRef = process.argv[2] ?? '7.x';
const toolDirectory = dirname(fileURLToPath(import.meta.url));
const sourceCommit = execGit(['rev-parse', sourceRef]).trim();
const generatedAt = execGit(['show', '-s', '--format=%cI', sourceCommit]).trim();
const outputPath = resolve(toolDirectory, '..', 'manifest.generated.json');
const sourcePaths = execGit(['grep', '-l', 'TestScheduler', sourceRef, '--', 'spec'])
  .trim()
  .split('\n')
  .map((path) => path.replace(`${sourceRef}:`, ''))
  .filter((path) => path.endsWith('.ts'));

const availableOperatorSymbols = new Set(Object.keys(capabilityRegistry.operators));
const availableStaticFactories = new Set(Object.keys(capabilityRegistry.staticFactories));
const availableRxjsValues = new Set(Object.keys(capabilityRegistry.values));
const frameworkModules = new Set(['chai', 'vitest', '@jest/globals', 'jest', 'mocha']);
if (verifiedColdPasses.sourceCommit !== sourceCommit) {
  throw new Error(
    `Cold-pass baseline targets ${verifiedColdPasses.sourceCommit}, but ${sourceRef} resolves to ${sourceCommit}. Run a complete audit before regenerating.`
  );
}
const activeCaseLocations = new Set(verifiedColdPasses.locations);
const marbleSignals = ['expectObservable', 'expectSubscriptions', 'createColdObservable', 'createHotObservable'];
const helperNames = ['cold', 'hot', 'time', 'expectObservable', 'expectSubscriptions', 'animate', 'flush'];

const cases = [];
for (const path of sourcePaths) {
  const sourceText = execGit(['show', `${sourceRef}:${path}`]);
  if (!sourceText.includes('TestScheduler') && !marbleSignals.some((signal) => sourceText.includes(signal))) {
    continue;
  }
  cases.push(...extractCases({ path, sourceText }));
}

const canonicalByFingerprint = new Map();
for (const testCase of cases) {
  const canonical = canonicalByFingerprint.get(testCase.fingerprint);
  if (canonical) {
    testCase.duplicateOf = canonical;
    testCase.disposition = 'deduplicated';
    testCase.reason = 'Exact normalized duplicate of the canonical migrated behavioral claim.';
  } else {
    canonicalByFingerprint.set(testCase.fingerprint, testCase.id);
  }
  delete testCase.fingerprint;
}

const totals = {
  cases: cases.length,
  active: countDisposition('active'),
  expectedFailure: countDisposition('expected-failure'),
  missingApi: countDisposition('missing-api'),
  deduplicated: countDisposition('deduplicated'),
  unsupportedOrObsolete: countDisposition('unsupported-or-obsolete'),
};

const manifest = {
  schemaVersion: 1,
  generatedAt,
  sourceRef,
  sourceCommit,
  totals,
  cases,
};

await writeFile(outputPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
process.stdout.write(`${JSON.stringify({ outputPath, sourceRef, sourceCommit, totals }, null, 2)}\n`);

function extractCases({ path, sourceText }) {
  const sourceFile = ts.createSourceFile(path, sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const importMap = readImports(sourceFile);
  const extracted = [];
  const rootSupport = collectSupport(sourceFile.statements);

  visitStatements(sourceFile.statements, [], rootSupport.included, rootSupport.excludedNames);
  const extractedLocations = new Set(extracted.map((testCase) => `${testCase.source.line}:${testCase.source.title}`));
  collectNestedCases(sourceFile);
  return extracted;

  function collectNestedCases(node) {
    if (ts.isCallExpression(node) && ['it', 'test', 'specify'].includes(getLeafCallName(node.expression))) {
      const originalSource = node.getText(sourceFile);
      const title = readTitle(node.arguments[0], sourceFile) ?? `test at line ${lineOf(node, sourceFile)}`;
      const location = `${lineOf(node, sourceFile)}:${title}`;
      if (!extractedLocations.has(location) && marbleSignals.some((signal) => originalSource.includes(signal))) {
        const callback = node.arguments[1];
        const usedImports = getUsedImports({
          callback,
          importMap,
          sourceFile,
          support: [],
        });
        const reviewFlags = [...detectReviewFlags(originalSource), 'dynamic-test-declaration'];
        const id = `${path}:${lineOf(node, sourceFile)}:${title}`;
        extracted.push({
          id,
          source: {
            ref: sourceRef,
            commit: sourceCommit,
            path,
            line: lineOf(node, sourceFile),
            suite: [],
            title,
          },
          behavioralClaim: title,
          classification: 'harness-rewrite',
          disposition: 'unsupported-or-obsolete',
          modes: ['cold', 'polyfill', 'native'],
          reason: 'The case is declared inside a loop or helper function and requires expansion with its runtime parameters.',
          duplicateOf: null,
          imports: usedImports,
          helpers: helperNames.filter((helper) => new RegExp(`\\b${helper}\\s*\\(`).test(originalSource)),
          reviewFlags,
          migratedProgram:
            callback && isFunction(callback)
              ? buildMigratedProgram({
                  callback,
                  imports: usedImports,
                  sourceFile,
                  support: [],
                })
              : null,
          originalSource,
          fingerprint: createHash('sha256').update(normalizeCase(originalSource)).digest('hex'),
        });
      }
    }
    ts.forEachChild(node, collectNestedCases);
  }

  function visitStatements(statements, suite, inheritedSupport, inheritedExcludedNames) {
    for (const statement of statements) {
      if (!ts.isExpressionStatement(statement) || !ts.isCallExpression(statement.expression)) {
        continue;
      }
      const call = statement.expression;
      const callName = getCallName(call.expression);
      if (callName === 'describe') {
        const title = readTitle(call.arguments[0], sourceFile) ?? 'unnamed suite';
        const callback = call.arguments[1];
        if (callback && isFunction(callback) && ts.isBlock(callback.body)) {
          const localSupport = collectSupport(callback.body.statements);
          visitStatements(
            callback.body.statements,
            [...suite, title],
            [...inheritedSupport, ...localSupport.included],
            [...inheritedExcludedNames, ...localSupport.excludedNames]
          );
        }
        continue;
      }
      if (!['it', 'test', 'specify'].includes(callName)) {
        continue;
      }

      const originalSource = call.getText(sourceFile);
      if (!marbleSignals.some((signal) => originalSource.includes(signal))) {
        continue;
      }
      if (isSkippedCall(call.expression)) {
        continue;
      }

      const title = readTitle(call.arguments[0], sourceFile) ?? `${callName} at line ${lineOf(call, sourceFile)}`;
      const callback = call.arguments[1];
      const id = `${path}:${lineOf(call, sourceFile)}:${[...suite, title].join(' > ')}`;
      const runMode = /\.run\s*\(/.test(originalSource);
      const reviewFlags = detectReviewFlags(originalSource);
      const blockedSupport = inheritedExcludedNames.filter((name) => new RegExp(`\\b${escapeRegExp(name)}\\b`).test(originalSource));
      if (blockedSupport.length > 0) {
        reviewFlags.push('scheduler-dependent-helper');
      }
      const helpers = helperNames.filter((helper) => new RegExp(`\\b${helper}\\s*\\(`).test(originalSource));
      const usedImports = getUsedImports({
        callback,
        importMap,
        sourceFile,
        support: inheritedSupport,
      });
      const availability = assessAvailability(usedImports);
      const schedulerInternal =
        reviewFlags.includes('scheduler-internals') ||
        reviewFlags.includes('scheduler-instance-access') ||
        reviewFlags.includes('scheduler-dependent-helper') ||
        path.includes('/schedulers/TestScheduler-spec.ts');

      let classification;
      let disposition;
      let reason;
      let modes;
      let migratedProgram = null;

      if (!callback || !isFunction(callback)) {
        classification = 'unsupported-or-obsolete';
        disposition = 'unsupported-or-obsolete';
        reason = 'The source test has no migratable callback body.';
        modes = ['cold', 'polyfill', 'native'];
        migratedProgram = buildUnavailableProgram(reason);
      } else if (!runMode || schedulerInternal) {
        classification = 'unsupported-or-obsolete';
        disposition = 'unsupported-or-obsolete';
        reason = schedulerInternal
          ? blockedSupport.length > 0
            ? `The case depends on scheduler-bound helper state: ${blockedSupport.join(', ')}.`
            : 'The case protects TestScheduler internals rather than an Observable behavior.'
          : 'The case uses manual TestScheduler APIs and requires a separate harness rewrite.';
        modes = ['cold', 'polyfill', 'native'];
        migratedProgram = buildMigratedProgram({
          callback,
          imports: usedImports,
          sourceFile,
          support: inheritedSupport,
        });
      } else if (availability.missing.length > 0) {
        classification = 'compatibility-only';
        disposition = 'missing-api';
        reason = `Required runtime capabilities are unavailable: ${availability.missing.join(', ')}.`;
        modes = ['cold', 'polyfill', 'native'];
        migratedProgram = buildMigratedProgram({
          callback,
          imports: usedImports,
          sourceFile,
          support: inheritedSupport,
        });
      } else if (availability.external.length > 0) {
        classification = 'harness-rewrite';
        disposition = 'unsupported-or-obsolete';
        reason = `The case depends on non-portable test helpers: ${availability.external.join(', ')}.`;
        modes = ['cold', 'polyfill', 'native'];
        migratedProgram = buildMigratedProgram({
          callback,
          imports: usedImports,
          sourceFile,
          support: inheritedSupport,
        });
      } else {
        classification = reviewFlags.includes('multiple-observers') ? 'harness-rewrite' : 'portable';
        const verifiedActive = activeCaseLocations.has(`${path}:${lineOf(call, sourceFile)}`);
        disposition = verifiedActive ? 'active' : 'expected-failure';
        reason = verifiedActive
          ? 'Mechanically migrated and verified against the ColdObservable mode.'
          : 'Mechanically migrated and quarantined after ColdObservable verification failed; production behavior is unchanged.';
        modes = ['cold', 'polyfill', 'native'];
        migratedProgram = buildMigratedProgram({
          callback,
          imports: usedImports,
          sourceFile,
          support: inheritedSupport,
        });
      }

      const fingerprint = createHash('sha256').update(normalizeCase(originalSource)).digest('hex');
      extracted.push({
        id,
        source: {
          ref: sourceRef,
          commit: sourceCommit,
          path,
          line: lineOf(call, sourceFile),
          suite,
          title,
        },
        behavioralClaim: title,
        classification,
        disposition,
        modes,
        reason,
        duplicateOf: null,
        imports: usedImports,
        helpers,
        reviewFlags,
        migratedProgram,
        originalSource,
        fingerprint,
      });
    }
  }
}

function buildUnavailableProgram(reason) {
  return `async function migrated() {\n  throw new Error(${JSON.stringify(reason)});\n}\n`;
}

function buildMigratedProgram({ callback, imports, sourceFile, support }) {
  const supportSource = support.map((statement) => statement.getText(sourceFile)).join('\n');
  const callbackBody = ts.isBlock(callback.body)
    ? callback.body.statements.map((statement) => statement.getText(sourceFile)).join('\n')
    : `return ${callback.body.getText(sourceFile)};`;
  const input = `async function migrated(runtime) {\n${supportSource}\n${callbackBody}\n}`;
  const transformed = ts.transpileModule(input, {
    compilerOptions: {
      module: ts.ModuleKind.None,
      target: ts.ScriptTarget.ES2022,
    },
    transformers: {
      before: [createMigrationTransformer],
    },
  }).outputText;

  const usedRuntimeNames = ['rxTest', 'applyOperators'];
  for (const imported of imports) {
    if (new RegExp(`\\b${escapeRegExp(imported.local)}\\b`).test(transformed)) {
      usedRuntimeNames.push(imported.local);
    }
  }
  if (/\bexpect\s*\(/.test(transformed) && !usedRuntimeNames.includes('expect')) {
    usedRuntimeNames.push('expect');
  }

  return transformed.replace(
    /async function migrated\(runtime\) \{/,
    `async function migrated(runtime) {\nconst { ${[...new Set(usedRuntimeNames)].join(', ')} } = runtime;`
  );
}

function createMigrationTransformer(context) {
  const { factory } = context;

  function visit(node) {
    if (ts.isCallExpression(node)) {
      if (ts.isPropertyAccessExpression(node.expression) && node.expression.name.text === 'run' && node.arguments.length > 0) {
        const callback = ensureAsyncFunction(ts.visitNode(node.arguments[0], visit), factory);
        return factory.createAwaitExpression(factory.createCallExpression(factory.createIdentifier('rxTest'), undefined, [callback]));
      }
      if (ts.isIdentifier(node.expression) && node.expression.text === 'flush') {
        return factory.createAwaitExpression(ts.visitEachChild(node, visit, context));
      }
      if (ts.isPropertyAccessExpression(node.expression) && node.expression.name.text === 'pipe') {
        const source = ts.visitNode(node.expression.expression, visit);
        const operators = node.arguments.map((argument) => ts.visitNode(argument, visit));
        return factory.createCallExpression(factory.createIdentifier('applyOperators'), undefined, [
          source,
          factory.createArrayLiteralExpression(operators),
        ]);
      }
    }
    return ts.visitEachChild(node, visit, context);
  }

  return (sourceFile) => ts.visitNode(sourceFile, visit);
}

function ensureAsyncFunction(node, factory) {
  if (ts.isArrowFunction(node)) {
    return factory.updateArrowFunction(
      node,
      addAsyncModifier(node.modifiers, factory),
      node.typeParameters,
      node.parameters,
      node.type,
      node.equalsGreaterThanToken,
      node.body
    );
  }
  if (ts.isFunctionExpression(node)) {
    return factory.updateFunctionExpression(
      node,
      addAsyncModifier(node.modifiers, factory),
      node.asteriskToken,
      node.name,
      node.typeParameters,
      node.parameters,
      node.type,
      node.body
    );
  }
  return node;
}

function addAsyncModifier(modifiers, factory) {
  if (modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.AsyncKeyword)) {
    return modifiers;
  }
  return factory.createNodeArray([factory.createModifier(ts.SyntaxKind.AsyncKeyword), ...(modifiers ?? [])]);
}

function readImports(sourceFile) {
  const imports = [];
  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) {
      continue;
    }
    const module = statement.moduleSpecifier.text;
    const clause = statement.importClause;
    if (!clause) {
      continue;
    }
    if (clause.name) {
      imports.push({ module, imported: 'default', local: clause.name.text });
    }
    const bindings = clause.namedBindings;
    if (bindings && ts.isNamedImports(bindings)) {
      for (const element of bindings.elements) {
        if (element.isTypeOnly || clause.isTypeOnly) {
          continue;
        }
        imports.push({
          module,
          imported: element.propertyName?.text ?? element.name.text,
          local: element.name.text,
        });
      }
    }
  }
  return imports;
}

function getUsedImports({ callback, importMap, sourceFile, support }) {
  if (!callback || !isFunction(callback)) {
    return [];
  }
  const selectedSource = [...support.map((statement) => statement.getText(sourceFile)), callback.getText(sourceFile)].join('\n');
  const operatorLocals = collectOperatorLocals({ callback, importMap, support });
  return importMap
    .filter((item) => new RegExp(`\\b${escapeRegExp(item.local)}\\b`).test(selectedSource))
    .map((item) => ({
      ...item,
      usage: item.module === 'rxjs/operators' || operatorLocals.has(item.local) ? 'operator' : 'value',
    }));
}

function assessAvailability(imports) {
  const missing = [];
  const external = [];
  for (const item of imports) {
    if (item.usage === 'operator') {
      if (!availableOperatorSymbols.has(item.imported)) {
        missing.push(`operator:${item.imported}`);
      }
    } else if (item.module === 'rxjs') {
      if (!availableStaticFactories.has(item.imported) && !availableRxjsValues.has(item.imported)) {
        missing.push(`rxjs:${item.imported}`);
      }
    } else if (item.module === 'rxjs/testing') {
      continue;
    } else if (frameworkModules.has(item.module)) {
      continue;
    } else if (item.module.startsWith('rxjs/')) {
      missing.push(`${item.module}:${item.imported}`);
    } else {
      external.push(`${item.module}:${item.imported}`);
    }
  }
  return { missing, external };
}

function collectOperatorLocals({ callback, importMap, support }) {
  const locals = new Set();
  const pipeLocals = new Set(importMap.filter((item) => item.module === 'rxjs' && item.imported === 'pipe').map((item) => item.local));

  const visit = (node) => {
    if (ts.isCallExpression(node)) {
      const isSourcePipe = ts.isPropertyAccessExpression(node.expression) && node.expression.name.text === 'pipe';
      const isStandalonePipe = ts.isIdentifier(node.expression) && pipeLocals.has(node.expression.text);
      if (isSourcePipe || isStandalonePipe) {
        for (const argument of node.arguments) {
          if (ts.isCallExpression(argument) && ts.isIdentifier(argument.expression)) {
            locals.add(argument.expression.text);
          } else if (ts.isIdentifier(argument)) {
            locals.add(argument.text);
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  };

  for (const statement of support) {
    visit(statement);
  }
  visit(callback);
  return locals;
}

function collectSupport(statements) {
  const included = [];
  const excludedNames = [];
  for (const statement of statements) {
    if (
      ts.isFunctionDeclaration(statement) ||
      ts.isClassDeclaration(statement) ||
      ts.isTypeAliasDeclaration(statement) ||
      ts.isInterfaceDeclaration(statement) ||
      ts.isEnumDeclaration(statement) ||
      ts.isVariableStatement(statement)
    ) {
      const text = statement.getText();
      if (text.includes('TestScheduler') || /\b(?:rx)?testScheduler\b/i.test(text)) {
        if (!ts.isVariableStatement(statement) || !text.includes('TestScheduler')) {
          excludedNames.push(...getDeclaredNames(statement));
        }
      } else {
        included.push(statement);
      }
    }
  }
  return { included, excludedNames };
}

function getDeclaredNames(statement) {
  if ((ts.isFunctionDeclaration(statement) || ts.isClassDeclaration(statement)) && statement.name) {
    return [statement.name.text];
  }
  if (ts.isVariableStatement(statement)) {
    const names = [];
    for (const declaration of statement.declarationList.declarations) {
      if (ts.isIdentifier(declaration.name)) {
        if (!/(?:rx)?testScheduler/i.test(declaration.name.text) && declaration.name.text !== 'scheduler') {
          names.push(declaration.name.text);
        }
      }
    }
    return names;
  }
  return [];
}

function detectReviewFlags(source) {
  const flags = [];
  if (/\bflush\s*\(/.test(source)) {
    flags.push('await-flush');
  }
  if (/\b(frameTimeFactor|maxFrames)\b|\.frame\b/.test(source)) {
    flags.push('scheduler-internals');
  }
  if (/\b(?:rx)?testScheduler\.(?!run\b)[A-Za-z_$][A-Za-z0-9_$]*/i.test(source)) {
    flags.push('scheduler-instance-access');
  }
  if (/\b(createColdObservable|createHotObservable)\s*\(/.test(source) && !/\.run\s*\(/.test(source)) {
    flags.push('manual-test-scheduler');
  }
  if (/\b(asyncScheduler|asapScheduler|animationFrameScheduler|queueScheduler)\b/.test(source)) {
    flags.push('scheduler-argument');
  }
  if ((source.match(/\bexpectObservable\s*\(/g) ?? []).length > 1) {
    flags.push('multiple-observers');
  }
  if (/\bsubscribe\s*\(/.test(source)) {
    flags.push('direct-subscription');
  }
  return flags;
}

function normalizeCase(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/[^\n\r]*/g, '')
    .replace(/\b[A-Za-z_$][A-Za-z0-9_$]*\.run\s*\(/g, 'testScheduler.run(')
    .replace(/\s+/g, ' ')
    .trim();
}

function isSkippedCall(expression) {
  return ts.isPropertyAccessExpression(expression) && ['skip', 'todo'].includes(expression.name.text);
}

function getCallName(expression) {
  if (ts.isIdentifier(expression)) {
    return expression.text;
  }
  if (ts.isPropertyAccessExpression(expression)) {
    return expression.expression.getText();
  }
  return '';
}

function getLeafCallName(expression) {
  if (ts.isIdentifier(expression)) {
    return expression.text;
  }
  if (ts.isPropertyAccessExpression(expression)) {
    return expression.name.text;
  }
  return '';
}

function readTitle(node, sourceFile) {
  return node && ts.isStringLiteralLike(node) ? node.text : node?.getText(sourceFile);
}

function isFunction(node) {
  return ts.isArrowFunction(node) || ts.isFunctionExpression(node);
}

function lineOf(node, sourceFile) {
  return sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1;
}

function countDisposition(disposition) {
  return cases.filter((testCase) => testCase.disposition === disposition).length;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function execGit(args) {
  return execFileSync('git', args, {
    cwd: resolve(toolDirectory, '../../../../..'),
    encoding: 'utf8',
    maxBuffer: 100 * 1024 * 1024,
  });
}
