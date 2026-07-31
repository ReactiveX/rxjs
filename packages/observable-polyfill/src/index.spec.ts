import { afterAll, describe, it, expect, vi, beforeAll } from 'vitest';

const _OriginalObservable = globalThis.Observable;
if (_OriginalObservable != null) {
  globalThis.Observable = undefined!;
}
const _EventTargetWhen = EventTarget.prototype.when;
if (_EventTargetWhen != null) {
  EventTarget.prototype.when = undefined!;
}
const _OriginalSubscriber = globalThis.Subscriber;

beforeAll(async () => {
  await import('./index.js');
});

afterAll(() => {
  globalThis.Observable = _OriginalObservable;
  globalThis.Subscriber = _OriginalSubscriber;
  EventTarget.prototype.when = _EventTargetWhen;
});

describe('Observable', () => {
  it('exists in global scope', () => {
    expect(typeof globalThis.Observable).toBe('function');
  });

  it('does observable things', () => {
    const results: (string | number)[] = [];

    const source = new Observable<number>((subscriber) => {
      results.push('subscribe');
      subscriber.addTeardown(() => {
        results.push('teardown');
      });

      subscriber.signal.addEventListener(
        'abort',
        () => {
          results.push('abort');
        },
        { once: true }
      );

      subscriber.next(1);
      subscriber.next(2);
      subscriber.complete();
    });

    source.subscribe({
      next: (value) => results.push(value),
      complete: () => results.push('complete'),
    });

    expect(results).toEqual(['subscribe', 1, 2, 'abort', 'teardown', 'complete']);
  });

  it('requires Subscriber.next to receive an argument', () => {
    let subscriber: Subscriber<void> | undefined;
    const source = new Observable<void>((currentSubscriber) => {
      subscriber = currentSubscriber;
    });

    source.subscribe();

    expect(() => (subscriber!.next as () => void)()).toThrow(
      new TypeError('Subscriber.next requires a value')
    );

    subscriber!.complete();

    expect(() => (subscriber!.next as () => void)()).toThrow(
      new TypeError('Subscriber.next requires a value')
    );
  });

  it('emits undefined when a void Subscriber receives explicit undefined', () => {
    const results: void[] = [];
    const source = new Observable<void>((subscriber) => {
      subscriber.next(undefined);
      subscriber.complete();
    });

    source.subscribe((value) => results.push(value));

    expect(results).toEqual([undefined]);
  });

  it('handles errors correctly', () => {
    const results: (string | number)[] = [];
    const error = new Error('Test error');

    const source = new Observable<number>((subscriber) => {
      results.push('subscribe');
      subscriber.addTeardown(() => {
        results.push('teardown');
      });

      subscriber.signal.addEventListener(
        'abort',
        () => {
          results.push('abort');
        },
        { once: true }
      );

      subscriber.error(error);
    });

    source.subscribe({
      next: (value) => results.push(value),
      error: (err) => results.push(err.message),
      complete: () => results.push('complete'),
    });

    expect(results).toEqual(['subscribe', 'abort', 'teardown', 'Test error']);
  });
});

describe('EventTarget.prototype.when', () => {
  it('should push events through an observable', () => {
    const results: (string | number)[] = [];
    const target = new EventTarget();
    const addEventListenerSpy = vi.spyOn(target, 'addEventListener');
    const controller = new AbortController();

    target
      .when('foo')
      .map((_, index) => index)
      .finally(() => results.push('finally'))
      .subscribe(
        {
          next: (value) => results.push(value),
          complete: () => results.push('complete'),
        },
        { signal: controller.signal }
      );

    target.dispatchEvent(new Event('foo'));
    target.dispatchEvent(new Event('foo'));
    target.dispatchEvent(new Event('foo'));

    controller.abort();

    target.dispatchEvent(new Event('foo'));

    expect(results).toEqual([0, 1, 2, 'finally']);
    expect(addEventListenerSpy).toHaveBeenCalledTimes(1);
  });
});
