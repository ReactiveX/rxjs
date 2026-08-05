export const extensionKernelCaseNames = Object.freeze([
  'installation and platform overlap',
  'map and scan semantics',
  'shared activation and restart',
  'switchMap cancellation',
  'timeout cancellation and recovery',
  'timer factory',
  'Symbol pipe composition',
  'compatible subclass construction',
]);

export async function runExtensionKernelContract({ ObservableCtor, platformMap, symbols }) {
  const completedCases = [];

  const fail = (message) => {
    throw new Error(message);
  };
  const assert = (condition, message) => {
    if (!condition) {
      fail(message);
    }
  };
  const assertEqual = (actual, expected, message) => {
    if (actual !== expected) {
      fail(`${message}: expected ${String(expected)}, received ${String(actual)}`);
    }
  };
  const assertDeepEqual = (actual, expected, message) => {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      fail(`${message}: expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`);
    }
  };
  const completeCase = (name) => completedCases.push(name);
  const collect = (source) =>
    new Promise((resolve, reject) => {
      const values = [];
      source.subscribe({
        next: (value) => values.push(value),
        error: reject,
        complete: () => resolve(values),
      });
    });
  const fromValues = (...values) =>
    new ObservableCtor((subscriber) => {
      for (const value of values) {
        subscriber.next(value);
      }
      subscriber.complete();
    });
  const controllable = () => {
    let subscriber;
    let activations = 0;
    let teardowns = 0;
    const observable = new ObservableCtor((nextSubscriber) => {
      activations++;
      subscriber = nextSubscriber;
      nextSubscriber.addTeardown(() => teardowns++);
    });
    return {
      observable,
      get subscriber() {
        assert(subscriber, 'The controllable Observable is not active');
        return subscriber;
      },
      get activations() {
        return activations;
      },
      get teardowns() {
        return teardowns;
      },
    };
  };

  for (const symbol of Object.values(symbols)) {
    assertEqual(Symbol.keyFor(symbol), undefined, `${symbol.description} must use an exact Symbol`);
  }
  for (const symbol of [symbols.map, symbols.pipe, symbols.scan, symbols.switchMap, symbols.timeout]) {
    const descriptor = Object.getOwnPropertyDescriptor(ObservableCtor.prototype, symbol);
    assert(descriptor, `Missing instance ${symbol.description} descriptor`);
    assertDeepEqual(
      { configurable: descriptor.configurable, enumerable: descriptor.enumerable, writable: descriptor.writable },
      { configurable: true, enumerable: true, writable: true },
      `Wrong instance ${symbol.description} descriptor`
    );
  }
  for (const symbol of [symbols.pipe, symbols.timer]) {
    const descriptor = Object.getOwnPropertyDescriptor(ObservableCtor, symbol);
    assert(descriptor, `Missing static ${symbol.description} descriptor`);
    assertDeepEqual(
      { configurable: descriptor.configurable, enumerable: descriptor.enumerable, writable: descriptor.writable },
      { configurable: true, enumerable: true, writable: true },
      `Wrong static ${symbol.description} descriptor`
    );
  }
  assertEqual(ObservableCtor.prototype.map, platformMap, 'The platform map method changed');
  assert(!Object.hasOwn(ObservableCtor.prototype, 'scan'), 'RxJS installed string-named scan');
  assert(!Object.hasOwn(ObservableCtor.prototype, 'pipe'), 'RxJS installed string-named pipe');
  assert(!Object.hasOwn(ObservableCtor, 'timer'), 'RxJS installed string-named timer');
  completeCase('installation and platform overlap');

  const offset = 10;
  const mapped = await collect(fromValues(1, 2, 3)[symbols.map]((value, index) => offset + value + index));
  assertDeepEqual(mapped, [11, 13, 15], 'RxJS map index behavior changed');
  const scanned = await collect(fromValues(1, 2, 3)[symbols.scan]((total, value) => total + value, 0));
  assertDeepEqual(scanned, [1, 3, 6], 'RxJS scan behavior changed');
  completeCase('map and scan semantics');

  const sharedSource = controllable();
  let projections = 0;
  const sharedMap = sharedSource.observable[symbols.map]((value, index) => {
    projections++;
    return `${index}:${value}`;
  });
  const firstValues = [];
  const secondValues = [];
  const firstController = new AbortController();
  const secondController = new AbortController();
  sharedMap.subscribe((value) => firstValues.push(value), { signal: firstController.signal });
  sharedMap.subscribe((value) => secondValues.push(value), { signal: secondController.signal });
  sharedSource.subscriber.next(1);
  firstController.abort();
  sharedSource.subscriber.next(2);
  secondController.abort();
  assertEqual(sharedSource.activations, 1, 'Concurrent map observers did not share one source activation');
  assertEqual(projections, 2, 'Concurrent map observers duplicated projection work');
  assertDeepEqual(firstValues, ['0:1'], 'The first map observer received the wrong values');
  assertDeepEqual(secondValues, ['0:1', '1:2'], 'The second map observer received the wrong values');
  assertEqual(sharedSource.teardowns, 1, 'Last-observer cancellation did not close the shared source');
  const restartedValues = [];
  const restartController = new AbortController();
  sharedMap.subscribe((value) => restartedValues.push(value), { signal: restartController.signal });
  sharedSource.subscriber.next(3);
  restartController.abort();
  assertEqual(sharedSource.activations, 2, 'Map did not restart source work after ref-count closure');
  assertDeepEqual(restartedValues, ['0:3'], 'Map did not reset state on restart');
  completeCase('shared activation and restart');

  const outer = controllable();
  const firstInner = controllable();
  const secondInner = controllable();
  const switchedValues = [];
  outer.observable[symbols.switchMap]((inner) => inner).subscribe({
    next: (value) => switchedValues.push(value),
    complete: () => switchedValues.push('complete'),
  });
  outer.subscriber.next(firstInner.observable);
  firstInner.subscriber.next('first');
  outer.subscriber.next(secondInner.observable);
  assertEqual(firstInner.subscriber.active, false, 'switchMap did not cancel the preceding inner');
  secondInner.subscriber.next('second');
  outer.subscriber.complete();
  assertDeepEqual(switchedValues, ['first', 'second'], 'switchMap completed before its active inner');
  secondInner.subscriber.complete();
  assertDeepEqual(switchedValues, ['first', 'second', 'complete'], 'switchMap did not complete after its active inner');
  completeCase('switchMap cancellation');

  const timeoutEvents = [];
  const timeoutSource = new ObservableCtor((subscriber) => {
    subscriber.addTeardown(() => timeoutEvents.push('source teardown'));
  });
  const timeoutValues = await collect(
    timeoutSource[symbols.timeout]({
      first: 0,
      with: () => {
        timeoutEvents.push('fallback');
        return [9];
      },
    })
  );
  assertDeepEqual(timeoutValues, [9], 'timeout recovery produced the wrong values');
  assertDeepEqual(timeoutEvents, ['source teardown', 'fallback'], 'timeout did not cancel source work before recovery');
  completeCase('timeout cancellation and recovery');

  assertDeepEqual(await collect(ObservableCtor[symbols.timer](0)), [0], 'timer did not emit one zero value');
  completeCase('timer factory');

  const instancePipe = fromValues(1, 2, 3)[symbols.pipe](
    (source) => source[symbols.map]((value) => value * 2),
    (source) => source[symbols.scan]((total, value) => total + value, 0)
  );
  assertDeepEqual(await collect(instancePipe), [2, 6, 12], 'Instance Symbol pipe composed incorrectly');
  const staticPipe = ObservableCtor[symbols.pipe]([1, 2], (source) => source[symbols.map]((value) => String(value)));
  assertDeepEqual(await collect(staticPipe), ['1', '2'], 'Static Symbol pipe composed incorrectly');
  completeCase('Symbol pipe composition');

  class DerivedObservable extends ObservableCtor {}
  const derivedSource = new DerivedObservable((subscriber) => {
    subscriber.next(1);
    subscriber.complete();
  });
  const derivedMap = derivedSource[symbols.map]((value) => value + 1);
  const derivedTimer = DerivedObservable[symbols.timer](0);
  assert(derivedMap instanceof DerivedObservable, 'Instance creation did not preserve a compatible subclass');
  assert(derivedTimer instanceof DerivedObservable, 'Static creation did not preserve a compatible subclass');
  assertDeepEqual(await collect(derivedMap), [2], 'The compatible subclass map emitted the wrong value');
  assertDeepEqual(await collect(derivedTimer), [0], 'The compatible subclass timer emitted the wrong value');
  completeCase('compatible subclass construction');

  return completedCases;
}
