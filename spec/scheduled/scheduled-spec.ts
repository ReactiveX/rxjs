import { scheduled, of } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { lowerCaseO } from '../helpers/test-helper';
import { observableMatcher } from '../helpers/observableMatcher';
import { expect } from 'chai';

describe('scheduled', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(observableMatcher);
  });

  it('should schedule a sync observable', () => {
    const input = of('a', 'b', 'c');
    testScheduler.run(({ expectObservable }) => {
      expectObservable(scheduled(input, testScheduler)).toBe('(abc|)');
    });
  });

  it('should schedule an array', () => {
    const input = ['a', 'b', 'c'];
    testScheduler.run(({ expectObservable }) => {
      expectObservable(scheduled(input, testScheduler)).toBe('(abc|)');
    });
  });

  it('should schedule an iterable', () => {
    const input = 'abc'; // strings are iterables
    testScheduler.run(({ expectObservable }) => {
      expectObservable(scheduled(input, testScheduler)).toBe('(abc|)');
    });
  });

  it('should schedule an observable-like', () => {
    const input = lowerCaseO('a', 'b', 'c'); // strings are iterables
    testScheduler.run(({ expectObservable }) => {
      expectObservable(scheduled(input, testScheduler)).toBe('(abc|)');
    });
  });

  it('should schedule a promise', done => {
    const results: any[] = [];
    const input = Promise.resolve('x'); // strings are iterables
    scheduled(input, testScheduler).subscribe({
      next(value) { results.push(value); },
      complete() { results.push('done'); },
    });

    expect(results).to.deep.equal([]);

    // Promises force async, so we can't schedule synchronously, no matter what.
    testScheduler.flush();
    expect(results).to.deep.equal([]);

    Promise.resolve().then(() => {
      // NOW it should work, as the other promise should have resolved.
      testScheduler.flush();
      expect(results).to.deep.equal(['x', 'done']);
      done();
    });
  });
});
