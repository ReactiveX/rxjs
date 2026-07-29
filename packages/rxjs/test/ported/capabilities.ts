import { expect as chaiExpect } from 'chai';
import type { RxTestContext } from '../../../test/src/index.js';
import capabilityRegistry from './capability-registry.json' with { type: 'json' };
import type { PortedImport, PortedMarbleCase, PortMode } from './types.js';

interface OperatorDescriptor {
  readonly name: string;
  readonly args: readonly unknown[];
}

const composedOperatorName = '\0rxjs7-pipe';

type SymbolMap = Readonly<Record<string, symbol>>;
type StaticFactoryMap = Readonly<Record<string, symbol>>;

export interface PortRuntime {
  readonly [name: string]: unknown;
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
    behaviorSubjectModule,
    bufferModule,
    coldObservableModule,
    combineLatestModule,
    concatModule,
    debounceModule,
    defaultIfEmptyModule,
    elementAtModule,
    emptyModule,
    exhaustMapModule,
    intervalModule,
    mergeModule,
    mergeMapModule,
    neverModule,
    onErrorResumeNextModule,
    pipeModule,
    raceModule,
    replaySubjectModule,
    repeatModule,
    retryModule,
    scanModule,
    sequenceEqualModule,
    skipLastModule,
    skipWhileModule,
    subjectModule,
    switchMapModule,
    takeLastModule,
    takeWhileModule,
    throttleModule,
    timeoutModule,
    timerModule,
    withLatestFromModule,
    zipModule,
  ] = await Promise.all([
    import('../../src/animation-frames.js'),
    import('../../src/behavior-subject.js'),
    import('../../src/buffer.js'),
    import('../../src/cold-observable.js'),
    import('../../src/combine-latest.js'),
    import('../../src/concat.js'),
    import('../../src/debounce.js'),
    import('../../src/default-if-empty.js'),
    import('../../src/element-at.js'),
    import('../../src/empty.js'),
    import('../../src/exhaust-map.js'),
    import('../../src/interval.js'),
    import('../../src/merge.js'),
    import('../../src/merge-map.js'),
    import('../../src/never.js'),
    import('../../src/on-error-resume-next.js'),
    import('../../src/pipe.js'),
    import('../../src/race.js'),
    import('../../src/replay-subject.js'),
    import('../../src/repeat.js'),
    import('../../src/retry.js'),
    import('../../src/scan.js'),
    import('../../src/sequence-equal.js'),
    import('../../src/skip-last.js'),
    import('../../src/skip-while.js'),
    import('../../src/subject.js'),
    import('../../src/switch-map.js'),
    import('../../src/take-last.js'),
    import('../../src/take-while.js'),
    import('../../src/throttle.js'),
    import('../../src/timeout.js'),
    import('../../src/timer.js'),
    import('../../src/with-latest-from.js'),
    import('../../src/zip.js'),
  ]);

  const capabilities = {
    operators: {
      buffer: bufferModule.buffer,
      combineLatest: combineLatestModule.combineLatest,
      concat: concatModule.concat,
      debounce: debounceModule.debounce,
      defaultIfEmpty: defaultIfEmptyModule.defaultIfEmpty,
      elementAt: elementAtModule.elementAt,
      exhaustMap: exhaustMapModule.exhaustMap,
      merge: mergeModule.merge,
      mergeMap: mergeMapModule.mergeMap,
      onErrorResumeNext: onErrorResumeNextModule.onErrorResumeNext,
      race: raceModule.race,
      repeat: repeatModule.repeat,
      retry: retryModule.retry,
      scan: scanModule.scan,
      sequenceEqual: sequenceEqualModule.sequenceEqual,
      skipLast: skipLastModule.skipLast,
      skipWhile: skipWhileModule.skipWhile,
      switchMap: switchMapModule.switchMap,
      takeLast: takeLastModule.takeLast,
      takeWhile: takeWhileModule.takeWhile,
      throttle: throttleModule.throttle,
      timeout: timeoutModule.timeout,
      withLatestFrom: withLatestFromModule.withLatestFrom,
    },
    staticFactories: {
      animationFrames: animationFramesModule.animationFrames,
      combineLatest: combineLatestModule.combineLatest,
      concat: concatModule.concat,
      interval: intervalModule.interval,
      merge: mergeModule.merge,
      onErrorResumeNext: onErrorResumeNextModule.onErrorResumeNext,
      race: raceModule.race,
      timer: timerModule.timer,
    },
    values: {
      BehaviorSubject: behaviorSubjectModule.behaviorSubject,
      ColdObservable: coldObservableModule.ColdObservable,
      EMPTY: emptyModule.EMPTY,
      firstValueFrom: 'first',
      lastValueFrom: 'last',
      NEVER: neverModule.NEVER,
      Observable,
      pipe: pipeModule.pipe,
      ReplaySubject: replaySubjectModule.replaySubject,
      Subject: subjectModule.Subject,
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
    expect: chaiExpect,
    applyOperators(source: unknown, operators: readonly OperatorDescriptor[]): unknown {
      let current = createOperatorSource(source);
      for (const operator of operators) {
        current = applyOperator(current, operator);
      }
      return current;
    },
    rxTest(callback: (context: RxTestContext) => void | PromiseLike<void>): Promise<void> {
      return rxTest((context) => {
        if (mode === 'cold') {
          return callback(context);
        }
        const platformContext = Object.create(context) as RxTestContext;
        Object.defineProperty(platformContext, 'cold', {
          configurable: true,
          value: context.observable.bind(context),
        });
        return callback(platformContext);
      });
    },
  };

  for (const imported of testCase.imports) {
    installImport(runtime, imported, capabilities);
  }
  return runtime as PortRuntime;
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
    runtime[imported.local] = chaiExpect;
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
      return [args[0], { leading: false, trailing: true }];
    case 'auditTime':
      return [args[0], { leading: false, trailing: true }];
    case 'buffer':
      return [{ delay: () => args[0], emitEmpty: true }];
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
    case 'sequenceEqual':
      if (args.length > 1) {
        throw new Error('Unsupported RxJS 7 sequenceEqual comparator overload.');
      }
      return args;
    case 'throttleTime':
      return args[2] === undefined ? [args[0]] : [args[0], args[2]];
    case 'countOrConfig':
      return typeof args[0] === 'number' ? [{ count: args[0] }] : args;
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
