import { expect } from 'chai';
import { single, mergeMap, tap } from 'rxjs/operators';
import { of, EmptyError, SequenceError, NotFoundError, Observable } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { observableMatcher } from '../helpers/observableMatcher';

/** @test {single} */
describe('single operator', () => {
  let rxTest: TestScheduler;

  beforeEach(() => {
    rxTest = new TestScheduler(observableMatcher);
  });

  it('should raise error from empty predicate if observable emits multiple time', () => {
    rxTest.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--|');
      const e1subs = '  ^----!      ';
      const expected = '-----#      ';

      expectObservable(e1.pipe(single())).toBe(expected, null, new SequenceError('Too many matching values'));
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should raise error from empty predicate if observable does not emit', () => {
    rxTest.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^--|');
      const e1subs = '     ^--!';
      const expected = '   ---#';

      expectObservable(e1.pipe(single())).toBe(expected, null, new EmptyError());
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should return only element from empty predicate if observable emits only once', () => {
    rxTest.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--|');
      const e1subs = '  ^----!';
      const expected = '-----(a|)';

      expectObservable(e1.pipe(single())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should allow unsubscribing explicitly and early', () => {
    rxTest.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--|');
      const unsub = '   ----!        ';
      const e1subs = '  ^---!        ';
      const expected = '------------';

      expectObservable(e1.pipe(single()), unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    rxTest.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--|');
      const e1subs = '  ^--!        ';
      const expected = '----        ';
      const unsub = '   ---!        ';

      const result = e1.pipe(
        mergeMap(x => of(x)),
        single(),
        mergeMap(x => of(x))
      );

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should raise error from empty predicate if observable emits error', () => {
    rxTest.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b^--#');
      const e1subs = '        ^--!';
      const expected = '      ---#';

      expectObservable(e1.pipe(single())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should raise error from predicate if observable emits error', () => {
    rxTest.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--b^--#');
      const e1subs = '      ^--!';
      const expected = '    ---#';

      expectObservable(e1.pipe(single(v => v === 'c'))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should raise error if predicate throws error', () => {
    rxTest.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--d--|');
      const e1subs = '  ^----------!   ';
      const expected = '-----------#   ';

      expectObservable(
        e1.pipe(
          single(v => {
            if (v !== 'd') {
              return false;
            }
            throw 'error';
          })
        )
      ).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should return element from predicate if observable have single matching element', () => {
    rxTest.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--|');
      const e1subs = '  ^----------!';
      const expected = '-----------(b|)';

      expectObservable(e1.pipe(single(v => v === 'b'))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should raise error from predicate if observable have multiple matching element', () => {
    rxTest.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--a--b--b--|');
      const e1subs = '  ^----------!      ';
      const expected = '-----------#      ';

      expectObservable(e1.pipe(single(v => v === 'b'))).toBe(expected, null, new SequenceError('Too many matching values'));
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should raise error from predicate if observable does not emit', () => {
    rxTest.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^--|');
      const e1subs = '     ^--!';
      const expected = '   ---#';

      expectObservable(e1.pipe(single(v => v === 'a'))).toBe(expected, null, new EmptyError());
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should raise error from predicate if observable does not contain matching element', () => {
    rxTest.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--|');
      const e1subs = '  ^----------!';
      const expected = '-----------#';

      expectObservable(e1.pipe(single(v => v === 'x'))).toBe(expected, undefined, new NotFoundError('No matching values'));
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should call predicate with indices starting at 0', () => {
    rxTest.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--|');
      const e1subs = '  ^----------!';
      const expected = '-----------(b|)';

      let indices: number[] = [];
      const predicate = function(value: string, index: number) {
        indices.push(index);
        return value === 'b';
      };

      expectObservable(
        e1.pipe(
          single(predicate),
          tap(null, null, () => {
            expect(indices).to.deep.equal([0, 1, 2]);
          })
        )
      ).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should error for synchronous empty observables when no arguments are provided', () => {
    rxTest.run(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('|');
      const expected = '   #';
      const subs = ['      (^!)'];
      const result = source.pipe(single());

      expectObservable(result).toBe(expected, undefined, new EmptyError());
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });

  it('should error for async empty observables when no arguments are provided', () => {
    rxTest.run(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('-------|');
      const expected = '   -------#';
      const subs = ['      ^------!'];
      const result = source.pipe(single());

      expectObservable(result).toBe(expected, undefined, new EmptyError());
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });

  it('should error for hot observables that do not emit while active when no arguments are provided', () => {
    rxTest.run(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('--a--b--^----|');
      const expected = '          -----#';
      const subs = ['             ^----!'];
      const result = source.pipe(single());

      expectObservable(result).toBe(expected, undefined, new EmptyError());
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });

  it('should error for synchronous empty observables when predicate never passes', () => {
    rxTest.run(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('|');
      const expected = '   #';
      const subs = ['      (^!)'];
      const result = source.pipe(single(() => false));

      expectObservable(result).toBe(expected, undefined, new EmptyError());
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });

  it('should error for async empty observables when predicate never passes', () => {
    rxTest.run(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('-------|');
      const expected = '   -------#';
      const subs = ['      ^------!'];
      const result = source.pipe(single(() => false));

      expectObservable(result).toBe(expected, undefined, new EmptyError());
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });

  it('should error for hot observables that do not emit while active when predicate never passes', () => {
    rxTest.run(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('--a--b--^----|');
      const expected = '          -----#';
      const subs = ['             ^----!'];
      const result = source.pipe(single(() => false));

      expectObservable(result).toBe(expected, undefined, new EmptyError());
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });

  it('should error for synchronous observables that emit when predicate never passes', () => {
    rxTest.run(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('(a|)');
      const expected = '   #';
      const subs = ['      (^!)'];
      const result = source.pipe(single(() => false));

      expectObservable(result).toBe(expected, undefined, new NotFoundError('No matching values'));
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });

  it('should error for async observables that emit when predicate never passes', () => {
    rxTest.run(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('--a--b-|');
      const expected = '   -------#';
      const subs = ['      ^------!'];
      const result = source.pipe(single(() => false));

      expectObservable(result).toBe(expected, undefined, new NotFoundError('No matching values'));
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });

  it('should error for hot observables that emit while active when predicate never passes', () => {
    rxTest.run(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('--a--b--^--c--d--|');
      const expected = '          ---------#';
      const subs = ['             ^--------!'];
      const result = source.pipe(single(() => false));

      expectObservable(result).toBe(expected, undefined, new NotFoundError('No matching values'));
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });

  it('should error for synchronous observables when the predicate passes more than once', () => {
    rxTest.run(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('(axbxc|)');
      const expected = '   #';
      const subs = ['      (^!)'];
      const result = source.pipe(single(v => v === 'x'));

      expectObservable(result).toBe(expected, undefined, new SequenceError('Too many matching values'));
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });

  it('should error for async observables that emit when the predicate passes more than once', () => {
    rxTest.run(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('--a-x-b-x-c-|');
      const expected = '   --------#';
      const subs = ['      ^-------!'];
      const result = source.pipe(single(v => v === 'x'));

      expectObservable(result).toBe(expected, undefined, new SequenceError('Too many matching values'));
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });

  it('should error for hot observables that emit while active when the predicate passes more than once', () => {
    rxTest.run(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('--a--b--^--c--x--d--x--|');
      const expected = '          ------------#';
      const subs = ['             ^-----------!'];
      const result = source.pipe(single(v => v === 'x'));

      expectObservable(result).toBe(expected, undefined, new SequenceError('Too many matching values'));
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });

  it('should stop listening to a synchronous observable when unsubscribed', () => {
    const sideEffects: number[] = [];
    const synchronousObservable = new Observable<number>(subscriber => {
      // This will check to see if the subscriber was closed on each loop
      // when the unsubscribe hits, it should be closed
      for (let i = 0; !subscriber.closed && i < 10; i++) {
        sideEffects.push(i);
        subscriber.next(i);
      }
    });

    synchronousObservable.pipe(
      single(),
    ).subscribe(() => { /* noop */ }, () => { /* noop */ });

    expect(sideEffects).to.deep.equal([0, 1]);
  });
});
