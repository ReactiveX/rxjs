import { expect } from 'chai';
import type { Subscription} from 'rxjs';
import { Subject, Observable, AsyncSubject, of, config, Subscriber, noop, operate } from 'rxjs';
import { delay } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { observableMatcher } from './helpers/observableMatcher';

/** @test {Subject} */
describe('Subject', () => {
  let rxTestScheduler: TestScheduler;

  beforeEach(() => {
    rxTestScheduler = new TestScheduler(observableMatcher);
  });

  it('should allow next with undefined or any when created with no type', (done) => {
    const subject = new Subject();
    subject.subscribe({
      next: (x) => {
        expect(x).to.be.a('undefined');
      },
      complete: done,
    });

    const data: any = undefined;
    subject.next(undefined);
    subject.next(data);
    subject.complete();
  });

  it('should allow empty next when created with void type', (done) => {
    const subject = new Subject<void>();
    subject.subscribe({
      next: (x) => {
        expect(x).to.be.a('undefined');
      },
      complete: done,
    });

    subject.next();
    subject.complete();
  });

  it('should pump values right on through itself', (done) => {
    const subject = new Subject<string>();
    const expected = ['foo', 'bar'];

    subject.subscribe({
      next: (x: string) => {
        expect(x).to.equal(expected.shift());
      },
      complete: done,
    });

    subject.next('foo');
    subject.next('bar');
    subject.complete();
  });

  it('should pump values to multiple subscribers', (done) => {
    const subject = new Subject<string>();
    const expected = ['foo', 'bar'];

    let i = 0;
    let j = 0;

    subject.subscribe(function (x) {
      expect(x).to.equal(expected[i++]);
    });

    subject.subscribe({
      next: function (x) {
        expect(x).to.equal(expected[j++]);
      },
      complete: done,
    });

    expect(subject.observers.length).to.equal(2);
    subject.next('foo');
    subject.next('bar');
    subject.complete();
  });

  it('should handle subscribers that arrive and leave at different times, ' + 'subject does not complete', () => {
    const subject = new Subject<number>();
    const results1: (number | string)[] = [];
    const results2: (number | string)[] = [];
    const results3: (number | string)[] = [];

    subject.next(1);
    subject.next(2);
    subject.next(3);
    subject.next(4);

    const subscription1 = subject.subscribe({
      next: function (x) {
        results1.push(x);
      },
      error: function (e) {
        results1.push('E');
      },
      complete: () => {
        results1.push('C');
      },
    });

    subject.next(5);

    const subscription2 = subject.subscribe({
      next: function (x) {
        results2.push(x);
      },
      error: function (e) {
        results2.push('E');
      },
      complete: () => {
        results2.push('C');
      },
    });

    subject.next(6);
    subject.next(7);

    subscription1.unsubscribe();

    subject.next(8);

    subscription2.unsubscribe();

    subject.next(9);
    subject.next(10);

    const subscription3 = subject.subscribe({
      next: function (x) {
        results3.push(x);
      },
      error: function (e) {
        results3.push('E');
      },
      complete: () => {
        results3.push('C');
      },
    });

    subject.next(11);

    subscription3.unsubscribe();

    expect(results1).to.deep.equal([5, 6, 7]);
    expect(results2).to.deep.equal([6, 7, 8]);
    expect(results3).to.deep.equal([11]);
  });

  it('should handle subscribers that arrive and leave at different times, ' + 'subject completes', () => {
    const subject = new Subject<number>();
    const results1: (number | string)[] = [];
    const results2: (number | string)[] = [];
    const results3: (number | string)[] = [];

    subject.next(1);
    subject.next(2);
    subject.next(3);
    subject.next(4);

    const subscription1 = subject.subscribe({
      next: function (x) {
        results1.push(x);
      },
      error: function (e) {
        results1.push('E');
      },
      complete: () => {
        results1.push('C');
      },
    });

    subject.next(5);

    const subscription2 = subject.subscribe({
      next: function (x) {
        results2.push(x);
      },
      error: function (e) {
        results2.push('E');
      },
      complete: () => {
        results2.push('C');
      },
    });

    subject.next(6);
    subject.next(7);

    subscription1.unsubscribe();

    subject.complete();

    subscription2.unsubscribe();

    const subscription3 = subject.subscribe({
      next: function (x) {
        results3.push(x);
      },
      error: function (e) {
        results3.push('E');
      },
      complete: () => {
        results3.push('C');
      },
    });

    subscription3.unsubscribe();

    expect(results1).to.deep.equal([5, 6, 7]);
    expect(results2).to.deep.equal([6, 7, 'C']);
    expect(results3).to.deep.equal(['C']);
  });

  it('should handle subscribers that arrive and leave at different times, ' + 'subject terminates with an error', () => {
    const subject = new Subject<number>();
    const results1: (number | string)[] = [];
    const results2: (number | string)[] = [];
    const results3: (number | string)[] = [];

    subject.next(1);
    subject.next(2);
    subject.next(3);
    subject.next(4);

    const subscription1 = subject.subscribe({
      next: function (x) {
        results1.push(x);
      },
      error: function (e) {
        results1.push('E');
      },
      complete: () => {
        results1.push('C');
      },
    });

    subject.next(5);

    const subscription2 = subject.subscribe({
      next: function (x) {
        results2.push(x);
      },
      error: function (e) {
        results2.push('E');
      },
      complete: () => {
        results2.push('C');
      },
    });

    subject.next(6);
    subject.next(7);

    subscription1.unsubscribe();

    subject.error(new Error('err'));

    subscription2.unsubscribe();

    const subscription3 = subject.subscribe({
      next: function (x) {
        results3.push(x);
      },
      error: function (e) {
        results3.push('E');
      },
      complete: () => {
        results3.push('C');
      },
    });

    subscription3.unsubscribe();

    expect(results1).to.deep.equal([5, 6, 7]);
    expect(results2).to.deep.equal([6, 7, 'E']);
    expect(results3).to.deep.equal(['E']);
  });

  it('should handle subscribers that arrive and leave at different times, ' + 'subject completes before nexting any value', () => {
    const subject = new Subject<number>();
    const results1: (number | string)[] = [];
    const results2: (number | string)[] = [];
    const results3: (number | string)[] = [];

    const subscription1 = subject.subscribe({
      next: function (x) {
        results1.push(x);
      },
      error: function (e) {
        results1.push('E');
      },
      complete: () => {
        results1.push('C');
      },
    });

    const subscription2 = subject.subscribe({
      next: function (x) {
        results2.push(x);
      },
      error: function (e) {
        results2.push('E');
      },
      complete: () => {
        results2.push('C');
      },
    });

    subscription1.unsubscribe();

    subject.complete();

    subscription2.unsubscribe();

    const subscription3 = subject.subscribe({
      next: function (x) {
        results3.push(x);
      },
      error: function (e) {
        results3.push('E');
      },
      complete: () => {
        results3.push('C');
      },
    });

    subscription3.unsubscribe();

    expect(results1).to.deep.equal([]);
    expect(results2).to.deep.equal(['C']);
    expect(results3).to.deep.equal(['C']);
  });

  it('should disallow new subscriber once subject has been disposed', () => {
    const subject = new Subject<number>();
    const results1: (number | string)[] = [];
    const results2: (number | string)[] = [];
    const results3: (number | string)[] = [];

    const subscription1 = subject.subscribe({
      next: function (x) {
        results1.push(x);
      },
      error: function (e) {
        results1.push('E');
      },
      complete: () => {
        results1.push('C');
      },
    });

    subject.next(1);
    subject.next(2);

    const subscription2 = subject.subscribe({
      next: function (x) {
        results2.push(x);
      },
      error: function (e) {
        results2.push('E');
      },
      complete: () => {
        results2.push('C');
      },
    });

    subject.next(3);
    subject.next(4);
    subject.next(5);

    subscription1.unsubscribe();
    subscription2.unsubscribe();
    subject.unsubscribe();

    const subscription = subject.subscribe({
      next: function (x) {
        results3.push(x);
      },
      error: function (err) {
        expect(false).to.equal('should not throw error: ' + err.toString());
      },
    });

    expect(subscription.closed).to.be.true;

    expect(results1).to.deep.equal([1, 2, 3, 4, 5]);
    expect(results2).to.deep.equal([3, 4, 5]);
    expect(results3).to.deep.equal([]);
  });

  it('should not allow values to be nexted after it is unsubscribed', () => {
    const subject = new Subject<string>();
    const results: any[] = [];
    subject.subscribe((x) => results.push(x));

    subject.next('foo');
    subject.unsubscribe();
    subject.next('bar');

    expect(results).to.deep.equal(['foo']);
  });

  it('should clean out unsubscribed subscribers', (done) => {
    const subject = new Subject();

    const sub1 = subject.subscribe(function (x) {
      //noop
    });

    const sub2 = subject.subscribe(function (x) {
      //noop
    });

    expect(subject.observers.length).to.equal(2);
    sub1.unsubscribe();
    expect(subject.observers.length).to.equal(1);
    sub2.unsubscribe();
    expect(subject.observers.length).to.equal(0);
    done();
  });

  it('should expose observed status', () => {
    const subject = new Subject();

    expect(subject.observed).to.equal(false);

    const sub1 = subject.subscribe(function (x) {
      //noop
    });

    expect(subject.observed).to.equal(true);

    const sub2 = subject.subscribe(function (x) {
      //noop
    });

    expect(subject.observed).to.equal(true);
    sub1.unsubscribe();
    expect(subject.observed).to.equal(true);
    sub2.unsubscribe();
    expect(subject.observed).to.equal(false);
    subject.unsubscribe();
    expect(subject.observed).to.equal(false);
  });

  it('should be an Observer which can be given to Observable.subscribe', (done) => {
    const source = of(1, 2, 3, 4, 5);
    const subject = new Subject<number>();
    const expected = [1, 2, 3, 4, 5];

    subject.subscribe({
      next: function (x) {
        expect(x).to.equal(expected.shift());
      },
      error: (x) => {
        done(new Error('should not be called'));
      },
      complete: () => {
        done();
      },
    });

    source.subscribe(subject);
  });

  it('should be usable as an Observer of a finite delayed Observable', (done) => {
    const source = of(1, 2, 3).pipe(delay(50));
    const subject = new Subject<number>();

    const expected = [1, 2, 3];

    subject.subscribe({
      next: function (x) {
        expect(x).to.equal(expected.shift());
      },
      error: (x) => {
        done(new Error('should not be called'));
      },
      complete: () => {
        done();
      },
    });

    source.subscribe(subject);
  });

  it('should be closed after unsubscribed', () => {
    const subject = new Subject<string>();
    subject.unsubscribe();
    expect(subject.closed).to.be.true;
  });

  it('should be closed after error', () => {
    const subject = new Subject<string>();
    subject.error('bad');
    expect(subject.closed).to.be.true;
  });

  it('should be closed after complete', () => {
    const subject = new Subject<string>();
    subject.complete();
    expect(subject.closed).to.be.true;
  });

  it('should not next after completed', () => {
    const subject = new Subject<string>();
    const results: string[] = [];
    subject.subscribe({ next: (x) => results.push(x), complete: () => results.push('C') });
    subject.next('a');
    subject.complete();
    subject.next('b');
    expect(results).to.deep.equal(['a', 'C']);
  });

  it('should not next after error', () => {
    const error = new Error('wut?');
    const subject = new Subject<string>();
    const results: string[] = [];
    subject.subscribe({ next: (x) => results.push(x), error: (err) => results.push(err) });
    subject.next('a');
    subject.error(error);
    subject.next('b');
    expect(results).to.deep.equal(['a', error]);
  });

  describe('asObservable', () => {
    it('should hide subject', () => {
      const subject = new Subject();
      const observable = subject.asObservable();

      expect(subject).not.to.equal(observable);

      expect(observable instanceof Observable).to.be.true;
      expect(observable instanceof Subject).to.be.false;
    });

    it('should handle subject never emits', () => {
      rxTestScheduler.run(({ hot, expectObservable }) => {
        const observable = hot('-').asObservable();

        expectObservable(observable).toBe('-');
      });
    });

    it('should handle subject completes without emits', () => {
      rxTestScheduler.run(({ hot, expectObservable }) => {
        const observable = hot('--^--|').asObservable();
        const expected = '        ---|';

        expectObservable(observable).toBe(expected);
      });
    });

    it('should handle subject throws', () => {
      rxTestScheduler.run(({ hot, expectObservable }) => {
        const observable = hot('--^--#').asObservable();
        const expected = '        ---#';

        expectObservable(observable).toBe(expected);
      });
    });

    it('should handle subject emits', () => {
      rxTestScheduler.run(({ hot, expectObservable }) => {
        const observable = hot('--^--x--|').asObservable();
        const expected = '        ---x--|';

        expectObservable(observable).toBe(expected);
      });
    });

    it('should work with inherited subject', () => {
      const results: (number | string)[] = [];
      const subject = new AsyncSubject<number>();

      subject.next(42);
      subject.complete();

      const observable = subject.asObservable();

      observable.subscribe({ next: (x) => results.push(x), complete: () => results.push('done') });

      expect(results).to.deep.equal([42, 'done']);
    });
  });

  describe('error thrown scenario', () => {
    afterEach(() => {
      config.onUnhandledError = null;
    });

    it('should not synchronously error when nexted into', (done) => {
      config.onUnhandledError = (err) => {
        expect(err.message).to.equal('Boom!');
        done();
      };

      const source = new Subject<number>();
      source.subscribe();
      source.subscribe(() => {
        throw new Error('Boom!');
      });
      source.subscribe();
      try {
        source.next(42);
      } catch (err) {
        // This should not happen!
        expect(true).to.be.false;
      }
      expect(true).to.be.true;
    });
  });

  describe('many subscribers', () => {
    it('should be able to subscribe and unsubscribe huge amounts of subscribers', () => {
      let numResultsReceived = 0;
      const allSubscriptions: Subscription[] = [];
      const source = new Subject<number>();
      const numSubscribers = 100000;
      for (let index = 0; index !== numSubscribers; ++index) {
        allSubscriptions.push(
          source.subscribe(() => {
            ++numResultsReceived;
          })
        );
      }
      expect(numResultsReceived).to.eq(0);
      expect(source.observed).to.be.true;
      source.next(42);
      expect(numResultsReceived).to.eq(numSubscribers);
      expect(source.observed).to.be.true;
      for (const subscription of allSubscriptions) {
        subscription.unsubscribe();
      }
      expect(numResultsReceived).to.eq(numSubscribers);
      expect(source.observed).to.be.false;
    });
  });

  describe('re-rentrant subscribers', () => {
    it('should handle re-entrant subscribers', () => {
      const seenValues: number[] = [];
      const source = new Subject<number>();
      source.subscribe((value) => {
        seenValues.push(value);
        source.subscribe((nestedValue) => {
          seenValues.push(nestedValue);
        });
      });
      source.next(1);
      source.next(2);
      source.next(3);
      expect(seenValues).to.deep.eq([1, 2, 2, 3, 3, 3]);
    });
  });

  it('should behave properly when subscribed to more than once by the same operator subscriber returned by `operate`', () => {
    const subject = new Subject<number>();
    const destination = new Subscriber();
    const results: any[] = [];
    const subscriber = operate({
      destination,
      next: (value) => {
        results.push(value);
      },
      error: noop,
      complete: () => {
        results.push('complete');
      },
    });

    subject.subscribe(subscriber);
    subject.subscribe(subscriber);
    subject.next(1);
    subject.next(2);
    subject.complete();

    expect(results).to.deep.equal([1, 1, 2, 2, 'complete']);
  });
});
