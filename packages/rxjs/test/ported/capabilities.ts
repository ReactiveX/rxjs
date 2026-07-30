import { Assertion as ChaiAssertion, expect as chaiExpect, util as chaiUtil } from 'chai';
import type { RxTestContext } from '../../../test/src/index.js';
import capabilityRegistry from './capability-registry.json' with { type: 'json' };
import type { PortedImport, PortedMarbleCase, PortMode } from './types.js';

interface OperatorDescriptor {
  readonly name: string;
  readonly args: readonly unknown[];
}

const composedOperatorName = '\0rxjs7-pipe';
const chaiInspect = Symbol.for('chai/inspect');
const portedObservableDisplayFlag = 'rxjsPortedObservableDisplay';
const originalChaiAssert = ChaiAssertion.prototype.assert;

export const portedExpect = ((actual: unknown, message?: string) => {
  const assertion = chaiExpect(actual, message);
  chaiUtil.flag(assertion, portedObservableDisplayFlag, true);
  return assertion;
}) as typeof chaiExpect;

ChaiAssertion.prototype.assert = function (...args: Parameters<typeof originalChaiAssert>): void {
  if (!chaiUtil.flag(this, portedObservableDisplayFlag)) {
    return originalChaiAssert.apply(this, args);
  }
  const actual = chaiUtil.flag(this, 'object');
  return withObservableAssertionDisplay(actual, () => originalChaiAssert.apply(this, args));
};

type SymbolMap = Readonly<Record<string, symbol>>;
type StaticFactoryMap = Readonly<Record<string, symbol>>;

export interface PortRuntime {
  readonly [name: string]: unknown;
  readonly __rxPortMode: PortMode;
  readonly rxTest: (callback: (context: RxTestContext) => void | PromiseLike<void>) => Promise<void>;
  readonly applyOperators: (source: unknown, operators: readonly OperatorDescriptor[]) => unknown;
  readonly expect: typeof chaiExpect;
}

