import { expect } from 'chai';
import { __OPERATOR__ } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { observableMatcher } from '../helpers/observableMatcher';

/** @test {__OPERATOR__} */
describe('__OPERATOR__', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(observableMatcher);
  });

  it('should handle never', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' -');
      const e1subs = '  ^';
      const expected = '-';

      const result = e1.pipe(__OPERATOR__());

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should handle empty', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('|');
      const e1subs = '(^!)';
      const expected = '|';

      const result = e1.pipe(__OPERATOR__());

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should handle a single value', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' --x--|', { x: 1 });
      const e1subs = '  ^----!';
      const expected = '--y--|';

      const result = e1.pipe(__OPERATOR__());

      expectObservable(result).toBe(expected, { y: 1 });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should handle multiple values', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' --1--2--3--|');
      const e1subs = '  ^----------!';
      const expected = '--a--b--c--|';

      const result = e1.pipe(__OPERATOR__());

      expectObservable(result).toBe(expected, { a: 1, b: 2, c: 3 });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should propagate error', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' --#');
      const e1subs = '  ^-!';
      const expected = '--#';

      const result = e1.pipe(__OPERATOR__());

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not complete if source does not complete', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' ------');
      const e1subs = '  ^-----';
      const expected = ' ------';

      const result = e1.pipe(__OPERATOR__());

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should allow unsubscribing explicitly and early', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' --1--2--3--|');
      const e1subs = '  ^-----!     ';
      const expected = '--a--b-     ';
      const unsub = '   ------!     ';

      const result = e1.pipe(__OPERATOR__());

      expectObservable(result, unsub).toBe(expected, { a: 1, b: 2 });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
});
