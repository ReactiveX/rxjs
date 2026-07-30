import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import '@rxjs/observable-polyfill';
import { ColdObservable } from './cold-observable.js';

describe('ColdObservable', () => {
  let originalReportError: typeof globalThis.reportError;
  let reported: unknown[];

  beforeEach(() => {
    originalReportError = globalThis.reportError;
    reported = [];
    globalThis.reportError = (error) => {
      reported.push(error);
    };
  });

  afterEach(() => {
    globalThis.reportError = originalReportError;
  });

  it('reports source errors when the observer has no error handler', () => {
    const expected = new Error('source failed');

    new ColdObservable<never>((subscriber) => subscriber.error(expected)).subscribe();

    expect(reported).toEqual([expected]);
  });

  it('reports errors thrown by an observer error handler', () => {
    const expected = new Error('handler failed');

    new ColdObservable<never>((subscriber) => subscriber.error(new Error('source failed'))).subscribe({
      error: () => {
        throw expected;
      },
    });

    expect(reported).toEqual([expected]);
  });
});