export async function loadCapabilities(): Promise<{
  readonly operators: SymbolMap;
  readonly staticFactories: StaticFactoryMap;
  readonly values: Readonly<Record<string, unknown>>;
}> {
  const [
    animationFramesModule,
    argumentOutOfRangeErrorModule,
    asyncSubjectModule,
    behaviorSubjectModule,
    bufferModule,
    bufferToggleModule,
    catchErrorModule,
    coldObservableModule,
    combineLatestAllModule,
    combineLatestModule,
    connectModule,
    connectableModule,
    concatModule,
    countModule,
    debounceModule,
    delayWhenModule,
    dematerializeModule,
    defaultIfEmptyModule,
    distinctModule,
    distinctUntilChangedModule,
    distinctUntilKeyChangedModule,
    elementAtModule,
    emptyErrorModule,
    emptyModule,
    everyModule,
    exhaustMapModule,
    expandModule,
    finalizeModule,
    filterModule,
    findIndexModule,
    findModule,
    firstModule,
    forkJoinModule,
    fromEventPatternModule,
    generateModule,
    groupByModule,
    identityModule,
    intervalModule,
    isEmptyModule,
    lastModule,
    mapModule,
    materializeModule,
    maxModule,
    mergeModule,
    mergeMapModule,
    mergeScanModule,
    minModule,
    multicastModule,
    neverModule,
    notFoundErrorModule,
    notificationModule,
    noopModule,
    onErrorResumeNextModule,
    pairwiseModule,
    partitionModule,
    pipeModule,
    pluckModule,
    publishLastModule,
    publishModule,
    raceModule,
    reduceModule,
    refCountModule,
    replaySubjectModule,
    repeatModule,
    repeatWhenModule,
    retryModule,
    retryWhenModule,
    sampleModule,
    scanModule,
    sequenceEqualModule,
    sequenceErrorModule,
    shareModule,
    shareReplayModule,
    singleModule,
    skipModule,
    skipLastModule,
    skipUntilModule,
    skipWhileModule,
    startWithModule,
    subjectModule,
    switchMapModule,
    switchScanModule,
    tapModule,
    takeModule,
    takeLastModule,
    takeUntilModule,
    takeWhileModule,
    throttleModule,
    throwIfEmptyModule,
    timeoutModule,
    timerModule,
    windowModule,
    windowCountModule,
    windowToggleModule,
    windowWhenModule,
    withLatestFromModule,
    zipAllModule,
    zipWithModule,
    zipModule,
  ] = await Promise.all([
    import('../../src/animation-frames.js'),
    import('../../src/argument-out-of-range-error.js'),
    import('../../src/async-subject.js'),
    import('../../src/behavior-subject.js'),
    import('../../src/buffer.js'),
    import('../../src/buffer-toggle.js'),
    import('../../src/catch-error.js'),
    import('../../src/cold-observable.js'),
    import('../../src/combine-latest-all.js'),
    import('../../src/combine-latest.js'),
    import('../../src/connect.js'),
    import('../../src/connectable.js'),
    import('../../src/concat.js'),
    import('../../src/count.js'),
    import('../../src/debounce.js'),
    import('../../src/delay-when.js'),
    import('../../src/dematerialize.js'),
    import('../../src/default-if-empty.js'),
    import('../../src/distinct.js'),
    import('../../src/distinct-until-changed.js'),
    import('../../src/distinct-until-key-changed.js'),
    import('../../src/element-at.js'),
    import('../../src/empty-error.js'),
    import('../../src/empty.js'),
    import('../../src/every.js'),
    import('../../src/exhaust-map.js'),
    import('../../src/expand.js'),
    import('../../src/finalize.js'),
    import('../../src/filter.js'),
    import('../../src/find-index.js'),
    import('../../src/find.js'),
    import('../../src/first.js'),
    import('../../src/fork-join.js'),
    import('../../src/from-event-pattern.js'),
    import('../../src/generate.js'),
    import('../../src/group-by.js'),
    import('../../src/identity.js'),
    import('../../src/interval.js'),
    import('../../src/is-empty.js'),
    import('../../src/last.js'),
    import('../../src/map.js'),
    import('../../src/materialize.js'),
    import('../../src/max.js'),
    import('../../src/merge.js'),
    import('../../src/merge-map.js'),
    import('../../src/merge-scan.js'),
    import('../../src/min.js'),
    import('../../src/multicast.js'),
    import('../../src/never.js'),
    import('../../src/not-found-error.js'),
    import('../../src/notification.js'),
    import('../../src/noop.js'),
    import('../../src/on-error-resume-next.js'),
    import('../../src/pairwise.js'),
    import('../../src/partition.js'),
    import('../../src/pipe.js'),
    import('../../src/pluck.js'),
    import('../../src/publish-last.js'),
    import('../../src/publish.js'),
    import('../../src/race.js'),
    import('../../src/reduce.js'),
    import('../../src/ref-count.js'),
    import('../../src/replay-subject.js'),
    import('../../src/repeat.js'),
    import('../../src/repeat-when.js'),
    import('../../src/retry.js'),
    import('../../src/retry-when.js'),
    import('../../src/sample.js'),
    import('../../src/scan.js'),
    import('../../src/sequence-equal.js'),
    import('../../src/sequence-error.js'),
    import('../../src/share.js'),
    import('../../src/share-replay.js'),
    import('../../src/single.js'),
    import('../../src/skip.js'),
    import('../../src/skip-last.js'),
    import('../../src/skip-until.js'),
    import('../../src/skip-while.js'),
    import('../../src/start-with.js'),
    import('../../src/subject.js'),
    import('../../src/switch-map.js'),
    import('../../src/switch-scan.js'),
    import('../../src/tap.js'),
    import('../../src/take.js'),
    import('../../src/take-last.js'),
    import('../../src/take-until.js'),
    import('../../src/take-while.js'),
    import('../../src/throttle.js'),
    import('../../src/throw-if-empty.js'),
    import('../../src/timeout.js'),
    import('../../src/timer.js'),
    import('../../src/window.js'),
    import('../../src/window-count.js'),
    import('../../src/window-toggle.js'),
    import('../../src/window-when.js'),
    import('../../src/with-latest-from.js'),
    import('../../src/zip-all.js'),
    import('../../src/zip-with.js'),
    import('../../src/zip.js'),
  ]);

  const capabilities = {
    operators: {
      buffer: bufferModule.buffer,
      bufferToggle: bufferToggleModule.bufferToggle,
      catchError: catchErrorModule.catchError,
      combineLatestAll: combineLatestAllModule.combineLatestAll,
      combineLatest: combineLatestModule.combineLatest,
      connect: connectModule.connect,
      concat: concatModule.concat,
      count: countModule.count,
      debounce: debounceModule.debounce,
      delayWhen: delayWhenModule.delayWhen,
      dematerialize: dematerializeModule.dematerialize,
      defaultIfEmpty: defaultIfEmptyModule.defaultIfEmpty,
      distinct: distinctModule.distinct,
      distinctUntilChanged: distinctUntilChangedModule.distinctUntilChanged,
      distinctUntilKeyChanged: distinctUntilKeyChangedModule.distinctUntilKeyChanged,
      elementAt: elementAtModule.elementAt,
      every: everyModule.every,
      exhaustMap: exhaustMapModule.exhaustMap,
      expand: expandModule.expand,
      finalize: finalizeModule.finalize,
      filter: filterModule.filter,
      findIndex: findIndexModule.findIndex,
      find: findModule.find,
      first: firstModule.first,
      groupBy: groupByModule.groupBy,
      isEmpty: isEmptyModule.isEmpty,
      last: lastModule.last,
      map: mapModule.map,
      materialize: materializeModule.materialize,
      max: maxModule.max,
      merge: mergeModule.merge,
      mergeMap: mergeMapModule.mergeMap,
      mergeScan: mergeScanModule.mergeScan,
      min: minModule.min,
      multicast: multicastModule.multicast,
      onErrorResumeNext: onErrorResumeNextModule.onErrorResumeNext,
      pairwise: pairwiseModule.pairwise,
      pluck: pluckModule.pluck,
      publishLast: publishLastModule.publishLast,
      publish: publishModule.publish,
      race: raceModule.race,
      reduce: reduceModule.reduce,
      refCount: refCountModule.refCount,
      repeat: repeatModule.repeat,
      repeatWhen: repeatWhenModule.repeatWhen,
      retry: retryModule.retry,
      retryWhen: retryWhenModule.retryWhen,
      sample: sampleModule.sample,
      scan: scanModule.scan,
      sequenceEqual: sequenceEqualModule.sequenceEqual,
      share: shareModule.share,
      shareReplay: shareReplayModule.shareReplay,
      single: singleModule.single,
      skip: skipModule.skip,
      skipLast: skipLastModule.skipLast,
      skipUntil: skipUntilModule.skipUntil,
      skipWhile: skipWhileModule.skipWhile,
      startWith: startWithModule.startWith,
      switchMap: switchMapModule.switchMap,
      switchScan: switchScanModule.switchScan,
      tap: tapModule.tap,
      take: takeModule.take,
      takeLast: takeLastModule.takeLast,
      takeUntil: takeUntilModule.takeUntil,
      takeWhile: takeWhileModule.takeWhile,
      throttle: throttleModule.throttle,
      throwIfEmpty: throwIfEmptyModule.throwIfEmpty,
      timeout: timeoutModule.timeout,
      window: windowModule.window,
      windowCount: windowCountModule.windowCount,
      windowToggle: windowToggleModule.windowToggle,
      windowWhen: windowWhenModule.windowWhen,
      withLatestFrom: withLatestFromModule.withLatestFrom,
      zipAll: zipAllModule.zipAll,
      zipWith: zipWithModule.zipWith,
    },
    staticFactories: {
      animationFrames: animationFramesModule.animationFrames,
      combineLatest: combineLatestModule.combineLatest,
      concat: concatModule.concat,
      forkJoin: forkJoinModule.forkJoin,
      generate: generateModule.generate,
      interval: intervalModule.interval,
      merge: mergeModule.merge,
      onErrorResumeNext: onErrorResumeNextModule.onErrorResumeNext,
      partition: partitionModule.partition,
      race: raceModule.race,
      timer: timerModule.timer,
    },
    values: {
      ArgumentOutOfRangeError: argumentOutOfRangeErrorModule.ArgumentOutOfRangeError,
      AsyncSubject: asyncSubjectModule.AsyncSubject,
      BehaviorSubject: behaviorSubjectModule.behaviorSubject,
      ColdObservable: coldObservableModule.ColdObservable,
      connectable: connectableModule.connectable,
      ConnectableObservable: connectableModule.ConnectableObservable,
      EMPTY: emptyModule.EMPTY,
      EmptyError: emptyErrorModule.EmptyError,
      firstValueFrom: 'first',
      fromEventPattern: fromEventPatternModule.fromEventPattern,
      identity: identityModule.identity,
      lastValueFrom: 'last',
      NEVER: neverModule.NEVER,
      NotFoundError: notFoundErrorModule.NotFoundError,
      Notification: notificationModule.Notification,
      ObservableNotification: undefined,
      Observer: undefined,
      Operator: undefined,
      noop: noopModule.noop,
      Observable,
      pipe: pipeModule.pipe,
      ReplaySubject: replaySubjectModule.replaySubject,
      SequenceError: sequenceErrorModule.SequenceError,
      Subject: subjectModule.Subject,
      Subscription: undefined,
      zip: zipModule.zip,
    },
  };
  assertCapabilityRegistry(capabilities);
  return capabilities;
}

