/** @prettier */
import { Observable, ConnectableObservable, connectable, of, AsyncSubject, BehaviorSubject, ReplaySubject, Subject, merge } from 'rxjs';
import { connect, share, multicast, publish, publishReplay, publishBehavior, publishLast, refCount, repeat, retry } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { observableMatcher } from '../helpers/observableMatcher';

describe('multicasting equivalent tests', () => {
  let rxTest: TestScheduler;

  beforeEach(() => {
    rxTest = new TestScheduler(observableMatcher);
  });

  testEquivalents(
    'multicast(() => new Subject()), refCount() and share()',
    (source) =>
      source.pipe(
        multicast(() => new Subject<string>()),
        refCount()
      ),
    (source) => source.pipe(share())
  );

  testEquivalents(
    'multicast(new Subject()), refCount() and share({ resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false })',
    (source) => source.pipe(multicast(new Subject()), refCount()),
    (source) => source.pipe(share({ resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false }))
  );

  testEquivalents(
    'publish(), refCount() and share({ resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false })',
    (source) => source.pipe(publish(), refCount()),
    (source) => source.pipe(share({ resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false }))
  );

  testEquivalents(
    'publishLast(), refCount() and share({ connector: () => new AsyncSubject(), resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false })',
    (source) => source.pipe(publishLast(), refCount()),
    (source) =>
      source.pipe(share({ connector: () => new AsyncSubject(), resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false }))
  );

  testEquivalents(
    'publishBehavior("X"), refCount() and share({ connector: () => new BehaviorSubject("X"), resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false })',
    (source) => source.pipe(publishBehavior('X'), refCount()),
    (source) =>
      source.pipe(
        share({ connector: () => new BehaviorSubject('X'), resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false })
      )
  );

  testEquivalents(
    'publishReplay(3, 10), refCount() and share({ connector: () => new ReplaySubject(3, 10), resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false })',
    (source) => source.pipe(publishReplay(3, 10), refCount()),
    (source) =>
      source.pipe(
        share({ connector: () => new ReplaySubject(3, 10), resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false })
      )
  );

  const fn = (source: Observable<any>) => merge(source, source);

  testEquivalents(
    'publish(fn) and connect({ setup: fn })',
    (source) => source.pipe(publish(fn)),
    (source) => source.pipe(connect(fn))
  );

  testEquivalents(
    'publishReplay(3, 10, fn) and `subject = new ReplaySubject(3, 10), connect({ connector: () => subject , setup: fn })`',
    (source) => source.pipe(publishReplay(3, 10, fn)),
    (source) => {
      const subject = new ReplaySubject(3, 10);
      return source.pipe(connect(fn, { connector: () => subject }));
    }
  );

  /**
   * Used to test a variety of scenarios with multicast operators that should be equivalent.
   * @param name The name to add to the test output
   * @param oldExpression The old expression we're saying matches the updated expression
   * @param updatedExpression The updated expression we're telling people to use instead.
   */
  function testEquivalents(
    name: string,
    oldExpression: (source: Observable<string>) => Observable<string>,
    updatedExpression: (source: Observable<string>) => Observable<string>
  ) {
    it(`should be equivalent for ${name} for async sources`, () => {
      rxTest.run(({ cold, expectObservable }) => {
        const source = cold('----a---b---c----d---e----|');
        const old = oldExpression(source);
        const updated = updatedExpression(source);
        expectObservable(updated).toEqual(old);
      });
    });

    it(`should be equivalent for ${name} for async sources that repeat`, () => {
      rxTest.run(({ cold, expectObservable }) => {
        const source = cold('----a---b---c----d---e----|');
        const old = oldExpression(source).pipe(repeat(3));
        const updated = updatedExpression(source).pipe(repeat(3));
        expectObservable(updated).toEqual(old);
      });
    });

    it(`should be equivalent for ${name} for async sources that retry`, () => {
      rxTest.run(({ cold, expectObservable }) => {
        const source = cold('----a---b---c----d---e----#');
        const old = oldExpression(source).pipe(retry(3));
        const updated = updatedExpression(source).pipe(retry(3));
        expectObservable(updated).toEqual(old);
      });
    });

    it(`should be equivalent for ${name} for async sources`, () => {
      rxTest.run(({ expectObservable }) => {
        const source = of('a', 'b', 'c');
        const old = oldExpression(source);
        const updated = updatedExpression(source);
        expectObservable(updated).toEqual(old);
      });
    });

    it(`should be equivalent for ${name} for async sources that repeat`, () => {
      rxTest.run(({ expectObservable }) => {
        const source = of('a', 'b', 'c');
        const old = oldExpression(source).pipe(repeat(3));
        const updated = updatedExpression(source).pipe(repeat(3));
        expectObservable(updated).toEqual(old);
      });
    });

    it(`should be equivalent for ${name} for async sources that retry`, () => {
      rxTest.run(({ expectObservable }) => {
        const source = of('a', 'b', 'c');
        const old = oldExpression(source).pipe(retry(3));
        const updated = updatedExpression(source).pipe(retry(3));
        expectObservable(updated).toEqual(old);
      });
    });
  }
});
