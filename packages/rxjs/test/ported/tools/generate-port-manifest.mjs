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
const outputPath = process.env.RXJS_NEXT_PORT_MANIFEST_OUTPUT
  ? resolve(process.env.RXJS_NEXT_PORT_MANIFEST_OUTPUT)
  : resolve(toolDirectory, '..', 'manifest.generated.json');
const sourcePaths = execGit(['ls-tree', '-r', '--name-only', sourceRef, '--', 'spec'])
  .trim()
  .split('\n')
  .filter((path) => path.endsWith('.ts'));

const availableOperatorSymbols = new Set(Object.keys(capabilityRegistry.operators));
const availableStaticFactories = new Set(Object.keys(capabilityRegistry.staticFactories));
const availableRxjsValues = new Set(Object.keys(capabilityRegistry.values));
const frameworkModules = new Set(['chai', 'vitest', '@jest/globals', 'jest', 'mocha']);
const inlineTestHelpers = new Set([
  '../helpers/test-helper:NO_SUBS',
  '../helpers/test-helper:lowerCaseO',
  '../helpers/interop-helper:asInteropObservable',
]);
const convertibleSchedulerHelpers = new Set(['expectObservableArray', 'getTimerSelector']);
if (verifiedColdPasses.sourceCommit !== sourceCommit) {
  throw new Error(
    `Cold-pass baseline targets ${verifiedColdPasses.sourceCommit}, but ${sourceRef} resolves to ${sourceCommit}. Run a complete audit before regenerating.`
  );
}
const activeCaseIds = new Set(verifiedColdPasses.caseIds ?? []);
const activeCaseLocations = new Set(verifiedColdPasses.locations ?? []);
const coldBaselineUsesCaseIds = Array.isArray(verifiedColdPasses.caseIds);
const marbleSignals = ['expectObservable', 'expectSubscriptions', 'createColdObservable', 'createHotObservable'];
const helperNames = ['cold', 'hot', 'time', 'expectObservable', 'expectSubscriptions', 'animate', 'flush'];
// Subscription replacements close original open logs only where the synthetic
// observation boundary itself performs the corresponding unsubscription.
const observationBoundaries = new Map([
  [
    'spec/observables/never-spec.ts:15:NEVER > should create a cold observable that never emits',
    { observable: '^!' },
  ],
  [
    'spec/operators/ignoreElements-spec.ts:79:ignoreElements > should handle never',
    { observable: '^!', subscriptions: new Map([['e1subs', '^!']]) },
  ],
  [
    'spec/observables/concat-spec.ts:99:static concat > should not complete if first source does not completes',
    { observable: '^!', subscriptions: new Map([['e1subs', '^!']]) },
  ],
  [
    'spec/observables/concat-spec.ts:113:static concat > should not complete if second source does not completes',
    { observable: '^--!', subscriptions: new Map([['e2subs', '--^!']]) },
  ],
  [
    'spec/observables/concat-spec.ts:127:static concat > should not complete if both sources do not complete',
    { observable: '^!', subscriptions: new Map([['e1subs', '^!']]) },
  ],
  [
    "spec/observables/concat-spec.ts:211:static concat > 'should emit element from first source, and should not complete if second ' + 'source does not completes'",
    { observable: '^-----!', subscriptions: new Map([['e2subs', '-----^!']]) },
  ],
  [
    'spec/observables/concat-spec.ts:225:static concat > should not complete if first source does not complete',
    { observable: '^!', subscriptions: new Map([['e1subs', '^!']]) },
  ],
  [
    'spec/observables/race-spec.ts:220:race > handle never',
    { observable: '^!', subscriptions: new Map([['e1subs', '^!']]) },
  ],
  [
    'spec/operators/concatMapTo-spec.ts:114:concatMapTo > should handle a never source',
    { observable: '^!', subscriptions: new Map([['e1subs', '^!']]) },
  ],
  [
    'spec/operators/concatMapTo-spec.ts:167:concatMapTo > should return a never if the mapped inner is never',
    { observable: '^---------!', subscriptions: new Map([['innerSubs', '--^-------!']]) },
  ],
  [
    'spec/operators/concatMapTo-spec.ts:221:concatMapTo > should concatMapTo many outer to many inner, outer never completes',
    {
      observable: '^------------------------------------------------!',
      subscriptions: new Map([['e1subs', '^------------------------------------------------!']]),
    },
  ],
  [
    'spec/operators/concatMapTo-spec.ts:269:concatMapTo > should concatMapTo many outer to many inner, inner never completes',
    { observable: '^-----------------!', subscriptions: new Map([['innerSubs', '-^----------------!']]) },
  ],
  [
    'spec/operators/elementAt-spec.ts:92:elementAt > should not complete if source never completes',
    { observable: '^!', subscriptions: new Map([['e1subs', '^!']]) },
  ],
  [
    'spec/operators/first-spec.ts:95:first > should go on forever on never',
    { observable: '^-------!', subscriptions: new Map([['e1subs', '^-------!']]) },
  ],
  [
    'spec/operators/last-spec.ts:47:last > should go on forever on never',
    { observable: '^!', subscriptions: new Map([['e1subs', '^!']]) },
  ],
  [
    'spec/operators/repeat-spec.ts:178:repeat operator > should not complete when source never completes',
    { observable: '^!', subscriptions: new Map([['e1subs', '^!']]) },
  ],
  [
    'spec/operators/repeat-spec.ts:223:repeat operator > should emit source once and does not complete when source emits but does not complete',
    { observable: '^-------!', subscriptions: new Map([['subs', new Map([[0, '^-------!']])]]) },
  ],
  [
    'spec/operators/scan-spec.ts:171:scan > handle never',
    { observable: '^!', subscriptions: new Map([['e1subs', '^!']]) },
  ],
  [
    'spec/operators/sequenceEqual-spec.ts:129:sequenceEqual > should never return if source is a never',
    { observable: '^-----------!' },
  ],
  [
    'spec/operators/sequenceEqual-spec.ts:141:sequenceEqual > should never return if compareTo is a never',
    { observable: '^-----------!' },
  ],
  [
    'spec/operators/sequenceEqual-spec.ts:185:sequenceEqual > should return never if compareTo is empty and source is never',
    { observable: '^!' },
  ],
  [
    'spec/operators/sequenceEqual-spec.ts:197:sequenceEqual > should return never if source is empty and compareTo is never',
    { observable: '^!' },
  ],
  [
    'spec/operators/skipWhile-spec.ts:88:skipWhile > should skip elements on hot source',
    { observable: '^-------------------!', subscriptions: new Map([['sourceSubs', '^-------------------!']]) },
  ],
  [
    'spec/operators/skipWhile-spec.ts:243:skipWhile > should handle Observable.never',
    { observable: '^!', subscriptions: new Map([['subs', '^!']]) },
  ],
  [
    'spec/operators/takeWhile-spec.ts:119:takeWhile > should take elements with predicate when source does not complete',
    { observable: '^-------------!', subscriptions: new Map([['e1subs', '^-------------!']]) },
  ],
  [
    'spec/operators/takeWhile-spec.ts:132:takeWhile > should not complete when source never completes',
    { observable: '^!', subscriptions: new Map([['e1subs', '^!']]) },
  ],
  [
    'spec/operators/mergeAll-spec.ts:247:mergeAll > should merge never and empty',
    { observable: '^--------!', subscriptions: new Map([['xsubs', '--^------!']]) },
  ],
  [
    'spec/operators/mergeAll-spec.ts:264:mergeAll > should merge never and never',
    {
      observable: '^--------!',
      subscriptions: new Map([
        ['xsubs', '--^------!'],
        ['ysubs', '-----^---!'],
      ]),
    },
  ],
  [
    'spec/operators/mergeAll-spec.ts:360:mergeAll > should take a never source and return never too',
    { observable: '^!', subscriptions: new Map([['e1subs', '^!']]) },
  ],
  [
    'spec/operators/onErrorResumeNext-spec.ts:127:onErrorResumeNext > should not complete with observable that does not complete',
    { observable: '^---------!', subscriptions: new Map([['e2subs', '--------^-!']]) },
  ],
  [
    'spec/operators/onErrorResumeNext-spec.ts:141:onErrorResumeNext > should not continue when source observable does not complete',
    { observable: '^----!', subscriptions: new Map([['e1subs', '^----!']]) },
  ],
  [
    'spec/operators/skipLast-spec.ts:92:skipLast operator > should go on forever on never',
    { observable: '^!', subscriptions: new Map([['e1subs', '^!']]) },
  ],
  [
    'spec/operators/switchAll-spec.ts:144:switchAll > should handle a hot observable of observables, inner never completes',
    {
      observable: '^-----------------------------!',
      subscriptions: new Map([['ysubs', '--------------^---------------!']]),
    },
  ],
  [
    'spec/operators/switchAll-spec.ts:225:switchAll > should handle a never hot observable',
    { observable: '^!', subscriptions: new Map([['e1subs', '^!']]) },
  ],
  [
    'spec/operators/switchMapTo-spec.ts:184:switchMapTo > should switch to an inner cold observable, inner never completes',
    {
      observable: '^----------------------------------!',
      subscriptions: new Map([['xsubs', new Map([[1, '-------------------^---------------!']])]]),
    },
  ],
  [
    'spec/operators/switchMapTo-spec.ts:270:switchMapTo > should switch to an inner never',
    {
      observable: '^-----------------------------!',
      subscriptions: new Map([['xsubs', new Map([[1, '-------------------^----------!']])]]),
    },
  ],
  [
    'spec/operators/switchMapTo-spec.ts:313:switchMapTo > should handle a never outer',
    { observable: '^!', subscriptions: new Map([['e1subs', '^!']]) },
  ],
  [
    'spec/operators/takeLast-spec.ts:91:takeLast operator > should go on forever on never',
    { observable: '^!', subscriptions: new Map([['e1subs', '^!']]) },
  ],
  [
    'spec/operators/toArray-spec.ts:25:toArray > should be never when source is never',
    { observable: '^!', subscriptions: new Map([['e1subs', '^!']]) },
  ],
  [
    "spec/operators/toArray-spec.ts:47:toArray > should be never when source doesn't complete",
    { observable: '^-----!', subscriptions: new Map([['e1subs', '^-----!']]) },
  ],
]);
const modeAwareSubscriptionExpectations = new Map([
  [
    'spec/operators/toArray-spec.ts:80:toArray > should allow multiple subscriptions',
    new Map([['e1', 1]]),
  ],
]);

