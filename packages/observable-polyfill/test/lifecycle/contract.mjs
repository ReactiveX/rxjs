export const observableLifecycleCaseNames = Object.freeze([
  'shared producer, abort, teardown, and restart',
  'completion lifecycle',
  'error lifecycle',
  'synchronous reentrancy',
  'thrown observer callbacks',
]);

/**
 * Runs the package-independent lifecycle contract against one already selected
 * platform Observable constructor.
 *
 * Keep this function self-contained. The native-browser runner serializes it
 * into a disposable browser realm so the exact same assertions exercise the
 * browser constructor and the packaged fallback.
 */
export async function runObservableLifecycleContract({ ObservableCtor, captureReportedErrors }) {
  const completedCases = [];

  const assert = (condition, message) => {
    if (!condition) {
      throw new Error(message);
    }
  };

  const equal = (actual, expected, message) => {
    assert(Object.is(actual, expected), `${message}: expected ${String(expected)}, got ${String(actual)}`);
  };

  const deepEqual = (actual, expected, message) => {
    const actualJson = JSON.stringify(actual);
    const expectedJson = JSON.stringify(expected);
    assert(actualJson === expectedJson, `${message}: expected ${expectedJson}, got ${actualJson}`);
  };

  const runCase = async (name, callback) => {
    await callback();
    completedCases.push(name);
  };

  assert(typeof ObservableCtor === 'function', 'The selected Observable constructor is not callable');
  assert(typeof captureReportedErrors === 'function', 'The reported-error capture adapter is missing');

  await runCase('shared producer, abort, teardown, and restart', () => {
    const events = [];
    const firstValues = [];
    const secondValues = [];
    let activations = 0;
    let activeSubscriber;

    const source = new ObservableCtor((subscriber) => {
      const activation = ++activations;
      activeSubscriber = subscriber;
      events.push(`activate ${activation}`);
      subscriber.addTeardown(() => {
        assert(subscriber.signal.aborted, `activation ${activation} first teardown ran before abort`);
        events.push(`teardown first ${activation}`);
      });
      subscriber.addTeardown(() => {
        assert(subscriber.signal.aborted, `activation ${activation} second teardown ran before abort`);
        events.push(`teardown second ${activation}`);
      });
    });

    const first = new AbortController();
    const second = new AbortController();
    source.subscribe((value) => firstValues.push(value), { signal: first.signal });

    equal(activations, 1, 'the first observer did not create exactly one producer');
    const firstActivation = activeSubscriber;
    firstActivation.next('before late join');

    source.subscribe((value) => secondValues.push(value), { signal: second.signal });
    equal(activations, 1, 'a concurrent observer created another producer');
    equal(activeSubscriber, firstActivation, 'a concurrent observer did not join the active subscriber');
    firstActivation.next('after late join');

    deepEqual(firstValues, ['before late join', 'after late join'], 'the first observer received the wrong values');
    deepEqual(secondValues, ['after late join'], 'the late observer replayed or missed active values');

    first.abort('first observer left');
    assert(!firstActivation.signal.aborted, 'one observer abort closed producer work while another observer remained');
    firstActivation.next('remaining observer');
    deepEqual(firstValues, ['before late join', 'after late join'], 'an aborted observer received another value');
    deepEqual(secondValues, ['after late join', 'remaining observer'], 'the remaining observer lost producer work');
    deepEqual(events, ['activate 1'], 'individual abort ran producer teardown');

    second.abort('last observer left');
    assert(firstActivation.signal.aborted, 'last-observer abort did not close the active subscriber');
    deepEqual(events, ['activate 1', 'teardown second 1', 'teardown first 1'], 'teardowns did not run once in reverse registration order');

    firstActivation.addTeardown(() => events.push('late teardown 1'));
    deepEqual(
      events,
      ['activate 1', 'teardown second 1', 'teardown first 1', 'late teardown 1'],
      'a teardown registered after closure did not run immediately'
    );

    const restarted = new AbortController();
    const restartedValues = [];
    source.subscribe((value) => restartedValues.push(value), { signal: restarted.signal });
    equal(activations, 2, 'subscription after ref-count closure did not restart the producer');
    assert(activeSubscriber !== firstActivation, 'restart reused the closed subscriber');
    activeSubscriber.next('restarted');
    deepEqual(restartedValues, ['restarted'], 'the restarted observer did not receive its new producer value');

    restarted.abort('restart observer left');
    deepEqual(
      events,
      ['activate 1', 'teardown second 1', 'teardown first 1', 'late teardown 1', 'activate 2', 'teardown second 2', 'teardown first 2'],
      'the restarted producer did not close through the same lifecycle'
    );
  });

  await runCase('completion lifecycle', () => {
    const events = [];
    let producerSubscriber;
    const source = new ObservableCtor((subscriber) => {
      producerSubscriber = subscriber;
      events.push('producer');
      subscriber.addTeardown(() => {
        assert(subscriber.signal.aborted, 'completion teardown ran before the producer signal aborted');
        events.push('teardown first');
      });
      subscriber.addTeardown(() => events.push('teardown second'));
      subscriber.next('value');
      subscriber.complete();
      subscriber.next('ignored');
      subscriber.complete();
    });

    source.subscribe({
      next: (value) => events.push(`next ${value}`),
      complete: () => events.push('complete'),
    });

    assert(producerSubscriber.signal.aborted, 'completion left the producer signal active');
    deepEqual(
      events,
      ['producer', 'next value', 'teardown second', 'teardown first', 'complete'],
      'completion did not close before notifying the observer'
    );
  });

  await runCase('error lifecycle', () => {
    const failure = new Error('source failure');
    const events = [];
    let producerSubscriber;
    let receivedError;
    const source = new ObservableCtor((subscriber) => {
      producerSubscriber = subscriber;
      subscriber.addTeardown(() => {
        assert(subscriber.signal.aborted, 'error teardown ran before the producer signal aborted');
        events.push('teardown first');
      });
      subscriber.addTeardown(() => events.push('teardown second'));
      subscriber.error(failure);
      subscriber.next('ignored');
      subscriber.complete();
    });

    source.subscribe({
      error: (error) => {
        receivedError = error;
        events.push('error');
      },
    });

    assert(producerSubscriber.signal.aborted, 'error left the producer signal active');
    equal(receivedError, failure, 'the observer did not receive the producer error');
    deepEqual(events, ['teardown second', 'teardown first', 'error'], 'error did not close before notifying the observer');
  });

  await runCase('synchronous reentrancy', () => {
    const events = [];
    let producerSubscriber;
    const source = new ObservableCtor((subscriber) => {
      producerSubscriber = subscriber;
    });

    source.subscribe((value) => {
      events.push(`first ${value}`);
      if (value === 1) {
        producerSubscriber.next(2);
      }
    });
    source.subscribe((value) => events.push(`second ${value}`));

    producerSubscriber.next(1);
    deepEqual(events, ['first 1', 'first 2', 'second 2', 'second 1'], 'synchronous reentrancy did not use stable observer snapshots');
    producerSubscriber.complete();
  });

  await runCase('thrown observer callbacks', async () => {
    const nextFailure = new Error('next callback failure');
    const nextValues = [];
    let nextSubscriber;
    const nextSource = new ObservableCtor((subscriber) => {
      nextSubscriber = subscriber;
    });
    nextSource.subscribe(() => {
      throw nextFailure;
    });
    nextSource.subscribe((value) => nextValues.push(value));

    const nextReports = await captureReportedErrors(() => nextSubscriber.next('value'));
    equal(nextReports.length, 1, 'a thrown next callback was not reported exactly once');
    assert(nextReports[0] != null, 'a thrown next callback produced an empty host report');
    deepEqual(nextValues, ['value'], 'a thrown next callback prevented a sibling observer from running');
    assert(nextSubscriber.active, 'a thrown next callback closed the producer');
    nextSubscriber.complete();

    const errorFailure = new Error('error callback failure');
    const sourceFailure = new Error('source failure');
    const siblingErrors = [];
    let errorSubscriber;
    const errorSource = new ObservableCtor((subscriber) => {
      errorSubscriber = subscriber;
    });
    errorSource.subscribe({
      error: () => {
        throw errorFailure;
      },
    });
    errorSource.subscribe({ error: (error) => siblingErrors.push(error) });

    const errorReports = await captureReportedErrors(() => errorSubscriber.error(sourceFailure));
    equal(errorReports.length, 1, 'a thrown error callback was not reported exactly once');
    assert(errorReports[0] != null, 'a thrown error callback produced an empty host report');
    equal(siblingErrors.length, 1, 'a thrown error callback prevented a sibling observer from running');
    equal(siblingErrors[0], sourceFailure, 'a sibling observer received the wrong source error');

    const completeFailure = new Error('complete callback failure');
    const siblingCompletions = [];
    let completeSubscriber;
    const completeSource = new ObservableCtor((subscriber) => {
      completeSubscriber = subscriber;
    });
    completeSource.subscribe({
      complete: () => {
        throw completeFailure;
      },
    });
    completeSource.subscribe({ complete: () => siblingCompletions.push('complete') });

    const completeReports = await captureReportedErrors(() => completeSubscriber.complete());
    equal(completeReports.length, 1, 'a thrown complete callback was not reported exactly once');
    assert(completeReports[0] != null, 'a thrown complete callback produced an empty host report');
    deepEqual(siblingCompletions, ['complete'], 'a thrown complete callback prevented a sibling observer from running');
  });

  return completedCases;
}
