import { expect } from 'chai';
import { TestScheduler } from 'rxjs/testing';
import { refCount, publish } from 'rxjs/operators';
import { NEVER, noop, Observable } from 'rxjs';
import { observableMatcher } from '../helpers/observableMatcher';

/** @test {refCount} */
describe('refCount', () => {
  it('should turn a multicasted Observable an automatically (dis)connecting hot one', () => {
    const testScheduler = new TestScheduler(observableMatcher);

    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' --1-2---3-4--5-|');
      const e1Subs = '  ^--------------!';
      const expected = '--1-2---3-4--5-|';

      const result = e1.pipe(publish(), refCount());

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1Subs);
    });
  });

  it('should count references', () => {
    const connectable = NEVER.pipe(publish());
    const refCounted = connectable.pipe(refCount());

    const sub1 = refCounted.subscribe({
      next: noop,
    });
    const sub2 = refCounted.subscribe({
      next: noop,
    });
    const sub3 = refCounted.subscribe({
      next: noop,
    });

    expect((connectable as any)._refCount).to.equal(3);

    sub1.unsubscribe();
    sub2.unsubscribe();
    sub3.unsubscribe();
  });

  it('should unsub from the source when all other subscriptions are unsubbed', (done) => {
    let unsubscribeCalled = false;
    const connectable = new Observable<boolean>((observer) => {
      observer.next(true);
      return () => {
        unsubscribeCalled = true;
      };
    }).pipe(publish());

    const refCounted = connectable.pipe(refCount());

    const sub1 = refCounted.subscribe(() => {
      //noop
    });
    const sub2 = refCounted.subscribe(() => {
      //noop
    });
    const sub3 = refCounted.subscribe(() => {
      expect((connectable as any)._refCount).to.equal(1);
    });

    sub1.unsubscribe();
    sub2.unsubscribe();
    sub3.unsubscribe();

    expect((connectable as any)._refCount).to.equal(0);
    expect(unsubscribeCalled).to.be.true;
    done();
  });
});