export function createRuntime(options: {
  readonly testCase: PortedMarbleCase;
  readonly mode: PortMode;
  readonly rxTest: typeof import('../../../test/src/index.js').rxTest;
  readonly capabilities: Awaited<ReturnType<typeof loadCapabilities>>;
}): PortRuntime {
  const { testCase, mode, rxTest, capabilities } = options;

  const applyOperator = (
    current: Record<PropertyKey, (...args: unknown[]) => unknown>,
    operator: OperatorDescriptor
  ): Record<PropertyKey, (...args: unknown[]) => unknown> => {
    if (operator.name === composedOperatorName) {
      const pipeSymbol = capabilities.values.pipe;
      if (typeof pipeSymbol !== 'symbol') {
        throw new Error('Missing static pipe Symbol capability.');
      }
      const implementation = (Observable as unknown as Record<PropertyKey, unknown>)[pipeSymbol];
      if (typeof implementation !== 'function') {
        throw new Error('The static pipe Symbol is not installed on the active Observable.');
      }
      const operatorFunctions = operator.args.map(
        (nestedOperator) => (source: unknown) =>
          applyOperator(
            createOperatorSource(source),
            nestedOperator as OperatorDescriptor
          )
      );
      return implementation.call(Observable, current, ...operatorFunctions) as Record<
        PropertyKey,
        (...args: unknown[]) => unknown
      >;
    }

    const mapping = capabilityRegistry.operators[operator.name as keyof typeof capabilityRegistry.operators];
    if (!mapping) {
      throw new Error(`Missing operator capability: ${operator.name}`);
    }
    const symbol = capabilities.operators[mapping.symbol];
    if (!symbol) {
      throw new Error(`Missing operator Symbol capability: ${mapping.symbol}`);
    }
    const implementation = current[symbol];
    if (typeof implementation !== 'function') {
      throw new Error(`Operator ${operator.name} (via ${mapping.symbol}) is not installed on the active Observable.`);
    }
    return implementation.call(current, ...adaptOperatorArguments(mapping.adapter, operator.args)) as Record<
      PropertyKey,
      (...args: unknown[]) => unknown
    >;
  };

  const runtime: Record<string, unknown> = {
    __rxPortMode: mode,
    expect: portedExpect,
    applyOperators(source: unknown, operators: readonly OperatorDescriptor[]): unknown {
      let current = createOperatorSource(source);
      for (const operator of operators) {
        current = applyOperator(current, operator);
      }
      return current;
    },
    rxTest(callback: (context: RxTestContext) => void | PromiseLike<void>): Promise<void> {
      return rxTest((context) => {
        const migratedContext = Object.create(context) as RxTestContext;
        Object.defineProperty(migratedContext, 'hot', {
          configurable: true,
          value: (...args: Parameters<typeof context.hot>) =>
            installSubjectObservableViewAdapter(context.hot(...args)),
        });
        if (mode !== 'cold') {
          Object.defineProperty(migratedContext, 'cold', {
            configurable: true,
            value: context.observable.bind(context),
          });
        }
        return callback(migratedContext);
      });
    },
  };

  for (const imported of testCase.imports) {
    installImport(runtime, imported, capabilities);
  }
  return runtime as PortRuntime;
}

