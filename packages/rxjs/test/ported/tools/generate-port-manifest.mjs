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
  '../helpers/observableMatcher:observableMatcher',
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
const boundedSubscription = (subscribedFrame, unsubscribedFrame) =>
  `${'-'.repeat(subscribedFrame)}^${'-'.repeat(unsubscribedFrame - subscribedFrame - 1)}!`;
const observableMessages = (events) =>
  events.map(([frame, kind, value]) => ({
    frame,
    notification:
      kind === 'N'
        ? { kind, value }
        : kind === 'E'
          ? { kind, error: value ?? 'error' }
          : { kind },
  }));
const harnessRewritePrograms = new Map([
  [
    'spec/observables/dom/animationFrames-spec.ts:60:animationFrames > should compose with take',
    buildAnimationFramesLifecycleHarnessRewrite('take'),
  ],
  [
    'spec/observables/dom/animationFrames-spec.ts:86:animationFrames > should compose with takeUntil',
    buildAnimationFramesLifecycleHarnessRewrite('takeUntil'),
  ],
  [
    'spec/observables/from-spec.ts:21:from > should create an observable from an array',
    buildFromArrayDelayHarnessRewrite(),
  ],
  [
    'spec/subjects/ReplaySubject-spec.ts:247:ReplaySubject > with windowTime=4 > should replay previous values since 4 time units ago when subscribed',
    buildReplaySubjectWindowHarnessRewrite(247),
  ],
  [
    'spec/subjects/ReplaySubject-spec.ts:279:ReplaySubject > with windowTime=4 > should replay last values since 4 time units ago when subscribed',
    buildReplaySubjectWindowHarnessRewrite(279),
  ],
  [
    'spec/subjects/ReplaySubject-spec.ts:303:ReplaySubject > with windowTime=4 > should only replay bufferSize items when 4 time units ago more were emitted',
    buildReplaySubjectWindowHarnessRewrite(303),
  ],
  [
    'spec/operators/delay-spec.ts:227:delay > should unsubscribe scheduled actions after execution',
    buildDelayTimerCleanupHarnessRewrite(),
  ],
  [
    'spec/operators/windowTime-spec.ts:160:windowTime > should be able to split a never Observable into timely empty windows',
    buildWindowTimeHorizonHarnessRewrite(160),
  ],
  [
    'spec/operators/windowTime-spec.ts:224:windowTime > should emit windows given windowTimeSpan and windowCreationInterval, but outer is unsubscribed early',
    buildWindowTimeHorizonHarnessRewrite(224),
  ],
  [
    'spec/operators/windowTime-spec.ts:247:windowTime > should not break unsubscription chains when result is unsubscribed explicitly',
    buildWindowTimeHorizonHarnessRewrite(247),
  ],
  [
    'spec/operators/windowTime-spec.ts:274:windowTime > should not error if maxWindowSize is hit while nexting to other windows.',
    buildWindowTimeHorizonHarnessRewrite(274),
  ],
  [
    'spec/observables/connectable-spec.ts:29:connectable > should do nothing if connect is not called, despite subscriptions',
    buildNoConnectHarnessRewrite('connectable', 1),
  ],
  [
    'spec/operators/multicast-spec.ts:186:multicast > should do nothing if connect is not called, despite subscriptions',
    buildNoConnectHarnessRewrite('multicast', 16),
  ],
  [
    'spec/operators/multicast-spec.ts:240:multicast > should multicast the same values to multiple observers, but is unsubscribed explicitly and early',
    buildDisconnectedMulticastHarnessRewrite(false),
  ],
  [
    'spec/operators/multicast-spec.ts:272:multicast > should not break unsubscription chains when result is unsubscribed explicitly',
    buildDisconnectedMulticastHarnessRewrite(true),
  ],
  [
    'spec/operators/multicast-spec.ts:321:multicast > should multicast a never source',
    buildNeverMulticastHarnessRewrite(),
  ],
  [
    'spec/operators/publish-spec.ts:37:publish operator > should do nothing if connect is not called, despite subscriptions',
    buildNoConnectPublishHarnessRewrite('publish'),
  ],
  [
    'spec/operators/publish-spec.ts:114:publish operator > should multicast the same values to multiple observers, but is unsubscribed explicitly and early',
    buildDisconnectedPublishHarnessRewrite('publish', false),
  ],
  [
    'spec/operators/publish-spec.ts:146:publish operator > should not break unsubscription chains when result is unsubscribed explicitly',
    buildDisconnectedPublishHarnessRewrite('publish', true),
  ],
  [
    'spec/operators/publish-spec.ts:315:publish operator > should multicast a never source',
    buildNeverPublishHarnessRewrite('publish'),
  ],
  [
    'spec/operators/publishBehavior-spec.ts:37:publishBehavior operator > should only emit default value if connect is not called, despite subscriptions',
    buildNoConnectPublishHarnessRewrite('publishBehavior'),
  ],
  [
    'spec/operators/publishBehavior-spec.ts:91:publishBehavior operator > should multicast the same values to multiple observers, but is unsubscribed explicitly and early',
    buildDisconnectedPublishHarnessRewrite('publishBehavior', false),
  ],
  [
    'spec/operators/publishBehavior-spec.ts:123:publishBehavior operator > should not break unsubscription chains when result is unsubscribed explicitly',
    buildDisconnectedPublishHarnessRewrite('publishBehavior', true),
  ],
  [
    'spec/operators/publishBehavior-spec.ts:292:publishBehavior operator > should multicast a never source',
    buildNeverPublishHarnessRewrite('publishBehavior'),
  ],
  [
    'spec/operators/publishLast-spec.ts:37:publishLast operator > should do nothing if connect is not called, despite subscriptions',
    buildNoConnectPublishHarnessRewrite('publishLast'),
  ],
  [
    'spec/operators/publishLast-spec.ts:91:publishLast operator > should not cast any values to multiple observers, when source is unsubscribed explicitly and early',
    buildDisconnectedPublishHarnessRewrite('publishLast', false),
  ],
  [
    'spec/operators/publishLast-spec.ts:123:publishLast operator > should not break unsubscription chains when result is unsubscribed explicitly',
    buildDisconnectedPublishHarnessRewrite('publishLast', true),
  ],
  [
    'spec/operators/publishLast-spec.ts:230:publishLast operator > should multicast a never source',
    buildNeverPublishHarnessRewrite('publishLast'),
  ],
  [
    'spec/operators/publishReplay-spec.ts:37:publishReplay operator > should do nothing if connect is not called, despite subscriptions',
    buildNoConnectPublishHarnessRewrite('publishReplay'),
  ],
  [
    'spec/operators/publishReplay-spec.ts:112:publishReplay operator > should multicast the same values to multiple observers, but is unsubscribed explicitly and early',
    buildDisconnectedPublishReplayHarnessRewrite(false),
  ],
  [
    'spec/operators/publishReplay-spec.ts:144:publishReplay operator > should not break unsubscription chains when result is unsubscribed explicitly',
    buildDisconnectedPublishReplayHarnessRewrite(true),
  ],
  [
    'spec/operators/publishReplay-spec.ts:423:publishReplay operator > should multicast a never source',
    buildNeverPublishHarnessRewrite('publishReplay'),
  ],
  [
    'spec/operators/publishReplay-spec.ts:495:publishReplay operator > should terminate immediately when the selector returns an empty Observable',
    buildTerminalPublishReplaySelectorHarnessRewrite('complete'),
  ],
  [
    'spec/operators/publishReplay-spec.ts:508:publishReplay operator > should not emit and should not complete/error when the selector returns never',
    buildNeverPublishReplaySelectorHarnessRewrite(),
  ],
  [
    'spec/operators/publishReplay-spec.ts:521:publishReplay operator > should emit error when the selector returns Observable.throw',
    buildTerminalPublishReplaySelectorHarnessRewrite('error'),
  ],
  [
    'spec/operators/shareReplay-spec.ts:226:shareReplay > should restart due to unsubscriptions if refCount is true',
    buildRestartingShareReplayHarnessRewrite(),
  ],
  [
    'spec/operators/multicast-spec.ts:391:multicast > with refCount() and subject factory > should be retryable when cold source is synchronous',
    buildSynchronousRefCountHarnessRewrite('retry', false),
  ],
  [
    'spec/operators/multicast-spec.ts:432:multicast > with refCount() and subject factory > should be retryable with ReplaySubject and cold source is synchronous',
    buildSynchronousRefCountHarnessRewrite('retry', true),
  ],
  [
    'spec/operators/multicast-spec.ts:473:multicast > with refCount() and subject factory > should be repeatable when cold source is synchronous',
    buildSynchronousRefCountHarnessRewrite('repeat', false),
  ],
  [
    'spec/operators/multicast-spec.ts:516:multicast > with refCount() and subject factory > should be repeatable with ReplaySubject and cold source is synchronous',
    buildSynchronousRefCountHarnessRewrite('repeat', true),
  ],
  [
    'spec/operators/multicast-spec.ts:559:multicast > with refCount() and subject factory > should be retryable',
    buildTimedRefCountHarnessRewrite('retry', false),
  ],
  [
    'spec/operators/multicast-spec.ts:597:multicast > with refCount() and subject factory > should be retryable using a ReplaySubject',
    buildTimedRefCountHarnessRewrite('retry', true),
  ],
  [
    'spec/operators/multicast-spec.ts:620:multicast > with refCount() and subject factory > should be repeatable',
    buildTimedRefCountHarnessRewrite('repeat', false),
  ],
  [
    'spec/operators/multicast-spec.ts:656:multicast > with refCount() and subject factory > should be repeatable using a ReplaySubject',
    buildTimedRefCountHarnessRewrite('repeat', true),
  ],
  [
    'spec/operators/share-spec.ts:813:share > share(config) with async/deferred reset notifiers > should not reset on refCount 0 if reset notifier errors before emitting any value',
    buildShareUnhandledResetHarnessRewrite('refCount'),
  ],
  [
    'spec/operators/share-spec.ts:840:share > share(config) with async/deferred reset notifiers > should not reset on error if reset notifier errors before emitting any value',
    buildShareUnhandledResetHarnessRewrite('error'),
  ],
  [
    'spec/operators/share-spec.ts:865:share > share(config) with async/deferred reset notifiers > should not reset on complete if reset notifier errors before emitting any value',
    buildShareUnhandledResetHarnessRewrite('complete'),
  ],
  [
    'spec/Observable-spec.ts:903:Observable > should handle sync errors within a test scheduler',
    buildSynchronousCatchErrorHarnessRewrite(),
  ],
  [
    'spec/Observable-spec.ts:50:Observable > should allow empty ctor, which is effectively a never-observable',
    buildRequiredObservableInitializerHarnessRewrite(),
  ],
  [
    'spec/Observable-spec.ts:1330:Observable.lift > should compose through combineLatest',
    buildPlatformSubclassCompositionHarnessRewrite('combineLatest'),
  ],
  [
    'spec/Observable-spec.ts:1353:Observable.lift > should compose through concat',
    buildPlatformSubclassCompositionHarnessRewrite('concat'),
  ],
  [
    'spec/Observable-spec.ts:1366:Observable.lift > should compose through merge',
    buildPlatformSubclassCompositionHarnessRewrite('merge'),
  ],
  [
    'spec/Observable-spec.ts:1380:Observable.lift > should compose through race',
    buildPlatformSubclassCompositionHarnessRewrite('race'),
  ],
  [
    'spec/Observable-spec.ts:1400:Observable.lift > should compose through zip',
    buildPlatformSubclassCompositionHarnessRewrite('zip'),
  ],
  [
    'spec/operators/repeatWhen-spec.ts:339:repeatWhen operator > should handle a host source that completes via operator like take, and a hot notifier',
    buildSkippedRepeatWhenHotNotifierHarnessRewrite(),
  ],
  [
    'spec/operators/mergeMap-spec.ts:975:mergeMap > should properly handle errors from iterables that are processed after some async',
    buildAsyncIterableErrorHarnessRewrite(),
  ],
  [
    'spec/operators/concat-legacy-spec.ts:15:concat operator > should concatenate two cold observables',
    buildLegacyConcatBehaviorHarnessRewrite(),
  ],
  [
    'spec/observables/timer-spec.ts:14:timer > should create an observable emitting periodically',
    buildVirtualTimerHarnessRewrite('periodic-open'),
  ],
  [
    'spec/observables/timer-spec.ts:51:timer > should start after delay and periodically emit values',
    buildVirtualTimerHarnessRewrite('delayed-periodic'),
  ],
  [
    'spec/observables/timer-spec.ts:63:timer > should start immediately and periodically emit values',
    buildVirtualTimerHarnessRewrite('immediate-periodic'),
  ],
  [
    'spec/observables/timer-spec.ts:75:timer > should stop emitting values when subscription is done',
    buildVirtualTimerHarnessRewrite('cancelled-periodic'),
  ],
  [
    'spec/observables/timer-spec.ts:99:timer > should start after delay and periodically emit values',
    buildVirtualTimerHarnessRewrite('dated-periodic'),
  ],
  [
    "spec/observables/timer-spec.ts:112:timer > 'should still target the same date if a date is provided even for the ' + 'second subscription'",
    buildVirtualTimerHarnessRewrite('dated-resubscription'),
  ],
  [
    'spec/observables/timer-spec.ts:128:timer > should accept Infinity as the first argument',
    buildVirtualTimerHarnessRewrite('infinite-due'),
  ],
  [
    'spec/observables/timer-spec.ts:136:timer > should accept Infinity as the second argument',
    buildVirtualTimerHarnessRewrite('infinite-period'),
  ],
  [
    'spec/observables/range-spec.ts:17:range > should create an observable with numbers 1 to 10',
    buildRangeBehaviorHarnessRewrite(1, 10, false),
  ],
  [
    'spec/observables/range-spec.ts:49:range > should work for two subscribers',
    buildRangeBehaviorHarnessRewrite(1, 5, true),
  ],
  [
    'spec/observables/range-spec.ts:101:range > should accept only one argument where count is argument and start is zero',
    buildRangeBehaviorHarnessRewrite(0, 5, true),
  ],
  [
    'spec/observables/generate-spec.ts:103:generate > should accept a scheduler',
    buildGenerateSchedulerBehaviorHarnessRewrite('values'),
  ],
  [
    'spec/observables/generate-spec.ts:150:generate > should emit error if result selector throws on scheduler',
    buildGenerateSchedulerBehaviorHarnessRewrite('result-error'),
  ],
  [
    'spec/observables/generate-spec.ts:176:generate > should emit error after first value if iterate function throws on scheduler',
    buildGenerateSchedulerBehaviorHarnessRewrite('iterate-error'),
  ],
  [
    'spec/observables/generate-spec.ts:202:generate > should emit error if condition function throws on scheduler',
    buildGenerateSchedulerBehaviorHarnessRewrite('condition-error'),
  ],
  [
    'spec/scheduled/scheduled-spec.ts:14:scheduled > should schedule a sync observable',
    buildScheduledInputHarnessRewrite('observable'),
  ],
  [
    'spec/scheduled/scheduled-spec.ts:21:scheduled > should schedule an array',
    buildScheduledInputHarnessRewrite('array'),
  ],
  [
    'spec/scheduled/scheduled-spec.ts:28:scheduled > should schedule an iterable',
    buildScheduledInputHarnessRewrite('iterable'),
  ],
  [
    'spec/scheduled/scheduled-spec.ts:35:scheduled > should schedule an observable-like',
    buildScheduledInputHarnessRewrite('observable-like'),
  ],
  [
    'spec/operators/startWith-spec.ts:146:startWith > should allow unsubscribing explicitly and early',
    buildStartWithSchedulerLastHarnessRewrite('cancelled'),
  ],
  [
    'spec/operators/startWith-spec.ts:161:startWith > should not break unsubscription chains when result is unsubscribed explicitly',
    buildStartWithSchedulerLastHarnessRewrite('chain'),
  ],
  [
    'spec/operators/startWith-spec.ts:180:startWith > should start with empty if given value is not specified',
    buildStartWithSchedulerLastHarnessRewrite('empty'),
  ],
  [
    'spec/operators/startWith-spec.ts:193:startWith > should accept scheduler as last argument with single value',
    buildStartWithSchedulerLastHarnessRewrite('single'),
  ],
  [
    'spec/operators/startWith-spec.ts:206:startWith > should accept scheduler as last argument with multiple value',
    buildStartWithSchedulerLastHarnessRewrite('multiple'),
  ],
  [
    'spec/operators/endWith-spec.ts:181:endWith > should accept scheduler as last argument with single value',
    buildEndWithSchedulerLastHarnessRewrite('single'),
  ],
  [
    'spec/operators/endWith-spec.ts:192:endWith > should accept scheduler as last argument with multiple value',
    buildEndWithSchedulerLastHarnessRewrite('multiple'),
  ],
  [
    'spec/operators/concat-legacy-spec.ts:324:concat operator > should accept scheduler with multiple observables',
    buildConcatSchedulerLastHarnessRewrite('multiple'),
  ],
  [
    'spec/operators/concat-legacy-spec.ts:341:concat operator > should accept scheduler without observable parameters',
    buildConcatSchedulerLastHarnessRewrite('empty'),
  ],
  [
    'spec/operators/share-spec.ts:723:share > share(config) with async/deferred reset notifiers > should not reset on refCount 0 when synchronously resubscribing and using a deferred reset notifier',
    buildDeferredShareResetHarnessRewrite(),
  ],
  [
    'spec/observables/fromEvent-spec.ts:16:fromEvent > should create an observable of click on the element',
    buildFromEventDispatchHarnessRewrite(),
  ],
  [
    'spec/observables/fromEventPattern-spec.ts:18:fromEventPattern > should create an observable from the handler API',
    buildFromEventPatternDispatchHarnessRewrite(),
  ],
  [
    'spec/operators/expand-spec.ts:32:expand > should work with scheduler',
    buildExpandScheduledSubscriptionHarnessRewrite(),
  ],
  [
    'spec/observables/dom/ajax-spec.ts:534:ajax > should error on timeout of asynchronous request',
    buildAjaxTimeoutHarnessRewrite(),
  ],
  [
    'spec/operators/skipUntil-spec.ts:293:skipUntil > should skip all elements if notifier is unsubscribed explicitly before the notifier emits',
    buildCancelledSkipUntilNotifierHarnessRewrite(),
  ],
  [
    'spec/operators/windowCount-spec.ts:85:windowCount > should return Never if source if Never',
    buildNeverWindowCountHarnessRewrite(),
  ],
  [
    'spec/operators/windowCount-spec.ts:136:windowCount > should dispose of inner windows once outer is unsubscribed early',
    buildCancelledWindowCountHarnessRewrite(false),
  ],
  [
    'spec/operators/windowCount-spec.ts:155:windowCount > should not break unsubscription chains when result is unsubscribed explicitly',
    buildCancelledWindowCountHarnessRewrite(true),
  ],
  [
    'spec/operators/window-spec.ts:105:window > should return a single Never window if source is Never',
    buildNeverWindowHarnessRewrite(),
  ],
  [
    'spec/operators/window-spec.ts:123:window > should be able to split a never Observable into timely empty windows',
    buildTimedNeverWindowHarnessRewrite(),
  ],
  [
    'spec/operators/window-spec.ts:203:window > should stop emitting windows when outer is unsubscribed early',
    buildCancelledWindowHarnessRewrite(false),
  ],
  [
    'spec/operators/window-spec.ts:223:window > should not break unsubscription chains when result is unsubscribed explicitly',
    buildCancelledWindowHarnessRewrite(true),
  ],
  [
    'spec/operators/windowToggle-spec.ts:176:windowToggle > should emit windows using varying cold closings, outer unsubscribed early',
    buildCancelledWindowToggleHarnessRewrite(false),
  ],
  [
    'spec/operators/windowToggle-spec.ts:210:windowToggle > should not break unsubscription chains when result is unsubscribed explicitly',
    buildCancelledWindowToggleHarnessRewrite(true),
  ],
  [
    'spec/operators/windowToggle-spec.ts:246:windowToggle > should dispose window Subjects if the outer is unsubscribed early',
    buildReleasedWindowToggleHarnessRewrite(),
  ],
  [
    'spec/operators/windowWhen-spec.ts:137:windowWhen > should emit windows using varying cold closings, outer unsubscribed early',
    buildCancelledWindowWhenHarnessRewrite(false),
  ],
  [
    'spec/operators/windowWhen-spec.ts:166:windowWhen > should not break unsubscription chain when unsubscribed explicitly',
    buildCancelledWindowWhenHarnessRewrite(true),
  ],
  [
    'spec/operators/windowWhen-spec.ts:335:windowWhen > should handle a never source',
    buildNeverSourceWindowWhenHarnessRewrite(),
  ],
  [
    'spec/operators/groupBy-spec.ts:682:groupBy operator > should allow subscribing late to an inner Observable, outer completes',
    buildLateGroupTerminalHarnessRewrite('complete'),
  ],
  [
    'spec/operators/groupBy-spec.ts:705:groupBy operator > should allow subscribing late to an inner Observable, outer throws',
    buildLateGroupTerminalHarnessRewrite('error'),
  ],
  [
    'spec/operators/groupBy-spec.ts:733:groupBy operator > should allow subscribing late to inner, unsubscribe outer early',
    buildLateGroupAfterOuterCancellationHarnessRewrite(),
  ],
  [
    'spec/operators/groupBy-spec.ts:1436:groupBy operator > should not error for late subscribed inners if outer is unsubscribed before inners are subscribed',
    buildVeryLateGroupsAfterOuterCancellationHarnessRewrite(),
  ],
  [
    'spec/operators/groupBy-spec.ts:566:groupBy operator > should allow an inner to be unsubscribed early but other inners continue',
    buildPhonyMarbelizeGroupHarnessRewrite({
      outer: [
        [2, 'N', 'foo'],
        [6, 'N', 'bar'],
        [10, 'N', 'baz'],
        [12, 'N', 'qux'],
        [26, 'C'],
      ],
      groups: [
        { key: 'foo', occurrence: 0, subscribeFrame: 2, abortFrame: 9, events: [[2, 'N', 'a'], [4, 'N', 'b'], [8, 'N', 'd']] },
        { key: 'bar', occurrence: 0, subscribeFrame: 6, events: [[6, 'N', 'c'], [14, 'N', 'g'], [16, 'N', 'h'], [26, 'C']] },
        { key: 'baz', occurrence: 0, subscribeFrame: 10, events: [[10, 'N', 'e'], [20, 'N', 'j'], [22, 'N', 'k'], [26, 'C']] },
        { key: 'qux', occurrence: 0, subscribeFrame: 12, events: [[12, 'N', 'f'], [26, 'C']] },
      ],
    }),
  ],
  [
    'spec/operators/groupBy-spec.ts:621:groupBy operator > should allow inners to be unsubscribed early at different times',
    buildPhonyMarbelizeGroupHarnessRewrite({
      outer: [
        [2, 'N', 'foo'],
        [6, 'N', 'bar'],
        [10, 'N', 'baz'],
        [12, 'N', 'qux'],
        [26, 'C'],
      ],
      groups: [
        { key: 'foo', occurrence: 0, subscribeFrame: 2, abortFrame: 9, events: [[2, 'N', 'a'], [4, 'N', 'b'], [8, 'N', 'd']] },
        { key: 'bar', occurrence: 0, subscribeFrame: 6, abortFrame: 12, events: [[6, 'N', 'c']] },
        { key: 'baz', occurrence: 0, subscribeFrame: 10, abortFrame: 16, events: [[10, 'N', 'e']] },
        { key: 'qux', occurrence: 0, subscribeFrame: 12, abortFrame: 19, events: [[12, 'N', 'f']] },
      ],
    }),
  ],
  [
    'spec/operators/groupBy-spec.ts:921:groupBy operator > should allow using a durationSelector, outer and all inners unsubscribed early',
    buildPhonyMarbelizeGroupHarnessRewrite({
      durationSkip: 2,
      outerAbortFrame: 11,
      sourceSubscription: '^----------!',
      outer: [
        [2, 'N', 'foo'],
        [6, 'N', 'bar'],
        [10, 'N', 'baz'],
      ],
      groups: [
        { key: 'foo', occurrence: 0, subscribeFrame: 2, abortFrame: 11, events: [[2, 'N', 'a'], [4, 'N', 'b'], [8, 'N', 'd'], [8, 'C']] },
        { key: 'bar', occurrence: 0, subscribeFrame: 6, abortFrame: 11, events: [[6, 'N', 'c']] },
        { key: 'baz', occurrence: 0, subscribeFrame: 10, abortFrame: 11, events: [[10, 'N', 'e']] },
      ],
    }),
  ],
  [
    'spec/operators/groupBy-spec.ts:1142:groupBy operator > should allow an inner to be unsubscribed early but other inners continue, with durationSelector',
    buildPhonyMarbelizeGroupHarnessRewrite({
      durationSkip: 2,
      element: 'reverse',
      legacy: true,
      outer: [
        [2, 'N', 'foo'],
        [6, 'N', 'bar'],
        [10, 'N', 'baz'],
        [12, 'N', 'qux'],
        [18, 'N', 'foo'],
        [26, 'C'],
      ],
      groups: [
        { key: 'foo', occurrence: 0, subscribeFrame: 2, abortFrame: 7, events: [[2, 'N', 'a'], [4, 'N', 'b']] },
        { key: 'bar', occurrence: 0, subscribeFrame: 6, events: [[6, 'N', 'c'], [14, 'N', 'g'], [16, 'N', 'h'], [16, 'C']] },
        { key: 'baz', occurrence: 0, subscribeFrame: 10, events: [[10, 'N', 'e'], [20, 'N', 'j'], [22, 'N', 'k'], [22, 'C']] },
        { key: 'qux', occurrence: 0, subscribeFrame: 12, events: [[12, 'N', 'f'], [26, 'C']] },
        { key: 'foo', occurrence: 1, subscribeFrame: 18, events: [[18, 'N', 'i'], [24, 'N', 'l'], [26, 'C']] },
      ],
    }),
  ],
  [
    'spec/operators/groupBy-spec.ts:1206:groupBy operator > should allow inners to be unsubscribed early at different times, with durationSelector',
    buildPhonyMarbelizeGroupHarnessRewrite({
      durationSkip: 2,
      element: 'identity',
      legacy: true,
      outer: [
        [2, 'N', 'foo'],
        [6, 'N', 'bar'],
        [10, 'N', 'baz'],
        [12, 'N', 'qux'],
        [18, 'N', 'foo'],
        [26, 'C'],
      ],
      groups: [
        { key: 'foo', occurrence: 0, subscribeFrame: 2, abortFrame: 7, events: [[2, 'N', 'a'], [4, 'N', 'b']] },
        { key: 'bar', occurrence: 0, subscribeFrame: 6, abortFrame: 9, events: [[6, 'N', 'c']] },
        { key: 'baz', occurrence: 0, subscribeFrame: 10, abortFrame: 21, events: [[10, 'N', 'e'], [20, 'N', 'j']] },
        { key: 'qux', occurrence: 0, subscribeFrame: 12, abortFrame: 16, events: [[12, 'N', 'f']] },
        { key: 'foo', occurrence: 1, subscribeFrame: 18, abortFrame: 22, events: [[18, 'N', 'i']] },
      ],
    }),
  ],
  [
    'spec/operators/groupBy-spec.ts:1280:groupBy operator > should return inners that when subscribed late exhibit hot behavior',
    buildPhonyMarbelizeGroupHarnessRewrite({
      element: 'identity',
      legacy: true,
      outer: [
        [2, 'N', 'foo'],
        [6, 'N', 'bar'],
        [10, 'N', 'baz'],
        [12, 'N', 'qux'],
        [26, 'C'],
      ],
      groups: [
        { key: 'foo', occurrence: 0, subscribeFrame: 3, events: [[4, 'N', 'b'], [8, 'N', 'd'], [18, 'N', 'i'], [24, 'N', 'l'], [26, 'C']] },
        { key: 'bar', occurrence: 0, subscribeFrame: 9, events: [[14, 'N', 'g'], [16, 'N', 'h'], [26, 'C']] },
        { key: 'baz', occurrence: 0, subscribeFrame: 19, events: [[20, 'N', 'j'], [22, 'N', 'k'], [26, 'C']] },
        { key: 'qux', occurrence: 0, subscribeFrame: 30, events: [[30, 'C']] },
      ],
    }),
  ],
  [
    'spec/operators/groupBy-spec.ts:1346:groupBy operator > should return inner group that when subscribed late emits complete()',
    buildPhonyMarbelizeGroupHarnessRewrite({
      durationSkip: 7,
      element: 'identity',
      legacy: true,
      sourceMarbles: '--a-b---d---------i-----l-|',
      values: {
        a: '  foo',
        b: ' FoO ',
        d: 'foO ',
        i: 'FOO ',
        l: '    fOo    ',
      },
      outer: [
        [2, 'N', 'foo'],
        [26, 'C'],
      ],
      groups: [{ key: 'foo', occurrence: 0, subscribeFrame: 32, events: [[32, 'C']] }],
    }),
  ],
  [
    'spec/operators/groupBy-spec.ts:1391:groupBy operator > should return inner group that when subscribed late emits error()',
    buildPhonyMarbelizeGroupHarnessRewrite({
      durationSkip: 7,
      element: 'identity',
      legacy: true,
      sourceMarbles: '--a-b---d---------i-----l-#',
      values: {
        a: '  foo',
        b: ' FoO ',
        d: 'foO ',
        i: 'FOO ',
        l: '    fOo    ',
      },
      outer: [
        [2, 'N', 'foo'],
        [26, 'E'],
      ],
      groups: [{ key: 'foo', occurrence: 0, subscribeFrame: 32, events: [[32, 'E']] }],
    }),
  ],
]);
const harnessRewritesReplacingUnavailableImports = new Set([
  'spec/observables/dom/animationFrames-spec.ts:60:animationFrames > should compose with take',
  'spec/observables/dom/animationFrames-spec.ts:86:animationFrames > should compose with takeUntil',
  'spec/scheduled/scheduled-spec.ts:14:scheduled > should schedule a sync observable',
  'spec/scheduled/scheduled-spec.ts:21:scheduled > should schedule an array',
  'spec/scheduled/scheduled-spec.ts:28:scheduled > should schedule an iterable',
  'spec/scheduled/scheduled-spec.ts:35:scheduled > should schedule an observable-like',
  'spec/operators/share-spec.ts:723:share > share(config) with async/deferred reset notifiers > should not reset on refCount 0 when synchronously resubscribing and using a deferred reset notifier',
  'spec/observables/dom/ajax-spec.ts:534:ajax > should error on timeout of asynchronous request',
  'spec/observables/from-spec.ts:21:from > should create an observable from an array',
]);
const intentionalDivergenceReasons = new Map([
  [
    'spec/observables/partition-spec.ts:77:partition > should partition an observable into two using a predicate and thisArg',
    'Intentional RxJS Next divergence: the callback receiver argument is removed; the active migrated spec binds the predicate explicitly.',
  ],
  [
    'spec/operators/filter-spec.ts:235:filter > should be able to accept and use a thisArg',
    'Intentional RxJS Next divergence: the callback receiver argument is removed; the active migrated spec uses closed-over predicates.',
  ],
  [
    'spec/operators/find-spec.ts:89:find > should work with a custom thisArg',
    'Intentional RxJS Next divergence: the callback receiver argument is removed; the active migrated spec binds the predicate explicitly.',
  ],
  [
    'spec/operators/findIndex-spec.ts:89:findIndex > should work with a custom thisArg',
    'Intentional RxJS Next divergence: the callback receiver argument is removed; the active migrated spec binds the predicate explicitly.',
  ],
  [
    'spec/operators/map-spec.ts:216:map > should map using a custom thisArg',
    'Intentional RxJS Next divergence: the callback receiver argument is removed; the active migrated spec binds the projector explicitly.',
  ],
  [
    'spec/operators/map-spec.ts:269:map > should do multiple maps using a custom thisArg',
    'Intentional RxJS Next divergence: the callback receiver argument is removed; the active migrated spec uses closed-over projectors.',
  ],
  [
    'spec/operators/delay-spec.ts:227:delay > should unsubscribe scheduled actions after execution',
    'Intentional RxJS Next divergence: the executable replacement asserts AbortSignal cancellation and virtual host-timer cleanup instead of removed RxJS 7 source and Subscription._finalizers internals.',
  ],
  [
    'spec/operators/bufferToggle-spec.ts:32:bufferToggle operator > should emit buffers that are opened by an observable from the first argument and closed by an observable returned by the function in the second argument',
    'Intentional RxJS Next divergence: overlapping closing subscriptions join one platform Observable run instead of restarting the reused cold closing fixture.',
  ],
  [
    'spec/operators/delayWhen-spec.ts:99:delayWhen > should delay by selector and completes after value emits',
    'Intentional RxJS Next divergence: overlapping delay subscriptions join one platform Observable run instead of restarting the reused cold selector fixture.',
  ],
  [
    'spec/operators/delayWhen-spec.ts:120:delayWhen > should delay, but not emit if the selector never emits a notification',
    'Intentional RxJS Next divergence: overlapping delay subscriptions join one platform Observable run instead of restarting the reused cold selector fixture.',
  ],
  [
    'spec/operators/delayWhen-spec.ts:175:delayWhen > should delay by first value from selector',
    'Intentional RxJS Next divergence: overlapping delay subscriptions join one platform Observable run instead of restarting the reused cold selector fixture.',
  ],
  [
    'spec/operators/delayWhen-spec.ts:196:delayWhen > should delay by selector that does not completes',
    'Intentional RxJS Next divergence: overlapping delay subscriptions join one platform Observable run instead of restarting the reused cold selector fixture.',
  ],
  [
    'spec/operators/mergeMap-spec.ts:16:mergeMap > should map-and-flatten each item to an Observable',
    'Intentional RxJS Next divergence: overlapping projections join one platform Observable run instead of restarting the reused cold inner fixture.',
  ],
  [
    'spec/operators/mergeMap-spec.ts:285:mergeMap > should not break unsubscription chains when result is unsubscribed explicitly',
    'Intentional RxJS Next divergence: overlapping projections join one platform Observable run instead of restarting the reused cold inner fixture.',
  ],
  [
    'spec/operators/mergeMap-spec.ts:374:mergeMap > should mergeMap many outer to many inner, and inner throws',
    'Intentional RxJS Next divergence: overlapping projections join one platform inner run. Its terminal error closes the shared result before later sibling delivery, so the platform reports that later delivery to the host instead of modeling independent cold inners.',
  ],
  [
    'spec/operators/mergeMap-spec.ts:422:mergeMap > should mergeMap many outer to many inner, both inner and outer throw',
    'Intentional RxJS Next divergence: overlapping projections join one platform inner run. Its terminal error closes the shared result before later sibling delivery, so the platform reports that later delivery to the host instead of modeling independent cold inners.',
  ],
  [
    'spec/operators/mergeMapTo-spec.ts:216:mergeMapTo > should not break unsubscription chains when result is unsubscribed explicitly',
    'Intentional RxJS Next divergence: overlapping projections join one platform Observable run instead of restarting the reused cold inner fixture.',
  ],
  [
    'spec/operators/mergeMapTo-spec.ts:271:mergeMapTo > should mergeMapTo many outer to many inner, and inner throws',
    'Intentional RxJS Next divergence: overlapping projections join one platform inner run. Its terminal error closes the shared result before later sibling delivery, so the platform reports that later delivery to the host instead of modeling independent cold inners.',
  ],
  [
    'spec/operators/mergeMapTo-spec.ts:314:mergeMapTo > should mergeMapTo many outer to many inner, both inner and outer throw',
    'Intentional RxJS Next divergence: overlapping projections join one platform inner run. Its terminal error closes the shared result before later sibling delivery, so the platform reports that later delivery to the host instead of modeling independent cold inners.',
  ],
  [
    'spec/operators/multicast-spec.ts:100:multicast > should accept a multicast selector and connect to a hot source for each subscriber',
    'Intentional RxJS Next divergence: the hot-derived selector result keeps one active platform run, so concurrent observers do not create the two independent selector connections asserted by the RxJS 7 cold expectation.',
  ],
  [
    'spec/operators/multicast-spec.ts:559:multicast > with refCount() and subject factory > should be retryable',
    'Intentional RxJS Next divergence: retry observes the ref-counted platform result lifecycle; it does not restore producer-per-subscription ColdObservable connection behavior around the migrated hot fixture.',
  ],
  [
    'spec/operators/multicast-spec.ts:597:multicast > with refCount() and subject factory > should be retryable using a ReplaySubject',
    'Intentional RxJS Next divergence: retry observes the ref-counted platform result lifecycle; it does not restore producer-per-subscription ColdObservable connection behavior around the migrated hot fixture.',
  ],
  [
    'spec/operators/multicast-spec.ts:620:multicast > with refCount() and subject factory > should be repeatable',
    'Intentional RxJS Next divergence: repeat observes the ref-counted platform result lifecycle; it does not restore producer-per-subscription ColdObservable connection behavior around the migrated hot fixture.',
  ],
  [
    'spec/operators/multicast-spec.ts:656:multicast > with refCount() and subject factory > should be repeatable using a ReplaySubject',
    'Intentional RxJS Next divergence: repeat observes the ref-counted platform result lifecycle; it does not restore producer-per-subscription ColdObservable connection behavior around the migrated hot fixture.',
  ],
  [
    'spec/operators/publish-spec.ts:70:publish operator > should accept selectors',
    'Intentional RxJS Next divergence: the hot-derived selector result keeps one active platform run, so concurrent observers do not create the two independent selector connections asserted by the RxJS 7 cold expectation.',
  ],
  [
    'spec/operators/publishBehavior-spec.ts:49:publishBehavior operator > should multicast the same values to multiple observers',
    'Intentional RxJS Next divergence: concurrent observers join one active platform result run and receive future BehaviorSubject values; they do not start independent cold result runs with separate current-value delivery.',
  ],
  [
    'spec/operators/publishBehavior-spec.ts:70:publishBehavior operator > should multicast an error from the source to multiple observers',
    'Intentional RxJS Next divergence: concurrent observers join one active platform result run and receive future BehaviorSubject values and its terminal error; they do not start independent cold result runs.',
  ],
  [
    'spec/operators/publishBehavior-spec.ts:91:publishBehavior operator > should multicast the same values to multiple observers, but is unsubscribed explicitly and early',
    'Intentional RxJS Next divergence: concurrent observers join one active platform result run, so late observers do not receive the independent cold-run BehaviorSubject state asserted by RxJS 7.',
  ],
  [
    'spec/operators/publishBehavior-spec.ts:123:publishBehavior operator > should not break unsubscription chains when result is unsubscribed explicitly',
    'Intentional RxJS Next divergence: concurrent observers join one active platform result run, so late observers do not receive the independent cold-run BehaviorSubject state asserted by RxJS 7.',
  ],
  [
    'spec/operators/publishBehavior-spec.ts:159:publishBehavior operator > with refCount() > should connect when first subscriber subscribes',
    'Intentional RxJS Next divergence: ref-counted observers join one active platform result run and receive only future values after joining, rather than independent cold-run current-value delivery.',
  ],
  [
    'spec/operators/publishBehavior-spec.ts:178:publishBehavior operator > with refCount() > should disconnect when last subscriber unsubscribes',
    'Intentional RxJS Next divergence: ref-counted observers join one active platform result run and receive only future values after joining, rather than independent cold-run current-value delivery.',
  ],
  [
    'spec/operators/publishBehavior-spec.ts:196:publishBehavior operator > with refCount() > should NOT be retryable',
    'Intentional RxJS Next divergence: retry observers join the active ref-counted platform result and share its terminal BehaviorSubject state instead of creating independent cold result runs.',
  ],
  [
    'spec/operators/publishBehavior-spec.ts:215:publishBehavior operator > with refCount() > should NOT be repeatable',
    'Intentional RxJS Next divergence: repeat observers join the active ref-counted platform result and share its terminal BehaviorSubject state instead of creating independent cold result runs.',
  ],
  [
    'spec/operators/publishReplay-spec.ts:49:publishReplay operator > should multicast the same values to multiple observers, bufferSize=1',
    'Intentional RxJS Next divergence: concurrent observers join one active platform result run and receive future replay-subject values; they do not create independent cold result runs.',
  ],
  [
    'spec/operators/publishReplay-spec.ts:70:publishReplay operator > should multicast the same values to multiple observers, bufferSize=2',
    'Intentional RxJS Next divergence: concurrent observers join one active platform result run and receive future replay-subject values; they do not create independent cold result runs.',
  ],
  [
    'spec/operators/publishReplay-spec.ts:91:publishReplay operator > should multicast an error from the source to multiple observers',
    'Intentional RxJS Next divergence: concurrent observers join one active platform result run and share its replay and terminal error; they do not create independent cold result runs.',
  ],
  [
    'spec/operators/publishReplay-spec.ts:112:publishReplay operator > should multicast the same values to multiple observers, but is unsubscribed explicitly and early',
    'Intentional RxJS Next divergence: the bounded cold case retains RxJS 7 replay for each observer, while platform observers joining one active result run do not create separate ReplaySubject subscriptions.',
  ],
  [
    'spec/operators/publishReplay-spec.ts:144:publishReplay operator > should not break unsubscription chains when result is unsubscribed explicitly',
    'Intentional RxJS Next divergence: the bounded cold case retains RxJS 7 replay for each observer, while platform observers joining one active result run do not create separate ReplaySubject subscriptions.',
  ],
  [
    'spec/operators/publishReplay-spec.ts:180:publishReplay operator > with refCount() > should connect when first subscriber subscribes',
    'Intentional RxJS Next divergence: ref-counted observers join one active platform result run and receive only future values after joining, rather than independent cold-run replay.',
  ],
  [
    'spec/operators/publishReplay-spec.ts:199:publishReplay operator > with refCount() > should disconnect when last subscriber unsubscribes',
    'Intentional RxJS Next divergence: ref-counted observers join one active platform result run and receive only future values after joining, rather than independent cold-run replay.',
  ],
  [
    'spec/operators/publishReplay-spec.ts:217:publishReplay operator > with refCount() > should NOT be retryable',
    'Intentional RxJS Next divergence: retry observers join the active ref-counted platform result and share its replay and terminal state instead of creating independent cold result runs.',
  ],
  [
    'spec/operators/publishReplay-spec.ts:236:publishReplay operator > with refCount() > should NOT be repeatable',
    'Intentional RxJS Next divergence: repeat observers join the active ref-counted platform result and share its replay and terminal state instead of creating independent cold result runs.',
  ],
  [
    'spec/operators/publishReplay-spec.ts:480:publishReplay operator > should emit an error when the selector returns an Observable that emits an error',
    'Intentional RxJS Next divergence: overlapping selector projections join one platform inner run. Its error closes the selector result before later sibling delivery, so the platform reports that later delivery to the host instead of modeling independent cold inners.',
  ],
  [
    'spec/operators/publishReplay-spec.ts:495:publishReplay operator > should terminate immediately when the selector returns an empty Observable',
    'Intentional RxJS Next divergence: a synchronously completed selector result prevents source activation instead of recording an immediately closed source subscription.',
  ],
  [
    'spec/operators/publishReplay-spec.ts:521:publishReplay operator > should emit error when the selector returns Observable.throw',
    'Intentional RxJS Next divergence: a synchronously errored selector result prevents source activation instead of recording an immediately closed source subscription.',
  ],
  [
    'spec/operators/windowToggle-spec.ts:246:windowToggle > should dispose window Subjects if the outer is unsubscribed early',
    'Intentional RxJS Next divergence: outer cancellation silently releases read-only windows, and late observation is accepted but remains silent.',
  ],
  [
    'spec/Observable-spec.ts:50:Observable > should allow empty ctor, which is effectively a never-observable',
    'Intentional RxJS Next divergence: the platform Observable constructor requires an initializer callback, so the RxJS 7 no-argument never-observable form is rejected no later than activation.',
  ],
  [
    'spec/Observable-spec.ts:1330:Observable.lift > should compose through combineLatest',
    'Intentional RxJS Next divergence: exact Symbol composition replaces the removed lift/source/operator protocol. The platform protocol preserves the custom subclass; the cold compatibility protocol returns a plain ColdObservable while preserving the combined output.',
  ],
  [
    'spec/Observable-spec.ts:1353:Observable.lift > should compose through concat',
    'Intentional RxJS Next divergence: exact Symbol composition replaces the removed lift/source/operator protocol. The platform protocol preserves the custom subclass; the cold compatibility protocol returns a plain ColdObservable while preserving the concatenated output. The trailing RxJS 7 scheduler overload is explicitly rejected.',
  ],
  [
    'spec/Observable-spec.ts:1366:Observable.lift > should compose through merge',
    'Intentional RxJS Next divergence: exact Symbol composition replaces the removed lift/source/operator protocol. The platform protocol preserves the custom subclass; the cold compatibility protocol returns a plain ColdObservable while preserving the merged output. The trailing RxJS 7 scheduler overload is explicitly rejected.',
  ],
  [
    'spec/Observable-spec.ts:1380:Observable.lift > should compose through race',
    'Intentional RxJS Next divergence: exact Symbol composition replaces the removed lift/source/operator protocol. The platform protocol preserves the custom subclass; the cold compatibility protocol returns a plain ColdObservable while preserving the winning output and loser cancellation.',
  ],
  [
    'spec/Observable-spec.ts:1400:Observable.lift > should compose through zip',
    'Intentional RxJS Next divergence: exact zipWith and map Symbols replace the removed lift/source/operator protocol and preserve the zipped projection, while the standalone zip construction boundary returns the active base Observable.',
  ],
  [
    'spec/deprecation-equivalents/multicasting-deprecations-spec.ts:107:should be equivalent for publish(fn) and connect({ setup: fn }) for async sources that retry [equivalence-6:publish(fn) and connect({ setup: fn })]',
    'Intentional RxJS Next divergence: both selector forms merge two subscriptions to one shared platform view. Terminal fanout reaches a sibling closed by the first delivery, so the platform reports the later error to the host before retry can express the RxJS 7 cold equivalence claim.',
  ],
  [
    'spec/deprecation-equivalents/multicasting-deprecations-spec.ts:107:should be equivalent for publishReplay(3, 10, fn) and `subject = new ReplaySubject(3, 10), connect({ connector: () => subject , setup: fn })` for async sources that retry [equivalence-7:publishReplay(3, 10, fn) and `subject = new ReplaySubject(3, 10), connect({ connector: () => subject , setup: fn })`]',
    'Intentional RxJS Next divergence: both selector forms merge two subscriptions to one shared platform view. Terminal fanout reaches a sibling closed by the first delivery, so the platform reports the later error to the host before retry can express the RxJS 7 cold equivalence claim.',
  ],
]);
const unsupportedOrObsoleteReasons = new Map([]);
const schedulerOnlyCaseReasons = new Map([]);
const harnessRewriteReasons = new Map([
  [
    'spec/observables/from-spec.ts:21:from > should create an observable from an array',
    'The focused rewrite preserves the array conversion and concatMap timing claim without carrying unrelated source-file helpers that require the removed RxJS observable interop Symbol.',
  ],
  [
    'spec/operators/mergeMap-spec.ts:975:mergeMap > should properly handle errors from iterables that are processed after some async',
    'The rewrite preserves the asynchronous boundary through the exact host-delay Symbol and verifies that a later iterable failure terminates mergeMap at the original frame.',
  ],
  [
    'spec/subjects/ReplaySubject-spec.ts:247:ReplaySubject > with windowTime=4 > should replay previous values since 4 time units ago when subscribed',
    'The rewrite feeds the current replaySubject on rxTest virtual host time and bounds each direct observer, preserving the exact four-unit age-window replay sets without constructing a production TestScheduler.',
  ],
  [
    'spec/subjects/ReplaySubject-spec.ts:279:ReplaySubject > with windowTime=4 > should replay last values since 4 time units ago when subscribed',
    'The rewrite feeds the current replaySubject on rxTest virtual host time and bounds the late direct observer, preserving terminal replay inside the four-unit age window without constructing a production TestScheduler.',
  ],
  [
    'spec/subjects/ReplaySubject-spec.ts:303:ReplaySubject > with windowTime=4 > should only replay bufferSize items when 4 time units ago more were emitted',
    'The rewrite feeds the current replaySubject on rxTest virtual host time and bounds the direct observer, preserving the combined buffer-size and four-unit age-window claim without constructing a production TestScheduler.',
  ],
  [
    'spec/operators/repeatWhen-spec.ts:339:repeatWhen operator > should handle a host source that completes via operator like take, and a hot notifier',
    'The source case was skipped in RxJS 7 with an expectation that completed before its notifier; the rewrite preserves resubscriptions and waits for notifier completion.',
  ],
]);
// Subscription replacements close original open logs only where the synthetic
// observation boundary itself performs the corresponding unsubscription.
const observationBoundaries = new Map([
  [
    'spec/observables/dom/animationFrames-spec.ts:17:animationFrames > should animate',
    { marbles: new Map([['subs', boundedSubscription(0, 12)]]) },
  ],
  [
    'spec/observables/dom/animationFrames-spec.ts:37:animationFrames > should use any passed timestampProvider',
    { marbles: new Map([['subs', boundedSubscription(0, 12)]]) },
  ],
  [
    'spec/observables/dom/animationFrames-spec.ts:60:animationFrames > should compose with take',
    { observable: boundedSubscription(0, 12) },
  ],
  [
    'spec/observables/dom/animationFrames-spec.ts:86:animationFrames > should compose with takeUntil',
    { observable: boundedSubscription(0, 12) },
  ],
  [
    'spec/operators/timeInterval-spec.ts:73:timeInterval > should record interval then does not completes if source emits but not completes',
    {
      observable: boundedSubscription(0, 7),
      subscriptions: new Map([['e1subs', boundedSubscription(0, 7)]]),
    },
  ],
  [
    'spec/operators/delay-spec.ts:213:delay > should not complete when source never completes',
    {
      observable: boundedSubscription(0, 1),
      subscriptions: new Map([['e1subs', boundedSubscription(0, 1)]]),
    },
  ],
  [
    'spec/operators/timeout-spec.ts:561:timeout operator > using with > should timeout after a specified period between emit then never completes if other source does not complete',
    {
      observable: boundedSubscription(0, 21),
      subscriptions: new Map([['innerSubs', boundedSubscription(9, 21)]]),
    },
  ],
  [
    'spec/operators/timeout-spec.ts:595:timeout operator > using with > should timeout after a specified period between emit then never completes if other source emits but not complete',
    {
      observable: boundedSubscription(0, 20),
      subscriptions: new Map([['innerSubs', boundedSubscription(11, 20)]]),
    },
  ],
  [
    'spec/operators/timeout-spec.ts:694:timeout operator > using with > should not timeout if source emits synchronously when subscribed',
    { observable: boundedSubscription(0, 4) },
  ],
  [
    'spec/operators/timeoutWith-spec.ts:145:timeoutWith operator > should timeout after a specified period between emit then never completes if other source does not complete',
    {
      observable: boundedSubscription(0, 21),
      subscriptions: new Map([['switchToSubs', boundedSubscription(9, 21)]]),
    },
  ],
  [
    'spec/operators/timeoutWith-spec.ts:179:timeoutWith operator > should timeout after a specified period between emit then never completes if other source emits but not complete',
    {
      observable: boundedSubscription(0, 20),
      subscriptions: new Map([['switchToSubs', boundedSubscription(11, 20)]]),
    },
  ],
  [
    'spec/operators/timeInterval-spec.ts:131:timeInterval > should not completes if source never completes',
    {
      observable: boundedSubscription(0, 1),
      subscriptions: new Map([['e1subs', boundedSubscription(0, 1)]]),
    },
  ],
  [
    'spec/operators/timestamp-spec.ts:72:timestamp > should record stamp then does not completes if source emits but not completes',
    {
      observable: boundedSubscription(0, 7),
      subscriptions: new Map([['e1subs', boundedSubscription(0, 7)]]),
    },
  ],
  [
    'spec/operators/timestamp-spec.ts:130:timestamp > should not completes if source never completes',
    {
      observable: boundedSubscription(0, 1),
      subscriptions: new Map([['e1subs', boundedSubscription(0, 1)]]),
    },
  ],
  [
    'spec/operators/observeOn-spec.ts:62:observeOn > should observe when source does not complete',
    {
      observable: boundedSubscription(0, 5),
      subscriptions: new Map([['e1subs', boundedSubscription(0, 5)]]),
    },
  ],
  [
    'spec/operators/subscribeOn-spec.ts:68:subscribeOn > should subscribe when source does not complete',
    {
      observable: boundedSubscription(0, 5),
      subscriptions: new Map([['sub', boundedSubscription(0, 5)]]),
    },
  ],
  [
    'spec/operators/subscribeOn-spec.ts:113:subscribeOn > should properly support a delayTime of Infinity',
    { observable: boundedSubscription(0, 9) },
  ],
  [
    'spec/operators/groupBy-spec.ts:160:groupBy operator > should handle a never Observable',
    {
      observable: boundedSubscription(0, 1),
      subscriptions: new Map([['e1subs', boundedSubscription(0, 1)]]),
    },
  ],
  [
    'spec/operators/isEmpty-spec.ts:47:isEmpty > should not complete if source never emits',
    {
      observable: boundedSubscription(0, 1),
      subscriptions: new Map([['e1subs', boundedSubscription(0, 1)]]),
    },
  ],
  [
    'spec/operators/pairwise-spec.ts:91:pairwise operator > should handle never',
    {
      observable: boundedSubscription(0, 1),
      subscriptions: new Map([['e1subs', boundedSubscription(0, 1)]]),
    },
  ],
  [
    'spec/operators/throwIfEmpty-spec.ts:68:throwIfEmpty > with errorFactory > should never when never',
    {
      observable: boundedSubscription(0, 1),
      subscriptions: new Map([['sub1', boundedSubscription(0, 1)]]),
    },
  ],
  [
    'spec/operators/throwIfEmpty-spec.ts:169:throwIfEmpty > without errorFactory > should never when never',
    {
      observable: boundedSubscription(0, 1),
      subscriptions: new Map([['sub1', boundedSubscription(0, 1)]]),
    },
  ],
  [
    'spec/operators/startWith-spec.ts:42:startWith > should start with given value and does not completes if source does not completes',
    {
      observable: boundedSubscription(0, 6),
      subscriptions: new Map([['e1subs', boundedSubscription(0, 6)]]),
    },
  ],
  [
    'spec/operators/startWith-spec.ts:55:startWith > should start with given value and does not completes if source never emits',
    {
      observable: boundedSubscription(0, 2),
      subscriptions: new Map([['e1subs', boundedSubscription(0, 2)]]),
    },
  ],
  [
    'spec/operators/sample-spec.ts:84:sample > should not complete when the notifier completes, nor should it emit',
    {
      observable: boundedSubscription(0, 34),
      subscriptions: new Map([['e1subs', boundedSubscription(0, 34)]]),
    },
  ],
  [
    'spec/operators/sample-spec.ts:218:sample > should not completes if source does not complete',
    {
      observable: boundedSubscription(0, 15),
      subscriptions: new Map([['e1subs', boundedSubscription(0, 15)]]),
    },
  ],
  [
    'spec/operators/find-spec.ts:35:find > should not emit if source does not emit',
    {
      observable: '^!',
      subscriptions: new Map([['e1subs', '^!']]),
    },
  ],
  [
    'spec/operators/findIndex-spec.ts:35:findIndex > should not emit if source does not emit',
    {
      observable: '^!',
      subscriptions: new Map([['e1subs', '^!']]),
    },
  ],
  [
    'spec/observables/partition-spec.ts:254:partition > should partition to infinite observable if source does not completes',
    {
      observable: boundedSubscription(0, 20),
      subscriptions: new Map([['e1subs', boundedSubscription(0, 20)]]),
    },
  ],
  [
    'spec/observables/partition-spec.ts:273:partition > should partition to infinite observable if source never completes',
    {
      observable: '^!',
      subscriptions: new Map([['e1subs', '^!']]),
    },
  ],
  [
    'spec/operators/skipUntil-spec.ts:181:skipUntil > should not complete if hot source observable does not complete',
    {
      observable: boundedSubscription(0, 16),
      subscriptions: new Map([['e1subs', boundedSubscription(0, 16)]]),
    },
  ],
  [
    'spec/operators/skipUntil-spec.ts:195:skipUntil > should not complete if cold source observable never completes',
    {
      observable: boundedSubscription(0, 16),
      subscriptions: new Map([['e1subs', boundedSubscription(0, 16)]]),
    },
  ],
  [
    'spec/operators/skipUntil-spec.ts:265:skipUntil > should not complete if source does not complete if notifier completes without emission',
    {
      observable: boundedSubscription(0, 14),
      subscriptions: new Map([['e1subs', boundedSubscription(0, 14)]]),
    },
  ],
  [
    'spec/operators/skipUntil-spec.ts:279:skipUntil > should not complete if source and notifier are both hot never',
    {
      observable: boundedSubscription(0, 1),
      subscriptions: new Map([
        ['e1subs', boundedSubscription(0, 1)],
        ['skipSubs', boundedSubscription(0, 1)],
      ]),
    },
  ],
  [
    'spec/operators/skipUntil-spec.ts:316:skipUntil > should unsubscribe the notifier after its first nexted value',
    {
      // RxJS 7 uses `^` to shift this expected diagram's zero point after the
      // leading pre-zero frame. rxTest reserves that token for hot sources, so
      // remove the zero marker while retaining the resulting absolute frames.
      marbles: new Map([['expected', '----------o---o---o---o---|']]),
    },
  ],
  [
    'spec/operators/takeUntil-spec.ts:136:takeUntil operator > should not complete when notifier is empty if source observable does not complete',
    {
      observable: boundedSubscription(0, 3),
      subscriptions: new Map([['e1subs', boundedSubscription(0, 3)]]),
    },
  ],
  [
    'spec/operators/takeUntil-spec.ts:150:takeUntil operator > should not complete when source and notifier do not complete',
    {
      observable: boundedSubscription(0, 1),
      subscriptions: new Map([
        ['e1subs', boundedSubscription(0, 1)],
        ['e2subs', boundedSubscription(0, 1)],
      ]),
    },
  ],
  [
    'spec/operators/repeatWhen-spec.ts:183:repeatWhen operator > should apply a never notifier on an empty source',
    { observable: boundedSubscription(0, 1) },
  ],
  [
    'spec/operators/repeatWhen-spec.ts:251:repeatWhen operator > should return a never-ending result if the notifier is never',
    { observable: boundedSubscription(0, 42) },
  ],
  [
    'spec/operators/repeatWhen-spec.ts:310:repeatWhen operator > should mirror a basic cold source with no termination, given a never notifier',
    {
      observable: boundedSubscription(0, 12),
      subscriptions: new Map([['subs', boundedSubscription(0, 12)]]),
    },
  ],
  [
    'spec/operators/retryWhen-spec.ts:186:retryWhen > should return a never observable given a just-throw source and never notifier',
    { observable: boundedSubscription(0, 1) },
  ],
  [
    'spec/operators/retryWhen-spec.ts:198:retryWhen > should hide errors using a never notifier on a source with eventual error',
    { observable: boundedSubscription(0, 42) },
  ],
  [
    'spec/operators/retryWhen-spec.ts:257:retryWhen > should mirror a basic cold source with no termination, given an empty notifier',
    {
      observable: boundedSubscription(0, 12),
      subscriptions: new Map([['subs', boundedSubscription(0, 12)]]),
    },
  ],
  [
    'spec/Subject-spec.ts:608:Subject > asObservable > should handle subject never emits',
    { observable: '^!' },
  ],
  [
    'spec/observables/never-spec.ts:15:NEVER > should create a cold observable that never emits',
    { observable: '^!' },
  ],
  [
    'spec/operators/ignoreElements-spec.ts:79:ignoreElements > should handle never',
    { observable: '^!', subscriptions: new Map([['e1subs', '^!']]) },
  ],
  [
    'spec/operators/filter-spec.ts:304:filter > should handle never',
    { observable: '^!', subscriptions: new Map([['e1subs', '^!']]) },
  ],
  [
    'spec/operators/take-spec.ts:37:take > should go on forever on never',
    { observable: '^!', subscriptions: new Map([['e1subs', '^!']]) },
  ],
  [
    'spec/operators/finalize-spec.ts:97:finalize > should handle never',
    {
      observable: '^!',
      subscriptions: new Map([['e1subs', '^!']]),
      // Preserve the source assertion that finalize has not run while the
      // never-source is still active. The synthetic boundary runs afterward.
      manualFlushThroughFrame: 0,
    },
  ],
  [
    'spec/operators/distinctUntilChanged-spec.ts:37:distinctUntilChanged > should distinguish between values and does not complete',
    {
      observable: boundedSubscription(0, 19),
      subscriptions: new Map([['e1subs', boundedSubscription(0, 19)]]),
    },
  ],
  [
    'spec/operators/distinctUntilChanged-spec.ts:48:distinctUntilChanged > should not complete if source never completes',
    { observable: '^!', subscriptions: new Map([['e1subs', '^!']]) },
  ],
  [
    'spec/operators/distinctUntilChanged-spec.ts:59:distinctUntilChanged > should not complete if source does not complete',
    { observable: '^!', subscriptions: new Map([['e1subs', '^!']]) },
  ],
  [
    'spec/operators/distinct-spec.ts:26:distinct > should distinguish between values and does not complete',
    {
      observable: boundedSubscription(0, 19),
      subscriptions: new Map([['e1subs', boundedSubscription(0, 19)]]),
    },
  ],
  [
    'spec/operators/distinct-spec.ts:37:distinct > should not complete if source never completes',
    { observable: '^!', subscriptions: new Map([['e1subs', '^!']]) },
  ],
  [
    'spec/operators/distinct-spec.ts:48:distinct > should not complete if source does not complete',
    { observable: '^!', subscriptions: new Map([['e1subs', '^!']]) },
  ],
  [
    'spec/operators/count-spec.ts:26:count > should be never when source is never',
    { observable: '^!', subscriptions: new Map([['e1subs', '^!']]) },
  ],
  [
    "spec/operators/count-spec.ts:48:count > should be never when source doesn't complete",
    {
      observable: boundedSubscription(0, 6),
      subscriptions: new Map([['e1subs', boundedSubscription(0, 6)]]),
    },
  ],
  [
    'spec/operators/count-spec.ts:298:count > should handle an always-true predicate on a hot never-observable',
    {
      observable: boundedSubscription(0, 5),
      subscriptions: new Map([['e1subs', boundedSubscription(0, 5)]]),
    },
  ],
  [
    'spec/operators/every-spec.ts:290:every > should not complete if source never emits',
    { observable: '^!', subscriptions: new Map([['e1subs', '^!']]) },
  ],
  [
    'spec/operators/max-spec.ts:26:max > should be never when source is never',
    { observable: '^!', subscriptions: new Map([['e1subs', '^!']]) },
  ],
  [
    "spec/operators/max-spec.ts:48:max > should be never when source doesn't complete",
    {
      observable: boundedSubscription(0, 6),
      subscriptions: new Map([['e1subs', boundedSubscription(0, 6)]]),
    },
  ],
  [
    'spec/operators/max-spec.ts:207:max > should handle a constant predicate on an never hot observable',
    {
      observable: boundedSubscription(0, 5),
      subscriptions: new Map([['e1subs', boundedSubscription(0, 5)]]),
    },
  ],
  [
    'spec/operators/min-spec.ts:26:min > should be never when source is never',
    { observable: '^!', subscriptions: new Map([['e1subs', '^!']]) },
  ],
  [
    "spec/operators/min-spec.ts:48:min > should be never when source doesn't complete",
    {
      observable: boundedSubscription(0, 6),
      subscriptions: new Map([['e1subs', boundedSubscription(0, 6)]]),
    },
  ],
  [
    'spec/operators/min-spec.ts:171:min > should handle a constant predicate on an never hot observable',
    {
      observable: boundedSubscription(0, 5),
      subscriptions: new Map([['e1subs', boundedSubscription(0, 5)]]),
    },
  ],
  [
    'spec/operators/distinctUntilKeyChanged-spec.ts:41:distinctUntilKeyChanged > should distinguish between values and does not complete',
    {
      observable: boundedSubscription(0, 19),
      subscriptions: new Map([['e1subs', boundedSubscription(0, 19)]]),
    },
  ],
  [
    'spec/operators/distinctUntilKeyChanged-spec.ts:77:distinctUntilKeyChanged > should not complete if source never completes',
    { observable: '^!', subscriptions: new Map([['e1subs', '^!']]) },
  ],
  [
    'spec/operators/distinctUntilKeyChanged-spec.ts:88:distinctUntilKeyChanged > should not complete if source does not complete',
    { observable: '^!', subscriptions: new Map([['e1subs', '^!']]) },
  ],
  [
    'spec/operators/reduce-spec.ts:207:reduce > should not complete with seed if source emits but does not complete',
    {
      observable: boundedSubscription(0, 5),
      subscriptions: new Map([['e1subs', boundedSubscription(0, 5)]]),
    },
  ],
  [
    'spec/operators/reduce-spec.ts:220:reduce > should not complete with seed if source never completes',
    { observable: '^!', subscriptions: new Map([['e1subs', '^!']]) },
  ],
  [
    'spec/operators/reduce-spec.ts:233:reduce > should not complete without seed if source emits but does not completes',
    {
      observable: boundedSubscription(0, 8),
      subscriptions: new Map([['e1subs', boundedSubscription(0, 8)]]),
    },
  ],
  [
    'spec/operators/reduce-spec.ts:246:reduce > should not complete without seed if source never completes',
    { observable: '^!', subscriptions: new Map([['e1subs', '^!']]) },
  ],
  [
    'spec/operators/skip-spec.ts:144:skip > should not complete if source never completes without emit',
    { observable: '^!', subscriptions: new Map([['e1subs', '^!']]) },
  ],
  [
    'spec/operators/skip-spec.ts:155:skip > should skip values before total and never completes if source emits and does not complete',
    {
      observable: boundedSubscription(0, 10),
      subscriptions: new Map([['e1subs', boundedSubscription(0, 10)]]),
    },
  ],
  [
    'spec/operators/skip-spec.ts:166:skip > should skip all values and never completes if total is more than numbers of value and source does not complete',
    {
      observable: boundedSubscription(0, 10),
      subscriptions: new Map([['e1subs', boundedSubscription(0, 10)]]),
    },
  ],
  [
    'spec/operators/skip-spec.ts:177:skip > should skip all values and never completes if total is same asnumbers of value and source does not complete',
    {
      observable: boundedSubscription(0, 10),
      subscriptions: new Map([['e1subs', boundedSubscription(0, 10)]]),
    },
  ],
  [
    'spec/operators/audit-spec.ts:369:audit operator > should handle a never source',
    { observable: '^!', subscriptions: new Map([['subs', '^!']]) },
  ],
  [
    'spec/operators/audit-spec.ts:173:audit operator > should emit no values and never complete if duration is a never',
    {
      observable: '^------------------------------!',
      subscriptions: new Map([['e2subs', '----^--------------------------!']]),
    },
  ],
  [
    'spec/operators/throttle-spec.ts:355:throttle > should handle a never source',
    { observable: '^!', subscriptions: new Map([['subs', '^!']]) },
  ],
  [
    'spec/operators/auditTime-spec.ts:120:auditTime > should handle a never source',
    { observable: '^!', subscriptions: new Map([['e1subs', '^!']]) },
  ],
  [
    'spec/operators/throttleTime-spec.ts:116:throttleTime operator > default behavior { leading: true, trailing: false } > should handle a never source',
    { observable: '^!', subscriptions: new Map([['subs', '^!']]) },
  ],
  [
    'spec/observables/zip-spec.ts:17:zip > should combine a source with a second',
    {
      observable: boundedSubscription(0, 18),
      subscriptions: new Map([
        ['asubs', boundedSubscription(0, 18)],
        ['bsubs', boundedSubscription(0, 18)],
      ]),
    },
  ],
  [
    'spec/observables/zip-spec.ts:216:zip > should combine two observables and selector',
    {
      observable: boundedSubscription(0, 18),
      subscriptions: new Map([
        ['asubs', boundedSubscription(0, 18)],
        ['bsubs', boundedSubscription(0, 18)],
      ]),
    },
  ],
  [
    'spec/observables/zip-spec.ts:148:zip > with iterables > should work with never observable and non-empty iterable',
    { observable: boundedSubscription(0, 1), subscriptions: new Map([['asubs', boundedSubscription(0, 1)]]) },
  ],
  [
    'spec/observables/zip-spec.ts:355:zip > should work with two nevers',
    {
      observable: boundedSubscription(0, 1),
      subscriptions: new Map([
        ['asubs', boundedSubscription(0, 1)],
        ['bsubs', boundedSubscription(0, 1)],
      ]),
    },
  ],
  [
    'spec/observables/zip-spec.ts:439:zip > should work with never and non-empty',
    { observable: boundedSubscription(0, 7), subscriptions: new Map([['asubs', boundedSubscription(0, 7)]]) },
  ],
  [
    'spec/observables/zip-spec.ts:453:zip > should work with non-empty and never',
    { observable: boundedSubscription(0, 7), subscriptions: new Map([['bsubs', boundedSubscription(0, 7)]]) },
  ],
  [
    'spec/operators/zipWith-spec.ts:15:zipWith > should combine a source with a second',
    {
      observable: boundedSubscription(0, 18),
      subscriptions: new Map([
        ['asubs', boundedSubscription(0, 18)],
        ['bsubs', boundedSubscription(0, 18)],
      ]),
    },
  ],
  [
    'spec/operators/zip-legacy-spec.ts:153:zip legacy > should combine two observables and selector',
    {
      observable: boundedSubscription(0, 18),
      subscriptions: new Map([
        ['asubs', boundedSubscription(0, 18)],
        ['bsubs', boundedSubscription(0, 18)],
      ]),
    },
  ],
  [
    'spec/operators/zipWith-spec.ts:145:zipWith > with iterables > should work with never observable and non-empty iterable',
    { observable: boundedSubscription(0, 1), subscriptions: new Map([['asubs', boundedSubscription(0, 1)]]) },
  ],
  [
    'spec/operators/zipWith-spec.ts:223:zipWith > should work with two nevers',
    {
      observable: boundedSubscription(0, 1),
      subscriptions: new Map([
        ['asubs', boundedSubscription(0, 1)],
        ['bsubs', boundedSubscription(0, 1)],
      ]),
    },
  ],
  [
    'spec/operators/zipWith-spec.ts:307:zipWith > should work with never and non-empty',
    { observable: boundedSubscription(0, 7), subscriptions: new Map([['asubs', boundedSubscription(0, 7)]]) },
  ],
  [
    'spec/operators/zipWith-spec.ts:321:zipWith > should work with non-empty and never',
    { observable: boundedSubscription(0, 7), subscriptions: new Map([['bsubs', boundedSubscription(0, 7)]]) },
  ],
  [
    'spec/operators/zipAll-spec.ts:28:zipAll operator > should combine two observables',
    {
      observable: boundedSubscription(0, 18),
      subscriptions: new Map([
        ['asubs', boundedSubscription(0, 18)],
        ['bsubs', boundedSubscription(0, 18)],
      ]),
    },
  ],
  [
    'spec/operators/zipAll-spec.ts:173:zipAll operator > with iterables > should work with never observable and non-empty iterable',
    { observable: boundedSubscription(0, 1), subscriptions: new Map([['asubs', boundedSubscription(0, 1)]]) },
  ],
  [
    'spec/operators/zipAll-spec.ts:241:zipAll operator > should combine two observables and selector',
    {
      observable: boundedSubscription(0, 18),
      subscriptions: new Map([
        ['asubs', boundedSubscription(0, 18)],
        ['bsubs', boundedSubscription(0, 18)],
      ]),
    },
  ],
  [
    'spec/operators/zipAll-spec.ts:478:zipAll operator > should work with two nevers',
    {
      observable: boundedSubscription(0, 1),
      subscriptions: new Map([
        ['asubs', boundedSubscription(0, 1)],
        ['bsubs', boundedSubscription(0, 1)],
      ]),
    },
  ],
  [
    'spec/operators/zipAll-spec.ts:562:zipAll operator > should work with never and non-empty',
    { observable: boundedSubscription(0, 7), subscriptions: new Map([['asubs', boundedSubscription(0, 7)]]) },
  ],
  [
    'spec/operators/zipAll-spec.ts:576:zipAll operator > should work with non-empty and never',
    { observable: boundedSubscription(0, 7), subscriptions: new Map([['bsubs', boundedSubscription(0, 7)]]) },
  ],
  [
    'spec/operators/zipAll-spec.ts:590:zipAll operator > should combine a source with a second',
    {
      observable: boundedSubscription(0, 18),
      subscriptions: new Map([
        ['asubs', boundedSubscription(0, 18)],
        ['bsubs', boundedSubscription(0, 18)],
      ]),
    },
  ],
  [
    'spec/observables/combineLatest-spec.ts:126:static combineLatest > should work with two nevers',
    {
      observable: boundedSubscription(0, 1),
      subscriptions: new Map([
        ['e1subs', boundedSubscription(0, 1)],
        ['e2subs', boundedSubscription(0, 1)],
      ]),
    },
  ],
  [
    'spec/observables/combineLatest-spec.ts:142:static combineLatest > should work with never and empty',
    { observable: boundedSubscription(0, 1), subscriptions: new Map([['e1subs', boundedSubscription(0, 1)]]) },
  ],
  [
    'spec/observables/combineLatest-spec.ts:158:static combineLatest > should work with empty and never',
    { observable: boundedSubscription(0, 1), subscriptions: new Map([['e2subs', boundedSubscription(0, 1)]]) },
  ],
  [
    'spec/observables/combineLatest-spec.ts:233:static combineLatest > should work with hot-single and never',
    { observable: boundedSubscription(0, 3), subscriptions: new Map([['e2subs', boundedSubscription(0, 3)]]) },
  ],
  [
    'spec/observables/combineLatest-spec.ts:252:static combineLatest > should work with never and hot-single',
    { observable: boundedSubscription(0, 5), subscriptions: new Map([['e1subs', boundedSubscription(0, 5)]]) },
  ],
  [
    'spec/operators/combineLatest-legacy-spec.ts:35:combineLatest > should work with two nevers',
    {
      observable: boundedSubscription(0, 1),
      subscriptions: new Map([
        ['e1subs', boundedSubscription(0, 1)],
        ['e2subs', boundedSubscription(0, 1)],
      ]),
    },
  ],
  [
    'spec/operators/combineLatest-legacy-spec.ts:51:combineLatest > should work with never and empty',
    { observable: boundedSubscription(0, 1), subscriptions: new Map([['e1subs', boundedSubscription(0, 1)]]) },
  ],
  [
    'spec/operators/combineLatest-legacy-spec.ts:67:combineLatest > should work with empty and never',
    { observable: boundedSubscription(0, 1), subscriptions: new Map([['e2subs', boundedSubscription(0, 1)]]) },
  ],
  [
    'spec/operators/combineLatest-legacy-spec.ts:142:combineLatest > should work with hot-single and never',
    { observable: boundedSubscription(0, 3), subscriptions: new Map([['e2subs', boundedSubscription(0, 3)]]) },
  ],
  [
    'spec/operators/combineLatest-legacy-spec.ts:161:combineLatest > should work with never and hot-single',
    { observable: boundedSubscription(0, 5), subscriptions: new Map([['e1subs', boundedSubscription(0, 5)]]) },
  ],
  [
    'spec/operators/combineLatestWith-spec.ts:38:combineLatestWith > should work with two nevers',
    {
      observable: boundedSubscription(0, 1),
      subscriptions: new Map([
        ['e1subs', boundedSubscription(0, 1)],
        ['e2subs', boundedSubscription(0, 1)],
      ]),
    },
  ],
  [
    'spec/operators/combineLatestWith-spec.ts:57:combineLatestWith > should work with never and empty',
    { observable: boundedSubscription(0, 1), subscriptions: new Map([['e1subs', boundedSubscription(0, 1)]]) },
  ],
  [
    'spec/operators/combineLatestWith-spec.ts:76:combineLatestWith > should work with empty and never',
    { observable: boundedSubscription(0, 1), subscriptions: new Map([['e2subs', boundedSubscription(0, 1)]]) },
  ],
  [
    'spec/operators/combineLatestWith-spec.ts:163:combineLatestWith > should work with hot-single and never',
    { observable: boundedSubscription(0, 3), subscriptions: new Map([['e2subs', boundedSubscription(0, 3)]]) },
  ],
  [
    'spec/operators/combineLatestWith-spec.ts:185:combineLatestWith > should work with never and hot-single',
    { observable: boundedSubscription(0, 5), subscriptions: new Map([['e1subs', boundedSubscription(0, 5)]]) },
  ],
  [
    'spec/operators/combineLatestAll-spec.ts:28:combineLatestAll operator > should work with two nevers',
    {
      observable: boundedSubscription(0, 1),
      subscriptions: new Map([
        ['e1subs', boundedSubscription(0, 1)],
        ['e2subs', boundedSubscription(0, 1)],
      ]),
    },
  ],
  [
    'spec/operators/combineLatestAll-spec.ts:44:combineLatestAll operator > should work with never and empty',
    { observable: boundedSubscription(0, 1), subscriptions: new Map([['e1subs', boundedSubscription(0, 1)]]) },
  ],
  [
    'spec/operators/combineLatestAll-spec.ts:60:combineLatestAll operator > should work with empty and never',
    { observable: boundedSubscription(0, 1), subscriptions: new Map([['e2subs', boundedSubscription(0, 1)]]) },
  ],
  [
    'spec/operators/combineLatestAll-spec.ts:124:combineLatestAll operator > should work with hot-single and never',
    { observable: boundedSubscription(0, 3), subscriptions: new Map([['e2subs', boundedSubscription(0, 3)]]) },
  ],
  [
    'spec/operators/combineLatestAll-spec.ts:140:combineLatestAll operator > should work with never and hot-single',
    { observable: boundedSubscription(0, 5), subscriptions: new Map([['e1subs', boundedSubscription(0, 5)]]) },
  ],
  [
    'spec/observables/forkJoin-spec.ts:190:forkJoin > forkJoin([input1, input2, input3]) > should not complete when only source never completes',
    { observable: boundedSubscription(0, 14) },
  ],
  [
    'spec/observables/forkJoin-spec.ts:199:forkJoin > forkJoin([input1, input2, input3]) > should not complete when one of the sources never completes',
    { observable: boundedSubscription(0, 1) },
  ],
  [
    'spec/observables/forkJoin-spec.ts:451:forkJoin > forkJoin({ foo, bar, baz }) > should not complete when only source never completes',
    { observable: boundedSubscription(0, 14) },
  ],
  [
    'spec/observables/forkJoin-spec.ts:462:forkJoin > forkJoin({ foo, bar, baz }) > should not complete when one of the sources never completes',
    { observable: boundedSubscription(0, 14) },
  ],
  [
    'spec/operators/catchError-spec.ts:329:catchError operator > should never terminate if you return NEVER',
    {
      observable: boundedSubscription(0, 9),
      subscriptions: new Map([['e2subs', boundedSubscription(8, 9)]]),
    },
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
    'spec/operators/endWith-spec.ts:50:endWith > should not end with given value if source does not complete',
    { observable: '^-----!', subscriptions: new Map([['e1subs', '^-----!']]) },
  ],
  [
    'spec/operators/endWith-spec.ts:61:endWith > should not end with given value if source never emits and does not completes',
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
    'spec/operators/retry-spec.ts:239:retry > should handle a never source',
    { observable: '^!', subscriptions: new Map([['subs', '^!']]) },
  ],
  [
    'spec/operators/retry-spec.ts:277:retry > should handle a basic source that emits next but does not complete',
    { observable: '^------------!', subscriptions: new Map([['subs', '^------------!']]) },
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
    'spec/operators/exhaustAll-spec.ts:71:exhaust > should handle never',
    { observable: '^!', subscriptions: new Map([['e1subs', '^!']]) },
  ],
  [
    'spec/operators/exhaustAll-spec.ts:140:exhaust > should handle a hot observable of observables, inner never completes',
    {
      observable: '^--------------------------!',
      subscriptions: new Map([['zsubs', '--------------^------------!']]),
    },
  ],
  [
    'spec/operators/exhaustAll-spec.ts:214:exhaust > should handle a never hot observable',
    { observable: '^!', subscriptions: new Map([['e1subs', '^!']]) },
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
  [
    'spec/operators/buffer-spec.ts:94:Observable.prototype.buffer > should work with never and never selector',
    { observable: '^!' },
  ],
  [
    'spec/operators/buffer-spec.ts:103:Observable.prototype.buffer > should work with never and empty selector',
    { observable: '^!' },
  ],
  [
    'spec/observables/merge-spec.ts:123:static merge(...observables) > should merge never and empty',
    { observable: '^!', subscriptions: new Map([['e1subs', '^!']]) },
  ],
  [
    'spec/observables/merge-spec.ts:139:static merge(...observables) > should merge never and never',
    {
      observable: '^!',
      subscriptions: new Map([
        ['e1subs', '^!'],
        ['e2subs', '^!'],
      ]),
    },
  ],
  [
    'spec/operators/mergeWith-spec.ts:202:merge operator > should merge never and empty',
    { observable: '^!', subscriptions: new Map([['e1subs', '^!']]) },
  ],
  [
    'spec/operators/mergeWith-spec.ts:217:merge operator > should merge never and never',
    {
      observable: '^!',
      subscriptions: new Map([
        ['e1subs', '^!'],
        ['e2subs', '^!'],
      ]),
    },
  ],
  [
    'spec/operators/concatAll-spec.ts:206:concatAll operator > should not complete if first source does not completes',
    { observable: '^!', subscriptions: new Map([['e1subs', '^!']]) },
  ],
  [
    'spec/operators/concatAll-spec.ts:222:concatAll operator > should not complete if second source does not completes',
    { observable: '^--!', subscriptions: new Map([['e2subs', '--^!']]) },
  ],
  [
    'spec/operators/concatAll-spec.ts:238:concatAll operator > should not complete if both sources do not complete',
    { observable: '^!', subscriptions: new Map([['e1subs', '^!']]) },
  ],
  [
    'spec/operators/concatAll-spec.ts:334:concatAll operator > should emit element from first source, and should not complete if second source does not completes',
    { observable: '^-----!', subscriptions: new Map([['e2subs', '-----^!']]) },
  ],
  [
    'spec/operators/concatAll-spec.ts:350:concatAll operator > should not complete if first source does not complete',
    { observable: '^!', subscriptions: new Map([['e1subs', '^!']]) },
  ],
  [
    'spec/operators/concatWith-spec.ts:65:concat operator > should not complete if first source does not completes',
    { observable: '^!', subscriptions: new Map([['e1subs', '^!']]) },
  ],
  [
    'spec/operators/concatWith-spec.ts:79:concat operator > should not complete if second source does not completes',
    { observable: '^--!', subscriptions: new Map([['e2subs', '--^!']]) },
  ],
  [
    'spec/operators/concatWith-spec.ts:93:concat operator > should not complete if both sources do not complete',
    { observable: '^!', subscriptions: new Map([['e1subs', '^!']]) },
  ],
  [
    'spec/operators/concatWith-spec.ts:177:concat operator > should emit element from first source, and should not complete if second source does not completes',
    { observable: '^-----!', subscriptions: new Map([['e2subs', '-----^!']]) },
  ],
  [
    'spec/operators/concatWith-spec.ts:191:concat operator > should not complete if first source does not complete',
    { observable: '^!', subscriptions: new Map([['e1subs', '^!']]) },
  ],
  [
    'spec/operators/concat-legacy-spec.ts:64:concat operator > should not complete if first source does not complete',
    { observable: '^!', subscriptions: new Map([['e1subs', '^!']]) },
  ],
  [
    'spec/operators/concat-legacy-spec.ts:78:concat operator > should not complete if second source does not complete',
    { observable: '^--!', subscriptions: new Map([['e2subs', '--^!']]) },
  ],
  [
    'spec/operators/concat-legacy-spec.ts:92:concat operator > should not complete if both sources do not complete',
    { observable: '^!', subscriptions: new Map([['e1subs', '^!']]) },
  ],
  [
    'spec/operators/concat-legacy-spec.ts:176:concat operator > should emit element from first source, and should not complete if second source does not complete',
    { observable: '^-----!', subscriptions: new Map([['e2subs', '-----^!']]) },
  ],
  [
    'spec/operators/concat-legacy-spec.ts:190:concat operator > should not complete if first source does not complete',
    { observable: '^!', subscriptions: new Map([['e1subs', '^!']]) },
  ],
  [
    'spec/operators/concatMap-spec.ts:145:Observable.prototype.concatMap > should handle a never source',
    { observable: '^!', subscriptions: new Map([['e1subs', '^!']]) },
  ],
  [
    'spec/operators/concatMap-spec.ts:210:Observable.prototype.concatMap > should return a never if the mapped inner is never',
    { observable: '^---------!', subscriptions: new Map([['innersubs', '--^-------!']]) },
  ],
  [
    'spec/operators/concatMap-spec.ts:272:Observable.prototype.concatMap > should concatMap many outer to many inner, outer never completes',
    {
      observable: '^------------------------------------------------!',
      subscriptions: new Map([['e1subs', '^------------------------------------------------!']]),
    },
  ],
  [
    'spec/operators/concatMap-spec.ts:294:Observable.prototype.concatMap > should concatMap many outer to many inner, inner never completes',
    { observable: '^-----------------!', subscriptions: new Map([['innersubs', '-^----------------!']]) },
  ],
  [
    'spec/operators/concatMap-spec.ts:401:Observable.prototype.concatMap > should concatMap many complex, all inners finite except one',
    {
      observable: '^------------------------------------------------------!',
      subscriptions: new Map([['dsubs', '-------------------^-----------------------------------!']]),
    },
  ],
  [
    'spec/operators/concatMap-spec.ts:436:Observable.prototype.concatMap > should concatMap many complex, inners finite, outer does not complete',
    {
      observable: '^------------------------------------------------------!',
      subscriptions: new Map([['e1subs', '^------------------------------------------------------!']]),
    },
  ],
  [
    'spec/operators/exhaustMap-spec.ts:116:exhaustMap > should handle outer never',
    { observable: '^!', subscriptions: new Map([['e1subs', '^!']]) },
  ],
  [
    'spec/operators/exhaustMap-spec.ts:291:exhaustMap > should switch inner cold observables, inner never completes',
    {
      observable: '^--------------------------------------------!',
      subscriptions: new Map([['zsubs', '-------------------------------^-------------!']]),
    },
  ],
  [
    'spec/operators/exhaustMap-spec.ts:402:exhaustMap > should switch inner empty and never',
    {
      observable: '^-----------------------------!',
      subscriptions: new Map([['ysubs', '-------------------^----------!']]),
    },
  ],
  [
    'spec/operators/exhaustMap-spec.ts:423:exhaustMap > should never switch inner never',
    {
      observable: '^------------------------------!',
      subscriptions: new Map([['xsubs', '---------^---------------------!']]),
    },
  ],
  [
    'spec/operators/switchMap-spec.ts:248:switchMap > should switch inner cold observables, inner never completes',
    {
      observable: '^------------------------------------!',
      subscriptions: new Map([['ysubs', '-------------------^-----------------!']]),
    },
  ],
  [
    'spec/operators/switchMap-spec.ts:353:switchMap > should switch inner empty and never',
    {
      observable: '^-----------------------------!',
      subscriptions: new Map([['ysubs', '-------------------^----------!']]),
    },
  ],
  [
    'spec/operators/switchMap-spec.ts:450:switchMap > should handle outer never',
    { observable: '^!', subscriptions: new Map([['e1subs', '^!']]) },
  ],
  [
    'spec/operators/debounce-spec.ts:155:debounce > should debounce and does not complete when source does not completes',
    {
      observable: boundedSubscription(0, 13),
      subscriptions: new Map([['e1subs', boundedSubscription(0, 13)]]),
    },
  ],
  [
    'spec/operators/debounce-spec.ts:166:debounce > should not complete when source does not complete',
    { observable: boundedSubscription(0, 1), subscriptions: new Map([['e1subs', boundedSubscription(0, 1)]]) },
  ],
  [
    'spec/operators/debounce-spec.ts:177:debounce > should not completes when source never completes',
    { observable: boundedSubscription(0, 1), subscriptions: new Map([['e1subs', boundedSubscription(0, 1)]]) },
  ],
  [
    'spec/operators/debounceTime-spec.ts:136:debounceTime > should debounce and does not complete when source does not completes',
    {
      observable: boundedSubscription(0, 27),
      subscriptions: new Map([['e1subs', boundedSubscription(0, 27)]]),
    },
  ],
  [
    'spec/operators/debounceTime-spec.ts:148:debounceTime > should not completes when source does not completes',
    { observable: boundedSubscription(0, 1), subscriptions: new Map([['e1subs', boundedSubscription(0, 1)]]) },
  ],
  [
    'spec/operators/debounceTime-spec.ts:160:debounceTime > should not completes when source never completes',
    { observable: boundedSubscription(0, 1), subscriptions: new Map([['e1subs', boundedSubscription(0, 1)]]) },
  ],
  [
    'spec/operators/withLatestFrom-spec.ts:156:withLatestFrom > should handle never',
    {
      observable: '^-------------------!',
      subscriptions: new Map([['e1subs', '^-------------------!']]),
    },
  ],
  [
    'spec/operators/mergeMap-spec.ts:350:mergeMap > should mergeMap many outer to many inner, inner never completes',
    {
      observable: boundedSubscription(0, 55),
      subscriptions: new Map([
        [
          'xsubs',
          new Map([
            [0, boundedSubscription(1, 55)],
            [1, boundedSubscription(9, 55)],
            [2, boundedSubscription(17, 55)],
            [3, boundedSubscription(25, 55)],
          ]),
        ],
      ]),
    },
  ],
  [
    'spec/operators/mergeMap-spec.ts:574:mergeMap > should mergeMap many complex, all inners finite except one',
    {
      observable: boundedSubscription(0, 55),
      subscriptions: new Map([['dsubs', boundedSubscription(8, 55)]]),
    },
  ],
  [
    'spec/operators/mergeMap-spec.ts:610:mergeMap > should mergeMap many complex, inners finite, outer does not complete',
    {
      observable: boundedSubscription(0, 55),
      subscriptions: new Map([['e1subs', boundedSubscription(0, 55)]]),
    },
  ],
  [
    'spec/operators/mergeMapTo-spec.ts:249:mergeMapTo > should mergeMapTo many outer to many inner, inner never completes',
    {
      observable: boundedSubscription(0, 55),
      subscriptions: new Map([
        [
          'xsubs',
          new Map([
            [0, boundedSubscription(1, 55)],
            [1, boundedSubscription(9, 55)],
            [2, boundedSubscription(17, 55)],
            [3, boundedSubscription(25, 55)],
          ]),
        ],
      ]),
    },
  ],
  [
    'spec/operators/delayWhen-spec.ts:154:delayWhen > should not emit if selector never emits',
    {
      observable: boundedSubscription(0, 9),
      subscriptions: new Map([
        [
          'selectorSubs',
          new Map([
            [0, boundedSubscription(2, 9)],
            [1, boundedSubscription(5, 9)],
          ]),
        ],
      ]),
    },
  ],
  [
    'spec/operators/materialize-spec.ts:114:materialize > should materialize stream that does not complete',
    {
      observable: boundedSubscription(0, 1),
      subscriptions: new Map([['e1subs', boundedSubscription(0, 1)]]),
    },
  ],
  [
    'spec/operators/dematerialize-spec.ts:80:dematerialize > should dematerialize stream does not completes',
    {
      observable: boundedSubscription(0, 6),
      subscriptions: new Map([['e1subs', boundedSubscription(0, 6)]]),
    },
  ],
  [
    'spec/operators/dematerialize-spec.ts:91:dematerialize > should dematerialize stream never completes',
    {
      observable: boundedSubscription(0, 1),
      subscriptions: new Map([['e1subs', boundedSubscription(0, 1)]]),
    },
  ],
  [
    'spec/operators/mergeScan-spec.ts:242:mergeScan > should handle a never projected Observable',
    { observable: boundedSubscription(0, 22) },
  ],
  [
    'spec/operators/mergeScan-spec.ts:268:mergeScan > handle never',
    {
      observable: boundedSubscription(0, 1),
      subscriptions: new Map([['e1subs', boundedSubscription(0, 1)]]),
    },
  ],
  [
    'spec/operators/switchScan-spec.ts:181:switchScan > should switch inner cold observables, inner never completes',
    {
      observable: boundedSubscription(0, 37),
      subscriptions: new Map([['ysubs', boundedSubscription(19, 37)]]),
    },
  ],
  [
    'spec/operators/switchScan-spec.ts:286:switchScan > should switch inner empty and never',
    {
      observable: boundedSubscription(0, 30),
      subscriptions: new Map([['ysubs', boundedSubscription(19, 30)]]),
    },
  ],
  [
    'spec/operators/switchScan-spec.ts:383:switchScan > should handle outer never',
    {
      observable: boundedSubscription(0, 1),
      subscriptions: new Map([['e1subs', boundedSubscription(0, 1)]]),
    },
  ],
  [
    'spec/operators/shareReplay-spec.ts:111:shareReplay > should multicast a never source',
    { observable: boundedSubscription(0, 1) },
  ],
  [
    'spec/operators/shareReplay-spec.ts:209:shareReplay > should not restart due to unsubscriptions if refCount is false',
    { marbles: new Map([['sub2', boundedSubscription(11, 19)]]) },
  ],
  [
    'spec/operators/shareReplay-spec.ts:291:shareReplay > should default to refCount being false',
    { marbles: new Map([['sub2', boundedSubscription(11, 19)]]) },
  ],
  [
    'spec/operators/shareReplay-spec.ts:343:shareReplay > should not skip values on a sync source',
    { observable: boundedSubscription(0, 9) },
  ],
]);
const expectedValueDictionaries = new Map([
  [
    'spec/operators/startWith-spec.ts:120:startWith > should start with given value and raises error if source raises error',
    new Map([['defaultStartValue', 'x']]),
  ],
  [
    'spec/operators/startWith-spec.ts:133:startWith > should start with given value and raises error immediately if source throws error',
    new Map([['defaultStartValue', 'x']]),
  ],
]);
// RxJS 7 starts a new producer for every subscription to a reused cold inner.
// Platform mode instead joins overlapping logical subscriptions to one
// ref-counted producer and restarts it only after the prior run closes. Exact
// message arrays are required because some joined bursts are denser than
// marble-group syntax can represent without shifting a later terminal frame.
const sharedManyComplete = observableMessages([
  [5, 'N', 'i'],
  [9, 'N', 'j'],
  [9, 'N', 'j'],
  [13, 'N', 'k'],
  [13, 'N', 'k'],
  [17, 'N', 'l'],
  [17, 'N', 'l'],
  [17, 'N', 'l'],
  [29, 'N', 'i'],
  [33, 'N', 'j'],
  [37, 'N', 'k'],
  [41, 'N', 'l'],
  [45, 'C'],
]);
const sharedManyCompleteLate = sharedManyComplete.map((message, index) =>
  index === sharedManyComplete.length - 1 ? { frame: 49, notification: { kind: 'C' } } : message
);
const sharedManyOuterNever = observableMessages([
  [5, 'N', 'i'],
  [9, 'N', 'j'],
  [9, 'N', 'j'],
  [13, 'N', 'k'],
  [13, 'N', 'k'],
  [17, 'N', 'l'],
  [17, 'N', 'l'],
  [17, 'N', 'l'],
  [29, 'N', 'i'],
  [33, 'N', 'j'],
  [33, 'N', 'j'],
  [37, 'N', 'k'],
  [37, 'N', 'k'],
  [41, 'N', 'l'],
  [41, 'N', 'l'],
  [53, 'N', 'i'],
]);
const sharedManyInnerNever = observableMessages([
  [5, 'N', 'i'],
  [9, 'N', 'j'],
  [9, 'N', 'j'],
  [13, 'N', 'k'],
  [13, 'N', 'k'],
  [17, 'N', 'l'],
  [17, 'N', 'l'],
  [17, 'N', 'l'],
]);
const sharedManyInnerThrows = observableMessages([
  ...sharedManyInnerNever.map(({ frame, notification }) => [frame, notification.kind, notification.value]),
  [25, 'E'],
]);
const sharedManyOuterThrows = observableMessages([
  ...sharedManyInnerNever.map(({ frame, notification }) => [frame, notification.kind, notification.value]),
  [29, 'N', 'i'],
  [33, 'E'],
]);
const sharedManyBothThrow = observableMessages([
  ...sharedManyInnerNever.map(({ frame, notification }) => [frame, notification.kind, notification.value]),
  [21, 'E'],
]);
const sharedManyConcurrentTwo = observableMessages([
  [5, 'N', 'i'],
  [9, 'N', 'j'],
  [9, 'N', 'j'],
  [13, 'N', 'k'],
  [13, 'N', 'k'],
  [17, 'N', 'l'],
  [17, 'N', 'l'],
  [25, 'N', 'i'],
  [29, 'N', 'j'],
  [33, 'N', 'k'],
  [37, 'N', 'l'],
  [41, 'C'],
]);
const sharedWindowToggleClosingResult = observableMessages([
  [
    8,
    'N',
    observableMessages([
      [1, 'N', 'c'],
      [4, 'N', 'd'],
      [7, 'N', 'e'],
      [10, 'N', 'f'],
      [10, 'C'],
    ]),
  ],
  [
    16,
    'N',
    observableMessages([
      [2, 'N', 'f'],
      [2, 'C'],
    ]),
  ],
  [24, 'N', observableMessages([[3, 'C']])],
  [27, 'C'],
]);
const sharedExplicitUnsubscriptionResult = observableMessages([
  [5, 'N', 'i'],
  [9, 'N', 'j'],
  [9, 'N', 'j'],
  [13, 'N', 'k'],
  [13, 'N', 'k'],
  [17, 'N', 'l'],
  [17, 'N', 'l'],
  [17, 'N', 'l'],
  [29, 'N', 'i'],
  [33, 'N', 'j'],
  [33, 'N', 'j'],
  [37, 'N', 'k'],
  [37, 'N', 'k'],
  [41, 'N', 'l'],
  [41, 'N', 'l'],
  [53, 'N', 'i'],
]);
const modeAwareObservableExpectations = new Map([
  // The delayed branch activates the shared connector view first. A platform
  // observer then joins that run, so the direct branch does not reactivate the
  // BehaviorSubject initializer for a second synchronous seed replay.
  [
    'spec/operators/connect-spec.ts:25:connect > should connect a source through a selector function and use the provided connector',
    new Map([
      [
        'result',
        observableMessages([
          [3, 'N', 'S'],
          [8, 'N', 'a'],
          [11, 'N', 'a'],
          [18, 'N', 'b'],
          [21, 'N', 'b'],
          [28, 'N', 'c'],
          [31, 'N', 'c'],
          [34, 'C'],
        ]),
      ],
    ]),
  ],
  [
    'spec/operators/bufferToggle-spec.ts:32:bufferToggle operator > should emit buffers that are opened by an observable from the first argument and closed by an observable returned by the function in the second argument',
    new Map([
      [
        'pipe',
        observableMessages([
          [28, 'N', ['c', 'd', 'e']],
          [28, 'N', []],
          [50, 'N', ['i']],
          [50, 'C'],
        ]),
      ],
    ]),
  ],
  [
    'spec/operators/delayWhen-spec.ts:99:delayWhen > should delay by selector and completes after value emits',
    new Map([['result', observableMessages([[9, 'N', 'a'], [9, 'N', 'b'], [9, 'C']])]]),
  ],
  [
    'spec/operators/delayWhen-spec.ts:120:delayWhen > should delay, but not emit if the selector never emits a notification',
    new Map([['result', observableMessages([[8, 'C']])]]),
  ],
  [
    'spec/operators/delayWhen-spec.ts:175:delayWhen > should delay by first value from selector',
    new Map([['result', observableMessages([[6, 'N', 'a'], [6, 'N', 'b'], [8, 'C']])]]),
  ],
  [
    'spec/operators/delayWhen-spec.ts:196:delayWhen > should delay by selector that does not completes',
    new Map([['result', observableMessages([[6, 'N', 'a'], [6, 'N', 'b'], [8, 'C']])]]),
  ],
  [
    'spec/operators/mergeMap-spec.ts:16:mergeMap > should map-and-flatten each item to an Observable',
    new Map([
      [
        'result',
        observableMessages([
          [2, 'N', 10],
          [4, 'N', 10],
          [6, 'N', 10],
          [8, 'N', 30],
          [10, 'N', 30],
          [12, 'N', 30],
          [12, 'N', 50],
          [20, 'C'],
        ]),
      ],
    ]),
  ],
  [
    'spec/operators/mergeMap-spec.ts:285:mergeMap > should not break unsubscription chains when result is unsubscribed explicitly',
    new Map([['source', sharedExplicitUnsubscriptionResult]]),
  ],
  [
    'spec/operators/mergeMapTo-spec.ts:216:mergeMapTo > should not break unsubscription chains when result is unsubscribed explicitly',
    new Map([['result', sharedExplicitUnsubscriptionResult]]),
  ],
  [
    'spec/operators/expand-spec.ts:15:expand > should recursively map-and-flatten each item to an Observable',
    new Map([
      [
        'result',
        observableMessages([
          [2, 'N', 1],
          [4, 'N', 2],
          [7, 'C'],
        ]),
      ],
    ]),
  ],
  ['spec/operators/mergeMap-spec.ts:208:mergeMap > should mergeMap many outer values to many inner values', new Map([['result', sharedManyComplete]])],
  ['spec/operators/mergeMap-spec.ts:232:mergeMap > should mergeMap many outer to many inner, complete late', new Map([['result', sharedManyCompleteLate]])],
  ['spec/operators/mergeMap-spec.ts:256:mergeMap > should mergeMap many outer to many inner, outer never completes', new Map([['source', sharedManyOuterNever]])],
  ['spec/operators/mergeMap-spec.ts:350:mergeMap > should mergeMap many outer to many inner, inner never completes', new Map([['result', sharedManyInnerNever]])],
  ['spec/operators/mergeMap-spec.ts:374:mergeMap > should mergeMap many outer to many inner, and inner throws', new Map([['result', sharedManyInnerThrows]])],
  ['spec/operators/mergeMap-spec.ts:398:mergeMap > should mergeMap many outer to many inner, and outer throws', new Map([['result', sharedManyOuterThrows]])],
  ['spec/operators/mergeMap-spec.ts:422:mergeMap > should mergeMap many outer to many inner, both inner and outer throw', new Map([['result', sharedManyBothThrow]])],
  ['spec/operators/mergeMap-spec.ts:467:mergeMap > should mergeMap to many cold Observable, with parameter concurrency=2', new Map([['result', sharedManyConcurrentTwo]])],
  [
    'spec/operators/mergeMapTo-spec.ts:15:mergeMapTo > should map-and-flatten each item to an Observable',
    new Map([
      [
        'result',
        observableMessages([
          [2, 'N', 'x'],
          [4, 'N', 'x'],
          [6, 'N', 'x'],
          [8, 'N', 'x'],
          [10, 'N', 'x'],
          [12, 'N', 'x'],
          [12, 'N', 'x'],
          [19, 'C'],
        ]),
      ],
    ]),
  ],
  [
    'spec/operators/mergeMapTo-spec.ts:84:mergeMapTo > should mergeMapTo many regular interval inners',
    new Map([
      [
        'result',
        observableMessages([
          [4, 'N', '1'],
          [4, 'N', '1'],
          [8, 'N', '2'],
          [8, 'N', '2'],
          [12, 'N', '3'],
          [12, 'N', '3'],
          [16, 'N', '4'],
          [16, 'N', '4'],
          [16, 'N', '4'],
          [28, 'N', '1'],
          [32, 'N', '2'],
          [36, 'N', '3'],
          [40, 'N', '4'],
          [40, 'C'],
        ]),
      ],
    ]),
  ],
  ['spec/operators/mergeMapTo-spec.ts:143:mergeMapTo > should mergeMapTo many outer values to many inner values', new Map([['pipe', sharedManyComplete]])],
  ['spec/operators/mergeMapTo-spec.ts:165:mergeMapTo > should mergeMapTo many outer to many inner, complete late', new Map([['pipe', sharedManyCompleteLate]])],
  ['spec/operators/mergeMapTo-spec.ts:187:mergeMapTo > should mergeMapTo many outer to many inner, outer never completes', new Map([['result', sharedManyOuterNever]])],
  ['spec/operators/mergeMapTo-spec.ts:249:mergeMapTo > should mergeMapTo many outer to many inner, inner never completes', new Map([['pipe', sharedManyInnerNever]])],
  ['spec/operators/mergeMapTo-spec.ts:271:mergeMapTo > should mergeMapTo many outer to many inner, and inner throws', new Map([['pipe', sharedManyInnerThrows]])],
  ['spec/operators/mergeMapTo-spec.ts:292:mergeMapTo > should mergeMapTo many outer to many inner, and outer throws', new Map([['pipe', sharedManyOuterThrows]])],
  ['spec/operators/mergeMapTo-spec.ts:314:mergeMapTo > should mergeMapTo many outer to many inner, both inner and outer throw', new Map([['pipe', sharedManyBothThrow]])],
  ['spec/operators/mergeMapTo-spec.ts:356:mergeMapTo > should mergeMapTo to many cold Observable, with parameter concurrency=2, without resultSelector', new Map([['result', sharedManyConcurrentTwo]])],
  [
    'spec/operators/windowToggle-spec.ts:44:windowToggle > should emit windows that are opened by an observable from the first argument and closed by an observable returned by the function in the second argument',
    new Map([['source', sharedWindowToggleClosingResult]]),
  ],
  [
    'spec/operators/mergeScan-spec.ts:354:mergeScan > should not emit accumulator if inner completes without value after source completes',
    new Map([['result', observableMessages([[9, 'C']])]]),
  ],
  [
    'spec/operators/multicast-spec.ts:127:multicast > should accept a multicast selector and connect to a cold source for each subscriber',
    new Map([
      ['subscriber2', observableMessages([[5, 'N', '6'], [10, 'N', '8'], [12, 'C']])],
      ['subscriber3', observableMessages([[10, 'N', '8'], [12, 'C']])],
    ]),
  ],
  [
    "spec/operators/multicast-spec.ts:155:multicast > should accept a multicast selector and respect the subject's messaging semantics",
    new Map([
      ['subscriber2', observableMessages([[5, 'N', '3'], [10, 'N', '4'], [12, 'N', '4'], [12, 'C']])],
      ['subscriber3', observableMessages([[10, 'N', '4'], [12, 'N', '4'], [12, 'C']])],
    ]),
  ],
  [
    'spec/operators/publishBehavior-spec.ts:49:publishBehavior operator > should multicast the same values to multiple observers',
    new Map([
      ['subscriber2', observableMessages([[5, 'N', '3'], [10, 'N', '4'], [12, 'C']])],
      ['subscriber3', observableMessages([[10, 'N', '4'], [12, 'C']])],
    ]),
  ],
  [
    'spec/operators/publishBehavior-spec.ts:70:publishBehavior operator > should multicast an error from the source to multiple observers',
    new Map([
      ['subscriber2', observableMessages([[5, 'N', '3'], [10, 'N', '4'], [12, 'E']])],
      ['subscriber3', observableMessages([[10, 'N', '4'], [12, 'E']])],
    ]),
  ],
  [
    'spec/operators/publishBehavior-spec.ts:159:publishBehavior operator > with refCount() > should connect when first subscriber subscribes',
    new Map([
      ['subscriber2', observableMessages([[8, 'N', '3'], [13, 'N', '4'], [15, 'C']])],
      ['subscriber3', observableMessages([[13, 'N', '4'], [15, 'C']])],
    ]),
  ],
  [
    'spec/operators/publishBehavior-spec.ts:178:publishBehavior operator > with refCount() > should disconnect when last subscriber unsubscribes',
    new Map([['subscriber2', observableMessages([[8, 'N', '3']])]]),
  ],
  [
    'spec/operators/publishBehavior-spec.ts:196:publishBehavior operator > with refCount() > should NOT be retryable',
    new Map([
      ['subscriber2', observableMessages([[5, 'N', '3'], [10, 'N', '4'], [12, 'E']])],
      ['subscriber3', observableMessages([[10, 'N', '4'], [12, 'E']])],
    ]),
  ],
  [
    'spec/operators/publishBehavior-spec.ts:215:publishBehavior operator > with refCount() > should NOT be repeatable',
    new Map([
      ['subscriber2', observableMessages([[5, 'N', '3'], [10, 'N', '4'], [12, 'C']])],
      ['subscriber3', observableMessages([[10, 'N', '4'], [12, 'C']])],
    ]),
  ],
  [
    'spec/operators/shareReplay-spec.ts:38:shareReplay > should multicast the same values to multiple observers, bufferSize=1',
    new Map([
      ['subscriber2', observableMessages([[5, 'N', '3'], [10, 'N', '4'], [12, 'C']])],
      ['subscriber3', observableMessages([[10, 'N', '4'], [12, 'C']])],
    ]),
  ],
  [
    'spec/operators/shareReplay-spec.ts:58:shareReplay > should multicast the same values to multiple observers, bufferSize=2',
    new Map([
      ['subscriber2', observableMessages([[9, 'N', '3'], [16, 'N', '4'], [18, 'C']])],
      ['subscriber3', observableMessages([[16, 'N', '4'], [18, 'C']])],
    ]),
  ],
  [
    'spec/operators/shareReplay-spec.ts:78:shareReplay > should multicast an error from the source to multiple observers',
    new Map([
      ['subscriber2', observableMessages([[5, 'N', '3'], [10, 'N', '4'], [12, 'E']])],
      ['subscriber3', observableMessages([[10, 'N', '4'], [12, 'E']])],
    ]),
  ],
  [
    'spec/operators/shareReplay-spec.ts:137:shareReplay > should replay results to subsequent subscriptions if source completes, bufferSize=2',
    new Map([['subscriber2', observableMessages([[9, 'N', '3'], [11, 'C']])]]),
  ],
  [
    'spec/operators/shareReplay-spec.ts:157:shareReplay > should completely restart for subsequent subscriptions if source errors, bufferSize=2',
    new Map([['subscriber2', observableMessages([[9, 'N', '3'], [11, 'E']])]]),
  ],
  [
    'spec/operators/shareReplay-spec.ts:178:shareReplay > should be retryable, bufferSize=2',
    new Map([
      [
        'subscriber2',
        observableMessages([
          [9, 'N', '3'],
          [12, 'N', '1'],
          [14, 'N', '2'],
          [20, 'N', '3'],
          [22, 'E'],
        ]),
      ],
      ['subscriber3', observableMessages([[20, 'N', '3'], [22, 'E']])],
    ]),
  ],
  [
    'spec/operators/publishReplay-spec.ts:49:publishReplay operator > should multicast the same values to multiple observers, bufferSize=1',
    new Map([
      ['subscriber2', observableMessages([[5, 'N', '3'], [10, 'N', '4'], [12, 'C']])],
      ['subscriber3', observableMessages([[10, 'N', '4'], [12, 'C']])],
    ]),
  ],
  [
    'spec/operators/publishReplay-spec.ts:70:publishReplay operator > should multicast the same values to multiple observers, bufferSize=2',
    new Map([
      ['subscriber2', observableMessages([[9, 'N', '3'], [16, 'N', '4'], [18, 'C']])],
      ['subscriber3', observableMessages([[16, 'N', '4'], [18, 'C']])],
    ]),
  ],
  [
    'spec/operators/publishReplay-spec.ts:91:publishReplay operator > should multicast an error from the source to multiple observers',
    new Map([
      ['subscriber2', observableMessages([[5, 'N', '3'], [10, 'N', '4'], [12, 'E']])],
      ['subscriber3', observableMessages([[10, 'N', '4'], [12, 'E']])],
    ]),
  ],
  [
    'spec/operators/publishReplay-spec.ts:180:publishReplay operator > with refCount() > should connect when first subscriber subscribes',
    new Map([
      ['subscriber2', observableMessages([[8, 'N', '3'], [13, 'N', '4'], [15, 'C']])],
      ['subscriber3', observableMessages([[13, 'N', '4'], [15, 'C']])],
    ]),
  ],
  [
    'spec/operators/publishReplay-spec.ts:199:publishReplay operator > with refCount() > should disconnect when last subscriber unsubscribes',
    new Map([['subscriber2', observableMessages([[8, 'N', '3']])]]),
  ],
  [
    'spec/operators/publishReplay-spec.ts:217:publishReplay operator > with refCount() > should NOT be retryable',
    new Map([
      [
        'subscriber2',
        observableMessages([
          [5, 'N', '3'],
          [10, 'N', '4'],
          [12, 'N', '4'],
          [12, 'N', '4'],
          [12, 'N', '4'],
          [12, 'E'],
        ]),
      ],
      [
        'subscriber3',
        observableMessages([
          [10, 'N', '4'],
          [12, 'N', '4'],
          [12, 'N', '4'],
          [12, 'N', '4'],
          [12, 'E'],
        ]),
      ],
    ]),
  ],
  [
    'spec/operators/publishReplay-spec.ts:236:publishReplay operator > with refCount() > should NOT be repeatable',
    new Map([
      [
        'subscriber2',
        observableMessages([
          [5, 'N', '3'],
          [10, 'N', '4'],
          [12, 'N', '4'],
          [12, 'N', '4'],
          [12, 'C'],
        ]),
      ],
      [
        'subscriber3',
        observableMessages([
          [10, 'N', '4'],
          [12, 'N', '4'],
          [12, 'N', '4'],
          [12, 'C'],
        ]),
      ],
    ]),
  ],
  [
    'spec/operators/publishReplay-spec.ts:480:publishReplay operator > should emit an error when the selector returns an Observable that emits an error',
    new Map([
      [
        'published',
        observableMessages([
          [4, 'N', '5'],
          [6, 'N', '6'],
          [6, 'N', '6'],
          [11, 'E', "It's broken"],
        ]),
      ],
    ]),
  ],
]);
const modeAwareSubscriptionExpectations = new Map([
  [
    'spec/operators/delayWhen-spec.ts:99:delayWhen > should delay by selector and completes after value emits',
    new Map([['selector', [boundedSubscription(2, 9)]]]),
  ],
  [
    'spec/operators/delayWhen-spec.ts:120:delayWhen > should delay, but not emit if the selector never emits a notification',
    new Map([['selector', [boundedSubscription(2, 8)]]]),
  ],
  [
    'spec/operators/delayWhen-spec.ts:175:delayWhen > should delay by first value from selector',
    new Map([['selector', [boundedSubscription(2, 6)]]]),
  ],
  [
    'spec/operators/delayWhen-spec.ts:196:delayWhen > should delay by selector that does not completes',
    new Map([['selector', [boundedSubscription(2, 6)]]]),
  ],
  [
    'spec/operators/mergeMap-spec.ts:16:mergeMap > should map-and-flatten each item to an Observable',
    new Map([['x', [boundedSubscription(2, 7), boundedSubscription(8, 13)]]]),
  ],
  [
    'spec/operators/mergeMap-spec.ts:285:mergeMap > should not break unsubscription chains when result is unsubscribed explicitly',
    new Map([['x', [boundedSubscription(1, 21), boundedSubscription(25, 45), boundedSubscription(49, 55)]]]),
  ],
  [
    'spec/operators/mergeMapTo-spec.ts:216:mergeMapTo > should not break unsubscription chains when result is unsubscribed explicitly',
    new Map([['x', [boundedSubscription(1, 21), boundedSubscription(25, 45), boundedSubscription(49, 55)]]]),
  ],
  [
    'spec/operators/publish-spec.ts:70:publish operator > should accept selectors',
    new Map([['source', [boundedSubscription(0, 12)]]]),
  ],
  [
    'spec/operators/multicast-spec.ts:100:multicast > should accept a multicast selector and connect to a hot source for each subscriber',
    new Map([['e1', [boundedSubscription(0, 12)]]]),
  ],
  [
    'spec/operators/multicast-spec.ts:127:multicast > should accept a multicast selector and connect to a cold source for each subscriber',
    new Map([['e1', [boundedSubscription(0, 12)]]]),
  ],
  [
    "spec/operators/multicast-spec.ts:155:multicast > should accept a multicast selector and respect the subject's messaging semantics",
    new Map([['e1', [boundedSubscription(0, 12)]]]),
  ],
  [
    'spec/observables/partition-spec.ts:115:partition > should pass errors to both returned observables if source throws',
    new Map([['e1', 1]]),
  ],
  [
    'spec/observables/partition-spec.ts:178:partition > should partition empty observable if source is empty',
    new Map([['e1', 1]]),
  ],
  [
    'spec/observables/partition-spec.ts:273:partition > should partition to infinite observable if source never completes',
    new Map([['e1', 1]]),
  ],
  [
    'spec/observables/partition-spec.ts:315:partition > should not break unsubscription chains when result is unsubscribed explicitly',
    new Map([['e1', 1]]),
  ],
  [
    'spec/operators/toArray-spec.ts:80:toArray > should allow multiple subscriptions',
    new Map([['e1', 1]]),
  ],
  [
    'spec/operators/mergeMap-spec.ts:208:mergeMap > should mergeMap many outer values to many inner values',
    new Map([['x', [boundedSubscription(1, 21), boundedSubscription(25, 45)]]]),
  ],
  [
    'spec/operators/mergeMap-spec.ts:232:mergeMap > should mergeMap many outer to many inner, complete late',
    new Map([['x', [boundedSubscription(1, 21), boundedSubscription(25, 45)]]]),
  ],
  [
    'spec/operators/mergeMap-spec.ts:256:mergeMap > should mergeMap many outer to many inner, outer never completes',
    new Map([['x', [boundedSubscription(1, 21), boundedSubscription(25, 45), boundedSubscription(49, 55)]]]),
  ],
  [
    'spec/operators/mergeMap-spec.ts:350:mergeMap > should mergeMap many outer to many inner, inner never completes',
    new Map([['x', [boundedSubscription(1, 55)]]]),
  ],
  [
    'spec/operators/mergeMap-spec.ts:374:mergeMap > should mergeMap many outer to many inner, and inner throws',
    new Map([['x', [boundedSubscription(1, 25)]]]),
  ],
  [
    'spec/operators/mergeMap-spec.ts:398:mergeMap > should mergeMap many outer to many inner, and outer throws',
    new Map([['x', [boundedSubscription(1, 21), boundedSubscription(25, 33)]]]),
  ],
  [
    'spec/operators/mergeMap-spec.ts:422:mergeMap > should mergeMap many outer to many inner, both inner and outer throw',
    new Map([['x', [boundedSubscription(1, 21)]]]),
  ],
  [
    'spec/operators/mergeMap-spec.ts:467:mergeMap > should mergeMap to many cold Observable, with parameter concurrency=2',
    new Map([['x', [boundedSubscription(1, 21), boundedSubscription(21, 41)]]]),
  ],
  [
    'spec/operators/mergeMapTo-spec.ts:15:mergeMapTo > should map-and-flatten each item to an Observable',
    new Map([['x', [boundedSubscription(2, 7), boundedSubscription(8, 13)]]]),
  ],
  [
    'spec/operators/mergeMapTo-spec.ts:84:mergeMapTo > should mergeMapTo many regular interval inners',
    new Map([['x', [boundedSubscription(0, 16), boundedSubscription(24, 40)]]]),
  ],
  [
    'spec/operators/mergeMapTo-spec.ts:143:mergeMapTo > should mergeMapTo many outer values to many inner values',
    new Map([['x', [boundedSubscription(1, 21), boundedSubscription(25, 45)]]]),
  ],
  [
    'spec/operators/mergeMapTo-spec.ts:165:mergeMapTo > should mergeMapTo many outer to many inner, complete late',
    new Map([['x', [boundedSubscription(1, 21), boundedSubscription(25, 45)]]]),
  ],
  [
    'spec/operators/mergeMapTo-spec.ts:187:mergeMapTo > should mergeMapTo many outer to many inner, outer never completes',
    new Map([['x', [boundedSubscription(1, 21), boundedSubscription(25, 45), boundedSubscription(49, 55)]]]),
  ],
  [
    'spec/operators/mergeMapTo-spec.ts:249:mergeMapTo > should mergeMapTo many outer to many inner, inner never completes',
    new Map([['x', [boundedSubscription(1, 55)]]]),
  ],
  [
    'spec/operators/mergeMapTo-spec.ts:271:mergeMapTo > should mergeMapTo many outer to many inner, and inner throws',
    new Map([['x', [boundedSubscription(1, 25)]]]),
  ],
  [
    'spec/operators/mergeMapTo-spec.ts:292:mergeMapTo > should mergeMapTo many outer to many inner, and outer throws',
    new Map([['x', [boundedSubscription(1, 21), boundedSubscription(25, 33)]]]),
  ],
  [
    'spec/operators/mergeMapTo-spec.ts:314:mergeMapTo > should mergeMapTo many outer to many inner, both inner and outer throw',
    new Map([['x', [boundedSubscription(1, 21)]]]),
  ],
  [
    'spec/operators/mergeMapTo-spec.ts:356:mergeMapTo > should mergeMapTo to many cold Observable, with parameter concurrency=2, without resultSelector',
    new Map([['x', [boundedSubscription(1, 21), boundedSubscription(21, 41)]]]),
  ],
  [
    'spec/operators/delayWhen-spec.ts:154:delayWhen > should not emit if selector never emits',
    new Map([['selector', [boundedSubscription(2, 9)]]]),
  ],
  [
    'spec/operators/windowToggle-spec.ts:44:windowToggle > should emit windows that are opened by an observable from the first argument and closed by an observable returned by the function in the second argument',
    new Map([['e3', [boundedSubscription(8, 18), boundedSubscription(24, 27)]]]),
  ],
  [
    'spec/operators/mergeScan-spec.ts:354:mergeScan > should not emit accumulator if inner completes without value after source completes',
    new Map([['x', [boundedSubscription(3, 8)]]]),
  ],
  [
    'spec/operators/shareReplay-spec.ts:178:shareReplay > should be retryable, bufferSize=2',
    new Map([
      [
        'source',
        [
          boundedSubscription(0, 11),
          boundedSubscription(11, 22),
        ],
      ],
    ]),
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
          const caseSupport =
            callback && isFunction(callback)
              ? getCaseSupport({
                  path,
                  callback,
                  sourceFile,
                  support: rootSupport.included,
                  extraRoots: variant.supportNodes ?? [],
                })
              : [];
          const caseImports =
            callback && isFunction(callback)
              ? getUsedImports({
                  path,
                  callback,
                  importMap,
                  sourceFile,
                  support: [...caseSupport, ...(variant.supportNodes ?? [])],
                })
              : [];
          const dynamicMigration =
            callback && isFunction(callback)
              ? buildDynamicMigratedProgram({
                  sourceText,
                  sourceFile,
                  targetCall: node,
                  imports: path === 'spec/operators/share-spec.ts' ? caseImports : dynamicImportMap,
                  variant,
                  support: rootSupport.included,
                  reachableSupport: caseSupport,
                  semanticImports: path === 'spec/operators/share-spec.ts',
                })
              : null;
          const dynamicHarnessRewrite =
            path === 'spec/operators/share-spec.ts'
              ? buildShareDynamicHarnessRewrite({
                  line: lineOf(node, sourceFile),
                  variantKey: variant.key,
                })
              : null;
          const intentionalDivergenceReason = intentionalDivergenceReasons.get(id);
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
            classification = intentionalDivergenceReason ? 'intentional-divergence' : 'harness-rewrite';
            disposition = 'expected-failure';
            reason =
              intentionalDivergenceReason ??
              (reviewFlags.includes('source-skipped')
                ? 'The source case was skipped in RxJS 7; its parameterized declaration is mechanically preserved as ' +
                  'executable parity evidence.'
                : `Parameterized variant ${variant.key} is mechanically expanded and retained as failing parity evidence.`);
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
            migratedProgram:
              dynamicHarnessRewrite ??
              dynamicMigration?.program ??
              buildUnavailableProgram(reason),
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
      const caseSupport = getCaseSupport({
        path,
        callback,
        sourceFile,
        support: inheritedSupport,
      });
      const usedImports = getUsedImports({
        path,
        callback,
        importMap,
        sourceFile,
        support: caseSupport,
      });
      const availability = assessAvailability(usedImports);
      const schedulerCompatibilityRewrite = buildSchedulerInternalsHarnessRewrite({
        path,
        line: lineOf(call, sourceFile),
      });
      const harnessRewrite = harnessRewritePrograms.get(id) ?? schedulerCompatibilityRewrite;
      const harnessRewriteReplacesUnavailableImports =
        harnessRewrite !== undefined &&
        (harnessRewritesReplacingUnavailableImports.has(id) || schedulerCompatibilityRewrite !== undefined);
      const intentionalDivergenceReason = intentionalDivergenceReasons.get(id);
      const unsupportedOrObsoleteReason = unsupportedOrObsoleteReasons.get(id);
      const schedulerOnlyReason = schedulerOnlyCaseReasons.get(id);
      const legacySubscribableHelperReason = usedImports.some(
        ({ module, imported }) =>
          (module === '../helpers/test-helper' && imported === 'lowerCaseO') ||
          (module === '../helpers/interop-helper' && imported === 'asInteropObservable')
      )
        ? 'The case exercises RxJS 7 arbitrary-subscribable input, which is outside the platform Observable.from contract and is retained as executable compatibility evidence.'
        : undefined;
      const harnessRewriteReason =
        harnessRewriteReasons.get(id) ??
        getPortedSchedulerAdapterReason({
          imports: usedImports,
          source: originalSource,
        });
      const schedulerInternal =
        !harnessRewrite &&
        !harnessRewriteReason &&
        (Boolean(schedulerOnlyReason) ||
          isGenuinelySchedulerInternal({
            path,
            line: lineOf(call, sourceFile),
            blockedSupport,
          }));

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
      } else if (unsupportedOrObsoleteReason) {
        classification = 'unsupported-or-obsolete';
        disposition = 'unsupported-or-obsolete';
        reason = unsupportedOrObsoleteReason;
        modes = ['cold', 'polyfill', 'native'];
        migratedProgram = buildMigratedProgram({
          caseId: id,
          callback,
          imports: usedImports,
          sourceFile,
          support: caseSupport,
          wrapManualHelpers: !runMode,
        });
      } else if (schedulerInternal) {
        classification = 'unsupported-or-obsolete';
        disposition = 'unsupported-or-obsolete';
        reason =
          schedulerOnlyReason ??
          (blockedSupport.length > 0
            ? `The case depends on scheduler-bound parser or notification state: ${blockedSupport.join(', ')}.`
            : 'The case protects TestScheduler parser or queue internals rather than an Observable behavior.');
        modes = ['cold', 'polyfill', 'native'];
        migratedProgram = buildMigratedProgram({
          caseId: id,
          callback,
          imports: usedImports,
          sourceFile,
          support: caseSupport,
          wrapManualHelpers: !runMode,
        });
      } else if (
        availability.missing.length > 0 &&
        !intentionalDivergenceReason &&
        !harnessRewriteReplacesUnavailableImports
      ) {
        classification = 'compatibility-only';
        disposition = 'missing-api';
        reason = `Required runtime capabilities are unavailable: ${availability.missing.join(', ')}.`;
        modes = ['cold', 'polyfill', 'native'];
        migratedProgram = buildMigratedProgram({
          caseId: id,
          callback,
          imports: usedImports,
          sourceFile,
          support: caseSupport,
          wrapManualHelpers: !runMode,
        });
      } else if (
        availability.external.length > 0 &&
        !intentionalDivergenceReason &&
        !harnessRewriteReplacesUnavailableImports
      ) {
        classification = 'harness-rewrite';
        disposition = 'missing-api';
        reason = `Required external test capabilities are unavailable: ${availability.external.join(', ')}.`;
        modes = ['cold', 'polyfill', 'native'];
        migratedProgram = buildMigratedProgram({
          caseId: id,
          callback,
          imports: usedImports,
          sourceFile,
          support: caseSupport,
          wrapManualHelpers: !runMode,
        });
      } else {
        classification = intentionalDivergenceReason
          ? 'intentional-divergence'
          : legacySubscribableHelperReason
            ? 'compatibility-only'
            : harnessRewrite || harnessRewriteReason || reviewFlags.includes('multiple-observers') || !runMode
              ? 'harness-rewrite'
              : 'portable';
        const verifiedActive =
          !reviewFlags.includes('source-skipped') &&
          isVerifiedColdPass({
            id,
            location: `${path}:${lineOf(call, sourceFile)}`,
          });
        disposition = verifiedActive ? 'active' : 'expected-failure';
        reason = reviewFlags.includes('source-skipped')
          ? harnessRewrite
            ? (harnessRewriteReason ??
              'The source case was skipped in RxJS 7; its unbounded synchronous recovery loop is preserved with an explicit cancellation boundary.')
            : 'The source case was skipped in RxJS 7; it is mechanically migrated as failing executable parity evidence.'
          : intentionalDivergenceReason
            ? intentionalDivergenceReason
            : legacySubscribableHelperReason
              ? legacySubscribableHelperReason
              : harnessRewrite || harnessRewriteReason
                ? (harnessRewriteReason ??
                  'Case-specific harness rewrite preserves the original behavioral claim without restoring a removed RxJS 7 test fixture API.')
                : verifiedActive
                  ? 'Mechanically migrated and verified against the ColdObservable mode.'
                  : 'Mechanically migrated; ColdObservable verification failed and production behavior is unchanged.';
        modes = ['cold', 'polyfill', 'native'];
        migratedProgram =
          harnessRewrite ??
          buildMigratedProgram({
            caseId: id,
            callback,
            imports: usedImports,
            sourceFile,
            support: caseSupport,
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

function buildSchedulerInternalsHarnessRewrite({ path, line }) {
  const scheduledCompositionCases = new Map([
    ['spec/observables/merge-spec.ts:282', 'scheduled-interop-merge'],
    ['spec/observables/merge-spec.ts:311', 'scheduled-timed-merge'],
    ['spec/observables/merge-spec.ts:322', 'scheduled-concurrent-merge'],
    ['spec/operators/concatAll-spec.ts:500', 'scheduled-concat-many'],
    ['spec/operators/concatAll-spec.ts:532', 'scheduled-concat-one'],
  ]);
  const scheduledCompositionKind = scheduledCompositionCases.get(`${path}:${line}`);
  if (scheduledCompositionKind) {
    return buildScheduledCompositionHarnessRewrite(scheduledCompositionKind);
  }

  if (path === 'spec/testing/index-spec.ts' && line === 5) {
    return buildSchedulerBoundaryHarnessRewrite('testing-index');
  }

  const delayedSchedulerCases = new Map([
    ['spec/schedulers/AnimationFrameScheduler-spec.ts:24', 'delayed-host-time'],
    ['spec/schedulers/AnimationFrameScheduler-spec.ts:41', 'cancelled-host-time'],
    ['spec/schedulers/AsapScheduler-spec.ts:24', 'delayed-host-time'],
    ['spec/schedulers/AsapScheduler-spec.ts:40', 'cancelled-host-time'],
    ['spec/schedulers/QueueScheduler-spec.ts:18', 'delayed-host-time'],
  ]);
  const delayedSchedulerKind = delayedSchedulerCases.get(`${path}:${line}`);
  if (delayedSchedulerKind) {
    return buildSchedulerBoundaryHarnessRewrite(delayedSchedulerKind);
  }

  if (path !== 'spec/schedulers/TestScheduler-spec.ts') {
    return undefined;
  }

  const kinds = new Map([
    [16, 'test-api'],
    [21, 'frame-time-factor'],
    [26, 'parse-basic'],
    [35, 'parse-spaces'],
    [44, 'parse-caret'],
    [53, 'parse-error'],
    [62, 'parse-default-values'],
    [71, 'parse-grouped'],
    [80, 'parse-whitespace'],
    [91, 'parse-time-progression'],
    [102, 'parse-emoji'],
    [114, 'subscription-basic'],
    [120, 'subscription-open-boundary'],
    [126, 'subscription-sync'],
    [132, 'subscription-whitespace'],
    [139, 'subscription-time-progression'],
    [146, 'subscription-multiple-starts'],
    [150, 'subscription-multiple-ends'],
    [156, 'time-basic'],
    [162, 'time-whitespace-boundary'],
    [169, 'time-mixed-whitespace-boundary'],
    [198, 'hot-source'],
    [213, 'test-api'],
    [219, 'cold-helper'],
    [237, 'hot-helper'],
    [242, 'hot-subject-boundary'],
    [250, 'time-helper'],
    [255, 'time-helper-value'],
    [261, 'observable-expectation-helper'],
    [270, 'observable-expectation-registration'],
    [279, 'never-expectation'],
    [300, 'subscription-expectation-helper'],
    [309, 'subscription-expectation-registration'],
    [361, 'run-whitespace-and-host-delay'],
    [390, 'run-helper-set'],
    [427, 'unbounded-virtual-time'],
    [451, 'automatic-flush'],
    [472, 'explicit-flush'],
    [497, 'promise-completion-boundary'],
    [508, 'restore-after-error'],
    [540, 'animation-without-opportunity'],
    [569, 'animation-async'],
    [591, 'animation-sync'],
    [610, 'animation-cancellation'],
    [632, 'immediate-schedule'],
    [647, 'immediate-cancellation'],
    [663, 'interval-schedule'],
    [679, 'interval-repeat'],
    [698, 'timeout-schedule'],
    [713, 'immediate-priority'],
    [739, 'host-scheduler-order'],
    [756, 'microtask-before-timer'],
    [769, 'zero-duration-repetition'],
  ]);
  const kind = kinds.get(line);
  return kind ? buildSchedulerBoundaryHarnessRewrite(kind) : undefined;
}

function buildScheduledCompositionHarnessRewrite(kind) {
  const programs = {
    'scheduled-interop-merge': `async function migrated(runtime) {
const { rxTest, expect, merge } = runtime;
await rxTest(({ expectObservable, schedule }) => {
  const observableKey = Symbol.observable ?? '@@observable';
  const source = {
    subscribe(observer) {
      const task = schedule(() => {
        observer.next?.('a');
        observer.next?.('b');
        observer.next?.('c');
        observer.complete?.();
      }, 0, { signal: observer.signal });
      return { unsubscribe: () => task.cancel() };
    },
    [observableKey]() {
      return this;
    },
  };

  // The removed scheduler overload scheduled conversion/subscription at frame
  // zero. Keep that timing in the local interop source and exercise the real
  // merge factory without treating a scheduler object as another source.
  const result = merge(source);
  expect(result instanceof globalThis.Observable).to.equal(true);
  expectObservable(result).toBe('(abc|)');
});
}
`,
    'scheduled-timed-merge': `async function migrated(runtime) {
const { rxTest, merge } = runtime;
await rxTest(({ expectObservable, schedule }) => {
  const scheduledValue = (value, delay) =>
    new globalThis.Observable((subscriber) => {
      schedule(() => {
        subscriber.next(value);
        subscriber.complete();
      }, delay, { signal: subscriber.signal });
    });

  // Local scheduled sources preserve the old frame-zero scheduler handoff and
  // the delayed second value while the production merge sees only sources.
  const result = merge(scheduledValue('a', 0), scheduledValue('b', 2));
  expectObservable(result).toBe('a-(b|)');
});
}
`,
    'scheduled-concurrent-merge': `async function migrated(runtime) {
const { rxTest, merge } = runtime;
await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
  const first = cold('---a---b---c---|');
  const second = cold('-d---e---f--|');
  const third = cold('---x---y---z---|');

  // rxTest owns virtual subscription time. Removing only the obsolete
  // TestScheduler argument leaves the exact merge concurrency contract active.
  const result = merge(first, second, third, 2);
  expectObservable(result).toBe('-d-a-e-b-f-c---x---y---z---|');
  expectSubscriptions(first.subscriptions).toBe('^--------------!');
  expectSubscriptions(second.subscriptions).toBe('^-----------!');
  expectSubscriptions(third.subscriptions).toBe('------------^--------------!');
});
}
`,
    'scheduled-concat-many': buildScheduledConcatHarnessRewrite([
      {
        name: 'first',
        marbles: '---a|',
        subscriptions: '^---!',
      },
      {
        name: 'second',
        marbles: '---b--|',
        subscriptions: '----^-----!',
      },
      {
        name: 'third',
        marbles: '---c--|',
        subscriptions: '----------^-----!',
      },
    ], '---a---b-----c--|'),
    'scheduled-concat-one': buildScheduledConcatHarnessRewrite([
      {
        name: 'first',
        marbles: '---a-|',
        subscriptions: '^----!',
      },
    ], '---a-|'),
  };
  const program = programs[kind];
  if (!program) {
    throw new Error(`Unknown scheduled composition harness rewrite: ${kind}`);
  }
  return program;
}

function buildScheduledConcatHarnessRewrite(sources, expected) {
  const sourceDeclarations = sources
    .map(({ name, marbles }) => `  const ${name} = cold(${JSON.stringify(marbles)});`)
    .join('\n');
  const sourceNames = sources.map(({ name }) => name).join(', ');
  const subscriptionExpectations = sources
    .map(
      ({ name, subscriptions }) =>
        `  expectSubscriptions(${name}.subscriptions).toBe(${JSON.stringify(subscriptions)});`
    )
    .join('\n');
  return `async function migrated(runtime) {
const { rxTest, applyOperators, concatAll } = runtime;
await rxTest(({ cold, expectObservable, expectSubscriptions, schedule }) => {
${sourceDeclarations}
  const outer = new globalThis.Observable((subscriber) => {
    schedule(() => {
      for (const source of [${sourceNames}]) {
        subscriber.next(source);
      }
      subscriber.complete();
    }, 0, { signal: subscriber.signal });
  });

  // The local outer source retains the legacy scheduler's frame-zero handoff;
  // exact concatAll flattening retains ordering and inner subscription timing.
  const result = applyOperators(outer, [concatAll()]);
  expectObservable(result).toBe(${JSON.stringify(expected)});
${subscriptionExpectations}
});
}
`;
}

function buildSchedulerBoundaryHarnessRewrite(kind) {
  const parserCases = {
    'parse-basic': {
      source: 'cold',
      marbles: '-------a---b---|',
      values: `{ a: 'A', b: 'B' }`,
      expected: `[
    [7, 'N', 'A'],
    [11, 'N', 'B'],
    [15, 'C'],
  ]`,
    },
    'parse-spaces': {
      source: 'cold',
      marbles: '--a--b--|   ',
      values: `{ a: 'A', b: 'B' }`,
      expected: `[
    [2, 'N', 'A'],
    [5, 'N', 'B'],
    [8, 'C'],
  ]`,
    },
    'parse-caret': {
      source: 'hot',
      marbles: '---^---a---b---|',
      values: `{ a: 'A', b: 'B' }`,
      expected: `[
    [4, 'N', 'A'],
    [8, 'N', 'B'],
    [12, 'C'],
  ]`,
    },
    'parse-error': {
      source: 'cold',
      marbles: '-------a---b---#',
      values: `{ a: 'A', b: 'B' }`,
      error: `'omg error!'`,
      expected: `[
    [7, 'N', 'A'],
    [11, 'N', 'B'],
    [15, 'E', 'omg error!'],
  ]`,
    },
    'parse-default-values': {
      source: 'cold',
      marbles: '--a--b--c--',
      expected: `[
    [2, 'N', 'a'],
    [5, 'N', 'b'],
    [8, 'N', 'c'],
  ]`,
      horizon: 9,
    },
    'parse-grouped': {
      source: 'cold',
      marbles: '---(abc)---',
      expected: `[
    [3, 'N', 'a'],
    [3, 'N', 'b'],
    [3, 'N', 'c'],
  ]`,
      horizon: 4,
    },
    'parse-whitespace': {
      source: 'cold',
      marbles: '  -a - b -    c |       ',
      values: `{ a: 'A', b: 'B', c: 'C' }`,
      expected: `[
    [1, 'N', 'A'],
    [3, 'N', 'B'],
    [5, 'N', 'C'],
    [6, 'C'],
  ]`,
    },
    'parse-time-progression': {
      source: 'cold',
      marbles: '10.2ms a 1.2s b 1m c|',
      values: `{ a: 'A', b: 'B', c: 'C' }`,
      expected: `[
    [10.2, 'N', 'A'],
    [1211.2, 'N', 'B'],
    [61212.2, 'N', 'C'],
    [61213.2, 'C'],
  ]`,
    },
    'parse-emoji': {
      source: 'cold',
      marbles: '--🙈--🙉--🙊--|',
      expected: `[
    [2, 'N', '🙈'],
    [5, 'N', '🙉'],
    [8, 'N', '🙊'],
    [11, 'C'],
  ]`,
    },
  };
  const parserCase = parserCases[kind];
  if (parserCase) {
    const values = parserCase.values ? `, ${parserCase.values}` : '';
    const error = parserCase.error ? `, ${parserCase.error}` : '';
    const horizon = parserCase.horizon
      ? `\n  schedule(() => controller.abort(), ${parserCase.horizon});`
      : '';
    return `async function migrated(runtime) {
const { rxTest, expect } = runtime;
await rxTest(async ({ ${parserCase.source}, flush, now, schedule }) => {
  const actual = [];
  const controller = new AbortController();
  ${parserCase.source}(${JSON.stringify(parserCase.marbles)}${values}${error}).subscribe({
    next: (value) => actual.push([now(), 'N', value]),
    error: (error) => actual.push([now(), 'E', error]),
    complete: () => actual.push([now(), 'C']),
  }, { signal: controller.signal });${horizon}
  await flush();
  expect(actual).to.deep.equal(${parserCase.expected});
});
}
`;
  }

  const programs = {
    'testing-index': `async function migrated(runtime) {
const { rxTest, expect } = runtime;
// RxJS Next exports the framework-neutral rxTest function instead of reviving
// the RxJS 7 rxjs/testing TestScheduler class.
expect(rxTest).to.be.a('function');
}
`,
    'test-api': `async function migrated(runtime) {
const { rxTest, expect } = runtime;
// The accepted public testing boundary is rxTest, not a constructible
// TestScheduler with mutable parser and queue internals.
expect(rxTest).to.be.a('function');
}
`,
    'frame-time-factor': `async function migrated(runtime) {
const { rxTest, expect } = runtime;
await rxTest(({ time }) => {
  // Run-style virtual time is the RxJS Next contract: one millisecond per
  // marble frame, replacing the legacy static frameTimeFactor of ten.
  expect(time('-|')).to.equal(1);
});
}
`,
    'subscription-basic': buildSubscriptionParserProgram('---^---!', '---^---!'),
    'subscription-open-boundary': `async function migrated(runtime) {
const { rxTest, expect } = runtime;
let rejection;
try {
  await rxTest(({ cold, expectObservable }) => {
    expectObservable(cold('-a'), '---^').toBe('----a');
  });
} catch (error) {
  rejection = error;
}
// A start marker without an end still parses as an infinite subscription.
// Unlike TestScheduler.run, rxTest then rejects the deliberately open
// observation so leaked tests cannot silently pass.
expect(rejection).to.be.instanceof(Error);
expect(rejection.message).to.match(/open observation/);
}
`,
    'subscription-sync': buildSubscriptionParserProgram('---(^!)', '---(^!)'),
    'subscription-whitespace': buildSubscriptionParserProgram(
      '  - -  - -  ^ -   - !  -- -      ',
      '----^--!'
    ),
    'subscription-time-progression': buildSubscriptionParserProgram(
      '10.2ms ^ 1.2s - 1m !',
      '10.2ms ^ 1.2s - 1m !'
    ),
    'subscription-multiple-starts': buildInvalidSubscriptionParserProgram('---^-^-!-'),
    'subscription-multiple-ends': buildInvalidSubscriptionParserProgram('---^---!-!'),
    'time-basic': buildTimeBoundaryProgram('-----|', 5, 'one millisecond per frame'),
    'time-whitespace-boundary': buildTimeBoundaryProgram(
      '     |',
      0,
      'run-style diagrams ignore whitespace instead of advancing legacy createTime'
    ),
    'time-mixed-whitespace-boundary': buildTimeBoundaryProgram(
      '  --|',
      2,
      'run-style diagrams ignore whitespace and count only explicit frames'
    ),
    'hot-source': `async function migrated(runtime) {
const { rxTest, expect } = runtime;
await rxTest(async ({ hot, flush, now }) => {
  const actual = [];
  const source = hot('--a---b--|', { a: 'A', b: 'B' });
  source.subscribe({
    next: (value) => actual.push([now(), value]),
    complete: () => actual.push([now(), 'complete']),
  });
  await flush();
  expect(actual).to.deep.equal([[2, 'A'], [6, 'B'], [9, 'complete']]);
});
}
`,
    'cold-helper': buildHelperExistenceProgram('cold'),
    'hot-helper': buildHelperExistenceProgram('hot'),
    'time-helper': buildHelperExistenceProgram('time'),
    'time-helper-value': buildTimeBoundaryProgram('-----|', 5, 'one millisecond per frame'),
    'observable-expectation-helper': buildHelperExistenceProgram('expectObservable'),
    'subscription-expectation-helper': buildHelperExistenceProgram('expectSubscriptions'),
    'hot-subject-boundary': `async function migrated(runtime) {
const { rxTest, expect } = runtime;
await rxTest(({ hot, expectObservable }) => {
  const source = hot('---^-a-b-|', { a: 1, b: 2 });
  // A Next hot fixture remains subject-like and multicast, but is deliberately
  // not required to inherit the removed RxJS 7 Subject class.
  expect(source.next).to.be.a('function');
  expect(source.complete).to.be.a('function');
  expectObservable(source).toBe('--a-b-|', { a: 1, b: 2 });
});
}
`,
    'observable-expectation-registration': `async function migrated(runtime) {
const { rxTest, expect } = runtime;
await rxTest(async ({ cold, expectObservable, flush }) => {
  const expectation = expectObservable(cold('|'));
  expect(expectation.toBe).to.be.a('function');
  expectation.toBe('|');
  await flush();
});
}
`,
    'never-expectation': `async function migrated(runtime) {
const { rxTest } = runtime;
await rxTest(({ cold, expectObservable }) => {
  const never = cold('-');
  expectObservable(never, '^!').toBe('-');
  expectObservable(never, '^--!').toBe('---');
});
}
`,
    'subscription-expectation-registration': `async function migrated(runtime) {
const { rxTest, expect } = runtime;
await rxTest(async ({ cold, expectObservable, expectSubscriptions, flush }) => {
  const source = cold('|');
  expectObservable(source).toBe('|');
  const expectation = expectSubscriptions(source.subscriptions);
  expect(expectation.toBe).to.be.a('function');
  expectation.toBe('(^!)');
  await flush();
});
}
`,
    'run-whitespace-and-host-delay': `async function migrated(runtime) {
const { rxTest, applyOperators, concatMap, delay, of } = runtime;
await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
  const input = cold('  -a - b -    c |       ');
  const output = applyOperators(input, [
    concatMap((value) => applyOperators(of(value), [delay(10)])),
  ]);
  expectObservable(output).toBe('-- 9ms a 9ms b 9ms (c|)');
  expectSubscriptions(input.subscriptions).toBe('^-----!');
});
}
`,
    'run-helper-set': `async function migrated(runtime) {
const { rxTest, expect } = runtime;
await rxTest(({ cold, hot, flush, expectObservable, expectSubscriptions }) => {
  expect(cold).to.be.a('function');
  expect(hot).to.be.a('function');
  expect(flush).to.be.a('function');
  expect(expectObservable).to.be.a('function');
  expect(expectSubscriptions).to.be.a('function');
  const first = cold('-a-c-e|');
  const second = hot('^-b-d-f|');
  expectObservable(first).toBe('-a-c-e|');
  expectObservable(second).toBe('--b-d-f|');
  expectSubscriptions(first.subscriptions).toBe('^-----!');
  expectSubscriptions(second.subscriptions).toBe('^------!');
});
}
`,
    'unbounded-virtual-time': `async function migrated(runtime) {
const { rxTest, applyOperators, delay } = runtime;
await rxTest(({ cold, expectObservable }) => {
  // rxTest has no legacy maxFrames ceiling.
  expectObservable(applyOperators(cold('-a|'), [delay(10_000)])).toBe('- 10s (a|)');
});
}
`,
    'automatic-flush': `async function migrated(runtime) {
const { rxTest, applyOperators, concatMap, delay, of } = runtime;
await rxTest(({ cold, expectObservable }) => {
  const output = applyOperators(cold('-a-b-c|'), [
    concatMap((value) => applyOperators(of(value), [delay(10)])),
  ]);
  // Returning from the callback performs the automatic flush and assertion.
  expectObservable(output).toBe('-- 9ms a 9ms b 9ms (c|)');
});
}
`,
    'explicit-flush': `async function migrated(runtime) {
const { rxTest, applyOperators, concatMap, delay, of, expect } = runtime;
let flushed = false;
await rxTest(async ({ cold, expectObservable, flush }) => {
  const output = applyOperators(cold('-a-b-c|'), [
    concatMap((value) => applyOperators(of(value), [delay(10)])),
  ]);
  expectObservable(output).toBe('-- 9ms a 9ms b 9ms (c|)');
  await flush();
  flushed = true;
});
expect(flushed).to.equal(true);
}
`,
    'promise-completion-boundary': `async function migrated(runtime) {
const { rxTest, expect } = runtime;
let completed = false;
await rxTest(async () => {
  await Promise.resolve('foo');
  completed = true;
});
// rxTest owns callback completion and returns Promise<void>; it does not expose
// arbitrary callback values as the removed TestScheduler.run method did.
expect(completed).to.equal(true);
}
`,
    'restore-after-error': `async function migrated(runtime) {
const { rxTest, expect } = runtime;
let caught;
try {
  await rxTest(() => {
    throw new Error('kaboom!');
  });
} catch (error) {
  caught = error;
}
expect(caught).to.be.instanceof(Error);
expect(caught.message).to.equal('kaboom!');
let ran = false;
await rxTest(async ({ schedule, flush }) => {
  schedule(() => {
    ran = true;
  }, 1);
  await flush();
});
expect(ran).to.equal(true);
}
`,
    'animation-without-opportunity': `async function migrated(runtime) {
const { rxTest, expect } = runtime;
let rejection;
try {
  await rxTest(() => {
    globalThis.requestAnimationFrame(() => {});
  });
} catch (error) {
  rejection = error;
}
expect(rejection).to.be.instanceof(Error);
expect(rejection.message).to.match(/animation-frame callback/);
}
`,
    'animation-async': buildAnimationProgram(false, false),
    'animation-sync': buildAnimationProgram(true, false),
    'animation-cancellation': buildAnimationProgram(true, true),
    'immediate-schedule': buildImmediateProgram(false),
    'immediate-cancellation': buildImmediateProgram(true),
    'interval-schedule': buildIntervalProgram(false),
    'interval-repeat': buildIntervalProgram(true),
    'timeout-schedule': `async function migrated(runtime) {
const { rxTest, expect } = runtime;
await rxTest(async ({ flush, now }) => {
  const values = [];
  globalThis.setTimeout(() => values.push('a@' + now()), 1);
  expect(values).to.deep.equal([]);
  await flush();
  expect(values).to.deep.equal(['a@1']);
});
}
`,
    'immediate-priority': `async function migrated(runtime) {
const { rxTest, expect } = runtime;
if (typeof globalThis.setImmediate !== 'function') {
  return;
}
await rxTest(async ({ flush, now }) => {
  const values = [];
  const interval = globalThis.setInterval(() => {
    values.push('a@' + now());
    globalThis.clearInterval(interval);
  }, 0);
  globalThis.setTimeout(() => values.push('b@' + now()), 0);
  globalThis.setImmediate(() => values.push('c@' + now()));
  await flush();
  expect(values).to.deep.equal(['c@0', 'a@0', 'b@0']);
});
}
`,
    'host-scheduler-order': `async function migrated(runtime) {
const { rxTest, expect } = runtime;
await rxTest(async ({ animate, cold, flush, now }) => {
  animate([9]);
  const values = [];
  cold('--m|').subscribe({
    next: () => {
      requestAnimationFrame(() => values.push('a@' + now()));
      setTimeout(() => values.push('b@' + now()), 5);
      setTimeout(() => values.push('c@' + now()), 0);
      queueMicrotask(() => values.push('d@' + now()));
    },
  });
  await flush();
  expect(values).to.deep.equal(['d@2', 'c@2', 'b@7', 'a@9']);
});
}
`,
    'microtask-before-timer': `async function migrated(runtime) {
const { rxTest, expect } = runtime;
await rxTest(async ({ cold, flush, now }) => {
  const values = [];
  cold('--ab|').subscribe({
    next: (value) => {
      if (value === 'a') {
        setTimeout(() => values.push('a@' + now()), 1);
      } else {
        queueMicrotask(() => values.push('b@' + now()));
      }
    },
  });
  await flush();
  expect(values).to.deep.equal(['b@3', 'a@3']);
});
}
`,
    'zero-duration-repetition': `async function migrated(runtime) {
const { rxTest, expect } = runtime;
await rxTest(async ({ cold, flush, now }) => {
  const values = [];
  cold('--m|').subscribe({
    next: () => {
      let microtasks = 0;
      const runMicrotask = () => {
        values.push('b@' + now());
        if (++microtasks < 3) queueMicrotask(runMicrotask);
      };
      queueMicrotask(runMicrotask);
      let intervals = 0;
      const handle = setInterval(() => {
        values.push('a@' + now());
        if (++intervals === 3) clearInterval(handle);
      }, 0);
    },
  });
  await flush();
  expect(values).to.deep.equal(['b@2', 'b@2', 'b@2', 'a@2', 'a@2', 'a@2']);
});
}
`,
    'delayed-host-time': `async function migrated(runtime) {
const { rxTest, applyOperators, delay, merge } = runtime;
await rxTest(({ cold, expectObservable, time }) => {
  const first = applyOperators(cold('(a|)'), [delay(time('----|'))]);
  const second = applyOperators(cold('(b|)'), [delay(time('--------|'))]);
  // Positive-delay legacy schedulers all crossed onto the same host timer
  // boundary; preserve that behavior without publishing scheduler instances.
  expectObservable(merge(first, second)).toBe('----a---(b|)');
});
}
`,
    'cancelled-host-time': `async function migrated(runtime) {
const { rxTest, applyOperators, delay } = runtime;
await rxTest(({ cold, expectObservable, expectSubscriptions, time }) => {
  const source = cold('a');
  const result = applyOperators(source, [delay(time('----|'))]);
  expectObservable(result, '^-!').toBe('--');
  expectSubscriptions(source.subscriptions).toBe('^-!');
  // Cancellation must clear the positive-delay host task. Provider spying is
  // intentionally outside the public Next boundary.
});
}
`,
  };
  const program = programs[kind];
  if (!program) {
    throw new Error(`Unknown scheduler compatibility harness rewrite: ${kind}`);
  }
  return program;
}

function buildSubscriptionParserProgram(subscriptionMarbles, expectedSubscriptionMarbles) {
  return `async function migrated(runtime) {
const { rxTest } = runtime;
await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
  const source = cold('-');
  expectObservable(source, ${JSON.stringify(subscriptionMarbles)}).toBe('-');
  expectSubscriptions(source.subscriptions).toBe(${JSON.stringify(expectedSubscriptionMarbles)});
});
}
`;
}

function buildInvalidSubscriptionParserProgram(subscriptionMarbles) {
  return `async function migrated(runtime) {
const { rxTest, expect } = runtime;
await rxTest(({ cold, expectObservable }) => {
  const source = cold('|');
  expect(() => expectObservable(source, ${JSON.stringify(subscriptionMarbles)})).to.throw();
});
}
`;
}

function buildTimeBoundaryProgram(marbles, expected, boundary) {
  return `async function migrated(runtime) {
const { rxTest, expect } = runtime;
await rxTest(({ time }) => {
  // Accepted TestScheduler compatibility boundary: ${boundary}.
  expect(time(${JSON.stringify(marbles)})).to.equal(${expected});
});
}
`;
}

function buildHelperExistenceProgram(helper) {
  return `async function migrated(runtime) {
const { rxTest, expect } = runtime;
await rxTest((context) => {
  expect(context[${JSON.stringify(helper)}]).to.be.a('function');
});
}
`;
}

function buildAnimationProgram(synchronousRequests, cancelFirst) {
  const requests = synchronousRequests
    ? `schedule(() => {
    const first = globalThis.requestAnimationFrame((timestamp) => values.push('a@' + timestamp));
    globalThis.requestAnimationFrame((timestamp) => values.push('b@' + timestamp));
    ${cancelFirst ? 'globalThis.cancelAnimationFrame(first);' : ''}
  }, 1);`
    : `schedule(() => globalThis.requestAnimationFrame((timestamp) => values.push('a@' + timestamp)), 0);
  schedule(() => globalThis.requestAnimationFrame((timestamp) => values.push('b@' + timestamp)), 1);`;
  const expected = cancelFirst ? `['b@2']` : `['a@2', 'b@2']`;
  return `async function migrated(runtime) {
const { rxTest, expect } = runtime;
await rxTest(async ({ animate, schedule, flush }) => {
  animate([2]);
  const values = [];
  ${requests}
  await flush();
  expect(values).to.deep.equal(${expected});
});
}
`;
}

function buildAnimationFramesLifecycleHarnessRewrite(kind) {
  const takeUntil = kind === 'takeUntil';
  return `async function migrated(runtime) {
const { rxTest, applyOperators, animationFrames, mergeMapTo, ${takeUntil ? 'takeUntil' : 'take'} } = runtime;
await rxTest(({ animate, cold, expectObservable, ${takeUntil ? 'hot, ' : ''}time }) => {
  animate('---x---x---x');
  const mapped = cold('-m');
  const tm = time('-|');
  const ta = time('---|');
  const tb = time('-------|');
  ${takeUntil ? "const signal = hot('^--------s--');" : ''}
  const frames = applyOperators(animationFrames(), [${takeUntil ? 'takeUntil(signal)' : 'take(2)'}]);
  const result = applyOperators(mapped, [mergeMapTo(frames)]);
  expectObservable(result, '^-----------!').toBe('---a---b', {
    a: { elapsed: ta - tm, timestamp: ta },
    b: { elapsed: tb - tm, timestamp: tb },
  });
});
}
`;
}

function buildImmediateProgram(cancelled) {
  return `async function migrated(runtime) {
const { rxTest, expect } = runtime;
if (typeof globalThis.setImmediate !== 'function') {
  return;
}
await rxTest(async ({ flush, now }) => {
  const values = [];
  const handle = globalThis.setImmediate(() => values.push('a@' + now()));
  ${cancelled ? 'globalThis.clearImmediate(handle);' : ''}
  expect(values).to.deep.equal([]);
  await flush();
  expect(values).to.deep.equal(${cancelled ? '[]' : "['a@0']"});
});
}
`;
}

function buildIntervalProgram(repeated) {
  return `async function migrated(runtime) {
const { rxTest, expect } = runtime;
await rxTest(async ({ flush, now }) => {
  const values = [];
  const handle = globalThis.setInterval(() => {
    if (${repeated ? 'now() <= 3' : 'true'}) {
      values.push('a@' + now());
    }
    if (${repeated ? 'now() > 3' : 'true'}) {
      globalThis.clearInterval(handle);
    }
  }, 1);
  expect(values).to.deep.equal([]);
  await flush();
  expect(values).to.deep.equal(${repeated ? "['a@1', 'a@2', 'a@3']" : "['a@1']"});
});
}
`;
}

function buildRequiredObservableInitializerHarnessRewrite() {
  return `async function migrated(runtime) {
const { expect, Observable } = runtime;
let rejection;
let nextCalled = false;
let completeCalled = false;

try {
  const result = new Observable();
  result.subscribe({
    next: () => {
      nextCalled = true;
    },
    error: (error) => {
      rejection = error;
    },
    complete: () => {
      completeCalled = true;
    },
  });
} catch (error) {
  rejection = error;
}

// RxJS 7 treated a missing initializer as NEVER. The platform constructor
// requires a callback: strict implementations reject construction, while the
// cold compatibility constructor rejects when the invalid source is activated.
expect(rejection).to.be.instanceof(TypeError);
expect(nextCalled).to.equal(false);
expect(completeCalled).to.equal(false);
}
`;
}

function buildPlatformSubclassCompositionHarnessRewrite(kind) {
  const configurations = {
    combineLatest: {
      operatorDescription: 'combineLatest',
      first: '-a--b-----c-d-e-|',
      second: '--1--2-3-4---|   ',
      result:
        "source[operatorSymbol]([other], (left, right) => String(left) + String(right))",
      expected: '--A-BC-D-EF-G-H-|',
      values: `, {
    A: 'a1',
    B: 'b1',
    C: 'b2',
    D: 'b3',
    E: 'b4',
    F: 'c4',
    G: 'd4',
    H: 'e4',
  }`,
      subclass: true,
      subscriptions: '',
    },
    concat: {
      operatorDescription: 'concat',
      first: '--a--b-|',
      second: '--x---y--|',
      result: 'source[operatorSymbol]([other])',
      expected: '--a--b---x---y--|',
      values: '',
      subclass: true,
      subscriptions: '',
    },
    merge: {
      operatorDescription: 'merge',
      first: '-a--b-| ',
      second: '--x--y-|',
      result: 'source[operatorSymbol]([other])',
      expected: '-ax-by-|',
      values: '',
      subclass: true,
      subscriptions: '',
    },
    race: {
      operatorDescription: 'race',
      first: '---a-----b-----c----|',
      second: '------x-----y-----z----|',
      result: 'source[operatorSymbol]([other])',
      expected: '---a-----b-----c----|',
      values: '',
      subclass: true,
      subscriptions: `
  expectSubscriptions(first.subscriptions).toBe('^-------------------!');
  expectSubscriptions(other.subscriptions).toBe('^--!');`,
    },
    zip: {
      operatorDescription: 'zipWith',
      first: '-a--b-----c-d-e-|',
      second: '--1--2-3-4---|   ',
      result: `source[operatorSymbol](other)[mapSymbol](
    ([left, right]) => String(left) + String(right)
  )`,
      expected: '--A--B----C-D|',
      values: `, {
    A: 'a1',
    B: 'b2',
    C: 'c3',
    D: 'd4',
  }`,
      subclass: false,
      subscriptions: '',
    },
  };
  const configuration = configurations[kind];
  const schedulerBoundary =
    kind === 'concat' || kind === 'merge'
      ? `
let schedulerError;
let schedulerCalls = 0;
await rxTest(async ({ cold, flush }) => {
  const first = cold('${configuration.first}');
  const other = cold('${configuration.second}');
  const legacyScheduler = {
    schedule() {
      schedulerCalls++;
    },
  };
  const result = applyOperators(MyCustomObservable.from(first), [
    ${kind}(other, legacyScheduler),
  ]);
  result.subscribe({ error: (error) => { schedulerError = error; } });
  await flush();
});

// The source case supplied the removed trailing SchedulerLike overload. Keep
// that part of the evidence executable: it is rejected as an unsupported
// Observable input and is never invoked as a scheduler.
expect(schedulerCalls).to.equal(0);
expect(schedulerError).to.be.instanceof(TypeError);
expect(schedulerError.message).to.match(/not observable/);
`
      : '';
  const runtimeNames =
    kind === 'concat' || kind === 'merge'
      ? `rxTest, expect, Observable, applyOperators, ${kind}${configuration.subclass ? ', __rxPortMode' : ''}`
      : `rxTest, expect, Observable${configuration.subclass ? ', __rxPortMode' : ''}`;
  const mapSymbol =
    kind === 'zip'
      ? `
const mapSymbol = exactOperatorSymbol('map');`
      : '';
  const subclassAssertion =
    configuration.subclass
      ? `expect(result instanceof MyCustomObservable).to.equal(__rxPortMode !== 'cold');
  expect(result instanceof Observable).to.equal(true);`
      : `expect(result instanceof MyCustomObservable).to.equal(false);
  expect(result instanceof Observable).to.equal(true);`;
  const constructionComment = configuration.subclass
    ? `// Exact extension Symbols replace the removed RxJS 7
  // empty-constructor/source/operator/lift protocol. The platform construction
  // protocol preserves an ordinary custom subclass; the cold compatibility
  // protocol deliberately normalizes subclasses to a plain ColdObservable.`
    : `// A valid platform subclass and exact extension Symbol replace the removed
  // RxJS 7 empty-constructor/source/operator/lift protocol. Preserve the
  // original composition identity decision and complete marble evidence.`;

  return `async function migrated(runtime) {
const { ${runtimeNames} } = runtime;
class MyCustomObservable extends Observable {
  static from(source) {
    return new this((subscriber) => {
      source.subscribe(subscriber, { signal: subscriber.signal });
    });
  }
}
const exactOperatorSymbol = (description) => {
  const matches = Object.getOwnPropertySymbols(Observable.prototype).filter(
    (symbol) => symbol.description === description
  );
  expect(matches).to.have.length(1);
  return matches[0];
};
const operatorSymbol = exactOperatorSymbol('${configuration.operatorDescription}');${mapSymbol}

await rxTest(async ({ cold, expectObservable, expectSubscriptions }) => {
  const first = cold('${configuration.first}');
  const other = cold('${configuration.second}');
  const source = MyCustomObservable.from(first);
  const result = ${configuration.result};

  ${constructionComment}
  ${subclassAssertion}
  expectObservable(result).toBe('${configuration.expected}'${configuration.values});${configuration.subscriptions}
});
${schedulerBoundary}}
`;
}

function buildNoConnectHarnessRewrite(kind, horizon) {
  const subscription = boundedSubscription(0, horizon);
  const expected = '-'.repeat(horizon);
  const runtimeNames =
    kind === 'connectable'
      ? 'rxTest, connectable'
      : 'rxTest, applyOperators, multicast, Subject';
  const result =
    kind === 'connectable'
      ? 'connectable(source)'
      : 'applyOperators(source, [multicast(() => new Subject())])';
  return `async function migrated(runtime) {
const { ${runtimeNames} } = runtime;
await rxTest(async ({ cold, expectObservable, expectSubscriptions }) => {
  const source = cold('--1-2---3-4--5-|');
  const result = ${result};

  // No connection is made. Bound the silent observer at the full original
  // diagram horizon and retain the empty source-subscription claim.
  expectObservable(result, '${subscription}').toBe('${expected}');
  expectSubscriptions(source.subscriptions).toBe([]);
});
}
`;
}

function buildDisconnectedMulticastHarnessRewrite(withUnsubscriptionChain) {
  const runtimeNames = withUnsubscriptionChain
    ? 'rxTest, applyOperators, mergeMap, multicast, of, Subject'
    : 'rxTest, applyOperators, multicast, Subject';
  const operators = withUnsubscriptionChain
    ? '[mergeMap((value) => of(value)), multicast(() => new Subject())]'
    : '[multicast(() => new Subject())]';
  return `async function migrated(runtime) {
const { ${runtimeNames} } = runtime;
await rxTest(async ({ cold, expectObservable, expectSubscriptions, schedule }) => {
  const source = cold('-1-2-3----4-|');
  const result = applyOperators(source, ${operators});

  // Preserve the three original subscription frames (0, 4, and 8). The
  // manual connection ends at frame 9; the still-live subject observations
  // are independently bounded at the diagrams' frame-10 horizon.
  expectObservable(result, '^---------!').toBe('-1-2-3----');
  expectObservable(result, '----^-----!').toBe('-----3----');
  expectObservable(result, '--------^-!').toBe('----------');
  expectSubscriptions(source.subscriptions).toBe('^--------!');

  const connection = result.connect();
  schedule(() => connection.unsubscribe(), 9);
});
}
`;
}

function buildNeverMulticastHarnessRewrite() {
  return `async function migrated(runtime) {
const { rxTest, applyOperators, multicast, Subject } = runtime;
await rxTest(async ({ cold, expectObservable, expectSubscriptions, schedule }) => {
  const source = cold('-');
  const result = applyOperators(source, [multicast(() => new Subject())]);

  // Bound the silent result and its explicit manual connection at the
  // original one-frame evidence horizon.
  expectObservable(result, '^!').toBe('-');
  expectSubscriptions(source.subscriptions).toBe('^!');

  const connection = result.connect();
  schedule(() => connection.unsubscribe(), 1);
});
}
`;
}

function buildNoConnectPublishHarnessRewrite(kind) {
  const descriptor =
    kind === 'publishBehavior'
      ? "publishBehavior('0')"
      : `${kind}()`;
  const expected = kind === 'publishBehavior' ? '0' : '-';
  return `async function migrated(runtime) {
const { rxTest, applyOperators, ${kind} } = runtime;
await rxTest(async ({ cold, expectObservable, expectSubscriptions }) => {
  const source = cold('--1-2---3-4--5-|');
  const result = applyOperators(source, [${descriptor}]);

  // No manual connection is made. Bound the observer at the original
  // one-frame evidence horizon while retaining the empty source log.
  expectObservable(result, '^!').toBe('${expected}');
  expectSubscriptions(source.subscriptions).toBe([]);
});
}
`;
}

function buildDisconnectedPublishHarnessRewrite(kind, withUnsubscriptionChain) {
  const descriptor =
    kind === 'publishBehavior'
      ? "publishBehavior('0')"
      : `${kind}()`;
  const runtimeNames = [
    'rxTest',
    'applyOperators',
    kind,
    ...(withUnsubscriptionChain ? ['mergeMap', 'of'] : []),
  ];
  const operators = [
    ...(withUnsubscriptionChain ? ['mergeMap((value) => of(value))'] : []),
    descriptor,
  ];
  const expectations =
    kind === 'publish'
      ? ['-1-2-3----', '-----3----', '----------']
      : kind === 'publishBehavior'
        ? ['01-2-3----', '----23----', '--------3-']
        : ['----------', '----------', '----------'];
  return `async function migrated(runtime) {
const { ${runtimeNames.join(', ')}, __rxPortMode } = runtime;
await rxTest(async ({ cold, expectObservable, expectSubscriptions, schedule }) => {
  const source = cold('-1-2-3----4-|');
  const result = applyOperators(source, [${operators.join(', ')}]);
  const platformSharedRun = __rxPortMode !== 'cold';
  const secondExpected =
    platformSharedRun && '${kind}' === 'publishBehavior'
      ? '-----3----'
      : '${expectations[1]}';
  const thirdExpected =
    platformSharedRun && '${kind}' === 'publishBehavior'
      ? '----------'
      : '${expectations[2]}';

  // Preserve the original observer starts at frames 0, 4, and 8. Disconnect
  // the source at frame 9 and release the live subject observers at the
  // diagrams' frame-10 horizon. Platform-mode observers join the existing
  // shared activation, so publishBehavior does not synchronously replay its
  // current subject value for those later logical observations.
  expectObservable(result, '^---------!').toBe('${expectations[0]}');
  expectObservable(result, '----^-----!').toBe(secondExpected);
  expectObservable(result, '--------^-!').toBe(thirdExpected);
  expectSubscriptions(source.subscriptions).toBe('^--------!');

  const connection = result.connect();
  schedule(() => connection.unsubscribe(), 9);
});
}
`;
}

function buildNeverPublishHarnessRewrite(kind) {
  const descriptor =
    kind === 'publishBehavior'
      ? "publishBehavior('0')"
      : `${kind}()`;
  const expected = kind === 'publishBehavior' ? '0' : '-';
  return `async function migrated(runtime) {
const { rxTest, applyOperators, ${kind} } = runtime;
await rxTest(async ({ cold, expectObservable, expectSubscriptions, schedule }) => {
  const source = cold('-');
  const result = applyOperators(source, [${descriptor}]);

  // Bound both the silent source connection and its result at the original
  // one-frame evidence horizon.
  expectObservable(result, '^!').toBe('${expected}');
  expectSubscriptions(source.subscriptions).toBe('^!');

  const connection = result.connect();
  schedule(() => connection.unsubscribe(), 1);
});
}
`;
}

function buildDisconnectedPublishReplayHarnessRewrite(withUnsubscriptionChain) {
  const runtimeNames = [
    'rxTest',
    'applyOperators',
    'publishReplay',
    ...(withUnsubscriptionChain ? ['mergeMap', 'of'] : []),
  ];
  const operators = [
    ...(withUnsubscriptionChain ? ['mergeMap((value) => of(value))'] : []),
    'publishReplay(1)',
  ];
  return `async function migrated(runtime) {
const { ${runtimeNames.join(', ')}, __rxPortMode } = runtime;
await rxTest(async ({ cold, expectObservable, expectSubscriptions, schedule }) => {
  const source = cold('-1-2-3----4-|');
  const result = applyOperators(source, [${operators.join(', ')}]);
  const coldMode = __rxPortMode === 'cold';

  // Preserve the original observer starts at frames 0, 4, and 8. A cold
  // observer gets its own ReplaySubject subscription and therefore replay;
  // platform observers join one active result run and see only later fanout.
  expectObservable(result, '^---------!').toBe('-1-2-3----');
  expectObservable(result, '----^-----!').toBe(coldMode ? '----23----' : '-----3----');
  expectObservable(result, '--------^-!').toBe(coldMode ? '--------3-' : '----------');
  expectSubscriptions(source.subscriptions).toBe('^--------!');

  const connection = result.connect();
  schedule(() => connection.unsubscribe(), 9);
});
}
`;
}

function buildNeverPublishReplaySelectorHarnessRewrite() {
  return `async function migrated(runtime) {
const { rxTest, applyOperators, NEVER, publishReplay } = runtime;
await rxTest(async ({ cold, expectObservable, expectSubscriptions }) => {
  const source = cold('-');
  const result = applyOperators(source, [publishReplay(1, Infinity, () => NEVER)]);

  // Bound the selector result and its source subscription at the original
  // one-frame evidence horizon without changing either silent claim.
  expectObservable(result, '^!').toBe('-');
  expectSubscriptions(source.subscriptions).toBe('^!');
});
}
`;
}

function buildTerminalPublishReplaySelectorHarnessRewrite(terminal) {
  const isError = terminal === 'error';
  const runtimeNames = isError
    ? 'rxTest, applyOperators, publishReplay, throwError'
    : 'rxTest, applyOperators, EMPTY, publishReplay';
  const selector = isError
    ? `() => throwError(() => "It's broken")`
    : '() => EMPTY';
  const expected = isError ? '#' : '|';
  const assertionArguments = isError ? `, undefined, "It's broken"` : '';
  return `async function migrated(runtime) {
const { ${runtimeNames} } = runtime;
await rxTest(async ({ cold, expectObservable, expectSubscriptions }) => {
  const source = cold('--1--2---3---|');
  const result = applyOperators(source, [publishReplay(1, Infinity, ${selector})]);

  // RxJS Next subscribes to the selector result first. Synchronous terminal
  // delivery closes the result before source activation, so the behavioral
  // output is retained with an intentionally empty source-subscription log.
  expectObservable(result).toBe('${expected}'${assertionArguments});
  expectSubscriptions(source.subscriptions).toBe([]);
});
}
`;
}

function buildFromArrayDelayHarnessRewrite() {
  return `async function migrated(runtime) {
const { rxTest, applyOperators, concatMap, delay, from, of } = runtime;
await rxTest(async ({ expectObservable, time }) => {
  const delayTime = time('--|');
  const result = applyOperators(from([10, 20, 30]), [
    concatMap((value, index) =>
      applyOperators(of(value), [delay(index === 0 ? 0 : delayTime)])
    ),
  ]);

  expectObservable(result).toBe('x-y-(z|)', { x: 10, y: 20, z: 30 });
});
}
`;
}

function buildAsyncIterableErrorHarnessRewrite() {
  return `async function migrated(runtime) {
const { rxTest, applyOperators, delay, mergeMap, of } = runtime;
await rxTest(async ({ cold, expectObservable, expectSubscriptions }) => {
  const failure = new Error('we do not allow x');
  const source = cold('-----a------------b-----|', {
    a: ['o', 'o', 'o'],
    b: ['o', 'x', 'o'],
  });
  const iterable = function* (values) {
    for (const value of values) {
      if (value === 'x') {
        throw failure;
      }
      yield value;
    }
  };
  const result = applyOperators(source, [
    mergeMap((values) =>
      applyOperators(of(values), [delay(0), mergeMap(iterable)])
    ),
  ]);

  expectObservable(result).toBe('-----(ooo)--------(o#)', undefined, failure);
  expectSubscriptions(source.subscriptions).toBe('^-----------------!');
});
}
`;
}

function buildRestartingShareReplayHarnessRewrite() {
  return `async function migrated(runtime) {
const { rxTest, applyOperators, shareReplay } = runtime;
await rxTest(async ({ cold, expectObservable, expectSubscriptions }) => {
  const source = cold('a-b-c-d-e-f-g-h-i-j');
  const shared = applyOperators(source, [
    shareReplay({ bufferSize: 1, refCount: true }),
  ]);

  // Retain both original observer windows and close the second ref-counted
  // run at the source diagram's frame-30 evidence horizon.
  expectObservable(shared, '^------!').toBe('a-b-c-d-');
  expectObservable(shared, '-----------^------------------!').toBe(
    '-----------a-b-c-d-e-f-g-h-i-j'
  );
  expectSubscriptions(source.subscriptions).toBe([
    '^------!',
    '-----------^------------------!',
  ]);
});
}
`;
}

function buildSynchronousRefCountHarnessRewrite(kind, replay) {
  const attempts = kind === 'retry' ? 4 : 5;
  const terminal = kind === 'retry' ? '#' : '|';
  const subject = replay ? 'new ReplaySubject(1)' : 'new Subject()';
  const runtimeNames = [
    'rxTest',
    'applyOperators',
    'multicast',
    'refCount',
    kind,
    replay ? 'ReplaySubject' : 'Subject',
  ];
  const sourceSubscriptions = [
    ...Array.from({ length: attempts }, () => '(^!)'),
    ...Array.from({ length: attempts }, () => '-(^!)'),
  ];
  const expected = `(${`123`.repeat(attempts)}${terminal})`;
  const operatorArgument = kind === 'retry' ? attempts - 1 : attempts;
  return `async function migrated(runtime) {
const { ${runtimeNames.join(', ')} } = runtime;
await rxTest(async ({ cold, expectObservable, expectSubscriptions }) => {
  const source = cold('(123${terminal})');
  const result = applyOperators(source, [
    multicast(() => ${subject}),
    refCount(),
  ]);

  // Preserve the two original trigger frames directly. Nested expectations
  // created at frame 1 otherwise schedule against absolute frame 0.
  expectObservable(applyOperators(result, [${kind}(${operatorArgument})])).toBe('${expected}');
  expectObservable(applyOperators(result, [${kind}(${operatorArgument})]), '-^').toBe('-${expected}');
  expectSubscriptions(source.subscriptions).toBe(${JSON.stringify(sourceSubscriptions, null, 2)});
});
}
`;
}

function buildTimedRefCountHarnessRewrite(kind, replay) {
  const terminal = kind === 'retry' ? '#' : '|';
  const subject = replay ? 'new ReplaySubject(1)' : 'new Subject()';
  const runtimeNames = [
    'rxTest',
    'applyOperators',
    'multicast',
    'refCount',
    kind,
    replay ? 'ReplaySubject' : 'Subject',
  ];
  return `async function migrated(runtime) {
const { ${runtimeNames.join(', ')}, __rxPortMode } = runtime;
await rxTest(async ({ cold, expectObservable, expectSubscriptions }) => {
  const source = cold('-1-2-3----4-${terminal}                        ');
  const result = applyOperators(source, [
    multicast(() => ${subject}),
    refCount(),
  ]);
  const coldMode = __rxPortMode === 'cold';
  const firstExpected = coldMode
    ? ${replay ? `'-1-2-3----4-(44${terminal})'` : `'-1-2-3----4-${terminal}'`}
    : '-1-2-3----4--1-2-3----4--1-2-3----4-${terminal}';
  const secondPrefix = ${replay ? `coldMode ? '----23----4-' : '-----3----4-'` : ` '-----3----4-'`};

  // Observe the shared ref-counted run at the original frames 0 and 4
  // without retaining the never-ending hot trigger fixtures. Cold-mode
  // operator subscriptions retain their individual terminal lifecycle while
  // the second ref-counted observer keeps the shared source retry/repeat run
  // active; platform mode shares that operator activation as well.
  expectObservable(applyOperators(result, [${kind}(${kind === 'retry' ? 2 : 3})])).toBe(
    firstExpected
  );
  expectObservable(
    applyOperators(result, [${kind}(${kind === 'retry' ? 2 : 3})]),
    '----^'
  ).toBe(secondPrefix + '-1-2-3----4--1-2-3----4-${terminal}');
  expectSubscriptions(source.subscriptions).toBe([
    '^-----------!                        ',
    '------------^-----------!            ',
    '------------------------^-----------!',
  ]);
});
}
`;
}

function buildShareUnhandledResetHarnessRewrite(kind) {
  const refCount = kind === 'refCount';
  const terminal = kind === 'error' ? '#' : '|';
  const source = refCount ? "hot('---1---2---3---4---(5 )---|')" : `cold('---1---2---${terminal}')`;
  const sourceSubscription = refCount ? '^------------------(- )---!' : '^----------!';
  const expected = refCount ? '---1---2-------4---(5|)' : `---1---2------${terminal}`;
  const subscription = refCount ? '^------------------(- )' : '^--------------';
  const firstPause = refCount ? "cold('------|')" : "cold('-------|')";
  const reset = refCount ? "cold('--#', undefined, error)" : "cold('--#', undefined, error)";
  const shareConfig = refCount
    ? 'resetOnRefCountZero: () => reset'
    : `resetOn${kind === 'error' ? 'Error' : 'Complete'}: () => reset, resetOnRefCountZero: false`;
  const result = refCount
    ? 'concat(sharedSource, firstPause, sharedSource)'
    : 'concat(sharedSource, firstPause, sharedSource)';
  const expectedCalls = refCount ? 2 : 1;
  return `async function migrated(runtime) {
const { rxTest, applyOperators, expect, concat, config, share, take, spy } = runtime;
const previous = config.onUnhandledError;
const onUnhandledError = spy();
config.onUnhandledError = onUnhandledError;
try {
  const error = new Error();
  await rxTest(async ({ ${refCount ? 'hot, ' : ''}cold, expectObservable, expectSubscriptions }) => {
    const source = ${source};
    const firstPause = ${firstPause};
    const reset = ${reset};
    const sharedSource = applyOperators(source, [
      share({ ${shareConfig} }),
      take(2),
    ]);
    const result = ${result};

    expectObservable(result, '${subscription}').toBe('${expected}');
    expectSubscriptions(source.subscriptions).toBe('${sourceSubscription}');
  });

  expect(onUnhandledError).to.have.callCount(${expectedCalls});
  for (let index = 0; index < ${expectedCalls}; index++) {
    expect(onUnhandledError.getCall(index)).to.have.been.calledWithExactly(error);
  }
} finally {
  config.onUnhandledError = previous;
}
}
`;
}

function buildSkippedRepeatWhenHotNotifierHarnessRewrite() {
  return `async function migrated(runtime) {
const { rxTest, applyOperators, repeatWhen, takeWhile } = runtime;
await rxTest(async ({ expectObservable, expectSubscriptions, hot }) => {
  const source = hot('-1--2--3----4--5---|');
  const notifier = hot('--------------r--------r---r--r--r---|');
  const result = applyOperators(source, [
    takeWhile((value) => value !== '3'),
    repeatWhen(() => notifier),
  ]);

  // The skipped RxJS 7 expectation completed at frame 19 even though the
  // notifier remained active. Preserve the host-source behavior while
  // asserting the notifier contract: later notifications attempt immediate
  // resubscriptions to the already-completed hot source, and the result
  // completes when the notifier completes at frame 37.
  expectObservable(result).toBe('-1--2----------5---------------------|');
  expectSubscriptions(source.subscriptions).toBe([
    '^------!',
    '--------------^----!',
    '-----------------------(^!)',
    '---------------------------(^!)',
    '------------------------------(^!)',
    '---------------------------------(^!)',
  ]);
  expectSubscriptions(notifier.subscriptions).toBe(
    '-------^-----------------------------!'
  );
});
}
`;
}

function buildLegacyConcatBehaviorHarnessRewrite() {
  return `async function migrated(runtime) {
const { rxTest, applyOperators, concat } = runtime;
await rxTest(async ({ cold, expectObservable, expectSubscriptions }) => {
  const first = cold('--a--b-|');
  const second = cold('--x---y--|');
  const result = applyOperators(first, [concat(second)]);

  // The original case passed its TestScheduler as a trailing legacy overload,
  // but its behavioral claim and timing only assert sequential subscription.
  // Preserve that claim without treating the scheduler object as a source.
  expectObservable(result).toBe('--a--b---x---y--|');
  expectSubscriptions(first.subscriptions).toBe('^------!');
  expectSubscriptions(second.subscriptions).toBe('-------^--------!');
});
}
`;
}

function buildVirtualTimerHarnessRewrite(kind) {
  const configurations = {
    'periodic-open': {
      runtimeNames: 'rxTest, applyOperators, NEVER, take, concat',
      body: `const source = applyOperators(virtualTimer(6, 2), [
    take(4),
    concat(NEVER),
  ]);
  expectObservable(source, '^-------------!').toBe('------a-b-c-d-', {
    a: 0,
    b: 1,
    c: 2,
    d: 3,
  });`,
    },
    'delayed-periodic': {
      runtimeNames: 'rxTest, applyOperators, take',
      body: `const source = applyOperators(virtualTimer(4, 2), [take(5)]);
  expectObservable(source).toBe('----a-b-c-d-(e|)', {
    a: 0,
    b: 1,
    c: 2,
    d: 3,
    e: 4,
  });`,
    },
    'immediate-periodic': {
      runtimeNames: 'rxTest, applyOperators, take',
      body: `const source = applyOperators(virtualTimer(0, 3), [take(5)]);
  expectObservable(source).toBe('a--b--c--d--(e|)', {
    a: 0,
    b: 1,
    c: 2,
    d: 3,
    e: 4,
  });`,
    },
    'cancelled-periodic': {
      runtimeNames: 'rxTest',
      body: `const source = virtualTimer(0, 3);
  expectObservable(source, '^------------!').toBe('a--b--c--d--e', {
    a: 0,
    b: 1,
    c: 2,
    d: 3,
    e: 4,
  });`,
    },
    'dated-periodic': {
      runtimeNames: 'rxTest, applyOperators, take',
      body: `const source = applyOperators(virtualTimer(new Date(now() + 4), 2), [take(5)]);
  expectObservable(source).toBe('----a-b-c-d-(e|)', {
    a: 0,
    b: 1,
    c: 2,
    d: 3,
    e: 4,
  });`,
    },
    'dated-resubscription': {
      runtimeNames: 'rxTest, applyOperators, merge, mergeMap',
      body: `const firstTrigger = cold('a|');
  const secondTrigger = cold('--a|');
  const source = virtualTimer(new Date(now() + 4));
  const result = applyOperators(merge(firstTrigger, secondTrigger), [
    mergeMap(() => source),
  ]);
  expectObservable(result).toBe('----(aa|)', { a: 0 });`,
    },
    'infinite-due': {
      runtimeNames: 'rxTest',
      body: `const source = virtualTimer(Infinity);
  expectObservable(source, '^-----!').toBe('------');`,
    },
    'infinite-period': {
      runtimeNames: 'rxTest',
      body: `const source = virtualTimer(4, Infinity);
  expectObservable(source, '^-----!').toBe('----a-', { a: 0 });`,
    },
  };
  const configuration = configurations[kind];
  if (!configuration) {
    throw new Error(`Unknown virtual timer harness rewrite: ${kind}`);
  }
  return `async function migrated(runtime) {
const { ${configuration.runtimeNames} } = runtime;
await rxTest(async ({ cold, expectObservable, now, schedule }) => {
  const virtualTimer = (due, period) =>
    new Observable((subscriber) => {
      const firstDelay =
        due instanceof Date ? Math.max(0, +due - now()) : Math.max(0, Number(due));
      if (firstDelay === Infinity) {
        return;
      }
      let index = 0;
      const emit = () => {
        if (subscriber.signal.aborted) {
          return;
        }
        subscriber.next(index++);
        if (subscriber.signal.aborted) {
          return;
        }
        if (period == null || period < 0) {
          subscriber.complete();
        } else if (period !== Infinity) {
          schedule(emit, period, { signal: subscriber.signal });
        }
      };
      schedule(emit, firstDelay, { signal: subscriber.signal });
    });

  // Model only the removed TestScheduler injection inside rxTest's virtual
  // host. This fixture preserves the timing claim without exposing a generic
  // scheduler value or claiming a public scheduler overload.
  ${configuration.body}
});
}
`;
}

function buildRangeBehaviorHarnessRewrite(start, count, multipleSubscribers) {
  const valueKeys = 'abcdefghij'.slice(0, count);
  const values = Object.fromEntries(
    Array.from({ length: count }, (_, index) => [valueKeys[index], start + index])
  );
  const argumentsText = start === 0 ? `${count}` : `${start}, ${count}`;
  const expectations = [
    `expectObservable(source).toBe('(${valueKeys}|)', values);`,
    ...(multipleSubscribers
      ? [`expectObservable(source).toBe('(${valueKeys}|)', values);`]
      : []),
  ].join('\n  ');
  return `async function migrated(runtime) {
const { rxTest, range } = runtime;
await rxTest(async ({ expectObservable }) => {
  const source = range(${argumentsText});
  const values = ${JSON.stringify(values, null, 2)};

  // The RxJS 7 case used concatMap/delay only to spread synchronous range
  // values into a readable diagram. Assert the actual range contract directly.
  ${expectations}
});
}
`;
}

function buildGenerateSchedulerBehaviorHarnessRewrite(kind) {
  const configurations = {
    values: {
      runtimeNames: 'rxTest, expect, generate',
      options: `{
    initialState: 1,
    condition: (value) => value < 4,
    iterate: (value) => value + 1,
    resultSelector: (value) => value,
  }`,
      assertion: `let count = 0;
  schedule(() => source.subscribe(() => count++), 0);
  expect(count).to.equal(0);
  expectObservable(source).toBe('(123|)', { '1': 1, '2': 2, '3': 3 });
  await flush();
  expect(count).to.equal(3);`,
    },
    'result-error': {
      runtimeNames: 'rxTest, generate',
      options: `{
    initialState: 1,
    iterate: (value) => value * 2,
    resultSelector: err,
  }`,
      assertion: `expectObservable(source).toBe('(#)');`,
    },
    'iterate-error': {
      runtimeNames: 'rxTest, generate',
      options: `{
    initialState: 1,
    iterate: err,
  }`,
      assertion: `expectObservable(source).toBe('(1#)', { '1': 1 });`,
    },
    'condition-error': {
      runtimeNames: 'rxTest, generate',
      options: `{
    initialState: 1,
    iterate: (value) => value + 1,
    condition: err,
  }`,
      assertion: `expectObservable(source).toBe('(#)');`,
    },
  };
  const configuration = configurations[kind];
  if (!configuration) {
    throw new Error(`Unknown generate scheduler harness rewrite: ${kind}`);
  }
  return `async function migrated(runtime) {
const { ${configuration.runtimeNames} } = runtime;
function err() {
  throw 'error';
}
await rxTest(async ({ expectObservable, flush, schedule }) => {
  const source = generate(${configuration.options});

  // The scheduler-last overload is intentionally unavailable. Preserve the
  // generation/error contract, and use rxTest.schedule only where the source
  // case explicitly proves deferred subscription.
  ${configuration.assertion}
});
}
`;
}

function buildScheduledInputHarnessRewrite(kind) {
  const inputs = {
    observable: {
      runtimeNames: 'rxTest, of',
      declaration: `const input = of('a', 'b', 'c');`,
    },
    array: {
      runtimeNames: 'rxTest',
      declaration: `const input = ['a', 'b', 'c'];`,
    },
    iterable: {
      runtimeNames: 'rxTest',
      declaration: `const input = 'abc';`,
    },
    'observable-like': {
      runtimeNames: 'rxTest',
      declaration: `const input = {
  subscribe(observer) {
    for (const value of ['a', 'b', 'c']) {
      observer.next?.(value);
    }
    observer.complete?.();
    return { unsubscribe() {} };
  },
};
input[Symbol.observable ?? '@@observable'] = function () {
  return this;
};`,
    },
  };
  const input = inputs[kind];
  if (!input) {
    throw new Error(`Unknown scheduled input harness rewrite: ${kind}`);
  }
  return `async function migrated(runtime) {
const { ${input.runtimeNames} } = runtime;
${input.declaration}
await rxTest(async ({ expectObservable, schedule }) => {
  const virtualScheduled = (value) =>
    new Observable((subscriber) => {
      schedule(
        () => {
          try {
            if (typeof value === 'string') {
              for (const item of value) {
                subscriber.next(item);
              }
              subscriber.complete();
              return;
            }
            Observable.from(value).subscribe(subscriber, {
              signal: subscriber.signal,
            });
          } catch (error) {
            subscriber.error(error);
          }
        },
        0,
        { signal: subscriber.signal }
      );
    });

  // This case exercises the input conversion contract under rxTest's virtual
  // host without registering scheduled or a scheduler object as public APIs.
  expectObservable(virtualScheduled(input)).toBe('(abc|)');
});
}
`;
}

function buildStartWithSchedulerLastHarnessRewrite(kind) {
  const configurations = {
    cancelled: {
      runtimeNames: 'rxTest, applyOperators, startWith',
      source: '---a--b----c--d--|',
      sourceSubscription: '^--------!',
      operators: `[startWith('s')]`,
      expectation: `expectObservable(result, '^--------!').toBe('s--a--b--', {
    s: 's',
    a: 'a',
    b: 'b',
  });`,
    },
    chain: {
      runtimeNames: 'rxTest, applyOperators, startWith, mergeMap, of',
      source: '---a--b----c--d--|',
      sourceSubscription: '^--------!',
      operators: `[mergeMap((value) => of(value)), startWith('s'), mergeMap((value) => of(value))]`,
      expectation: `expectObservable(result, '^--------!').toBe('s--a--b--', {
    s: 's',
    a: 'a',
    b: 'b',
  });`,
    },
    empty: {
      runtimeNames: 'rxTest, applyOperators, startWith',
      source: '-a-|',
      sourceSubscription: '^--!',
      operators: `[startWith()]`,
      expectation: `expectObservable(result).toBe('-a-|');`,
    },
    single: {
      runtimeNames: 'rxTest, applyOperators, startWith',
      source: '--a--|',
      sourceSubscription: '^----!',
      operators: `[startWith('x')]`,
      expectation: `expectObservable(result).toBe('x-a--|');`,
    },
    multiple: {
      runtimeNames: 'rxTest, applyOperators, startWith',
      source: '-----a--|',
      sourceSubscription: '^-------!',
      operators: `[startWith('y', 'z')]`,
      expectation: `expectObservable(result).toBe('(yz)-a--|');`,
    },
  };
  const configuration = configurations[kind];
  if (!configuration) {
    throw new Error(`Unknown startWith scheduler-last harness rewrite: ${kind}`);
  }
  return `async function migrated(runtime) {
const { ${configuration.runtimeNames} } = runtime;
await rxTest(async ({ hot, expectObservable, expectSubscriptions }) => {
  const source = hot('${configuration.source}');
  const result = applyOperators(source, ${configuration.operators});

  // Remove only the obsolete TestScheduler argument. The exact startWith
  // Symbol still owns all values, timing, and cancellation in this claim.
  ${configuration.expectation}
  expectSubscriptions(source.subscriptions).toBe('${configuration.sourceSubscription}');
});
}
`;
}

function buildEndWithSchedulerLastHarnessRewrite(kind) {
  const multiple = kind === 'multiple';
  return `async function migrated(runtime) {
const { rxTest, applyOperators, endWith } = runtime;
await rxTest(async ({ hot, expectObservable, expectSubscriptions }) => {
  const source = hot('${multiple ? '-----a--|' : '--a--|'}');
  const result = applyOperators(source, [${multiple ? "endWith('y', 'z')" : "endWith('x')"}]);

  // Remove only the obsolete TestScheduler argument. The existing concat
  // compatibility boundary still owns append ordering and completion.
  expectObservable(result).toBe('${multiple ? '-----a--(yz|)' : '--a--(x|)'}');
  expectSubscriptions(source.subscriptions).toBe('${multiple ? '^-------!' : '^----!'}');
});
}
`;
}

function buildConcatSchedulerLastHarnessRewrite(kind) {
  const multiple = kind === 'multiple';
  return `async function migrated(runtime) {
const { rxTest, applyOperators, concat } = runtime;
await rxTest(async ({ cold, expectObservable, expectSubscriptions }) => {
  const first = cold('${multiple ? '---a|' : '---a-|'}');${
    multiple
      ? `
  const second = cold('---b--|');
  const third = cold('---c--|');
  const result = applyOperators(first, [concat(second, third)]);`
      : `
  const result = applyOperators(first, [concat()]);`
  }

  // The trailing scheduler controlled subscription dispatch only. Preserve
  // the exact sequential-source claim without treating that object as input.
  expectObservable(result).toBe('${multiple ? '---a---b-----c--|' : '---a-|'}');
  expectSubscriptions(first.subscriptions).toBe('${multiple ? '^---!' : '^----!'}');${
    multiple
      ? `
  expectSubscriptions(second.subscriptions).toBe('----^-----!');
  expectSubscriptions(third.subscriptions).toBe('----------^-----!');`
      : ''
  }
});
}
`;
}

function buildDeferredShareResetHarnessRewrite() {
  return `async function migrated(runtime) {
const { rxTest, applyOperators, concat, share, take } = runtime;
await rxTest(async ({ cold, expectObservable, expectSubscriptions, schedule }) => {
  const deferredNotify = new Observable((subscriber) => {
    schedule(
      () => {
        subscriber.next(1);
        subscriber.complete();
      },
      0,
      { signal: subscriber.signal }
    );
  });
  const source = cold('---1---2---3---4---5---|');
  const sharedSource = applyOperators(source, [
    share({ resetOnRefCountZero: () => deferredNotify }),
    take(3),
  ]);
  const result = concat(sharedSource, sharedSource);

  // A zero-delay rxTest task represents the original asap reset. concat
  // resubscribes synchronously first, cancelling that pending reset without
  // exposing scheduled/asapScheduler as compatibility capabilities.
  expectObservable(result, '^-----------------------').toBe(
    '---1---2---3---4---5---|'
  );
  expectSubscriptions(source.subscriptions).toBe('^----------------------!');
});
}
`;
}

function buildFromEventDispatchHarnessRewrite() {
  return `async function migrated(runtime) {
const { rxTest, applyOperators, fromEvent, mapTo } = runtime;
await rxTest(async ({ expectObservable, schedule }) => {
  const target = new EventTarget();
  const result = applyOperators(fromEvent(target, 'click'), [mapTo('ev')]);

  // Use the platform EventTarget contract required by the current fromEvent
  // boundary and reproduce the original two listener callbacks at frames 5
  // and 7. The finite observer horizon replaces the source's concat(NEVER).
  schedule(() => target.dispatchEvent(new Event('click')), 5);
  schedule(() => target.dispatchEvent(new Event('click')), 7);
  expectObservable(result, '^----------!').toBe('-----x-x---', { x: 'ev' });
});
}
`;
}

function buildFromEventPatternDispatchHarnessRewrite() {
  return `async function migrated(runtime) {
const { rxTest, fromEventPattern } = runtime;
await rxTest(async ({ expectObservable, schedule }) => {
  const addHandler = (handler) => {
    schedule(() => handler('ev'), 5);
    schedule(() => handler('ev'), 7);
  };
  const result = fromEventPattern(addHandler);

  // Reproduce the original handler API and virtual emission times directly.
  // The finite observation boundary retains the deliberately open result.
  expectObservable(result, '^----------!').toBe('-----x-x---', { x: 'ev' });
});
}
`;
}

function buildExpandScheduledSubscriptionHarnessRewrite() {
  return `async function migrated(runtime) {
const { rxTest, applyOperators, expect, expand, map, EMPTY } = runtime;
await rxTest(async ({ cold, hot, expectObservable, expectSubscriptions, flush, now, schedule }) => {
  const source = hot('--x----|', { x: 1 });
  const ordering = [];
  const scheduleSubscription = (input) =>
    new Observable((subscriber) => {
      schedule(
        () => {
          ordering.push(\`subscribe:\${now()}\`);
          Observable.from(input).subscribe(subscriber, {
            signal: subscriber.signal,
          });
        },
        0,
        { signal: subscriber.signal }
      );
    });
  const result = applyOperators(source, [
    expand(
      (value) => {
        ordering.push(\`project:\${now()}\`);
        return scheduleSubscription(
          value === 8
            ? EMPTY
            : applyOperators(cold('--c|', { c: 2 }), [
                map((innerValue) => innerValue * value),
              ])
        );
      },
      Infinity
    ),
  ]);

  // RxJS 7 deprecated the scheduler argument in favor of scheduling each
  // projected subscription. Model that replacement with rxTest.schedule.
  // Create each projected cold producer per recursion because platform-mode
  // fixtures otherwise join one shared run, unlike the RxJS 7 cold fixture.
  // This retains the original breadth-first timing plus source lifecycle.
  expectObservable(result).toBe('--a-b-c-d|', {
    a: 1,
    b: 2,
    c: 4,
    d: 8,
  });
  expectSubscriptions(source.subscriptions).toBe('^------!');
  await flush();
  expect(ordering).to.deep.equal([
    'project:2',
    'subscribe:2',
    'project:4',
    'subscribe:4',
    'project:6',
    'subscribe:6',
    'project:8',
    'subscribe:8',
  ]);
});
}
`;
}

function buildAjaxTimeoutHarnessRewrite() {
  return `async function migrated(runtime) {
const { rxTest, expect } = runtime;
await rxTest(async ({ flush, now, schedule }) => {
  let mostRecent;
  let nextCount = 0;
  let errorCount = 0;
  let lateResponseAttempts = 0;
  let responseAccepted = false;

  class TimeoutXMLHttpRequest {
    status = 0;
    method = '';
    async = true;
    timeout = 0;
    responseType = '';
    url = '';
    onload;
    ontimeout;
    settled = false;

    open(method, url, async) {
      this.method = method;
      this.url = url;
      this.async = async;
    }

    send() {
      setTimeout(() => {
        if (this.settled) {
          return;
        }
        this.settled = true;
        this.status = 0;
        this.ontimeout?.();
      }, this.timeout);
    }

    respondWith() {
      lateResponseAttempts++;
      if (this.settled) {
        return;
      }
      this.settled = true;
      responseAccepted = true;
      this.onload?.();
    }

    abort() {
      this.settled = true;
    }
  }

  const ajaxTimeoutFixture = (config) =>
    new Observable((subscriber) => {
      const xhr = new TimeoutXMLHttpRequest();
      mostRecent = xhr;
      xhr.open('GET', config.url, true);
      xhr.timeout = config.timeout;
      xhr.responseType = config.responseType;
      xhr.onload = () => {
        subscriber.next({ status: xhr.status, xhr });
        subscriber.complete();
      };
      xhr.ontimeout = () => subscriber.error({ status: 0, xhr });
      xhr.send();
      subscriber.addTeardown(() => xhr.abort());
    });

  const config = {
    url: '/flibbertyJibbet',
    responseType: 'text',
    timeout: 10,
  };
  ajaxTimeoutFixture(config).subscribe({
    next: () => {
      nextCount++;
    },
    error: (error) => {
      errorCount++;
      expect(now()).to.equal(10);
      expect(error.status).to.equal(0);
      expect(error.xhr).to.equal(mostRecent);
      expect(error.xhr.method).to.equal('GET');
      expect(error.xhr.async).to.equal(true);
      expect(error.xhr.timeout).to.equal(10);
      expect(error.xhr.responseType).to.equal('text');
    },
  });

  expect(mostRecent.url).to.equal('/flibbertyJibbet');
  schedule(() => mostRecent.respondWith(), 1000);
  await flush();

  // Preserve the XHR configuration and timeout error contract locally while
  // the compatibility ajax API is absent. The later response is attempted but
  // ignored because the frame-10 timeout has already terminated the request.
  expect(errorCount).to.equal(1);
  expect(nextCount).to.equal(0);
  expect(lateResponseAttempts).to.equal(1);
  expect(responseAccepted).to.equal(false);
});
}
`;
}

function buildSynchronousCatchErrorHarnessRewrite() {
  return `async function migrated(runtime) {
const { applyOperators, catchError, expect, map } = runtime;
const controller = new AbortController();
let sourceAttempts = 0;
let projectionAttempts = 0;
let handledErrors = 0;
const notifications = [];
const source = new Observable((subscriber) => {
  sourceAttempts++;
  subscriber.next(4);
  subscriber.complete();
});
const observable = applyOperators(source, [
  map((value) => {
    projectionAttempts++;
    throw 'four!';
  }),
  catchError((_error, caught) => {
    handledErrors++;
    if (handledErrors === 1000) {
      controller.abort();
    }
    return caught;
  }),
]);
observable.subscribe(
  {
    next: (value) => notifications.push({ kind: 'N', value }),
    error: (error) => notifications.push({ kind: 'E', error }),
    complete: () => notifications.push({ kind: 'C' }),
  },
  { signal: controller.signal }
);
expect(sourceAttempts).to.equal(1000);
expect(projectionAttempts).to.equal(1000);
expect(handledErrors).to.equal(1000);
expect(controller.signal.aborted).to.equal(true);
expect(notifications).to.deep.equal([]);
}
`;
}

function buildCancelledSkipUntilNotifierHarnessRewrite() {
  return `async function migrated(runtime) {
const { rxTest, applyOperators, expect, skipUntil } = runtime;
const notifierController = new AbortController();
let notifierSink = null;
let notifierCancellationCount = 0;
await rxTest(async ({ hot, expectObservable, expectSubscriptions }) => {
  const e1 = hot('  --a--b--c--d--e--|');
  const e1subs = [
    '               ^----------------!',
    '               ^----------------!',
  ];
  // The legacy Subject fixture exposed unsubscribe() on the producer itself.
  // Model that cancellation at the platform AbortSignal boundary: detaching
  // the producer sink sends no next, error, or complete notification, so the
  // skipUntil gate must remain closed until the source completes.
  const skip = new Observable((subscriber) => {
    notifierSink = subscriber;
    const cancelNotifier = () => {
      notifierCancellationCount++;
      notifierSink = null;
    };
    notifierController.signal.addEventListener('abort', cancelNotifier, { once: true });
    subscriber.addTeardown(() => {
      notifierController.signal.removeEventListener('abort', cancelNotifier);
      notifierSink = null;
    });
  });
  const expected = '-----------------|';

  e1.subscribe((value) => {
    if (value === 'd' && !notifierController.signal.aborted) {
      notifierSink?.next('x');
    }
    notifierController.abort();
  });

  expectObservable(applyOperators(e1, [skipUntil(skip)])).toBe(expected);
  expectSubscriptions(e1.subscriptions).toBe(e1subs);
});
expect(notifierController.signal.aborted).to.equal(true);
expect(notifierCancellationCount).to.equal(1);
expect(notifierSink).to.equal(null);
}
`;
}

function buildLateGroupTerminalHarnessRewrite(kind) {
  const terminal = kind === 'complete' ? '|' : '#';
  const terminalObserver =
    kind === 'complete'
      ? `complete: () => lateEvents.push({
              frame: now(),
              notification: { kind: 'C' },
            }),`
      : `error: (error) => lateEvents.push({
              frame: now(),
              notification: { kind: 'E', error },
            }),`;
  const outerObserver = kind === 'complete' ? '' : 'error: () => {},';
  const expectedNotification =
    kind === 'complete' ? `{ kind: 'C' }` : `{ kind: 'E', error: 'error' }`;
  return `async function migrated(runtime) {
const { rxTest, applyOperators, expect, groupBy } = runtime;
await rxTest(async ({ expectSubscriptions, flush, hot, now, schedule }) => {
  const values = {
    a: '  foo',
    b: ' FoO ',
    d: 'foO ',
    i: 'FOO ',
    l: '    fOo    ',
  };
  const source = hot('--a-b---d---------i-----l-${terminal}', values);
  const lateEvents = [];

  applyOperators(source, [groupBy((value) => value.toLowerCase().trim())]).subscribe({
    next: (group) => {
      // The group opens at frame 2. Preserve the original relative delay of
      // 26 frames, then subscribe after the source has already terminated.
      schedule(() => {
        group.subscribe({
          ${terminalObserver}
        });
      }, 26);
    },
    ${outerObserver}
  });

  expectSubscriptions(source.subscriptions).toBe('^-------------------------!');
  await flush();
  expect(lateEvents).to.deep.equal([
    {
      frame: 28,
      notification: ${expectedNotification},
    },
  ]);
});
}
`;
}

function buildLateGroupAfterOuterCancellationHarnessRewrite() {
  return `async function migrated(runtime) {
const { rxTest, applyOperators, expect, groupBy } = runtime;
await rxTest(async ({ expectSubscriptions, flush, hot, now, schedule }) => {
  const values = {
    a: '  foo',
    b: ' FoO ',
    d: 'foO ',
    i: 'FOO ',
    l: '    fOo    ',
  };
  const source = hot('--a-b---d---------i-----l-#', values);
  const outerController = new AbortController();
  const innerController = new AbortController();
  const outerEvents = [];
  const innerEvents = [];
  let innerSnapshot;

  applyOperators(source, [groupBy((value) => value.toLowerCase().trim())]).subscribe(
    {
      next: (group) => {
        outerEvents.push({
          frame: now(),
          notification: { kind: 'N', value: group.key },
        });
        // The group opens at frame 2. The original scheduler delay is 12
        // frames, so this observation begins at frame 14, after outer
        // cancellation has released the source at frame 12.
        schedule(() => {
          group.subscribe(
            {
              next: (value) => innerEvents.push({
                frame: now(),
                notification: { kind: 'N', value },
              }),
              error: (error) => innerEvents.push({
                frame: now(),
                notification: { kind: 'E', error },
              }),
              complete: () => innerEvents.push({
                frame: now(),
                notification: { kind: 'C' },
              }),
            },
            { signal: innerController.signal }
          );
        }, 12);
      },
      error: (error) => outerEvents.push({
        frame: now(),
        notification: { kind: 'E', error },
      }),
      complete: () => outerEvents.push({
        frame: now(),
        notification: { kind: 'C' },
      }),
    },
    { signal: outerController.signal }
  );

  schedule(() => outerController.abort(), 12);
  schedule(() => {
    innerSnapshot = [...innerEvents];
    innerController.abort();
  }, 27);

  expectSubscriptions(source.subscriptions).toBe('^-----------!');
  await flush();
  expect(outerEvents).to.deep.equal([
    {
      frame: 2,
      notification: { kind: 'N', value: 'foo' },
    },
  ]);
  expect(innerSnapshot).to.deep.equal([]);
  expect(innerEvents).to.deep.equal([]);
});
}
`;
}

function buildVeryLateGroupsAfterOuterCancellationHarnessRewrite() {
  return `async function migrated(runtime) {
const { rxTest, applyOperators, expect, groupBy, Subject } = runtime;
await rxTest(async ({ flush, hot, now, schedule }) => {
  const source = hot('-----^----a----b-----a------b----a----b---#');
  const outerController = new AbortController();
  const subjectControllers = {
    a: new AbortController(),
    b: new AbortController(),
  };
  const groupControllers = [];
  const subjects = {
    a: new Subject(),
    b: new Subject(),
  };
  const groupKeys = [];
  const subjectEvents = {
    a: [],
    b: [],
  };
  let snapshot;

  for (const key of ['a', 'b']) {
    subjects[key].subscribe(
      {
        next: (value) => subjectEvents[key].push({
          frame: now(),
          notification: { kind: 'N', value },
        }),
        error: (error) => subjectEvents[key].push({
          frame: now(),
          notification: { kind: 'E', error },
        }),
        complete: () => subjectEvents[key].push({
          frame: now(),
          notification: { kind: 'C' },
        }),
      },
      { signal: subjectControllers[key].signal }
    );
  }

  applyOperators(source, [groupBy((value) => value)]).subscribe(
    {
      next: (group) => {
        groupKeys.push(group.key);
        // Preserve the original 1,000-frame relative delay. Both group
        // observations start long after outer cancellation at frame 19.
        schedule(() => {
          const controller = new AbortController();
          groupControllers.push(controller);
          group.subscribe(subjects[group.key], { signal: controller.signal });
        }, 1000);
      },
    },
    { signal: outerController.signal }
  );

  schedule(() => outerController.abort(), 19);
  schedule(() => {
    snapshot = {
      a: [...subjectEvents.a],
      b: [...subjectEvents.b],
    };
    for (const controller of groupControllers) {
      controller.abort();
    }
    subjectControllers.a.abort();
    subjectControllers.b.abort();
  }, 1020);

  await flush();
  expect(groupKeys).to.deep.equal(['a', 'b']);
  expect(snapshot).to.deep.equal({ a: [], b: [] });
  expect(subjectEvents).to.deep.equal({ a: [], b: [] });
});
}
`;
}

function buildPhonyMarbelizeGroupHarnessRewrite(config) {
  const normalized = {
    durationSkip: null,
    element: null,
    legacy: false,
    outerAbortFrame: null,
    sourceMarbles: '--a-b-c-d-e-f-g-h-i-j-k-l-|',
    sourceSubscription: '^-------------------------!',
    values: {
      a: '  foo',
      b: ' FoO ',
      c: 'baR  ',
      d: 'foO ',
      e: ' Baz   ',
      f: '  qux ',
      g: '   bar',
      h: ' BAR  ',
      i: 'FOO ',
      j: 'baz  ',
      k: ' bAZ ',
      l: '    fOo    ',
    },
    ...config,
  };
  return `async function migrated(runtime) {
const { rxTest, applyOperators, expect, groupBy, skip } = runtime;
const config = ${JSON.stringify(normalized)};
await rxTest(async ({ expectSubscriptions, flush, hot, now, schedule }) => {
  const source = hot(config.sourceMarbles, config.values);
  const outerController = new AbortController();
  const groupControllers = [];
  const occurrences = new Map();
  const actualOuter = [];
  const actualGroups = [];
  const keySelector = (value) => value.toLowerCase().trim();
  const element = config.element === 'reverse'
    ? (value) => value.split('').reverse().join('')
    : (value) => value;
  const outputTokens = new Map(
    Object.entries(config.values).map(([token, value]) => [element(value), token])
  );
  const duration = config.durationSkip === null
    ? undefined
    : (group) => applyOperators(group, [skip(config.durationSkip)]);
  const descriptor = config.legacy
    ? config.durationSkip === null
      ? groupBy(keySelector, element)
      : groupBy(keySelector, element, duration)
    : config.durationSkip === null
      ? groupBy(keySelector)
      : groupBy(keySelector, { duration });

  applyOperators(source, [descriptor]).subscribe(
    {
      next: (group) => {
        const occurrence = occurrences.get(group.key) ?? 0;
        occurrences.set(group.key, occurrence + 1);
        actualOuter.push([now(), 'N', group.key]);
        const expectedGroup = config.groups.find(
          (candidate) => candidate.key === group.key && candidate.occurrence === occurrence
        );
        if (!expectedGroup) {
          throw new Error(\`Unexpected group \${group.key} occurrence \${occurrence}\`);
        }
        const actualGroup = {
          key: group.key,
          occurrence,
          subscribeFrame: expectedGroup.subscribeFrame,
          ...(expectedGroup.abortFrame === undefined ? {} : { abortFrame: expectedGroup.abortFrame }),
          events: [],
        };
        actualGroups.push(actualGroup);
        const subscribe = () => {
          const controller = new AbortController();
          groupControllers.push(controller);
          group.subscribe(
            {
              next: (value) => actualGroup.events.push([now(), 'N', outputTokens.get(value)]),
              error: () => actualGroup.events.push([now(), 'E']),
              complete: () => actualGroup.events.push([now(), 'C']),
            },
            { signal: controller.signal }
          );
          if (expectedGroup.abortFrame !== undefined) {
            schedule(() => controller.abort(), expectedGroup.abortFrame - now());
          }
        };
        const delay = expectedGroup.subscribeFrame - now();
        if (delay === 0) {
          subscribe();
        } else {
          schedule(subscribe, delay);
        }
      },
      error: () => actualOuter.push([now(), 'E']),
      complete: () => actualOuter.push([now(), 'C']),
    },
    { signal: outerController.signal }
  );

  if (config.outerAbortFrame !== null) {
    schedule(() => outerController.abort(), config.outerAbortFrame);
  }

  expectSubscriptions(source.subscriptions).toBe(config.sourceSubscription);
  await flush();
  expect(actualOuter).to.deep.equal(config.outer);
  expect(actualGroups).to.deep.equal(config.groups);
});
}
`;
}

function buildNeverWindowHarnessRewrite() {
  return `async function migrated(runtime) {
const { rxTest, applyOperators, expect, window } = runtime;
await rxTest(async ({ cold, expectSubscriptions, flush, now, schedule }) => {
  const source = cold('------');
  const closings = cold('------');
  const outerController = new AbortController();
  const innerControllers = [];
  const actual = [];
  const result = applyOperators(source, [window(closings)]);

  result.subscribe(
    {
      next: (inner) => {
        const outerFrame = now();
        const messages = [];
        const innerController = new AbortController();
        innerControllers.push(innerController);
        actual.push({
          frame: outerFrame,
          notification: { kind: 'N', value: messages },
        });
        inner.subscribe(
          {
            next: (value) => messages.push({
              frame: now() - outerFrame,
              notification: { kind: 'N', value },
            }),
            error: (error) => messages.push({
              frame: now() - outerFrame,
              notification: { kind: 'E', error },
            }),
            complete: () => messages.push({
              frame: now() - outerFrame,
              notification: { kind: 'C' },
            }),
          },
          { signal: innerController.signal }
        );
      },
      error: (error) => actual.push({
        frame: now(),
        notification: { kind: 'E', error },
      }),
      complete: () => actual.push({
        frame: now(),
        notification: { kind: 'C' },
      }),
    },
    { signal: outerController.signal }
  );

  schedule(() => {
    // The pinned diagrams assert silence through frame 5. End the harness-only
    // observations at frame 6 without adding a terminal notification.
    for (const innerController of innerControllers) {
      innerController.abort();
    }
    outerController.abort();
  }, 6);

  expectSubscriptions(source.subscriptions).toBe('^-----!');
  expectSubscriptions(closings.subscriptions).toBe('^-----!');
  await flush();
  expect(actual).to.deep.equal([
    {
      frame: 0,
      notification: { kind: 'N', value: [] },
    },
  ]);
});
}
`;
}

function buildReplaySubjectWindowHarnessRewrite(line) {
  const configurations = {
    247: {
      size: 'Infinity',
      feeds: [
        [1, '1'],
        [3, '2'],
        [5, '3'],
        [10, '4'],
        [17, '5'],
        [19, '6'],
        [24, '7'],
        [26, '8'],
        [31, '9'],
      ],
      completeFrame: 34,
      observers: [
        { frame: 6, abortFrame: 21 },
        { frame: 12, abortFrame: 25 },
        { frame: 27 },
      ],
      boundary: 35,
      expected: [
        [
          [6, 'N', '2'],
          [6, 'N', '3'],
          [10, 'N', '4'],
          [17, 'N', '5'],
          [19, 'N', '6'],
        ],
        [
          [12, 'N', '4'],
          [17, 'N', '5'],
          [19, 'N', '6'],
          [24, 'N', '7'],
        ],
        [
          [27, 'N', '7'],
          [27, 'N', '8'],
          [31, 'N', '9'],
          [34, 'C'],
        ],
      ],
    },
    279: {
      size: 'Infinity',
      feeds: [
        [1, '1'],
        [3, '2'],
        [5, '3'],
        [10, '4'],
      ],
      completeFrame: 11,
      observers: [{ frame: 13 }],
      boundary: 14,
      expected: [
        [
          [13, 'N', '4'],
          [13, 'C'],
        ],
      ],
    },
    303: {
      size: '2',
      feeds: [
        [0, '1'],
        [1, '2'],
        [2, '3'],
        [3, '4'],
      ],
      completeFrame: 11,
      observers: [{ frame: 4 }],
      boundary: 12,
      expected: [
        [
          [4, 'N', '3'],
          [4, 'N', '4'],
          [11, 'C'],
        ],
      ],
    },
  };
  const configuration = configurations[line];
  if (!configuration) {
    throw new Error(`Unknown ReplaySubject window rewrite line: ${line}`);
  }
  const observerSchedules = configuration.observers
    .map(
      (observer, index) => `schedule(() => {
    replaySubject.subscribe(
      {
        next: (value) => results[${index}].push([now(), 'N', value]),
        error: (error) => results[${index}].push([now(), 'E', error]),
        complete: () => results[${index}].push([now(), 'C']),
      },
      { signal: controllers[${index}].signal }
    );
  }, ${observer.frame});${
    observer.abortFrame === undefined
      ? ''
      : `
  schedule(() => controllers[${index}].abort(), ${observer.abortFrame});`
  }`
    )
    .join('\n  ');

  return `async function migrated(runtime) {
const { rxTest, ReplaySubject, __rxTestScheduler, expect } = runtime;
await rxTest(async ({ flush, now, schedule }) => {
  const replaySubject = new ReplaySubject(${configuration.size}, 4, __rxTestScheduler);
  const controllers = Array.from({ length: ${configuration.observers.length} }, () => new AbortController());
  const results = Array.from({ length: ${configuration.observers.length} }, () => []);

  for (const [frame, value] of ${JSON.stringify(configuration.feeds)}) {
    schedule(() => replaySubject.next(value), frame);
  }
  schedule(() => replaySubject.complete(), ${configuration.completeFrame});
  ${observerSchedules}
  schedule(() => {
    for (const controller of controllers) {
      controller.abort();
    }
  }, ${configuration.boundary});

  await flush();
  expect(results).to.deep.equal(${JSON.stringify(configuration.expected, null, 2)});
});
}
`;
}

function buildDelayTimerCleanupHarnessRewrite() {
  return `async function migrated(runtime) {
const { rxTest, applyOperators, delay, expect } = runtime;
await rxTest(async ({ flush, now, schedule }) => {
  const sourceSignals = [];
  const cancelledEvents = [];
  const completedEvents = [];
  const source = new Observable((subscriber) => {
    sourceSignals.push(subscriber.signal);
    subscriber.next('a');
    subscriber.complete();
  });

  const cancellation = new AbortController();
  applyOperators(source, [delay(2)]).subscribe(
    {
      next: (value) => cancelledEvents.push([now(), 'N', value]),
      complete: () => cancelledEvents.push([now(), 'C']),
    },
    { signal: cancellation.signal }
  );
  schedule(() => cancellation.abort(), 1);

  applyOperators(source, [delay(2)]).subscribe({
    next: (value) => completedEvents.push([now(), 'N', value]),
    complete: () => completedEvents.push([now(), 'C']),
  });

  await flush();
  expect(cancelledEvents).to.deep.equal([]);
  expect(completedEvents).to.deep.equal([
    [2, 'N', 'a'],
    [2, 'C'],
  ]);
  expect(cancellation.signal.aborted).to.equal(true);
  expect(sourceSignals.every((signal) => signal.aborted)).to.equal(true);
});
}
`;
}

function buildWindowTimeHorizonHarnessRewrite(line) {
  const next = (frame, value) => ({ frame, notification: { kind: 'N', value } });
  const complete = (frame) => ({ frame, notification: { kind: 'C' } });
  const configurations = {
    160: {
      runtimeNames: 'windowTime',
      helpers: 'expectSubscriptions, flush, hot, now, schedule',
      horizon: 10,
      setup: `const source = hot('^----------');
  const result = applyOperators(source, [windowTime(3, 3)]);`,
      expected: [
        next(0, [complete(3)]),
        next(3, [complete(3)]),
        next(6, [complete(3)]),
        next(9, []),
      ],
      subscriptions: `expectSubscriptions(source.subscriptions).toBe('^---------!');`,
    },
    224: {
      runtimeNames: 'windowTime',
      helpers: 'expectSubscriptions, flush, hot, now, schedule',
      horizon: 11,
      setup: `const source = hot('^--a--b--c--d--e--f--g--h--|');
  const result = applyOperators(source, [windowTime(5, 10)]);`,
      expected: [
        next(0, [next(3, 'a'), complete(5)]),
        next(10, []),
      ],
      subscriptions: `expectSubscriptions(source.subscriptions).toBe('^----------!');`,
    },
    247: {
      runtimeNames: 'mergeMap, of, windowTime',
      helpers: 'expectSubscriptions, flush, hot, now, schedule',
      horizon: 14,
      setup: `const source = hot('^--a--b--c--d--e--f--g--h--|');
  const result = applyOperators(source, [
    mergeMap((value) => of(value)),
    windowTime(5, 10),
    mergeMap((value) => of(value)),
  ]);`,
      expected: [
        next(0, [next(3, 'a'), complete(5)]),
        next(10, [next(2, 'd')]),
      ],
      subscriptions: `expectSubscriptions(source.subscriptions).toBe('^-------------!');`,
    },
    274: {
      runtimeNames: 'windowTime',
      helpers: 'cold, flush, now, schedule',
      horizon: 42,
      setup: `const source = cold('----a---b---c---d---e---f---g---h---i---j---');
  const result = applyOperators(source, [windowTime(12, 8, 4)]);`,
      expected: [
        next(0, [next(4, 'a'), next(8, 'b'), complete(12)]),
        next(8, [next(0, 'b'), next(4, 'c'), next(8, 'd'), next(12, 'e'), complete(12)]),
        next(16, [next(4, 'e'), next(8, 'f'), next(12, 'g'), complete(12)]),
        next(24, [next(4, 'g'), next(8, 'h'), next(12, 'i'), complete(12)]),
        next(32, [next(4, 'i'), next(8, 'j')]),
        next(40, []),
      ],
      subscriptions: '',
    },
  };
  const configuration = configurations[line];
  if (!configuration) {
    throw new Error(`Unknown windowTime horizon rewrite line: ${line}`);
  }

  return `async function migrated(runtime) {
const { rxTest, applyOperators, expect, ${configuration.runtimeNames} } = runtime;
await rxTest(async ({ ${configuration.helpers} }) => {
  ${configuration.setup}
  const outerController = new AbortController();
  const innerControllers = [];
  const actual = [];

  schedule(() => {
    for (const innerController of innerControllers) {
      innerController.abort();
    }
    outerController.abort();
  }, ${configuration.horizon});

  result.subscribe(
    {
      next: (inner) => {
        const outerFrame = now();
        const messages = [];
        const innerController = new AbortController();
        innerControllers.push(innerController);
        actual.push({
          frame: outerFrame,
          notification: { kind: 'N', value: messages },
        });
        inner.subscribe(
          {
            next: (value) => messages.push({
              frame: now() - outerFrame,
              notification: { kind: 'N', value },
            }),
            error: (error) => messages.push({
              frame: now() - outerFrame,
              notification: { kind: 'E', error },
            }),
            complete: () => {
              messages.push({
                frame: now() - outerFrame,
                notification: { kind: 'C' },
              });
              innerController.abort();
            },
          },
          { signal: innerController.signal }
        );
      },
      error: (error) => actual.push({
        frame: now(),
        notification: { kind: 'E', error },
      }),
      complete: () => actual.push({
        frame: now(),
        notification: { kind: 'C' },
      }),
    },
    { signal: outerController.signal }
  );

  await flush();
  expect(actual).to.deep.equal(${JSON.stringify(configuration.expected, null, 2)});
  ${configuration.subscriptions}
});
}
`;
}

function buildTimedNeverWindowHarnessRewrite() {
  return `async function migrated(runtime) {
const { rxTest, applyOperators, expect, window } = runtime;
await rxTest(async ({ cold, expectSubscriptions, flush, hot, now, schedule }) => {
  const source = hot('^--------');
  const closings = cold('--x--x--|');
  const outerController = new AbortController();
  const innerControllers = [];
  const actual = [];
  const result = applyOperators(source, [window(closings)]);

  result.subscribe(
    {
      next: (inner) => {
        const outerFrame = now();
        const messages = [];
        const innerController = new AbortController();
        innerControllers.push(innerController);
        actual.push({
          frame: outerFrame,
          notification: { kind: 'N', value: messages },
        });
        inner.subscribe(
          {
            next: (value) => messages.push({
              frame: now() - outerFrame,
              notification: { kind: 'N', value },
            }),
            error: (error) => messages.push({
              frame: now() - outerFrame,
              notification: { kind: 'E', error },
            }),
            complete: () => messages.push({
              frame: now() - outerFrame,
              notification: { kind: 'C' },
            }),
          },
          { signal: innerController.signal }
        );
      },
      error: (error) => actual.push({
        frame: now(),
        notification: { kind: 'E', error },
      }),
      complete: () => actual.push({
        frame: now(),
        notification: { kind: 'C' },
      }),
    },
    { signal: outerController.signal }
  );

  schedule(() => {
    // Preserve the original open outer result and final open window through
    // frame 8, then release both observations at the finite evidence horizon.
    for (const innerController of innerControllers) {
      innerController.abort();
    }
    outerController.abort();
  }, 9);

  expectSubscriptions(source.subscriptions).toBe('^--------!');
  expectSubscriptions(closings.subscriptions).toBe('^-------!');
  await flush();
  expect(actual).to.deep.equal([
    {
      frame: 0,
      notification: {
        kind: 'N',
        value: [
          { frame: 2, notification: { kind: 'C' } },
        ],
      },
    },
    {
      frame: 2,
      notification: {
        kind: 'N',
        value: [
          { frame: 3, notification: { kind: 'C' } },
        ],
      },
    },
    {
      frame: 5,
      notification: { kind: 'N', value: [] },
    },
  ]);
});
}
`;
}

function buildCancelledWindowHarnessRewrite(withUnsubscriptionChain) {
  const runtimeImports = withUnsubscriptionChain
    ? 'rxTest, applyOperators, expect, mergeMap, of, window'
    : 'rxTest, applyOperators, expect, window';
  const operators = withUnsubscriptionChain
    ? '[mergeMap((value) => of(value)), window(closings), mergeMap((inner) => of(inner))]'
    : '[window(closings)]';
  return `async function migrated(runtime) {
const { ${runtimeImports} } = runtime;
await rxTest(async ({ expectSubscriptions, flush, hot, now, schedule }) => {
  const outerController = new AbortController();
  const innerControllers = [];
  const actual = [];
  schedule(() => {
    // Bound materialized inner windows before applying the pinned outer
    // unsubscription, so cancellation is not misreported as completion.
    for (const innerController of innerControllers) {
      innerController.abort();
    }
    outerController.abort();
  }, 8);

  const source = hot('-1-2-^3-4-5-6-7-8-9-|');
  const closings = hot('---^---x---x---x---x---x---|');
  const result = applyOperators(source, ${operators});

  // Match expectObservable's frame-zero observation: pre-subscription hot
  // values are dispatched before the result is observed.
  schedule(() => result.subscribe(
    {
      next: (inner) => {
        const outerFrame = now();
        const messages = [];
        const innerController = new AbortController();
        innerControllers.push(innerController);
        actual.push({
          frame: outerFrame,
          notification: { kind: 'N', value: messages },
        });
        inner.subscribe(
          {
            next: (value) => messages.push({
              frame: now() - outerFrame,
              notification: { kind: 'N', value },
            }),
            error: (error) => messages.push({
              frame: now() - outerFrame,
              notification: { kind: 'E', error },
            }),
            complete: () => messages.push({
              frame: now() - outerFrame,
              notification: { kind: 'C' },
            }),
          },
          { signal: innerController.signal }
        );
      },
      error: (error) => actual.push({
        frame: now(),
        notification: { kind: 'E', error },
      }),
      complete: () => actual.push({
        frame: now(),
        notification: { kind: 'C' },
      }),
    },
    { signal: outerController.signal }
  ), 0);

  expectSubscriptions(source.subscriptions).toBe('^-------!');
  expectSubscriptions(closings.subscriptions).toBe('^-------!');
  await flush();
  expect(actual).to.deep.equal([
    {
      frame: 0,
      notification: {
        kind: 'N',
        value: [
          { frame: 1, notification: { kind: 'N', value: '3' } },
          { frame: 3, notification: { kind: 'N', value: '4' } },
          { frame: 4, notification: { kind: 'C' } },
        ],
      },
    },
    {
      frame: 4,
      notification: {
        kind: 'N',
        value: [
          { frame: 1, notification: { kind: 'N', value: '5' } },
          { frame: 3, notification: { kind: 'N', value: '6' } },
        ],
      },
    },
  ]);
});
}
`;
}

function buildCancelledWindowToggleHarnessRewrite(withUnsubscriptionChain) {
  const runtimeImports = withUnsubscriptionChain
    ? 'rxTest, applyOperators, expect, mergeMap, of, windowToggle'
    : 'rxTest, applyOperators, expect, windowToggle';
  const operators = withUnsubscriptionChain
    ? '[mergeMap((value) => of(value)), windowToggle(openings, () => close[closingIndex++]), mergeMap((inner) => of(inner))]'
    : '[windowToggle(openings, () => close[closingIndex++])]';
  const horizon = withUnsubscriptionChain ? 15 : 17;
  const firstClosing = withUnsubscriptionChain ? '---------------s--|' : '-------------s---|';
  const secondClosing = withUnsubscriptionChain ? '----(s|)' : '-----(s|)';
  const sourceSubscription = withUnsubscriptionChain ? '^--------------!' : '^----------------!';
  const secondClosingSubscription = withUnsubscriptionChain ? '--------------^!' : '--------------^--!';
  const expected = withUnsubscriptionChain
    ? `[
    {
      frame: 2,
      notification: {
        kind: 'N',
        value: [
          { frame: 2, notification: { kind: 'N', value: 'b' } },
          { frame: 6, notification: { kind: 'N', value: 'c' } },
          { frame: 10, notification: { kind: 'N', value: 'd' } },
        ],
      },
    },
    {
      frame: 14,
      notification: { kind: 'N', value: [] },
    },
  ]`
    : `[
    {
      frame: 2,
      notification: {
        kind: 'N',
        value: [
          { frame: 2, notification: { kind: 'N', value: 'b' } },
          { frame: 6, notification: { kind: 'N', value: 'c' } },
          { frame: 10, notification: { kind: 'N', value: 'd' } },
          { frame: 13, notification: { kind: 'C' } },
        ],
      },
    },
    {
      frame: 14,
      notification: {
        kind: 'N',
        value: [
          { frame: 2, notification: { kind: 'N', value: 'e' } },
        ],
      },
    },
  ]`;
  return `async function migrated(runtime) {
const { ${runtimeImports} } = runtime;
await rxTest(async ({ cold, expectSubscriptions, flush, hot, now, schedule }) => {
  const outerController = new AbortController();
  const innerControllers = [];
  const actual = [];
  schedule(() => {
    // Materialized windows are independent observations. End them before the
    // pinned outer cancellation so teardown is not reinterpreted as a window
    // completion notification.
    for (const innerController of innerControllers) {
      innerController.abort();
    }
    outerController.abort();
  }, ${horizon});

  const openings = cold('--x-----------y--------z---|');
  const close = [
    cold('${firstClosing}'),
    cold('${secondClosing}'),
    cold('---------------(s|)'),
  ];
  const source = hot('--a--^---b---c---d---e---f---g---h------|');
  let closingIndex = 0;
  const result = applyOperators(source, ${operators});

  // Match expectObservable's frame-zero priority after pre-subscription hot
  // values and before the first post-zero source event.
  schedule(() => result.subscribe(
    {
      next: (inner) => {
        const outerFrame = now();
        const messages = [];
        const innerController = new AbortController();
        innerControllers.push(innerController);
        actual.push({
          frame: outerFrame,
          notification: { kind: 'N', value: messages },
        });
        inner.subscribe(
          {
            next: (value) => messages.push({
              frame: now() - outerFrame,
              notification: { kind: 'N', value },
            }),
            error: (error) => messages.push({
              frame: now() - outerFrame,
              notification: { kind: 'E', error },
            }),
            complete: () => messages.push({
              frame: now() - outerFrame,
              notification: { kind: 'C' },
            }),
          },
          { signal: innerController.signal }
        );
      },
      error: (error) => actual.push({
        frame: now(),
        notification: { kind: 'E', error },
      }),
      complete: () => actual.push({
        frame: now(),
        notification: { kind: 'C' },
      }),
    },
    { signal: outerController.signal }
  ), 0);

  expectSubscriptions(source.subscriptions).toBe('${sourceSubscription}');
  expectSubscriptions(openings.subscriptions).toBe('${sourceSubscription}');
  expectSubscriptions(close[0].subscriptions).toBe('--^------------!');
  expectSubscriptions(close[1].subscriptions).toBe('${secondClosingSubscription}');
  expectSubscriptions(close[2].subscriptions).toBe([]);
  await flush();
  expect(actual).to.deep.equal(${expected});
});
}
`;
}

function buildReleasedWindowToggleHarnessRewrite() {
  return `async function migrated(runtime) {
const { rxTest, applyOperators, expect, windowToggle } = runtime;
await rxTest(async ({ cold, expectSubscriptions, flush, hot, now, schedule }) => {
  const outerController = new AbortController();
  const earlyWindowController = new AbortController();
  const lateWindowController = new AbortController();
  const outerEvents = [];
  const earlyWindowEvents = [];
  const lateWindowEvents = [];
  let releasedWindow;
  let lateObservationError;
  let lateSnapshot;

  // Register cancellation before fixture work at the same timestamp. This
  // preserves the original expectObservable unsubscription priority.
  schedule(() => outerController.abort(), 9);

  const openings = cold('o-------------------------|');
  const closing = cold('-');
  const source = hot('--a--b--c--d--e--f--g--h--|');
  const result = applyOperators(source, [windowToggle(openings, () => closing)]);

  schedule(() => result.subscribe(
    {
      next: (inner) => {
        releasedWindow = inner;
        outerEvents.push({
          frame: now(),
          notification: { kind: 'N' },
        });
        inner.subscribe(
          {
            next: (value) => earlyWindowEvents.push({
              frame: now(),
              notification: { kind: 'N', value },
            }),
            error: (error) => earlyWindowEvents.push({
              frame: now(),
              notification: { kind: 'E', error },
            }),
            complete: () => earlyWindowEvents.push({
              frame: now(),
              notification: { kind: 'C' },
            }),
          },
          { signal: earlyWindowController.signal }
        );
      },
      error: (error) => outerEvents.push({
        frame: now(),
        notification: { kind: 'E', error },
      }),
      complete: () => outerEvents.push({
        frame: now(),
        notification: { kind: 'C' },
      }),
    },
    { signal: outerController.signal }
  ), 0);

  schedule(() => {
    try {
      releasedWindow.subscribe(
        {
          next: (value) => lateWindowEvents.push({
            frame: now(),
            notification: { kind: 'N', value },
          }),
          error: (error) => lateWindowEvents.push({
            frame: now(),
            notification: { kind: 'E', error },
          }),
          complete: () => lateWindowEvents.push({
            frame: now(),
            notification: { kind: 'C' },
          }),
        },
        { signal: lateWindowController.signal }
      );
    } catch (error) {
      lateObservationError = error;
    }
  }, 15);
  schedule(() => {
    lateSnapshot = [...lateWindowEvents];
    earlyWindowController.abort();
    lateWindowController.abort();
  }, 16);

  expectSubscriptions(source.subscriptions).toBe('^--------!');
  expectSubscriptions(openings.subscriptions).toBe('^--------!');
  expectSubscriptions(closing.subscriptions).toBe('^--------!');
  await flush();
  expect(outerEvents).to.deep.equal([
    {
      frame: 0,
      notification: { kind: 'N' },
    },
  ]);
  expect(earlyWindowEvents).to.deep.equal([
    { frame: 2, notification: { kind: 'N', value: 'a' } },
    { frame: 5, notification: { kind: 'N', value: 'b' } },
    { frame: 8, notification: { kind: 'N', value: 'c' } },
  ]);
  expect(lateObservationError).to.equal(undefined);
  expect(lateSnapshot).to.deep.equal([]);
  expect(lateWindowEvents).to.deep.equal([]);
});
}
`;
}

function buildCancelledWindowWhenHarnessRewrite(withUnsubscriptionChain) {
  const runtimeImports = withUnsubscriptionChain
    ? 'rxTest, applyOperators, expect, mergeMap, of, windowWhen'
    : 'rxTest, applyOperators, expect, windowWhen';
  const operators = withUnsubscriptionChain
    ? '[mergeMap((value) => of(value)), windowWhen(() => closings[closingIndex++]), mergeMap((inner) => of(inner))]'
    : '[windowWhen(() => closings[closingIndex++])]';
  return `async function migrated(runtime) {
const { ${runtimeImports} } = runtime;
await rxTest(async ({ cold, expectSubscriptions, flush, hot, now, schedule }) => {
  const outerController = new AbortController();
  const innerControllers = [];
  const actual = [];
  schedule(() => {
    // Each emitted window is observed independently. End those observations
    // immediately before the pinned outer cancellation so teardown remains
    // silent instead of becoming a completion notification.
    for (const innerController of innerControllers) {
      innerController.abort();
    }
    outerController.abort();
  }, 21);

  const closings = [
    cold('-----------------s--|'),
    cold('---------(s|)'),
  ];
  const source = hot('--a--^---b---c---d---e---f---g---h------|');
  let closingIndex = 0;
  const result = applyOperators(source, ${operators});

  schedule(() => result.subscribe(
    {
      next: (inner) => {
        const outerFrame = now();
        const messages = [];
        const innerController = new AbortController();
        innerControllers.push(innerController);
        actual.push({
          frame: outerFrame,
          notification: { kind: 'N', value: messages },
        });
        inner.subscribe(
          {
            next: (value) => messages.push({
              frame: now() - outerFrame,
              notification: { kind: 'N', value },
            }),
            error: (error) => messages.push({
              frame: now() - outerFrame,
              notification: { kind: 'E', error },
            }),
            complete: () => messages.push({
              frame: now() - outerFrame,
              notification: { kind: 'C' },
            }),
          },
          { signal: innerController.signal }
        );
      },
      error: (error) => actual.push({
        frame: now(),
        notification: { kind: 'E', error },
      }),
      complete: () => actual.push({
        frame: now(),
        notification: { kind: 'C' },
      }),
    },
    { signal: outerController.signal }
  ), 0);

  expectSubscriptions(source.subscriptions).toBe('^--------------------!');
  expectSubscriptions(closings[0].subscriptions).toBe('^----------------!');
  expectSubscriptions(closings[1].subscriptions).toBe('-----------------^---!');
  await flush();
  expect(actual).to.deep.equal([
    {
      frame: 0,
      notification: {
        kind: 'N',
        value: [
          { frame: 4, notification: { kind: 'N', value: 'b' } },
          { frame: 8, notification: { kind: 'N', value: 'c' } },
          { frame: 12, notification: { kind: 'N', value: 'd' } },
          { frame: 16, notification: { kind: 'N', value: 'e' } },
          { frame: 17, notification: { kind: 'C' } },
        ],
      },
    },
    {
      frame: 17,
      notification: {
        kind: 'N',
        value: [
          { frame: 3, notification: { kind: 'N', value: 'f' } },
        ],
      },
    },
  ]);
});
}
`;
}

function buildNeverSourceWindowWhenHarnessRewrite() {
  return `async function migrated(runtime) {
const { rxTest, applyOperators, expect, windowWhen } = runtime;
await rxTest(async ({ cold, expectSubscriptions, flush, now, schedule }) => {
  const outerController = new AbortController();
  const innerControllers = [];
  const actual = [];
  schedule(() => {
    // The original evidence horizon ends at frame 17. Bound the final live
    // window first, then cancel the outer observation and its source work.
    for (const innerController of innerControllers) {
      innerController.abort();
    }
    outerController.abort();
  }, 17);

  const closing = cold('-----c--|');
  const source = cold('-');
  const result = applyOperators(source, [windowWhen(() => closing)]);

  result.subscribe(
    {
      next: (inner) => {
        const outerFrame = now();
        const messages = [];
        const innerController = new AbortController();
        innerControllers.push(innerController);
        actual.push({
          frame: outerFrame,
          notification: { kind: 'N', value: messages },
        });
        inner.subscribe(
          {
            next: (value) => messages.push({
              frame: now() - outerFrame,
              notification: { kind: 'N', value },
            }),
            error: (error) => messages.push({
              frame: now() - outerFrame,
              notification: { kind: 'E', error },
            }),
            complete: () => messages.push({
              frame: now() - outerFrame,
              notification: { kind: 'C' },
            }),
          },
          { signal: innerController.signal }
        );
      },
      error: (error) => actual.push({
        frame: now(),
        notification: { kind: 'E', error },
      }),
      complete: () => actual.push({
        frame: now(),
        notification: { kind: 'C' },
      }),
    },
    { signal: outerController.signal }
  );

  expectSubscriptions(source.subscriptions).toBe('^----------------!');
  expectSubscriptions(closing.subscriptions).toBe([
    '^----!',
    '-----^----!',
    '----------^----!',
    '---------------^-!',
  ]);
  await flush();
  expect(actual).to.deep.equal([
    {
      frame: 0,
      notification: {
        kind: 'N',
        value: [
          { frame: 5, notification: { kind: 'C' } },
        ],
      },
    },
    {
      frame: 5,
      notification: {
        kind: 'N',
        value: [
          { frame: 5, notification: { kind: 'C' } },
        ],
      },
    },
    {
      frame: 10,
      notification: {
        kind: 'N',
        value: [
          { frame: 5, notification: { kind: 'C' } },
        ],
      },
    },
    {
      frame: 15,
      notification: { kind: 'N', value: [] },
    },
  ]);
});
}
`;
}

function buildNeverWindowCountHarnessRewrite() {
  return `async function migrated(runtime) {
const { rxTest, applyOperators, expect, windowCount } = runtime;
await rxTest(async ({ cold, expectSubscriptions, flush, schedule }) => {
  const source = cold('-');
  const outerController = new AbortController();
  const innerController = new AbortController();
  const outerEvents = [];
  const innerEvents = [];
  let snapshot;
  const result = applyOperators(source, [windowCount(2, 1)]);

  result.subscribe(
    {
      next: (window) => {
        outerEvents.push('window');
        window.subscribe(
          {
            next: (value) => innerEvents.push({ kind: 'N', value }),
            error: (error) => innerEvents.push({ kind: 'E', error }),
            complete: () => innerEvents.push({ kind: 'C' }),
          },
          { signal: innerController.signal }
        );
      },
      error: (error) => outerEvents.push({ kind: 'E', error }),
      complete: () => outerEvents.push({ kind: 'C' }),
    },
    { signal: outerController.signal }
  );

  schedule(() => {
    snapshot = {
      outerEvents: [...outerEvents],
      innerEvents: [...innerEvents],
    };
    // Bound the independently observed window before cancelling the outer
    // result so teardown cannot turn this never-window assertion into a
    // terminal-notification assertion.
    innerController.abort();
    outerController.abort();
  }, 1);

  expectSubscriptions(source.subscriptions).toBe('^!');
  await flush();
  expect(snapshot).to.deep.equal({
    outerEvents: ['window'],
    innerEvents: [],
  });
  expect(outerEvents).to.deep.equal(['window']);
  expect(innerEvents).to.deep.equal([]);
});
}
`;
}

function buildCancelledWindowCountHarnessRewrite(withUnsubscriptionChain) {
  const runtimeImports = withUnsubscriptionChain
    ? 'rxTest, applyOperators, expect, mergeMap, of, windowCount'
    : 'rxTest, applyOperators, expect, windowCount';
  const operators = withUnsubscriptionChain
    ? '[mergeMap((value) => of(value)), windowCount(2, 1), mergeMap((window) => of(window))]'
    : '[windowCount(2, 1)]';
  return `async function migrated(runtime) {
const { ${runtimeImports} } = runtime;
await rxTest(async ({ expectSubscriptions, flush, hot, now, schedule }) => {
  const source = hot('^-a--b--c--d--|');
  const outerController = new AbortController();
  const innerControllers = [];
  const actual = [];
  const result = applyOperators(source, ${operators});

  result.subscribe(
    {
      next: (window) => {
        const outerFrame = now();
        const messages = [];
        const innerController = new AbortController();
        innerControllers.push(innerController);
        actual.push({
          frame: outerFrame,
          notification: { kind: 'N', value: messages },
        });
        window.subscribe(
          {
            next: (value) => messages.push({
              frame: now() - outerFrame,
              notification: { kind: 'N', value },
            }),
            error: (error) => messages.push({
              frame: now() - outerFrame,
              notification: { kind: 'E', error },
            }),
            complete: () => messages.push({
              frame: now() - outerFrame,
              notification: { kind: 'C' },
            }),
          },
          { signal: innerController.signal }
        );
      },
      error: (error) => actual.push({
        frame: now(),
        notification: { kind: 'E', error },
      }),
      complete: () => actual.push({
        frame: now(),
        notification: { kind: 'C' },
      }),
    },
    { signal: outerController.signal }
  );

  schedule(() => {
    // The RxJS 7 expectation materializes each emitted window independently.
    // Bound those inner observations before the original outer-unsubscribe
    // frame releases the still-live windows without completing them.
    for (const innerController of innerControllers) {
      innerController.abort();
    }
    outerController.abort();
  }, 9);

  expectSubscriptions(source.subscriptions).toBe('^--------!');
  await flush();
  expect(actual).to.deep.equal([
    {
      frame: 0,
      notification: {
        kind: 'N',
        value: [
          { frame: 2, notification: { kind: 'N', value: 'a' } },
          { frame: 5, notification: { kind: 'N', value: 'b' } },
          { frame: 5, notification: { kind: 'C' } },
        ],
      },
    },
    {
      frame: 2,
      notification: {
        kind: 'N',
        value: [
          { frame: 3, notification: { kind: 'N', value: 'b' } },
          { frame: 6, notification: { kind: 'N', value: 'c' } },
          { frame: 6, notification: { kind: 'C' } },
        ],
      },
    },
    {
      frame: 5,
      notification: {
        kind: 'N',
        value: [
          { frame: 3, notification: { kind: 'N', value: 'c' } },
        ],
      },
    },
    {
      frame: 8,
      notification: {
        kind: 'N',
        value: [],
      },
    },
  ]);
});
}
`;
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
  const program = transpileMigratedProgram(
    input,
    imports,
    [],
    true,
    observationBoundaries.get(caseId),
    modeAwareObservableExpectations.get(caseId),
    modeAwareSubscriptionExpectations.get(caseId),
    expectedValueDictionaries.get(caseId)
  );
  return rewriteRemovedCallbackReceiver(caseId, program);
}

function rewriteRemovedCallbackReceiver(caseId, program) {
  switch (caseId) {
    case 'spec/observables/partition-spec.ts:77:partition > should partition an observable into two using a predicate and thisArg':
      return replaceRemovedCallbackReceiver(
        caseId,
        program,
        "partition(e1, predicate, { value: 'a' })",
        "partition(e1, predicate.bind({ value: 'a' }))"
      );
    case 'spec/operators/filter-spec.ts:235:filter > should be able to accept and use a thisArg':
    case 'spec/operators/map-spec.ts:269:map > should do multiple maps using a custom thisArg':
      return replaceRemovedCallbackReceiver(caseId, program, '}, filterer)', '}.bind(filterer))', 3);
    case 'spec/operators/find-spec.ts:89:find > should work with a custom thisArg':
      return replaceRemovedCallbackReceiver(caseId, program, 'find(predicate, finder)', 'find(predicate.bind(finder))');
    case 'spec/operators/findIndex-spec.ts:89:findIndex > should work with a custom thisArg':
      return replaceRemovedCallbackReceiver(
        caseId,
        program,
        'findIndex(predicate, sourceValues)',
        'findIndex(predicate.bind(sourceValues))'
      );
    case 'spec/operators/map-spec.ts:216:map > should map using a custom thisArg':
      return replaceRemovedCallbackReceiver(caseId, program, '}, foo)', '}.bind(foo))');
    default:
      return program;
  }
}

function replaceRemovedCallbackReceiver(caseId, program, receiverArgument, boundCallback, expectedCount = 1) {
  const actualCount = program.split(receiverArgument).length - 1;
  if (actualCount !== expectedCount) {
    throw new Error(`Expected ${expectedCount} callback receiver rewrite(s) for ${caseId}; found ${actualCount}.`);
  }
  return program.replaceAll(receiverArgument, boundCallback);
}

function getPortedSchedulerAdapterReason({ imports, source }) {
  const schedulerOperatorLocals = imports
    .filter(
      ({ imported, usage }) =>
        usage === 'operator' &&
        (imported === 'observeOn' || imported === 'subscribeOn')
    )
    .map(({ local }) => local);
  const usesPortedScheduler = schedulerOperatorLocals.some((local) =>
    new RegExp(
      `\\b${escapeRegExp(local)}\\s*\\(\\s*(?:rx)?testScheduler\\b`,
      'i'
    ).test(source)
  );
  return usesPortedScheduler
    ? 'The RxJS 7 TestScheduler argument is adapted to the exact host-delay Symbol because rxTest virtualizes host timers; notification, subscription, and cancellation evidence is unchanged.'
    : undefined;
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

function buildShareDynamicHarnessRewrite({ line, variantKey }) {
  if (![235, 323, 359, 395, 430, 465].includes(line)) {
    return null;
  }

  const variantIndex = Number.parseInt(
    /^share-config-(\d+):/.exec(variantKey)?.[1] ?? '',
    10
  );
  const optionVariants = [
    {
      runtimeNames: [],
      source: 'const options = {};',
    },
    {
      runtimeNames: ['of'],
      source: `const syncNotify = of(1);
  const options = {
    resetOnError: () => syncNotify,
    resetOnComplete: () => syncNotify,
    resetOnRefCountZero: () => syncNotify,
  };`,
    },
    {
      runtimeNames: ['concat', 'of'],
      source: `const syncNotify = of(1);
  const options = {
    resetOnError: () => concat(syncNotify, syncNotify),
    resetOnComplete: () => concat(syncNotify, syncNotify),
    resetOnRefCountZero: () => concat(syncNotify, syncNotify),
  };`,
    },
    {
      runtimeNames: ['concat', 'NEVER', 'of'],
      source: `const syncNotify = of(1);
  const options = {
    resetOnError: () => concat(syncNotify, NEVER),
    resetOnComplete: () => concat(syncNotify, NEVER),
    resetOnRefCountZero: () => concat(syncNotify, NEVER),
  };`,
    },
    {
      runtimeNames: ['concat', 'of', 'throwError'],
      source: `const syncNotify = of(1);
  const syncError = throwError(() => new Error());
  const options = {
    resetOnError: () => concat(syncNotify, syncError),
    resetOnComplete: () => concat(syncNotify, syncError),
    resetOnRefCountZero: () => concat(syncNotify, syncError),
  };`,
    },
  ];
  const optionVariant = optionVariants[variantIndex];
  if (!optionVariant) {
    return null;
  }

  let operatorNames;
  let body;
  if (line === 235) {
    operatorNames = ['share'];
    body = `const source = cold('-');
  const shared = applyOperators(source, [share(options)]);

  // The original one-frame diagram asserts silence from a live source.
  // Bound both observations at that evidence horizon.
  expectObservable(shared, '^!').toBe('-');
  expectSubscriptions(source.subscriptions).toBe('^!');`;
  } else if (line === 465) {
    operatorNames = ['NEVER', 'share'];
    body = `const shared = applyOperators(NEVER, [share(options)]);

  // The original one-frame diagram asserts silence without completion.
  expectObservable(shared, '^!').toBe('-');`;
  } else if (line === 323) {
    operatorNames = ['retry', 'share'];
    body = `const source = cold('(123#)');
  const shared = applyOperators(source, [share(options)]);

  // Preserve the original trigger frames directly. Nested expectations
  // created at frame 1 otherwise schedule against absolute frame 0.
  expectObservable(applyOperators(shared, [retry(1)])).toBe('(123123#)');
  expectObservable(applyOperators(shared, [retry(1)]), '-^').toBe('-(123123#)');
  expectSubscriptions(source.subscriptions).toBe([
    '(^!)',
    '(^!)',
    '-(^!)',
    '-(^!)',
  ]);`;
  } else if (line === 359) {
    operatorNames = ['repeat', 'share'];
    body = `const source = cold('(123|)');
  const shared = applyOperators(source, [share(options)]);

  // Preserve the original trigger frames directly. Nested expectations
  // created at frame 1 otherwise schedule against absolute frame 0.
  expectObservable(applyOperators(shared, [repeat(2)])).toBe('(123123|)');
  expectObservable(applyOperators(shared, [repeat(2)]), '-^').toBe('-(123123|)');
  expectSubscriptions(source.subscriptions).toBe([
    '(^!)',
    '(^!)',
    '-(^!)',
    '-(^!)',
  ]);`;
  } else if (line === 395) {
    operatorNames = ['retry', 'share'];
    body = `const source = cold('-1-2-3----4-#                        ');
  const shared = applyOperators(source, [share(options)]);

  // Subscribe at the two original hot-trigger frames without retaining
  // the trigger observations beyond the terminal retry evidence.
  expectObservable(applyOperators(shared, [retry(2)])).toBe(
    '-1-2-3----4--1-2-3----4--1-2-3----4-#'
  );
  expectObservable(applyOperators(shared, [retry(2)]), '----^').toBe(
    '-----3----4--1-2-3----4--1-2-3----4-#'
  );
  expectSubscriptions(source.subscriptions).toBe([
    '^-----------!                        ',
    '------------^-----------!            ',
    '------------------------^-----------!',
  ]);`;
  } else {
    operatorNames = ['repeat', 'share'];
    body = `const source = cold('-1-2-3----4-|                        ');
  const shared = applyOperators(source, [share(options)]);

  // Subscribe at the two original hot-trigger frames without retaining
  // the trigger observations beyond the terminal repeat evidence.
  expectObservable(applyOperators(shared, [repeat(3)])).toBe(
    '-1-2-3----4--1-2-3----4--1-2-3----4-|'
  );
  expectObservable(applyOperators(shared, [repeat(3)]), '----^').toBe(
    '-----3----4--1-2-3----4--1-2-3----4-|'
  );
  expectSubscriptions(source.subscriptions).toBe([
    '^-----------!                        ',
    '------------^-----------!            ',
    '------------------------^-----------!',
  ]);`;
  }

  const runtimeNames = [
    'rxTest',
    'applyOperators',
    ...optionVariant.runtimeNames,
    ...operatorNames,
  ];
  return `async function migrated(runtime) {
const { ${[...new Set(runtimeNames)].join(', ')} } = runtime;
await rxTest(async ({ cold, expectObservable, expectSubscriptions }) => {
  ${optionVariant.source}
  ${body}
});
}
`;
}

function buildDynamicMigratedProgram({
  sourceText,
  sourceFile,
  targetCall,
  imports,
  variant,
  support,
  reachableSupport,
  semanticImports,
}) {
  const expressionStart = targetCall.expression.getStart(sourceFile);
  const expressionEnd = targetCall.expression.end;
  const reachableSupportSet = new Set(reachableSupport);
  const prunedSource = maskSourceStatements(
    sourceText,
    sourceFile,
    support.filter((statement) => !reachableSupportSet.has(statement))
  );
  const taggedSource = `${prunedSource.slice(0, expressionStart)}__targetIt${prunedSource.slice(expressionEnd)}`;
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
  const referencedNames = semanticImports
    ? collectReferencedIdentifiers([
        ts.createSourceFile(
          'dynamic-migrated-program.ts',
          transformed,
          ts.ScriptTarget.Latest,
          true,
          ts.ScriptKind.TS
        ),
      ])
    : null;
  const usedImports = imports.filter(
    (imported) =>
      isInlineTestHelper(imported) ||
      (semanticImports
        ? (imported.module === 'rxjs' && imported.imported === 'pipe') ||
          referencedNames.has(imported.local)
        : new RegExp(`\\b${escapeRegExp(imported.local)}\\b`).test(transformed))
  );
  return {
    imports: usedImports,
    program: transpileMigratedProgram(input, usedImports, [dynamicTransformer]),
  };
}

function maskSourceStatements(sourceText, sourceFile, statements) {
  let masked = sourceText;
  const ranges = statements
    .map((statement) => [statement.getStart(sourceFile), statement.end])
    .sort(([leftStart], [rightStart]) => rightStart - leftStart);
  for (const [start, end] of ranges) {
    const replacement = masked.slice(start, end).replace(/[^\r\n]/g, ' ');
    masked = `${masked.slice(0, start)}${replacement}${masked.slice(end)}`;
  }
  return masked;
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
              supportNodes: [element],
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
  modeAwareObservableExpectation,
  modeAwareSubscriptionExpectation,
  expectedValueDictionary
) {
  const standalonePipeLocals = new Set(
    imports.filter((item) => item.module === 'rxjs' && item.imported === 'pipe').map((item) => item.local)
  );
  const operatorLocals = new Set(imports.filter((item) => item.usage === 'operator').map((item) => item.local));
  const portedSchedulerOperatorLocals = new Set(
    imports
      .filter(
        ({ imported, usage }) =>
          usage === 'operator' &&
          (imported === 'observeOn' || imported === 'subscribeOn')
      )
      .map(({ local }) => local)
  );
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
          portedSchedulerOperatorLocals,
          observationBoundary,
          modeAwareObservableExpectation,
          modeAwareSubscriptionExpectation,
          expectedValueDictionary,
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
  if (/\b__rxTestScheduler\b/.test(transformed)) {
    usedRuntimeNames.push('__rxTestScheduler');
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

  function containsTestRegistration(node) {
    if (
      ts.isCallExpression(node) &&
      ['it', 'test', 'specify', 'describe'].includes(getCallName(node.expression))
    ) {
      return true;
    }
    let found = false;
    ts.forEachChild(node, (child) => {
      if (!found && containsTestRegistration(child)) {
        found = true;
      }
    });
    return found;
  }

  function visit(node) {
    if (
      ts.isForOfStatement(node) &&
      variant.binding &&
      ts.isArrayLiteralExpression(node.expression) &&
      node.expression.elements.every(
        (element) => readObjectStringProperty(element, variant.binding) !== undefined
      ) &&
      containsTestRegistration(node.statement)
    ) {
      const selectedElements = node.expression.elements.filter(
        (element) => readObjectStringProperty(element, variant.binding) === variant.value
      );
      if (selectedElements.length === 1) {
        return factory.updateForOfStatement(
          node,
          node.awaitModifier,
          ts.visitNode(node.initializer, visit),
          factory.updateArrayLiteralExpression(node.expression, selectedElements),
          ts.visitNode(node.statement, visit)
        );
      }
      if (selectedElements.length === 0) {
        return factory.createEmptyStatement();
      }
    }
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

function getModeAwareObservableTarget(node, expectations) {
  if (
    !ts.isPropertyAccessExpression(node.expression) ||
    node.expression.name.text !== 'toBe' ||
    !ts.isCallExpression(node.expression.expression)
  ) {
    return undefined;
  }
  const expectation = node.expression.expression;
  if (
    !ts.isIdentifier(expectation.expression) ||
    expectation.expression.text !== 'expectObservable'
  ) {
    return undefined;
  }
  const source = expectation.arguments[0];
  if (ts.isIdentifier(source)) {
    return source.text;
  }
  return ts.isCallExpression(source) &&
    ts.isIdentifier(source.expression) &&
    source.expression.text === 'applyOperators'
    ? ts.isIdentifier(source.arguments[0]) &&
      expectations?.has(source.arguments[0].text)
      ? source.arguments[0].text
      : 'applyOperators'
    : ts.isCallExpression(source) &&
        ts.isPropertyAccessExpression(source.expression) &&
        source.expression.name.text === 'pipe'
      ? ts.isIdentifier(source.expression.expression) &&
        expectations?.has(source.expression.expression.text)
        ? source.expression.expression.text
        : 'pipe'
      : undefined;
}

function createLiteralExpression(value, factory) {
  if (Array.isArray(value)) {
    return factory.createArrayLiteralExpression(
      value.map((item) => createLiteralExpression(item, factory)),
      false
    );
  }
  if (value && typeof value === 'object') {
    return factory.createObjectLiteralExpression(
      Object.entries(value).map(([key, item]) =>
        factory.createPropertyAssignment(key, createLiteralExpression(item, factory))
      ),
      false
    );
  }
  if (typeof value === 'string') {
    return factory.createStringLiteral(value);
  }
  if (typeof value === 'number') {
    return factory.createNumericLiteral(value);
  }
  if (typeof value === 'boolean') {
    return value ? factory.createTrue() : factory.createFalse();
  }
  if (value === null) {
    return factory.createNull();
  }
  return factory.createIdentifier('undefined');
}

function createMigrationTransformer({
  standalonePipeLocals,
  operatorLocals,
  portedSchedulerOperatorLocals,
  observationBoundary,
  modeAwareObservableExpectation,
  modeAwareSubscriptionExpectation,
  expectedValueDictionary,
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
          const marbleReplacement =
            ts.isIdentifier(declaration.name) && observationBoundary?.marbles?.get(declaration.name.text);
          const retainedInitializer = replaceSubscriptionBoundary(
            declaration.initializer,
            marbleReplacement ?? subscriptionBoundary,
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
        if (
          ts.isIdentifier(node.expression) &&
          ['bufferTime', 'timeout', 'timeoutWith', 'windowTime'].includes(node.expression.text) &&
          isSchedulerReceiver(node.arguments.at(-1))
        ) {
          return factory.updateCallExpression(
            node,
            ts.visitNode(node.expression, visit),
            node.typeArguments,
            node.arguments.slice(0, -1).map((argument) => ts.visitNode(argument, visit))
          );
        }
        if (
          ts.isIdentifier(node.expression) &&
          node.expression.text === 'interval' &&
          node.arguments.length > 1 &&
          isSchedulerReceiver(node.arguments.at(-1))
        ) {
          return factory.updateCallExpression(
            node,
            ts.visitNode(node.expression, visit),
            node.typeArguments,
            [ts.visitNode(node.arguments[0], visit)]
          );
        }
        if (
          ts.isIdentifier(node.expression) &&
          portedSchedulerOperatorLocals.has(node.expression.text) &&
          node.arguments[0] &&
          isPortedTestSchedulerReceiver(node.arguments[0])
        ) {
          return factory.updateCallExpression(
            node,
            node.expression,
            node.typeArguments,
            [
              factory.createIdentifier('__rxTestScheduler'),
              ...node.arguments.slice(1).map((argument) => ts.visitNode(argument, visit)),
            ]
          );
        }
        if (
          ts.isIdentifier(node.expression) &&
          ['timestamp', 'timeInterval', 'sampleTime'].includes(node.expression.text)
        ) {
          const schedulerIndex = node.expression.text === 'sampleTime' ? 1 : 0;
          const schedulerArgument = node.arguments[schedulerIndex];
          if (schedulerArgument && isSchedulerReceiver(schedulerArgument)) {
            const arguments_ = node.arguments.map((argument) => ts.visitNode(argument, visit));
            arguments_[schedulerIndex] = factory.createObjectLiteralExpression(
              [
                factory.createPropertyAssignment('__rxjsHostTimeProvider', factory.createTrue()),
                factory.createPropertyAssignment(
                  'now',
                  factory.createArrowFunction(
                    undefined,
                    undefined,
                    [],
                    undefined,
                    factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                    factory.createCallExpression(factory.createIdentifier('__rxNow'), undefined, [])
                  )
                ),
              ],
              false
            );
            return factory.updateCallExpression(
              node,
              ts.visitNode(node.expression, visit),
              node.typeArguments,
              arguments_
            );
          }
        }
        const expectedValuesArgument = node.arguments[1];
        const expectedValueToken =
          ts.isPropertyAccessExpression(node.expression) &&
          node.expression.name.text === 'toBe' &&
          expectedValuesArgument &&
          ts.isIdentifier(expectedValuesArgument)
            ? expectedValueDictionary?.get(expectedValuesArgument.text)
            : undefined;
        if (expectedValueToken !== undefined) {
          return factory.updateCallExpression(
            node,
            ts.visitNode(node.expression, visit),
            node.typeArguments,
            [
              ...node.arguments.slice(0, 1).map((argument) => ts.visitNode(argument, visit)),
              factory.createObjectLiteralExpression([
                factory.createPropertyAssignment(
                  factory.createStringLiteral(expectedValueToken),
                  ts.visitNode(expectedValuesArgument, visit)
                ),
              ]),
              ...node.arguments.slice(2).map((argument) => ts.visitNode(argument, visit)),
            ]
          );
        }
        const modeAwareObservableTarget =
          modeAwareObservableExpectation &&
          getModeAwareObservableTarget(node, modeAwareObservableExpectation);
        const platformObservableExpectation =
          modeAwareObservableTarget && modeAwareObservableExpectation.get(modeAwareObservableTarget);
        const coldObservableExpectation = node.arguments[0];
        if (
          platformObservableExpectation !== undefined &&
          coldObservableExpectation
        ) {
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
                ts.visitNode(coldObservableExpectation, visit),
                factory.createToken(ts.SyntaxKind.ColonToken),
                createLiteralExpression(platformObservableExpectation, factory)
              ),
              ...node.arguments.slice(1).map((argument) => ts.visitNode(argument, visit)),
            ]
          );
        }
        const modeAwareTarget = modeAwareSubscriptionExpectation && getModeAwareSubscriptionTarget(node);
        const platformSubscriptionExpectation =
          modeAwareTarget && modeAwareSubscriptionExpectation.get(modeAwareTarget);
        const coldSubscriptionExpectation = node.arguments[0];
        if (
          platformSubscriptionExpectation !== undefined &&
          coldSubscriptionExpectation
        ) {
          const visitedColdExpectation = ts.visitNode(coldSubscriptionExpectation, visit);
          const platformExpectation =
            typeof platformSubscriptionExpectation === 'number'
              ? ts.isArrayLiteralExpression(visitedColdExpectation)
                ? factory.updateArrayLiteralExpression(
                    visitedColdExpectation,
                    visitedColdExpectation.elements.slice(0, platformSubscriptionExpectation)
                  )
                : undefined
              : createLiteralExpression(platformSubscriptionExpectation, factory);
          if (!platformExpectation) {
            return ts.visitEachChild(node, visit, context);
          }
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
          typeof observationBoundary?.observable === 'string' &&
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
          const callback = ensureContextHelpers(
            visitedCallback,
            factory,
            observationBoundary?.manualFlushThroughFrame !== undefined
          );
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
            const invocation =
              observationBoundary?.manualFlushThroughFrame === undefined
                ? factory.createCallExpression(factory.createIdentifier('__rxFlush'), undefined, [])
                : factory.createCallExpression(factory.createIdentifier('__rxAdvanceTo'), undefined, [
                    factory.createNumericLiteral(observationBoundary.manualFlushThroughFrame),
                  ]);
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
          return createExpectObservableArrayCall(
            node.arguments,
            factory,
            visit,
            observationBoundary?.observable
          );
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

function ensureContextHelpers(node, factory, includeAdvanceTo = false) {
  if (!isFunction(node)) {
    return node;
  }
  const helperBindings = [
    { property: 'cold', local: '__rxCold' },
    { property: 'hot', local: '__rxHot' },
    { property: 'time', local: '__rxTime' },
    { property: 'expectObservable', local: 'expectObservable' },
    { property: 'flush', local: '__rxFlush' },
    ...(includeAdvanceTo ? [{ property: 'advanceTo', local: '__rxAdvanceTo' }] : []),
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

function createExpectObservableArrayCall(args, factory, visit, observationBoundary) {
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
                    ...(typeof observationBoundary === 'string'
                      ? [factory.createStringLiteral(observationBoundary)]
                      : []),
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
      factory.createIdentifier('__rxTime'),
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

function isPortedTestSchedulerReceiver(node) {
  return ts.isIdentifier(node) && /^(?:rx)?testScheduler$/i.test(node.text);
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

function getUsedImports({ path, callback, importMap, sourceFile, support }) {
  if (!callback || !isFunction(callback)) {
    return [];
  }
  const selectedSource = [...support.map((statement) => statement.getText(sourceFile)), callback.getText(sourceFile)].join('\n');
  const referencedNames =
    path === 'spec/operators/share-spec.ts'
      ? collectReferencedIdentifiers([...support, callback])
      : null;
  const operatorLocals = collectOperatorLocals({ callback, importMap, support });
  const needsTimerHelper =
    referencedNames?.has('getTimerSelector') ??
    /\bgetTimerSelector\s*\(/.test(selectedSource);
  return importMap
    .filter(
      (item) =>
        (referencedNames
          ? referencedNames.has(item.local)
          : new RegExp(`\\b${escapeRegExp(item.local)}\\b`).test(selectedSource)) ||
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
    } else if (item.module === 'sinon') {
      continue;
    } else if (frameworkModules.has(item.module)) {
      continue;
    } else if (item.module === 'rxjs/internal/operators/timeInterval' && item.imported === 'TimeInterval') {
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

function collectReferencedIdentifiers(nodes) {
  const names = new Set();

  const isReference = (node, parent) => {
    if (!parent) {
      return true;
    }
    if (
      (ts.isVariableDeclaration(parent) && parent.name === node) ||
      (ts.isParameter(parent) && parent.name === node) ||
      (ts.isBindingElement(parent) && (parent.name === node || parent.propertyName === node)) ||
      ((ts.isFunctionDeclaration(parent) ||
        ts.isFunctionExpression(parent) ||
        ts.isClassDeclaration(parent) ||
        ts.isClassExpression(parent) ||
        ts.isInterfaceDeclaration(parent) ||
        ts.isTypeAliasDeclaration(parent) ||
        ts.isEnumDeclaration(parent) ||
        ts.isModuleDeclaration(parent)) &&
        parent.name === node) ||
      (ts.isPropertyAccessExpression(parent) && parent.name === node) ||
      ((ts.isPropertyAssignment(parent) ||
        ts.isPropertyDeclaration(parent) ||
        ts.isMethodDeclaration(parent) ||
        ts.isGetAccessorDeclaration(parent) ||
        ts.isSetAccessorDeclaration(parent)) &&
        parent.name === node) ||
      ts.isImportClause(parent) ||
      ts.isImportSpecifier(parent) ||
      ts.isNamespaceImport(parent) ||
      ts.isImportEqualsDeclaration(parent) ||
      ts.isExportSpecifier(parent) ||
      ts.isLabeledStatement(parent) ||
      ts.isBreakStatement(parent) ||
      ts.isContinueStatement(parent) ||
      ts.isTypeNode(parent)
    ) {
      return false;
    }
    return true;
  };

  const visit = (node, parent) => {
    if (ts.isIdentifier(node) && isReference(node, parent)) {
      names.add(node.text);
    }
    ts.forEachChild(node, (child) => visit(child, node));
  };

  for (const node of nodes) {
    visit(node, undefined);
  }
  return names;
}

function getCaseSupport({ path, callback, sourceFile, support, extraRoots = [] }) {
  if (!callback || !isFunction(callback)) {
    return [];
  }
  if (
    path !== 'spec/operators/share-spec.ts' &&
    path !== 'spec/observables/combineLatest-spec.ts'
  ) {
    if (path !== 'spec/observables/zip-spec.ts') {
      return support;
    }
    const callbackSource = callback.getText(sourceFile);
    return support.filter((statement) => {
      const names = getDeclaredNames(statement);
      return names.length === 0 || names.some((name) => new RegExp(`\\b${escapeRegExp(name)}\\b`).test(callbackSource));
    });
  }

  const reachable = new Set();
  const referencedNames = collectReferencedIdentifiers([callback, ...extraRoots]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const statement of support) {
      if (reachable.has(statement)) {
        continue;
      }
      const names = getDeclaredNames(statement);
      if (names.length > 0 && names.some((name) => referencedNames.has(name))) {
        reachable.add(statement);
        for (const name of collectReferencedIdentifiers([statement])) {
          referencedNames.add(name);
        }
        changed = true;
      }
    }
  }
  return support.filter((statement) => reachable.has(statement));
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
  if (
    (ts.isFunctionDeclaration(statement) ||
      ts.isClassDeclaration(statement) ||
      ts.isTypeAliasDeclaration(statement) ||
      ts.isInterfaceDeclaration(statement) ||
      ts.isEnumDeclaration(statement)) &&
    statement.name
  ) {
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