const cases = [];
for (const path of sourcePaths) {
  const sourceText = execGit(['show', `${sourceRef}:${path}`]);
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
  const dynamicOperatorLocals = collectOperatorLocals({ callback: sourceFile, importMap, support: [] });
  const dynamicImportMap = importMap.map((item) => ({
    ...item,
    usage: item.module === 'rxjs/operators' || dynamicOperatorLocals.has(item.local) ? 'operator' : 'value',
  }));
  const extracted = [];
  const rootSupport = collectSupport(sourceFile.statements);

  visitStatements(sourceFile.statements, [], rootSupport.included, rootSupport.excludedNames);
  const extractedLocations = new Set(extracted.map((testCase) => `${testCase.source.line}:${testCase.source.title}`));
  collectNestedCases(sourceFile);
  return extracted;

  function collectNestedCases(node) {
    if (ts.isCallExpression(node) && ['it', 'test', 'specify'].includes(getCallName(node.expression))) {
      const originalSource = node.getText(sourceFile);
      const title = readTitle(node.arguments[0], sourceFile) ?? `test at line ${lineOf(node, sourceFile)}`;
      const location = `${lineOf(node, sourceFile)}:${title}`;
      if (!extractedLocations.has(location) && shouldInventoryCase(path, originalSource)) {
        for (const variant of getDynamicVariants({ path, node, sourceFile, fallbackTitle: title })) {
          const callback = node.arguments[1];
          const reviewFlags = [...detectReviewFlags(originalSource), 'dynamic-test-declaration', `dynamic-variant:${variant.key}`];
          if (isSkippedCall(node.expression)) {
            reviewFlags.push('source-skipped');
          }
          const id = `${path}:${lineOf(node, sourceFile)}:${variant.title} [${variant.key}]`;
          const dynamicMigration =
            callback && isFunction(callback)
              ? buildDynamicMigratedProgram({
                  sourceText,
                  sourceFile,
                  targetCall: node,
                  imports: dynamicImportMap,
                  variant,
                })
              : null;
          const usedImports = dynamicMigration?.imports ?? [];
          const availability = assessAvailability(usedImports);
          const genuinelySchedulerInternal = isGenuinelySchedulerInternal({
            path,
            line: lineOf(node, sourceFile),
            blockedSupport: [],
          });
          let classification;
          let disposition;
          let reason;
          if (!callback || !isFunction(callback)) {
            classification = 'unsupported-or-obsolete';
            disposition = 'unsupported-or-obsolete';
            reason = 'The dynamically declared source test has no migratable callback body.';
          } else if (genuinelySchedulerInternal) {
            classification = 'unsupported-or-obsolete';
            disposition = 'unsupported-or-obsolete';
            reason = 'The parameterized case asserts TestScheduler parser or queue internals rather than Observable behavior.';
          } else if (availability.missing.length > 0 || availability.external.length > 0) {
            classification = 'harness-rewrite';
            disposition = 'missing-api';
            reason = `Required runtime capabilities are unavailable: ${[...availability.missing, ...availability.external].join(', ')}.`;
          } else {
            classification = 'harness-rewrite';
            disposition = 'expected-failure';
            reason = reviewFlags.includes('source-skipped')
              ? 'The source case was skipped in RxJS 7; its parameterized declaration is mechanically preserved as ' +
                'executable parity evidence.'
              : `Parameterized variant ${variant.key} is mechanically expanded and retained as failing parity evidence.`;
          }
          extracted.push({
            id,
            source: {
              ref: sourceRef,
              commit: sourceCommit,
              path,
              line: lineOf(node, sourceFile),
              suite: [],
              title: variant.title,
            },
            behavioralClaim: variant.title,
            classification,
            disposition,
            modes: ['cold', 'polyfill', 'native'],
            reason,
            duplicateOf: null,
            imports: usedImports,
            helpers: helperNames.filter((helper) => new RegExp(`\\b${helper}\\s*\\(`).test(originalSource)),
            reviewFlags,
            migratedProgram: dynamicMigration?.program ?? buildUnavailableProgram(reason),
            originalSource,
            fingerprint: createHash('sha256')
              .update(`${normalizeCase(originalSource)}\nvariant:${variant.key}`)
              .digest('hex'),
          });
        }
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
      if (!shouldInventoryCase(path, originalSource)) {
        continue;
      }

      const title = readTitle(call.arguments[0], sourceFile) ?? `${callName} at line ${lineOf(call, sourceFile)}`;
      const callback = call.arguments[1];
      const id = `${path}:${lineOf(call, sourceFile)}:${[...suite, title].join(' > ')}`;
      const runMode = /\.run\s*\(/.test(originalSource);
      const reviewFlags = detectReviewFlags(originalSource);
      if (isSkippedCall(call.expression)) {
        reviewFlags.push('source-skipped');
      }
      const blockedSupport = inheritedExcludedNames.filter(
        (name) => !convertibleSchedulerHelpers.has(name) && new RegExp(`\\b${escapeRegExp(name)}\\b`).test(originalSource)
      );
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
      const schedulerInternal = isGenuinelySchedulerInternal({
        path,
        line: lineOf(call, sourceFile),
        blockedSupport,
      });

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
      } else if (schedulerInternal) {
        classification = 'unsupported-or-obsolete';
        disposition = 'unsupported-or-obsolete';
        reason =
          blockedSupport.length > 0
            ? `The case depends on scheduler-bound parser or notification state: ${blockedSupport.join(', ')}.`
            : 'The case protects TestScheduler parser or queue internals rather than an Observable behavior.';
        modes = ['cold', 'polyfill', 'native'];
        migratedProgram = buildMigratedProgram({
          caseId: id,
          callback,
          imports: usedImports,
          sourceFile,
          support: inheritedSupport,
          wrapManualHelpers: !runMode,
        });
      } else if (availability.missing.length > 0) {
        classification = 'compatibility-only';
        disposition = 'missing-api';
        reason = `Required runtime capabilities are unavailable: ${availability.missing.join(', ')}.`;
        modes = ['cold', 'polyfill', 'native'];
        migratedProgram = buildMigratedProgram({
          caseId: id,
          callback,
          imports: usedImports,
          sourceFile,
          support: inheritedSupport,
          wrapManualHelpers: !runMode,
        });
      } else if (availability.external.length > 0) {
        classification = 'harness-rewrite';
        disposition = 'missing-api';
        reason = `Required external test capabilities are unavailable: ${availability.external.join(', ')}.`;
        modes = ['cold', 'polyfill', 'native'];
        migratedProgram = buildMigratedProgram({
          caseId: id,
          callback,
          imports: usedImports,
          sourceFile,
          support: inheritedSupport,
          wrapManualHelpers: !runMode,
        });
      } else {
        classification = reviewFlags.includes('multiple-observers') || !runMode ? 'harness-rewrite' : 'portable';
        const verifiedActive =
          !reviewFlags.includes('source-skipped') &&
          isVerifiedColdPass({
            id,
            location: `${path}:${lineOf(call, sourceFile)}`,
          });
        disposition = verifiedActive ? 'active' : 'expected-failure';
        reason = reviewFlags.includes('source-skipped')
          ? 'The source case was skipped in RxJS 7; it is mechanically migrated as failing executable parity evidence.'
          : verifiedActive
            ? 'Mechanically migrated and verified against the ColdObservable mode.'
            : 'Mechanically migrated; ColdObservable verification failed and production behavior is unchanged.';
        modes = ['cold', 'polyfill', 'native'];
        migratedProgram = buildMigratedProgram({
          caseId: id,
          callback,
          imports: usedImports,
          sourceFile,
          support: inheritedSupport,
          wrapManualHelpers: !runMode,
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

function buildMigratedProgram({ caseId, callback, imports, sourceFile, support, wrapManualHelpers = false }) {
  const supportSource = support.map((statement) => statement.getText(sourceFile)).join('\n');
  const helperPrelude = buildInlineHelperPrelude(imports);
  const callbackBody = ts.isBlock(callback.body)
    ? callback.body.statements.map((statement) => statement.getText(sourceFile)).join('\n')
    : `return ${callback.body.getText(sourceFile)};`;
  const manualContext =
    '{ cold: __rxCold, hot: __rxHot, time: __rxTime, expectObservable: __rxExpectObservable, ' +
    'expectSubscriptions: __rxExpectSubscriptions, animate: __rxAnimate, flush: __rxFlush, ' +
    'now: __rxNow, schedule: __rxSchedule }';
  const migratedBody = wrapManualHelpers
    ? `await rxTest(async (${manualContext}) => {\n${rewriteManualHelperCalls(callbackBody)}\n});`
    : callbackBody;
  const input = `async function migrated(runtime) {\n${helperPrelude}\n${supportSource}\n${migratedBody}\n}`;
  return transpileMigratedProgram(
    input,
    imports,
    [],
    true,
    observationBoundaries.get(caseId),
    modeAwareSubscriptionExpectations.get(caseId)
  );
}

function rewriteManualHelperCalls(source) {
  const aliases = {
    animate: '__rxAnimate',
    cold: '__rxCold',
    expectObservable: '__rxExpectObservable',
    expectSubscriptions: '__rxExpectSubscriptions',
    hot: '__rxHot',
    time: '__rxTime',
  };
  return source.replace(
    /\b(animate|cold|expectObservable|expectSubscriptions|hot|time)\s*\(/g,
    (_, name) => `${aliases[name]}(`
  );
}

function buildDynamicMigratedProgram({ sourceText, sourceFile, targetCall, imports, variant }) {
  const expressionStart = targetCall.expression.getStart(sourceFile);
  const expressionEnd = targetCall.expression.end;
  const taggedSource = `${sourceText.slice(0, expressionStart)}__targetIt${sourceText.slice(expressionEnd)}`;
  const executableSource = maskImports(taggedSource);
  const helperPrelude = buildInlineHelperPrelude(imports);
  const input = `async function migrated(runtime) {
${helperPrelude}
const __dynamicTasks = [];
${executableSource}
await Promise.all(__dynamicTasks);
}`;
  const dynamicTransformer = createDynamicExecutionTransformer(variant);
  const transformed = transpileMigratedProgram(input, imports, [dynamicTransformer], false);
  const usedImports = imports.filter(
    (imported) =>
      isInlineTestHelper(imported) ||
      new RegExp(`\\b${escapeRegExp(imported.local)}\\b`).test(transformed)
  );
  return {
    imports: usedImports,
    program: transpileMigratedProgram(input, usedImports, [dynamicTransformer]),
  };
}

function getDynamicVariants({ path, node, sourceFile, fallbackTitle }) {
  if (path === 'spec/operators/share-spec.ts') {
    const loop = findAncestor(node, ts.isForOfStatement);
    if (loop && ts.isArrayLiteralExpression(loop.expression) && ts.isVariableDeclarationList(loop.initializer)) {
      const binding = loop.initializer.declarations[0]?.name;
      if (binding && ts.isObjectBindingPattern(binding)) {
        const titleBinding = binding.elements.find(
          (element) => ts.isIdentifier(element.name) && element.name.text === 'title'
        );
        if (titleBinding) {
          return loop.expression.elements.map((element, index) => {
            const title = readObjectStringProperty(element, 'title') ?? `share configuration ${index}`;
            return {
              key: `share-config-${index}:${title}`,
              binding: 'title',
              value: title,
              title: `${stripTemplateQuotes(fallbackTitle)} [${title}]`,
            };
          });
        }
      }
    }
  }

  if (path === 'spec/operators/buffer-spec.ts') {
    const forEachCall = findAncestor(
      node,
      (candidate) =>
        ts.isCallExpression(candidate) &&
        ts.isPropertyAccessExpression(candidate.expression) &&
        candidate.expression.name.text === 'forEach'
    );
    if (forEachCall && ts.isCallExpression(forEachCall)) {
      const callback = forEachCall.arguments[0];
      const indexBinding =
        callback && isFunction(callback) && callback.parameters[1] && ts.isIdentifier(callback.parameters[1].name)
          ? callback.parameters[1].name.text
          : 'index';
      const collectionName =
        ts.isPropertyAccessExpression(forEachCall.expression) && ts.isIdentifier(forEachCall.expression.expression)
          ? forEachCall.expression.expression.text
          : null;
      const collection = collectionName ? findArrayDeclaration(sourceFile, collectionName) : null;
      if (collection) {
        return collection.elements.map((_, index) => ({
          key: `buffer-case-${index}`,
          binding: indexBinding,
          value: index,
          title: formatTemplateTitle(fallbackTitle, indexBinding, index),
        }));
      }
    }
  }

  if (path === 'spec/deprecation-equivalents/multicasting-deprecations-spec.ts') {
    const declaration = findAncestor(
      node,
      (candidate) => ts.isFunctionDeclaration(candidate) && candidate.name?.text === 'testEquivalents'
    );
    if (declaration && ts.isFunctionDeclaration(declaration)) {
      const nameBinding =
        declaration.parameters[0] && ts.isIdentifier(declaration.parameters[0].name)
          ? declaration.parameters[0].name.text
          : 'name';
      const values = [];
      const visit = (candidate) => {
        if (
          ts.isCallExpression(candidate) &&
          ts.isIdentifier(candidate.expression) &&
          candidate.expression.text === 'testEquivalents' &&
          candidate.arguments[0] &&
          ts.isStringLiteralLike(candidate.arguments[0])
        ) {
          values.push(candidate.arguments[0].text);
        }
        ts.forEachChild(candidate, visit);
      };
      visit(sourceFile);
      return values.map((value, index) => ({
        key: `equivalence-${index}:${value}`,
        binding: nameBinding,
        value,
        title: formatTemplateTitle(fallbackTitle, nameBinding, value),
      }));
    }
  }

  return [
    {
      key: 'declaration',
      binding: null,
      value: null,
      title: stripTemplateQuotes(fallbackTitle),
    },
  ];
}

function findAncestor(node, predicate) {
  let current = node.parent;
  while (current) {
    if (predicate(current)) {
      return current;
    }
    current = current.parent;
  }
  return null;
}

function readObjectStringProperty(node, propertyName) {
  if (!ts.isObjectLiteralExpression(node)) {
    return null;
  }
  for (const property of node.properties) {
    if (
      ts.isPropertyAssignment(property) &&
      ((ts.isIdentifier(property.name) && property.name.text === propertyName) ||
        (ts.isStringLiteralLike(property.name) && property.name.text === propertyName)) &&
      ts.isStringLiteralLike(property.initializer)
    ) {
      return property.initializer.text;
    }
  }
  return null;
}

function findArrayDeclaration(sourceFile, name) {
  let result = null;
  const visit = (node) => {
    if (
      !result &&
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === name &&
      node.initializer &&
      ts.isArrayLiteralExpression(node.initializer)
    ) {
      result = node.initializer;
      return;
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return result;
}

function formatTemplateTitle(title, binding, value) {
  return stripTemplateQuotes(title).replace(`\${${binding}}`, String(value));
}

function stripTemplateQuotes(title) {
  return title.replace(/^`|`$/g, '');
}

function transpileMigratedProgram(
  input,
  imports,
  extraTransformers = [],
  injectRuntime = true,
  observationBoundary,
  modeAwareSubscriptionExpectation
) {
  const standalonePipeLocals = new Set(
    imports.filter((item) => item.module === 'rxjs' && item.imported === 'pipe').map((item) => item.local)
  );
  const operatorLocals = new Set(imports.filter((item) => item.usage === 'operator').map((item) => item.local));
  const transformed = ts.transpileModule(input, {
    compilerOptions: {
      module: ts.ModuleKind.None,
      target: ts.ScriptTarget.ES2022,
    },
    transformers: {
      before: [
        ...extraTransformers,
        createMigrationTransformer({
          standalonePipeLocals,
          operatorLocals,
          observationBoundary,
          modeAwareSubscriptionExpectation,
        }),
      ],
    },
  }).outputText;

  const usedRuntimeNames = ['rxTest', 'applyOperators'];
  for (const imported of imports) {
    if (!isInlineTestHelper(imported) && new RegExp(`\\b${escapeRegExp(imported.local)}\\b`).test(transformed)) {
      usedRuntimeNames.push(imported.local);
    }
  }
  if (/\bexpect\s*\(/.test(transformed) && !usedRuntimeNames.includes('expect')) {
    usedRuntimeNames.push('expect');
  }
  if (/\b__rxPortMode\b/.test(transformed)) {
    usedRuntimeNames.push('__rxPortMode');
  }

  if (!injectRuntime) {
    return transformed;
  }
  return transformed.replace(
    /async function migrated\(runtime\) \{/,
    `async function migrated(runtime) {\nconst { ${[...new Set(usedRuntimeNames)].join(', ')} } = runtime;`
  );
}

function createDynamicExecutionTransformer(variant) {
  return (context) => {
    const { factory } = context;

  function containsTarget(node) {
    if (ts.isIdentifier(node) && node.text === '__targetIt') {
      return true;
    }
    let found = false;
    ts.forEachChild(node, (child) => {
      if (!found && containsTarget(child)) {
        found = true;
      }
    });
    return found;
  }

  function visit(node) {
    if (ts.isCallExpression(node)) {
      if (ts.isIdentifier(node.expression) && node.expression.text === '__targetIt') {
        const callback = node.arguments[1];
        if (!callback || !isFunction(callback)) {
          return factory.createVoidZero();
        }
        const asyncCallback = ensureAsyncFunction(ts.visitNode(callback, visit), factory);
        const invocation = factory.createCallExpression(
          factory.createParenthesizedExpression(asyncCallback),
          undefined,
          []
        );
        const registration = factory.createCallExpression(
          factory.createPropertyAccessExpression(factory.createIdentifier('__dynamicTasks'), 'push'),
          undefined,
          [invocation]
        );
        if (!variant.binding) {
          return registration;
        }
        return factory.createConditionalExpression(
          factory.createBinaryExpression(
            factory.createIdentifier(variant.binding),
            ts.SyntaxKind.EqualsEqualsEqualsToken,
            typeof variant.value === 'number'
              ? factory.createNumericLiteral(variant.value)
              : factory.createStringLiteral(variant.value)
          ),
          factory.createToken(ts.SyntaxKind.QuestionToken),
          registration,
          factory.createToken(ts.SyntaxKind.ColonToken),
          factory.createVoidZero()
        );
      }

      const callName = getCallName(node.expression);
      if (['it', 'test', 'specify'].includes(callName)) {
        return factory.createVoidZero();
      }
      if (callName === 'describe') {
        if (!containsTarget(node)) {
          return factory.createVoidZero();
        }
        const callback = node.arguments[1];
        if (!callback || !isFunction(callback)) {
          return factory.createVoidZero();
        }
        return factory.createCallExpression(
          factory.createParenthesizedExpression(ts.visitNode(callback, visit)),
          undefined,
          []
        );
      }
      if (['beforeEach', 'afterEach', 'beforeAll', 'afterAll'].includes(callName)) {
        return factory.createVoidZero();
      }
    }
    return ts.visitEachChild(node, visit, context);
  }

    return (sourceFileNode) => ts.visitNode(sourceFileNode, visit);
  };
}

function replaceSubscriptionBoundary(initializer, replacement, factory) {
  if (typeof replacement === 'string' && initializer && ts.isStringLiteralLike(initializer)) {
    return factory.createStringLiteral(replacement);
  }
  if (replacement instanceof Map && initializer && ts.isArrayLiteralExpression(initializer)) {
    return factory.updateArrayLiteralExpression(
      initializer,
      initializer.elements.map((element, index) => {
        const elementReplacement = replacement.get(index);
        return typeof elementReplacement === 'string' && ts.isStringLiteralLike(element)
          ? factory.createStringLiteral(elementReplacement)
          : element;
      })
    );
  }
  return initializer;
}

function getModeAwareSubscriptionTarget(node) {
  if (
    !ts.isPropertyAccessExpression(node.expression) ||
    node.expression.name.text !== 'toBe' ||
    !ts.isCallExpression(node.expression.expression)
  ) {
    return undefined;
  }
  const expectation = node.expression.expression;
  const source = expectation.arguments[0];
  return ts.isIdentifier(expectation.expression) &&
    expectation.expression.text === 'expectSubscriptions' &&
    source &&
    ts.isPropertyAccessExpression(source) &&
    source.name.text === 'subscriptions' &&
    ts.isIdentifier(source.expression)
    ? source.expression.text
    : undefined;
}

function createMigrationTransformer({
  standalonePipeLocals,
  operatorLocals,
  observationBoundary,
  modeAwareSubscriptionExpectation,
}) {
  return (context) => {
    const { factory } = context;
    const operatorBindings = new Set();
    const composedOperatorBindings = new Set();
    let awaitAllowed = false;

    function visit(node) {
      if (ts.isFunctionLike(node)) {
        const previousAwaitAllowed = awaitAllowed;
        awaitAllowed = node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.AsyncKeyword) ?? false;
        const visited = ts.visitEachChild(node, visit, context);
        awaitAllowed = previousAwaitAllowed;
        return visited;
      }

      if (ts.isVariableStatement(node)) {
        const retained = [];
        for (const declaration of node.declarationList.declarations) {
          if (
            (declaration.initializer && isTestSchedulerConstruction(declaration.initializer)) ||
            (ts.isIdentifier(declaration.name) &&
              isSchedulerReceiver(declaration.name) &&
              (!declaration.initializer || declaration.type?.getText().includes('TestScheduler')))
          ) {
            continue;
          }
          if (
            ts.isIdentifier(declaration.name) &&
            declaration.initializer &&
            ts.isCallExpression(declaration.initializer) &&
            ts.isIdentifier(declaration.initializer.expression)
          ) {
            if (standalonePipeLocals.has(declaration.initializer.expression.text)) {
              composedOperatorBindings.add(declaration.name.text);
            } else if (operatorLocals.has(declaration.initializer.expression.text)) {
              operatorBindings.add(declaration.name.text);
            }
          }
          const subscriptionBoundary =
            ts.isIdentifier(declaration.name) && observationBoundary?.subscriptions?.get(declaration.name.text);
          const retainedInitializer = replaceSubscriptionBoundary(
            declaration.initializer,
            subscriptionBoundary,
            factory
          );
          const retainedDeclaration =
            retainedInitializer !== declaration.initializer
              ? factory.updateVariableDeclaration(
                  declaration,
                  declaration.name,
                  declaration.exclamationToken,
                  declaration.type,
                  retainedInitializer
                )
              : declaration;
          retained.push(ts.visitEachChild(retainedDeclaration, visit, context));
        }
        if (retained.length === 0) {
          return factory.createEmptyStatement();
        }
        return factory.updateVariableStatement(
          node,
          node.modifiers,
          factory.updateVariableDeclarationList(node.declarationList, retained)
        );
      }

      if (
        ts.isExpressionStatement(node) &&
        ts.isBinaryExpression(node.expression) &&
        node.expression.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
        ts.isPropertyAccessExpression(node.expression.left) &&
        isSchedulerReceiver(node.expression.left.expression) &&
        node.expression.left.name.text === 'maxFrames'
      ) {
        return factory.createEmptyStatement();
      }

      if (ts.isCallExpression(node)) {
        const modeAwareTarget = modeAwareSubscriptionExpectation && getModeAwareSubscriptionTarget(node);
        const platformSubscriptionCount =
          modeAwareTarget && modeAwareSubscriptionExpectation.get(modeAwareTarget);
        const coldSubscriptionExpectation = node.arguments[0];
        if (
          platformSubscriptionCount !== undefined &&
          coldSubscriptionExpectation &&
          ts.isArrayLiteralExpression(coldSubscriptionExpectation)
        ) {
          const visitedColdExpectation = ts.visitEachChild(coldSubscriptionExpectation, visit, context);
          const platformExpectation = factory.updateArrayLiteralExpression(
            visitedColdExpectation,
            visitedColdExpectation.elements.slice(0, platformSubscriptionCount)
          );
          return factory.updateCallExpression(
            node,
            ts.visitNode(node.expression, visit),
            node.typeArguments,
            [
              factory.createConditionalExpression(
                factory.createBinaryExpression(
                  factory.createIdentifier('__rxPortMode'),
                  ts.SyntaxKind.EqualsEqualsEqualsToken,
                  factory.createStringLiteral('cold')
                ),
                factory.createToken(ts.SyntaxKind.QuestionToken),
                visitedColdExpectation,
                factory.createToken(ts.SyntaxKind.ColonToken),
                platformExpectation
              ),
              ...node.arguments.slice(1).map((argument) => ts.visitNode(argument, visit)),
            ]
          );
        }
        if (
          observationBoundary &&
          ts.isIdentifier(node.expression) &&
          node.expression.text === 'expectObservable' &&
          node.arguments.length === 1
        ) {
          return factory.updateCallExpression(
            node,
            node.expression,
            node.typeArguments,
            [
              ...node.arguments.map((argument) => ts.visitNode(argument, visit)),
              factory.createStringLiteral(observationBoundary.observable),
            ]
          );
        }
        const expectedThrowCallback = getExpectedThrowCallback(node);
        if (expectedThrowCallback && containsSchedulerRun(expectedThrowCallback)) {
          const asyncCallback = ensureAsyncFunction(expectedThrowCallback, factory);
          const visitedCallback = ts.visitNode(asyncCallback, visit);
          const assertion = createAsyncRejectionAssertion(visitedCallback, factory);
          return awaitAllowed ? factory.createAwaitExpression(assertion) : assertion;
        }
        if (
          ts.isIdentifier(node.expression) &&
          ['__rxExpectObservable', '__rxExpectSubscriptions'].includes(node.expression.text) &&
          isMatcherMethodIntrospection(node)
        ) {
          return createCompletedMatcherIntrospection(node, node.expression.text, factory, visit);
        }
        if (ts.isPropertyAccessExpression(node.expression) && node.expression.name.text === 'run' && node.arguments.length > 0) {
          const asyncCallback = ensureAsyncFunction(node.arguments[0], factory);
          const visitedCallback = ts.visitNode(asyncCallback, visit);
          const callback = ensureContextHelpers(visitedCallback, factory);
          const invocation = factory.createCallExpression(factory.createIdentifier('rxTest'), undefined, [callback]);
          return awaitAllowed ? factory.createAwaitExpression(invocation) : invocation;
        }
        if (ts.isIdentifier(node.expression) && node.expression.text === 'flush') {
          const invocation = ts.visitEachChild(node, visit, context);
          return awaitAllowed ? factory.createAwaitExpression(invocation) : invocation;
        }
        if (ts.isPropertyAccessExpression(node.expression) && isSchedulerReceiver(node.expression.expression)) {
          const method = node.expression.name.text;
          if (method === 'flush') {
            const invocation = factory.createCallExpression(factory.createIdentifier('__rxFlush'), undefined, []);
            return awaitAllowed ? factory.createAwaitExpression(invocation) : invocation;
          }
          if (method === 'now') {
            return factory.createCallExpression(factory.createIdentifier('__rxNow'), undefined, []);
          }
          if (method === 'schedule') {
            return factory.createCallExpression(
              factory.createIdentifier('__rxSchedule'),
              undefined,
              node.arguments.map((argument) => ts.visitNode(argument, visit))
            );
          }
          if (method === 'createColdObservable' || method === 'createHotObservable') {
            return factory.createCallExpression(
              factory.createIdentifier(method === 'createColdObservable' ? '__rxCold' : '__rxHot'),
              undefined,
              node.arguments.map((argument) => ts.visitNode(argument, visit))
            );
          }
          if (method === 'createTime') {
            return factory.createCallExpression(
              factory.createIdentifier('__rxTime'),
              undefined,
              node.arguments.map((argument) => ts.visitNode(argument, visit))
            );
          }
        }
        if (
          ts.isPropertyAccessExpression(node.expression) &&
          ts.isIdentifier(node.expression.expression) &&
          node.expression.expression.text === 'TestScheduler' &&
          node.expression.name.text === 'parseMarblesAsSubscriptions'
        ) {
          return createSubscriptionFrameRecord(node.arguments, factory, visit);
        }
        if (ts.isIdentifier(node.expression) && node.expression.text === 'expectObservableArray') {
          return createExpectObservableArrayCall(node.arguments, factory, visit);
        }
        if (ts.isIdentifier(node.expression) && node.expression.text === 'getTimerSelector') {
          const delay = node.arguments[0] ? ts.visitNode(node.arguments[0], visit) : factory.createNumericLiteral(0);
          return factory.createArrowFunction(
            undefined,
            undefined,
            [],
            undefined,
            factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
            factory.createCallExpression(factory.createIdentifier('timer'), undefined, [delay])
          );
        }
        if (ts.isIdentifier(node.expression) && standalonePipeLocals.has(node.expression.text)) {
          const operators = node.arguments.map((argument) => ts.visitNode(argument, visit));
          return createComposedOperatorFunction(operators, factory);
        }
        if (
          ts.isCallExpression(node.expression) &&
          ts.isIdentifier(node.expression.expression) &&
          operatorLocals.has(node.expression.expression.text)
        ) {
          const descriptor = ts.visitNode(node.expression, visit);
          const source = node.arguments[0] ? ts.visitNode(node.arguments[0], visit) : factory.createIdentifier('undefined');
          return createApplyOperatorsCall(source, [descriptor], factory);
        }
        if (ts.isIdentifier(node.expression) && operatorBindings.has(node.expression.text) && node.arguments.length > 0) {
          return createApplyOperatorsCall(
            ts.visitNode(node.arguments[0], visit),
            [factory.createIdentifier(node.expression.text)],
            factory
          );
        }
        if (ts.isPropertyAccessExpression(node.expression) && node.expression.name.text === 'pipe') {
          let source = ts.visitNode(node.expression.expression, visit);
          let pendingDescriptors = [];
          for (const argument of node.arguments) {
            const visited = ts.visitNode(argument, visit);
            if (ts.isIdentifier(visited) && composedOperatorBindings.has(visited.text)) {
              if (pendingDescriptors.length > 0) {
                source = createApplyOperatorsCall(source, pendingDescriptors, factory);
                pendingDescriptors = [];
              }
              source = factory.createCallExpression(visited, undefined, [source]);
            } else {
              pendingDescriptors.push(visited);
            }
          }
          return pendingDescriptors.length > 0 ? createApplyOperatorsCall(source, pendingDescriptors, factory) : source;
        }
      }
      if (
        ts.isPropertyAccessExpression(node) &&
        isSchedulerReceiver(node.expression) &&
        node.name.text === 'frame'
      ) {
        return factory.createCallExpression(factory.createIdentifier('__rxNow'), undefined, []);
      }
      return ts.visitEachChild(node, visit, context);
    }

    return (sourceFileNode) => ts.visitNode(sourceFileNode, visit);
  };
}

function getExpectedThrowCallback(node) {
  if (
    !ts.isCallExpression(node) ||
    !ts.isPropertyAccessExpression(node.expression) ||
    node.expression.name.text !== 'throw'
  ) {
    return null;
  }
  let target = node.expression.expression;
  while (ts.isPropertyAccessExpression(target)) {
    target = target.expression;
  }
  if (
    !ts.isCallExpression(target) ||
    !ts.isIdentifier(target.expression) ||
    target.expression.text !== 'expect'
  ) {
    return null;
  }
  const callback = target.arguments[0];
  return callback && isFunction(callback) ? callback : null;
}

function containsSchedulerRun(node) {
  let found = false;
  const visit = (candidate) => {
    if (
      ts.isCallExpression(candidate) &&
      ts.isPropertyAccessExpression(candidate.expression) &&
      candidate.expression.name.text === 'run'
    ) {
      found = true;
      return;
    }
    ts.forEachChild(candidate, visit);
  };
  visit(node);
  return found;
}

function createAsyncRejectionAssertion(callback, factory) {
  const rejected = factory.createUniqueName('rejected');
  const callbackCall = factory.createCallExpression(
    factory.createParenthesizedExpression(callback),
    undefined,
    []
  );
  const body = factory.createBlock(
    [
      factory.createVariableStatement(
        undefined,
        factory.createVariableDeclarationList(
          [factory.createVariableDeclaration(rejected, undefined, undefined, factory.createFalse())],
          ts.NodeFlags.Let
        )
      ),
      factory.createTryStatement(
        factory.createBlock(
          [factory.createExpressionStatement(factory.createAwaitExpression(callbackCall))],
          true
        ),
        factory.createCatchClause(
          undefined,
          factory.createBlock(
            [
              factory.createExpressionStatement(
                factory.createAssignment(rejected, factory.createTrue())
              ),
            ],
            true
          )
        ),
        undefined
      ),
      factory.createExpressionStatement(
        factory.createCallExpression(
          factory.createPropertyAccessExpression(
            factory.createCallExpression(factory.createIdentifier('expect'), undefined, [rejected]),
            'equal'
          ),
          undefined,
          [factory.createTrue()]
        )
      ),
    ],
    true
  );
  return factory.createCallExpression(
    factory.createParenthesizedExpression(
      factory.createArrowFunction(
        [factory.createModifier(ts.SyntaxKind.AsyncKeyword)],
        undefined,
        [],
        undefined,
        factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
        body
      )
    ),
    undefined,
    []
  );
}

function isMatcherMethodIntrospection(node) {
  return (
    ts.isPropertyAccessExpression(node.parent) &&
    node.parent.name.text === 'toBe' &&
    ts.isCallExpression(node.parent.parent) &&
    ts.isIdentifier(node.parent.parent.expression) &&
    node.parent.parent.expression.text === 'expect'
  );
}

function createCompletedMatcherIntrospection(node, helperName, factory, visit) {
  const expectation = factory.createUniqueName('expectation');
  const invocation = factory.updateCallExpression(
    node,
    node.expression,
    node.typeArguments,
    node.arguments.map((argument) => ts.visitNode(argument, visit))
  );
  const matcherArguments =
    helperName === '__rxExpectObservable'
      ? [
          factory.createStringLiteral('(a|)'),
          factory.createObjectLiteralExpression(
            [factory.createPropertyAssignment('a', factory.createNumericLiteral(1))],
            false
          ),
        ]
      : [factory.createArrayLiteralExpression()];
  const body = factory.createBlock(
    [
      factory.createExpressionStatement(
        factory.createCallExpression(
          factory.createPropertyAccessExpression(expectation, 'toBe'),
          undefined,
          matcherArguments
        )
      ),
      factory.createReturnStatement(expectation),
    ],
    true
  );
  return factory.createCallExpression(
    factory.createParenthesizedExpression(
      factory.createArrowFunction(
        undefined,
        undefined,
        [factory.createParameterDeclaration(undefined, undefined, expectation)],
        undefined,
        factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
        body
      )
    ),
    undefined,
    [invocation]
  );
}

function ensureContextHelpers(node, factory) {
  if (!isFunction(node)) {
    return node;
  }
  const helperBindings = [
    { property: 'cold', local: '__rxCold' },
    { property: 'hot', local: '__rxHot' },
    { property: 'time', local: '__rxTime' },
    { property: 'expectObservable', local: 'expectObservable' },
    { property: 'flush', local: '__rxFlush' },
    { property: 'now', local: '__rxNow' },
    { property: 'schedule', local: '__rxSchedule' },
  ];
  const firstParameter =
    node.parameters[0] ??
    factory.createParameterDeclaration(
      undefined,
      undefined,
      factory.createObjectBindingPattern(
        helperBindings.map(({ property, local }) =>
          factory.createBindingElement(
            undefined,
            property === local ? undefined : factory.createIdentifier(property),
            factory.createIdentifier(local),
            undefined
          )
        )
      )
    );
  if (!ts.isObjectBindingPattern(firstParameter.name)) {
    return node;
  }
  const existingLocals = new Set(
    firstParameter.name.elements
      .map((element) => (ts.isIdentifier(element.name) ? element.name.text : null))
      .filter(Boolean)
  );
  const additions = helperBindings
    .filter(({ local }) => !existingLocals.has(local))
    .map(({ property, local }) =>
      factory.createBindingElement(
        undefined,
        property === local ? undefined : factory.createIdentifier(property),
        factory.createIdentifier(local),
        undefined
      )
    );
  if (additions.length === 0 && node.parameters.length > 0) {
    return node;
  }
  const parameter = factory.updateParameterDeclaration(
    firstParameter,
    firstParameter.modifiers,
    firstParameter.dotDotDotToken,
    factory.updateObjectBindingPattern(firstParameter.name, [...firstParameter.name.elements, ...additions]),
    firstParameter.questionToken,
    firstParameter.type,
    firstParameter.initializer
  );
  const parameters = [parameter, ...node.parameters.slice(node.parameters.length > 0 ? 1 : 0)];
  if (ts.isArrowFunction(node)) {
    return factory.updateArrowFunction(
      node,
      node.modifiers,
      node.typeParameters,
      parameters,
      node.type,
      node.equalsGreaterThanToken,
      node.body
    );
  }
  return factory.updateFunctionExpression(
    node,
    node.modifiers,
    node.asteriskToken,
    node.name,
    node.typeParameters,
    parameters,
    node.type,
    node.body
  );
}

function createApplyOperatorsCall(source, operators, factory) {
  return factory.createCallExpression(factory.createIdentifier('applyOperators'), undefined, [
    source,
    factory.createArrayLiteralExpression(operators),
  ]);
}

function createComposedOperatorFunction(operators, factory) {
  const source = factory.createUniqueName('source');
  return factory.createArrowFunction(
    undefined,
    undefined,
    [factory.createParameterDeclaration(undefined, undefined, source)],
    undefined,
    factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
    createApplyOperatorsCall(source, operators, factory)
  );
}

function createExpectObservableArrayCall(args, factory, visit) {
  const result = factory.createUniqueName('result');
  const expected = factory.createUniqueName('expected');
  const index = factory.createUniqueName('index');
  const resultArgument = args[0] ? ts.visitNode(args[0], visit) : factory.createArrayLiteralExpression();
  const expectedArgument = args[1] ? ts.visitNode(args[1], visit) : factory.createArrayLiteralExpression();
  const body = factory.createBlock(
    [
      factory.createForStatement(
        factory.createVariableDeclarationList(
          [factory.createVariableDeclaration(index, undefined, undefined, factory.createNumericLiteral(0))],
          ts.NodeFlags.Let
        ),
        factory.createBinaryExpression(
          index,
          ts.SyntaxKind.LessThanToken,
          factory.createPropertyAccessExpression(result, 'length')
        ),
        factory.createPostfixIncrement(index),
        factory.createBlock(
          [
            factory.createExpressionStatement(
              factory.createCallExpression(
                factory.createPropertyAccessExpression(
                  factory.createCallExpression(factory.createIdentifier('expectObservable'), undefined, [
                    factory.createElementAccessExpression(result, index),
                  ]),
                  'toBe'
                ),
                undefined,
                [factory.createElementAccessExpression(expected, index)]
              )
            ),
          ],
          true
        )
      ),
    ],
    true
  );
  return factory.createCallExpression(
    factory.createParenthesizedExpression(
      factory.createArrowFunction(
        undefined,
        undefined,
        [
          factory.createParameterDeclaration(undefined, undefined, result),
          factory.createParameterDeclaration(undefined, undefined, expected),
        ],
        undefined,
        factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
        body
      )
    ),
    undefined,
    [resultArgument, expectedArgument]
  );
}

function createSubscriptionFrameRecord(args, factory, visit) {
  const marbles = args[0] ? ts.visitNode(args[0], visit) : factory.createStringLiteral('');
  const frame = (marker) =>
    factory.createCallExpression(factory.createIdentifier('__subscriptionFrame'), undefined, [
      marbles,
      factory.createStringLiteral(marker),
      factory.createIdentifier('time'),
    ]);
  return factory.createObjectLiteralExpression(
    [
      factory.createPropertyAssignment('subscribedFrame', frame('^')),
      factory.createPropertyAssignment('unsubscribedFrame', frame('!')),
    ],
    false
  );
}

function isSchedulerReceiver(node) {
  return ts.isIdentifier(node) && /(?:testScheduler|rxTest|scheduler)$/i.test(node.text);
}

function isTestSchedulerConstruction(node) {
  return (
    ts.isNewExpression(node) &&
    ts.isIdentifier(node.expression) &&
    node.expression.text === 'TestScheduler'
  );
}

function buildInlineHelperPrelude(imports) {
  const locals = new Map(
    imports
      .filter(isInlineTestHelper)
      .map((item) => [`${item.module}:${item.imported}`, item.local])
  );
  const definitions = [
    `const __subscriptionFrame = (marbles, marker, parseTime) => {
  const markerIndex = marbles.indexOf(marker);
  if (markerIndex < 0) return Infinity;
  const prefix = marbles.slice(0, markerIndex).replace(/[!^]/g, '-');
  return parseTime(prefix + '|');
};`,
  ];
  const noSubscriptions = locals.get('../helpers/test-helper:NO_SUBS');
  if (noSubscriptions) {
    definitions.push(`const ${noSubscriptions} = [];`);
  }
  const lowerCaseObservable = locals.get('../helpers/test-helper:lowerCaseO');
  if (lowerCaseObservable) {
    definitions.push(`const ${lowerCaseObservable} = (...values) => {
  const source = {
    subscribe(observer) {
      const destination = typeof observer === 'function' ? { next: observer } : observer;
      for (const value of values) destination.next?.(value);
      destination.complete?.();
      return { unsubscribe() {} };
    }
  };
  const observableKey = Symbol.observable ?? '@@observable';
  source[observableKey] = function () { return this; };
  return source;
};`);
  }
  const interopObservable = locals.get('../helpers/interop-helper:asInteropObservable');
  if (interopObservable) {
    definitions.push(`const ${interopObservable} = (source) => new Proxy(source, {
  get(target, key) {
    if (key === 'subscribe') {
      return (...args) => Reflect.apply(target.subscribe, target, args);
    }
    return Reflect.get(target, key, target);
  },
  getPrototypeOf(target) {
    const prototype = Reflect.getPrototypeOf(target);
    return { ...prototype, subscribe: (...args) => Reflect.apply(target.subscribe, target, args) };
  }
});`);
  }
  return definitions.join('\n');
}

function maskImports(source) {
  const sourceFile = ts.createSourceFile('dynamic-source.ts', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const characters = [...source];
  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement) && !ts.isImportEqualsDeclaration(statement)) {
      continue;
    }
    for (let index = statement.getFullStart(); index < statement.end; index++) {
      if (characters[index] !== '\n' && characters[index] !== '\r') {
        characters[index] = ' ';
      }
    }
  }
  return characters.join('');
}

function isInlineTestHelper(item) {
  return inlineTestHelpers.has(`${item.module}:${item.imported}`);
}

function isGenuinelySchedulerInternal({ path, line, blockedSupport }) {
  if (blockedSupport.length > 0) {
    return true;
  }
  if (path !== 'spec/schedulers/TestScheduler-spec.ts') {
    return false;
  }
  return line === 261 || line === 270 || line === 309;
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
    } else if (bindings && ts.isNamespaceImport(bindings)) {
      imports.push({
        module,
        imported: '*',
        local: bindings.name.text,
      });
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
  const needsTimerHelper = /\bgetTimerSelector\s*\(/.test(selectedSource);
  return importMap
    .filter(
      (item) =>
        new RegExp(`\\b${escapeRegExp(item.local)}\\b`).test(selectedSource) ||
        (needsTimerHelper && item.module === 'rxjs' && item.imported === 'timer')
    )
    .map((item) => ({
      ...item,
      usage: item.module === 'rxjs/operators' || operatorLocals.has(item.local) ? 'operator' : 'value',
    }));
}

function assessAvailability(imports) {
  const missing = [];
  const external = [];
  for (const item of imports) {
    if (isInlineTestHelper(item) || item.module === '../helpers/marble-testing') {
      continue;
    }
    if (item.usage === 'operator') {
      if (!availableOperatorSymbols.has(item.imported)) {
        missing.push(`operator:${item.imported}`);
      }
    } else if (item.module === 'rxjs') {
      if (item.imported === 'pipe') {
        continue;
      }
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

function shouldInventoryCase(path, source) {
  return (
    path === 'spec/schedulers/TestScheduler-spec.ts' ||
    marbleSignals.some((signal) => source.includes(signal)) ||
    /\bTestScheduler\b/.test(source) ||
    /\b(?:cold|hot|expectObservable|expectSubscriptions|animate)\s*\(/.test(source)
  );
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

function isVerifiedColdPass({ id, location }) {
  return coldBaselineUsesCaseIds ? activeCaseIds.has(id) : activeCaseLocations.has(location);
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