function installSubjectObservableViewAdapter<T>(source: Observable<T>): Observable<T> {
  // RxJS 7 TestScheduler hot observables were Subjects. The framework-neutral
  // Next hot fixture is only subject-like, so retain this legacy method on the
  // fixture instance without patching the platform Observable prototype.
  Object.defineProperty(source, 'asObservable', {
    configurable: true,
    value: (): Observable<T> =>
      new Observable<T>((subscriber) => {
        source.subscribe(subscriber, { signal: subscriber.signal });
      }),
  });
  return source;
}

function createOperatorSource(source: unknown): Record<PropertyKey, (...args: unknown[]) => unknown> {
  const observableSource = source as {
    subscribe(observer: Subscriber<unknown>, options?: { readonly signal?: AbortSignal }): void;
  };
  return new Observable<unknown>((subscriber) => {
    observableSource.subscribe(subscriber, { signal: subscriber.signal });
  }) as unknown as Record<PropertyKey, (...args: unknown[]) => unknown>;
}

function installImport(
  runtime: Record<string, unknown>,
  imported: PortedImport,
  capabilities: Awaited<ReturnType<typeof loadCapabilities>>
): void {
  if (imported.usage === 'operator') {
    runtime[imported.local] = (...args: readonly unknown[]): OperatorDescriptor => ({
      name: imported.imported,
      args,
    });
    return;
  }
  if (imported.module === 'rxjs') {
    const factoryMapping =
      capabilityRegistry.staticFactories[imported.imported as keyof typeof capabilityRegistry.staticFactories];
    if (factoryMapping) {
      runtime[imported.local] = (...args: readonly unknown[]): unknown =>
        invokeStaticFactory(imported.imported, factoryMapping, args, capabilities);
      return;
    }
    const valueMapping = capabilityRegistry.values[imported.imported as keyof typeof capabilityRegistry.values];
    const value = capabilities.values[imported.imported];
    if (valueMapping?.adapter === 'standaloneSourcesArrayWithProjection') {
      runtime[imported.local] = (...args: readonly unknown[]) => invokeStandaloneSourcesArray(value, args);
    } else if (valueMapping?.adapter === 'behaviorSubjectConstructor') {
      runtime[imported.local] = createBehaviorSubjectConstructor(value);
    } else if (valueMapping?.adapter === 'replaySubjectConstructor') {
      runtime[imported.local] = createReplaySubjectConstructor(value);
    } else if (valueMapping?.adapter === 'operatorComposition') {
      runtime[imported.local] = (...operators: readonly OperatorDescriptor[]): OperatorDescriptor => ({
        name: composedOperatorName,
        args: operators,
      });
    } else if (valueMapping && 'method' in valueMapping && valueMapping.adapter === 'platformConsumer') {
      runtime[imported.local] = (source: unknown) => invokePlatformConsumer(valueMapping.method, source);
    } else {
      runtime[imported.local] = value;
    }
    return;
  }
  if (imported.module === 'chai' && imported.imported === 'expect') {
    runtime[imported.local] = portedExpect;
  }
}

