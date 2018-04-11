import { Observable } from './Observable';
import { expect } from 'chai';
import { Scheduler, Subs } from './types';

describe('Observable', () => {
  it('should exist', () => {
    expect(Observable).to.exist;
  });

  it('should new a value that is an instancof Observable', () => {
    const test = new Observable();
    expect(test instanceof Observable).to.be.true;
  });

  it('should work for the simplest use case', () => {
    const source = new Observable<number>(subscriber => {
      subscriber.next(1);
      subscriber.next(2);
      subscriber.next(3);
      subscriber.complete();
    });

    const results: any[] = [];

    source.subscribe({
      next(v) { results.push(v); },
      complete() { results.push('done'); },
    });

    expect(results).to.deep.equal([1, 2, 3, 'done']);
  });

  it('should be able to stop synchronous observables with the nexted subscription', () => {
    let calls = 0;
    const source = new Observable<number>(subscriber => {
      for (let i = 0; i < 10; i++) {
        if (subscriber.closed) {
          break;
        }
        calls++;
        subscriber.next(i);
      }
      subscriber.complete();
    });

    const results: any[] = [];

    source.subscribe({
      next(value, subscription) {
        if (value === 3) subscription.unsubscribe();
        results.push(value);
      },
      complete() {
        results.push('done');
      }
    });

    expect(calls).to.equal(4);
    expect(results).to.deep.equal([0, 1, 2, 3]);
  });

  it('should not allow calling next after complete', () => {
    const source = new Observable<number>(subscriber => {
      subscriber.next(1);
      subscriber.next(2);
      subscriber.complete();
      subscriber.next(3);
    });

    const results: any[] = [];

    source.subscribe({
      next(v) { results.push(v); },
      complete() { results.push('done'); },
    });

    expect(results).to.deep.equal([1, 2, 'done']);
  });

  it('should not allow calling next after error', () => {
    const source = new Observable<number>(subscriber => {
      subscriber.next(1);
      subscriber.next(2);
      subscriber.error(new Error('bad'));
      subscriber.next(3);
    });

    const results: any[] = [];
    let error: Error;

    source.subscribe({
      next(v) { results.push(v); },
      error(err) { error = err; },
      complete() { results.push('done'); },
    });

    expect(results).to.deep.equal([1, 2]);
    expect(error).to.be.an.instanceof(Error);
    expect(error.message).to.equal('bad');
  });

  it('should not complete after early unsubscribe', () => {
    const source = new Observable<number>(subscriber => {
      subscriber.next(1);
      subscriber.next(2);
      subscriber.next(3);
      subscriber.complete();
    });

    const results: any[] = [];

    source.subscribe({
      next(v, subscription) {
        results.push(v);
        if (v === 2) subscription.unsubscribe();
        if (v === 3) {
          console.log((new Error()).stack);
        }
      },
      complete() { results.push('done'); },
    });

    expect(results).to.deep.equal([1, 2]);
  });

  describe('subscribe', () => {
    let source: Observable<number>;
    let mockScheduler: Scheduler;
    let mockSchedulerCalls: Array<{work?: () => void, delay?: number, subs?: Subs}>;

    beforeEach(() => {
      source = new Observable(subscriber => {
        subscriber.next(1);
        subscriber.next(2);
        subscriber.next(3);
        subscriber.complete();
      });

      mockScheduler = (work?: () => void, delay?: number, subs?: Subs) => {
        mockSchedulerCalls.push({ work, delay, subs });
        return 12345;
      }

      mockSchedulerCalls = [];
    });

    it('should accept an observer with a scheduler', () => {
      const results: any[] = [];

      source.subscribe({
        next(value) { results.push(value); },
        complete() { results.push('done'); },
      }, mockScheduler);

      expect(mockSchedulerCalls.length).to.equal(1); // initial subscribe
      mockSchedulerCalls.shift().work();
      expect(results).to.deep.equal([]);
      expect(mockSchedulerCalls.length).to.equal(5); // + subscription passing + 4 emissions
      while (mockSchedulerCalls.length > 0) {
        mockSchedulerCalls.shift().work();
      }
      expect(results).to.deep.equal([1, 2, 3, 'done']);
    });

    it('should accept handlers with a scheduler', () => {
      const results: any[] = [];

      source.subscribe(
        (value) => { results.push(value); },
        null,
        () => { results.push('done'); },
        mockScheduler
      );

      expect(mockSchedulerCalls.length).to.equal(1); // initial subscribe
      mockSchedulerCalls.shift().work();
      expect(results).to.deep.equal([]);
      expect(mockSchedulerCalls.length).to.equal(5); // + subscription passing + 4 emissions
      while (mockSchedulerCalls.length > 0) {
        mockSchedulerCalls.shift().work();
      }
      expect(results).to.deep.equal([1, 2, 3, 'done']);
    });
  });
});
