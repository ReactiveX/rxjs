import { describe, expect, it } from 'vitest';
import '@rxjs/observable-polyfill';
import { onErrorResumeNext } from './on-error-resume-next.js';

describe('onErrorResumeNext', () => {
  it('advances static sources on completion and error, then completes', () => {
    const results: Array<string | 'complete'> = [];
    const first = new Observable<string>((subscriber) => {
      subscriber.next('first');
      subscriber.complete();
    });
    const second = new Observable<string>((subscriber) => {
      subscriber.next('second');
      subscriber.error(new Error('ignored'));
    });

    Observable[onErrorResumeNext]([first, second]).subscribe({
      next: (value) => results.push(value),
      complete: () => results.push('complete'),
    });

    expect(results).toEqual(['first', 'second', 'complete']);
  });

  it('includes the instance receiver before configured sources and preserves its constructor', () => {
    class CustomObservable<T> extends Observable<T> {}

    const results: Array<string | 'complete'> = [];
    const source = new CustomObservable<string>((subscriber) => {
      subscriber.next('source');
      subscriber.complete();
    });
    const nextSource = new Observable<string>((subscriber) => {
      subscriber.next('next');
      subscriber.complete();
    });
    const resumed = source[onErrorResumeNext]([nextSource]);

    resumed.subscribe({
      next: (value) => results.push(value),
      complete: () => results.push('complete'),
    });

    expect(resumed).toBeInstanceOf(CustomObservable);
    expect(results).toEqual(['source', 'next', 'complete']);
  });

  it('does not advance while the current source remains active', () => {
    let sourceSubscriber: Subscriber<string> | undefined;
    let nextSourceActivations = 0;
    const results: string[] = [];
    const source = new Observable<string>((subscriber) => {
      sourceSubscriber = subscriber;
    });
    const nextSource = new Observable<string>(() => {
      nextSourceActivations++;
    });

    source[onErrorResumeNext]([nextSource]).subscribe((value) => results.push(value));
    sourceSubscriber?.next('source');

    expect(results).toEqual(['source']);
    expect(nextSourceActivations).toBe(0);
  });

  it('shares source work and cancels the active input when the last observer aborts', () => {
    let sourceSubscriber: Subscriber<string> | undefined;
    let nextSubscriber: Subscriber<string> | undefined;
    let sourceActivations = 0;
    let nextActivations = 0;
    let sourceTeardowns = 0;
    let nextTeardowns = 0;
    const source = new Observable<string>((subscriber) => {
      sourceActivations++;
      sourceSubscriber = subscriber;
      subscriber.addTeardown(() => {
        sourceTeardowns++;
      });
    });
    const nextSource = new Observable<string>((subscriber) => {
      nextActivations++;
      nextSubscriber = subscriber;
      subscriber.addTeardown(() => {
        nextTeardowns++;
      });
    });
    const resumed = source[onErrorResumeNext]([nextSource]);
    const firstController = new AbortController();
    const secondController = new AbortController();
    const firstResults: string[] = [];
    const secondResults: string[] = [];

    resumed.subscribe((value) => firstResults.push(value), { signal: firstController.signal });
    resumed.subscribe((value) => secondResults.push(value), { signal: secondController.signal });
    sourceSubscriber?.next('source');

    expect(sourceActivations).toBe(1);
    expect(firstResults).toEqual(['source']);
    expect(secondResults).toEqual(['source']);

    firstController.abort();
    expect(sourceTeardowns).toBe(0);

    sourceSubscriber?.error(new Error('ignored'));
    nextSubscriber?.next('next');

    expect(sourceTeardowns).toBe(1);
    expect(nextActivations).toBe(1);
    expect(firstResults).toEqual(['source']);
    expect(secondResults).toEqual(['source', 'next']);

    secondController.abort();
    expect(nextTeardowns).toBe(1);
  });
});