function withObservableAssertionDisplay<T>(value: unknown, work: () => T): T {
  const ObservableConstructor = globalThis.Observable;
  if (
    typeof ObservableConstructor !== 'function' ||
    (typeof value !== 'object' && typeof value !== 'function') ||
    value === null ||
    !(value instanceof ObservableConstructor) ||
    chaiInspect in value
  ) {
    return work();
  }

  let displayTarget: object | null = value;
  while (displayTarget !== null && !Object.isExtensible(displayTarget)) {
    displayTarget = Object.getPrototypeOf(displayTarget);
  }
  if (displayTarget === null) {
    return work();
  }

  Object.defineProperty(displayTarget, chaiInspect, {
    configurable: true,
    enumerable: false,
    value: () => '[Observable]',
  });
  try {
    return work();
  } finally {
    Reflect.deleteProperty(displayTarget, chaiInspect);
  }
}

function assertCapabilityRegistry(capabilities: {
  readonly operators: SymbolMap;
  readonly staticFactories: StaticFactoryMap;
  readonly values: Readonly<Record<string, unknown>>;
}): void {
  for (const [name, mapping] of Object.entries(capabilityRegistry.operators)) {
    if (!(mapping.symbol in capabilities.operators)) {
      throw new Error(
        `Capability registry declares operators:${name} via ${mapping.symbol}, but the runtime loader does not provide that Symbol.`
      );
    }
  }
  for (const [name, mapping] of Object.entries(capabilityRegistry.staticFactories)) {
    if ('symbol' in mapping && !(mapping.symbol in capabilities.staticFactories)) {
      throw new Error(
        `Capability registry declares staticFactories:${name} via ${mapping.symbol}, but the runtime loader does not provide that Symbol.`
      );
    }
    if ('value' in mapping && !(mapping.value in capabilities.values)) {
      throw new Error(
        `Capability registry declares staticFactories:${name} via standalone value ${mapping.value}, but the runtime loader does not provide it.`
      );
    }
  }
  for (const name of Object.keys(capabilityRegistry.values)) {
    if (!(name in capabilities.values)) {
      throw new Error(`Capability registry declares values:${name}, but the runtime loader does not provide it.`);
    }
  }
}

