import { expect } from 'chai';
import { hot, cold, expectObservable, expectSubscriptions } from '../helpers/marble-testing';
import { of, from, Observable } from 'rxjs';
import { concatMapTo, mergeMap } from 'rxjs/operators';

declare function asDiagram(arg: string): Function;

/** @test {concatMapTo} */
describe('Observable.prototype.concatMapTo', () => {
  asDiagram('concatMapTo( 10\u2014\u201410\u2014\u201410\u2014| )')
  ('should map-and-flatten each item to an Observable', () => {
    const e1 =    hot('--1-----3--5-------|');
    const e1subs =    '^                  !';
    const e2 =   cold('x-x-x|              ', {x: 10});
    const expected =  '--x-x-x-x-x-xx-x-x-|';
    const values = {x: 10};

    const result = e1.pipe(concatMapTo(e2));

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should support the deprecated resultSelector', () => {
    const results: Array<number[]> = [];

    of(1, 2, 3).pipe(
      concatMapTo(
        of(4, 5, 6),
        (a, b, i, ii) => [a, b, i, ii]
      )
    )
    .subscribe({
      next (value) {
        results.push(value);
      },
      error(err) {
        throw err;
      },
      complete() {
        expect(results).to.deep.equal([
          [1, 4, 0, 0],
          [1, 5, 0, 1],
          [1, 6, 0, 2],
          [2, 4, 1, 0],
          [2, 5, 1, 1],
          [2, 6, 1, 2],
          [3, 4, 2, 0],
          [3, 5, 2, 1],
          [3, 6, 2, 2],
        ]);
      }
    });
  });

  it('should support a void resultSelector (still deprecated)', () => {
    const results: number[] = [];

    of(1, 2, 3).pipe(
      concatMapTo(
        of(4, 5, 6),
        void 0
      )
    )
    .subscribe({
      next (value) {
        results.push(value);
      },
      error(err) {
        throw err;
      },
      complete() {
        expect(results).to.deep.equal([
          4, 5, 6, 4, 5, 6, 4, 5, 6
        ]);
      }
    });
  });

  it('should concatMapTo many outer values to many inner values', () => {
    const values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
    const e1 =     hot('-a---b---c---d---|                        ');
    const e1subs =     '^                !                        ';
    const inner =  cold('--i-j-k-l-|                              ', values);
    const innersubs = [' ^         !                              ',
                       '           ^         !                    ',
                       '                     ^         !          ',
                       '                               ^         !'];
    const expected =   '---i-j-k-l---i-j-k-l---i-j-k-l---i-j-k-l-|';

    const result = e1.pipe(concatMapTo(inner));

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(inner.subscriptions).toBe(innersubs);
  });

  it('should handle an empty source', () => {
    const e1 = cold( '|');
    const e1subs =   '(^!)';
    const inner = cold('-1-2-3|');
    const innersubs: string[] = [];
    const expected = '|';

    const result = e1.pipe(concatMapTo(inner));

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(inner.subscriptions).toBe(innersubs);
  });

  it('should handle a never source', () => {
    const e1 = cold( '-');
    const e1subs =   '^';
    const inner = cold('-1-2-3|');
    const innersubs: string[] = [];
    const expected = '-';

    const result = e1.pipe(concatMapTo(inner));

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(inner.subscriptions).toBe(innersubs);
  });

  it('should error immediately if given a just-throw source', () => {
    const e1 = cold( '#');
    const e1subs =   '(^!)';
    const inner = cold('-1-2-3|');
    const innersubs: string[] = [];
    const expected = '#';

    const result = e1.pipe(concatMapTo(inner));

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(inner.subscriptions).toBe(innersubs);
  });

  it('should return a silenced version of the source if the mapped inner is empty', () => {
    const e1 =    cold('--a-b--c-|');
    const e1subs =     '^        !';
    const inner = cold('|');
    const innersubs = ['  (^!)     ',
                       '    (^!)   ',
                       '       (^!)'];
    const expected =   '---------|';

    const result = e1.pipe(concatMapTo(inner));

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(inner.subscriptions).toBe(innersubs);
  });

  it('should return a never if the mapped inner is never', () => {
    const e1 =    cold('--a-b--c-|');
    const e1subs =     '^        !';
    const inner = cold('-');
    const innersubs =  '  ^       ';
    const expected =   '----------';

    const result = e1.pipe(concatMapTo(inner));

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(inner.subscriptions).toBe(innersubs);
  });

  it('should propagate errors if the mapped inner is a just-throw Observable', () => {
    const e1 =    cold('--a-b--c-|');
    const e1subs =     '^ !       ';
    const inner = cold('#');
    const innersubs =  '  (^!)    ';
    const expected =   '--#';

    const result = e1.pipe(concatMapTo(inner));

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(inner.subscriptions).toBe(innersubs);
  });

  it('should concatMapTo many outer to many inner, complete late', () => {
    const values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
    const e1 =     hot('-a---b---c---d----------------------------------|');
    const e1subs =     '^                                               !';
    const inner =  cold('--i-j-k-l-|                                     ', values);
    const innersubs = [' ^         !                                     ',
                       '           ^         !                           ',
                       '                     ^         !                 ',
                       '                               ^         !       '];
    const expected =   '---i-j-k-l---i-j-k-l---i-j-k-l---i-j-k-l--------|';

    const result = e1.pipe(concatMapTo(inner));

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(inner.subscriptions).toBe(innersubs);
  });

  it('should concatMapTo many outer to many inner, outer never completes', () => {
    const values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
    const e1 =     hot('-a---b---c---d-----------------------------------');
    const e1subs =     '^                                                ';
    const inner =  cold('--i-j-k-l-|                                     ', values);
    const innersubs = [' ^         !                                     ',
                       '           ^         !                           ',
                       '                     ^         !                 ',
                       '                               ^         !       '];
    const expected =   '---i-j-k-l---i-j-k-l---i-j-k-l---i-j-k-l---------';

    const result = e1.pipe(concatMapTo(inner));

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(inner.subscriptions).toBe(innersubs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    const values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
    const e1 =     hot('-a---b---c---d---| ');
    const e1subs =     '^                ! ';
    const inner =  cold('--i-j-k-l-|       ', values);
    const innersubs = [' ^         !       ',
                       '           ^      !'];
    const expected =   '---i-j-k-l---i-j-k-';
    const unsub =      '                  !';

    const result = e1.pipe(
      mergeMap(x => of(x)),
      concatMapTo(inner),
      mergeMap(x => of(x)),
    );

    expectObservable(result, unsub).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(inner.subscriptions).toBe(innersubs);
  });

  it('should concatMapTo many outer to many inner, inner never completes', () => {
    const values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
    const e1 =     hot('-a---b---c---d---|');
    const e1subs =     '^                !';
    const inner =  cold('--i-j-k-l-       ', values);
    const innersubs =  ' ^                ';
    const expected =   '---i-j-k-l--------';

    const result = e1.pipe(concatMapTo(inner));

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(inner.subscriptions).toBe(innersubs);
  });

  it('should concatMapTo many outer to many inner, and inner throws', () => {
    const values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
    const e1 =     hot('-a---b---c---d---|');
    const e1subs =     '^          !      ';
    const inner =  cold('--i-j-k-l-#      ', values);
    const innersubs =  ' ^         !      ';
    const expected =   '---i-j-k-l-#      ';

    const result = e1.pipe(concatMapTo(inner));

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(inner.subscriptions).toBe(innersubs);
  });

  it('should concatMapTo many outer to many inner, and outer throws', () => {
    const values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
    const e1 =     hot('-a---b---c---d---#');
    const e1subs =     '^                !';
    const inner =  cold('--i-j-k-l-|      ', values);
    const innersubs = [' ^         !      ',
                       '           ^     !'];
    const expected =   '---i-j-k-l---i-j-#';

    const result = e1.pipe(concatMapTo(inner));

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(inner.subscriptions).toBe(innersubs);
  });

  it('should concatMapTo many outer to many inner, both inner and outer throw', () => {
    const values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
    const e1 =     hot('-a---b---c---d---#');
    const e1subs =     '^          !      ';
    const inner =  cold('--i-j-k-l-#      ', values);
    const innersubs =  ' ^         !      ';
    const expected =   '---i-j-k-l-#      ';

    const result = e1.pipe(concatMapTo(inner));

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(inner.subscriptions).toBe(innersubs);
  });

  it('should concatMapTo many outer to an array', () => {
    const e1 =   hot('2-----4--------3--------2-------|');
    const expected = '(0123)(0123)---(0123)---(0123)--|';

    const result = e1.pipe(concatMapTo(['0', '1', '2', '3']));

    expectObservable(result).toBe(expected);
  });

  it('should concatMapTo many outer to inner arrays, and outer throws', () => {
    const e1 =   hot('2-----4--------3--------2-------#');
    const expected = '(0123)(0123)---(0123)---(0123)--#';

    const result = e1.pipe(concatMapTo(['0', '1', '2', '3']));

    expectObservable(result).toBe(expected);
  });

  it('should mergeMap many outer to inner arrays, outer unsubscribed early', () => {
    const e1 =   hot('2-----4--------3--------2-------|');
    const unsub =    '             !';
    const expected = '(0123)(0123)--';

    const result = e1.pipe(concatMapTo(['0', '1', '2', '3']));

    expectObservable(result, unsub).toBe(expected);
  });

  it('should map values to constant resolved promises and concatenate', (done: MochaDone) => {
    const source = from([4, 3, 2, 1]);

    const results: number[] = [];
    source.pipe(concatMapTo(from(Promise.resolve(42)))).subscribe(
      (x) => {
        results.push(x);
      },
      (err) => {
        done(new Error('Subscriber error handler not supposed to be called.'));
      },
      () => {
        expect(results).to.deep.equal([42, 42, 42, 42]);
        done();
      });
  });

  it('should map values to constant rejected promises and concatenate', (done) => {
    const source = from([4, 3, 2, 1]);

    source.pipe(concatMapTo(from(Promise.reject(42)))).subscribe(
      (x) => {
        done(new Error('Subscriber next handler not supposed to be called.'));
      },
      (err) => {
        expect(err).to.equal(42);
        done();
      },
      () => {
        done(new Error('Subscriber complete handler not supposed to be called.'));
      });
  });
});