function invokeStaticFactory(
  name: string,
  mapping: (typeof capabilityRegistry.staticFactories)[keyof typeof capabilityRegistry.staticFactories],
  args: readonly unknown[],
  capabilities: Awaited<ReturnType<typeof loadCapabilities>>
): unknown {
  if ('symbol' in mapping) {
    const symbol = capabilities.staticFactories[mapping.symbol];
    if (!symbol) {
      throw new Error(`Missing static factory Symbol capability: ${mapping.symbol}`);
    }
    const factory = (Observable as unknown as Record<PropertyKey, (...values: unknown[]) => unknown>)[symbol];
    if (typeof factory !== 'function') {
      throw new Error(`Static factory ${name} (via ${mapping.symbol}) is not installed on the active Observable.`);
    }
    return factory.call(Observable, ...adaptStaticFactoryArguments(mapping.adapter, args));
  }
  if ('value' in mapping) {
    if (name === 'empty' && args.length > 0) {
      throw new Error('Unsupported RxJS 7 empty(scheduler) overload: the current EMPTY singleton is unscheduled.');
    }
    return capabilities.values[mapping.value];
  }

  switch (mapping.adapter) {
    case 'defer':
      return new Observable((subscriber) => {
        let input: unknown;
        try {
          input = (args[0] as () => unknown)();
        } catch (error) {
          subscriber.error(error);
          return;
        }
        Observable.from(input as ObservableValue<unknown>).subscribe(subscriber, { signal: subscriber.signal });
      });
    case 'from':
      return Observable.from(args[0] as ObservableValue<unknown>);
    case 'fromEvent': {
      const target = args[0];
      if (!(target instanceof EventTarget)) {
        throw new Error('Unsupported RxJS 7 fromEvent target: the platform mapping requires an EventTarget.');
      }
      if (args.length > 3) {
        throw new Error('Unsupported RxJS 7 fromEvent fourth-argument result-selector overload.');
      }
      const options = args[2];
      if (typeof options === 'function') {
        throw new Error('Unsupported RxJS 7 fromEvent third-argument result-selector overload.');
      }
      const whenOptions = adaptFromEventOptions(options);
      const implementation = target.when;
      if (typeof implementation !== 'function') {
        throw new Error('The fromEvent platform mapping requires an EventTarget with when().');
      }
      const eventName = args[1];
      if (typeof eventName !== 'string') {
        throw new Error('Unsupported RxJS 7 fromEvent event name: EventTarget.when() requires a string.');
      }
      return implementation.call(target, eventName, whenOptions);
    }
    case 'iif':
      return new Observable((subscriber) => {
        let input: unknown;
        try {
          input = (args[0] as () => boolean)() ? args[1] : args[2];
        } catch (error) {
          subscriber.error(error);
          return;
        }
        Observable.from(input as ObservableValue<unknown>).subscribe(subscriber, { signal: subscriber.signal });
      });
    case 'of':
      return Observable.from(args);
    case 'pairs':
      return Observable.from(Object.entries(args[0] as object));
    case 'range': {
      const start = args.length > 1 ? Number(args[0]) : 0;
      const count = Number(args.length > 1 ? args[1] : args[0]);
      return Observable.from(Array.from({ length: Math.max(0, count) }, (_, index) => start + index));
    }
    case 'throwError':
      return new Observable((subscriber) => {
        const errorOrFactory = args[0];
        subscriber.error(typeof errorOrFactory === 'function' ? errorOrFactory() : errorOrFactory);
      });
    default:
      throw new Error(`Unknown platform factory capability adapter: ${mapping.adapter}`);
  }
}

function adaptStaticFactoryArguments(adapter: string, args: readonly unknown[]): readonly unknown[] {
  switch (adapter) {
    case 'identity':
      return args;
    case 'firstArgument':
      return args.length === 0 ? [] : [args[0]];
    case 'generate': {
      const options = args.length === 1 ? args[0] : undefined;
      if (
        (typeof options === 'object' &&
          options !== null &&
          'scheduler' in options &&
          (options as { readonly scheduler?: unknown }).scheduler !== undefined) ||
        isSchedulerLike(args.at(-1))
      ) {
        throw new Error('Unsupported RxJS 7 generate scheduler overload.');
      }
      return args;
    }
    case 'staticCombineLatest': {
      const values = withoutTrailingFunction(args);
      if (values.length === 1 && isSourceCollection(values[0])) {
        return [values[0]];
      }
      return [[...values]];
    }
    case 'staticSourcesArray':
      return [[...args]];
    case 'staticSourcesArrayOrSingleArray':
      return [[...sourcesFromArgs(args)]];
    case 'staticMerge': {
      const values = [...args];
      const concurrency = typeof values.at(-1) === 'number' ? (values.pop() as number) : undefined;
      return concurrency === undefined ? [values] : [values, { concurrency }];
    }
    case 'timer': {
      const due = args[0];
      const delay = due instanceof Date ? Math.max(0, +due - Date.now()) : due;
      return args.length > 1 && typeof args[1] === 'number' ? [delay, args[1]] : [delay];
    }
    default:
      throw new Error(`Unknown static factory capability adapter: ${adapter}`);
  }
}

function invokeStandaloneSourcesArray(value: unknown, args: readonly unknown[]): unknown {
  if (typeof value !== 'function') {
    throw new Error('Registered standalone source combiner is not callable.');
  }
  const values = withoutTrailingFunction(args);
  const sources = values.length === 1 && Array.isArray(values[0]) ? values[0] : values;
  return value(sources);
}

function createBehaviorSubjectConstructor(value: unknown): (initialValue: unknown) => unknown {
  if (typeof value !== 'function') {
    throw new Error('Registered behaviorSubject factory is not callable.');
  }
  return function BehaviorSubject(initialValue: unknown): unknown {
    return value(initialValue);
  };
}

function createReplaySubjectConstructor(
  value: unknown
): (bufferSize?: number, windowTime?: number, timestampProviderOrScheduler?: unknown) => unknown {
  if (typeof value !== 'function') {
    throw new Error('Registered replaySubject factory is not callable.');
  }
  return function ReplaySubject(
    bufferSize = Infinity,
    windowTime = Infinity,
    timestampProviderOrScheduler?: unknown
  ): unknown {
    if (timestampProviderOrScheduler !== undefined) {
      throw new Error('Unsupported RxJS 7 ReplaySubject timestamp-provider or scheduler constructor argument.');
    }
    return value({ size: bufferSize, maxAge: windowTime });
  };
}

function adaptFromEventOptions(options: unknown): { readonly capture?: boolean; readonly passive?: boolean } | undefined {
  if (options === undefined) {
    return undefined;
  }
  if (typeof options === 'boolean') {
    return { capture: options };
  }
  if (typeof options !== 'object' || options === null) {
    throw new Error('Unsupported RxJS 7 fromEvent options: expected a capture boolean or capture/passive options.');
  }
  if ('once' in options) {
    throw new Error('Unsupported RxJS 7 fromEvent once option: EventTarget.when() supports only capture and passive.');
  }
  const unsupportedKeys = Object.keys(options).filter((key) => key !== 'capture' && key !== 'passive');
  if (unsupportedKeys.length > 0) {
    throw new Error(
      `Unsupported RxJS 7 fromEvent option(s): ${unsupportedKeys.join(', ')}. EventTarget.when() supports only capture and passive.`
    );
  }
  const eventOptions = options as { readonly capture?: unknown; readonly passive?: unknown };
  return {
    capture: eventOptions.capture as boolean | undefined,
    passive: eventOptions.passive as boolean | undefined,
  };
}

function invokePlatformConsumer(method: string, source: unknown): unknown {
  const implementation = (source as Record<PropertyKey, unknown>)[method];
  if (typeof implementation !== 'function') {
    throw new Error(`Platform Observable consumer ${method} is not installed on the source.`);
  }
  return implementation.call(source);
}

function isSourceCollection(value: unknown): boolean {
  return Array.isArray(value) || (typeof value === 'object' && value !== null);
}

function adaptOperatorArguments(adapter: string, args: readonly unknown[]): readonly unknown[] {
  switch (adapter) {
    case 'identity':
      return args;
    case 'firstArgument':
      return args.length === 0 ? [] : [args[0]];
    case 'elementAt':
      return args;
    case 'endWith':
      if (isSchedulerLike(args.at(-1))) {
        throw new Error('Unsupported RxJS 7 endWith trailing SchedulerLike overload.');
      }
      return [[[...args]]];
    case 'expand':
      if (args[2] !== undefined || isSchedulerLike(args[1])) {
        throw new Error('Unsupported RxJS 7 expand scheduler overload.');
      }
      return args[1] === undefined ? [args[0]] : [args[0], { concurrent: args[1] }];
    case 'startWith':
      if (isSchedulerLike(args.at(-1))) {
        throw new Error('Unsupported RxJS 7 startWith trailing SchedulerLike overload.');
      }
      return args;
    case 'first':
      if (args.length > 0) {
        throw new Error('Unsupported RxJS 7 first predicate/default-value overload.');
      }
      return [0];
    case 'ignoreElements':
      return [() => Observable.from([])];
    case 'last':
      if (args.length > 0) {
        throw new Error('Unsupported RxJS 7 last predicate/default-value overload.');
      }
      return [1];
    case 'mapTo':
      return [() => Observable.from([args[0]])];
    case 'audit':
      return [args[0], { leading: false, trailing: true, restartOnTrailing: false }];
    case 'auditTime':
      return [args[0], { leading: false, trailing: true, restartOnTrailing: false }];
    case 'buffer':
      return [
        {
          delay: () => args[0],
          emitEmpty: true,
          emitRemainingOnError: false,
          restartDelay: false,
        },
      ];
    case 'bufferCount':
      return [
        {
          maxSize: args[0],
          startEvery: args[1] ?? args[0],
          emitRemainingOnError: false,
        },
      ];
    case 'bufferTime':
      return [{ delay: args[0], maxSize: args[2] ?? Infinity, emitEmpty: true }];
    case 'bufferWhen':
      return [{ delay: args[0], emitEmpty: true, emitRemainingOnError: false }];
    case 'sourcesArray':
      return [[...args]];
    case 'sourcesArrayOrSingleArray':
      return [[...sourcesFromArgs(args)]];
    case 'sourcesArrayWithProjection':
      return [[...withoutTrailingFunction(args)]];
    case 'withLatestFromSourcesArrayWithProjection': {
      const projection = typeof args.at(-1) === 'function' ? args.at(-1) : undefined;
      const sources = [...withoutTrailingFunction(args)];
      return projection === undefined ? [sources] : [sources, projection];
    }
    case 'mergeSources': {
      const values = [...args];
      const concurrency = typeof values.at(-1) === 'number' ? (values.pop() as number) : undefined;
      return concurrency === undefined ? [values] : [values, { concurrency }];
    }
    case 'flattenIdentity':
      return [(value: unknown) => value];
    case 'concatAll':
      return [(value: unknown) => value, { concurrent: 1 }];
    case 'concatMap':
      return [args[0], { concurrent: 1 }];
    case 'concatMapTo':
      return [() => args[0], { concurrent: 1 }];
    case 'mergeAll':
      return [
        (value: unknown) => value,
        {
          concurrent: typeof args[0] === 'number' ? args[0] : Infinity,
        },
      ];
    case 'mergeMap': {
      const concurrent = numericConcurrency(args, 1, 2);
      return concurrent === undefined ? [args[0]] : [args[0], { concurrent }];
    }
    case 'mergeMapTo': {
      const concurrent = numericConcurrency(args, 1, 2);
      return concurrent === undefined ? [() => args[0]] : [() => args[0], { concurrent }];
    }
    case 'switchMapTo':
      return [() => args[0]];
    case 'takeWhile':
      return args[1] ? [args[0], { includeLast: true }] : [args[0]];
    case 'sequenceEqual':
      return args;
    case 'throttleTime':
      return args[2] === undefined ? [args[0]] : [args[0], args[2]];
    case 'countOrConfig':
      return typeof args[0] === 'number' ? [{ count: args[0] }] : args;
    case 'retryCountOrConfig': {
      const config = typeof args[0] === 'number' ? { count: args[0] } : args[0];
      if (config === undefined) {
        return [{ resetOnSuccess: false }];
      }
      if (typeof config !== 'object' || config === null) {
        return args;
      }
      return [
        {
          ...config,
          resetOnSuccess: (config as { readonly resetOnSuccess?: boolean }).resetOnSuccess ?? false,
        },
      ];
    }
    case 'timeout':
      return adaptTimeoutArguments(args);
    case 'timeoutWith': {
      const due = args[0];
      const config = timeoutDueConfig(due);
      return [{ ...config, with: () => args[1], meta: null }];
    }
    case 'toArray':
      return [{ emitEmpty: true, emitRemainingOnError: false }];
    default:
      throw new Error(`Unknown operator capability adapter: ${adapter}`);
  }
}

function withoutTrailingFunction(args: readonly unknown[]): readonly unknown[] {
  return typeof args.at(-1) === 'function' ? args.slice(0, -1) : args;
}

function sourcesFromArgs(args: readonly unknown[]): readonly unknown[] {
  return args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
}

function isSchedulerLike(value: unknown): value is { readonly schedule: (...args: readonly unknown[]) => unknown } {
  return typeof value === 'object' && value !== null && typeof (value as { readonly schedule?: unknown }).schedule === 'function';
}

function numericConcurrency(args: readonly unknown[], ...indexes: readonly number[]): number | undefined {
  for (const index of indexes) {
    if (typeof args[index] === 'number') {
      return args[index];
    }
  }
  return undefined;
}

function adaptTimeoutArguments(args: readonly unknown[]): readonly unknown[] {
  const dueOrConfig = args[0];
  if (typeof dueOrConfig === 'number' || dueOrConfig instanceof Date) {
    return [{ ...timeoutDueConfig(dueOrConfig), meta: null }];
  }
  return args;
}

function timeoutDueConfig(due: unknown): { readonly each?: number; readonly first?: Date } {
  return due instanceof Date ? { first: due } : { each: due as number };
}
