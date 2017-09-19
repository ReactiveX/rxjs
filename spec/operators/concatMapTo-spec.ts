import { expect } from 'chai';
import * as Rx from '../../dist/package/Rx';
import marbleTestingSignature = require('../helpers/marble-testing'); // tslint:disable-line:no-require-imports

declare const { asDiagram };
declare const hot: typeof marbleTestingSignature.hot;
declare const cold: typeof marbleTestingSignature.cold;
declare const expectObservable: typeof marbleTestingSignature.expectObservable;
declare const expectSubscriptions: typeof marbleTestingSignature.expectSubscriptions;
const Observable = Rx.Observable;

/** @test {concatMapTo} */
describe('Observable.prototype.concatMapTo', () => {
  asDiagram('concatMapTo( 10\u2014\u201410\u2014\u201410\u2014| )')
  ('should map-and-flatten each item to an Observable', () => {
    const e1 =    hot('--1-----3--5-------|');
    const e1subs =    '^                  !';
    const e2 =   cold('x-x-x|              ', {x: 10});
    const expected =  '--x-x-x-x-x-xx-x-x-|';
    const values = {x: 10};

    const result = e1.concatMapTo(e2);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should concatMapTo many outer values to many inner values', () => {
    const values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
    const e1 =     hot('-a---b---c---d---|                        ');
    const e1subs =     '^                                        !';
    const inner =  cold('--i-j-k-l-|                              ', values);
    const innersubs = [' ^         !                              ',
                     '           ^         !                    ',
                     '                     ^         !          ',
                     '                               ^         !'];
    const expected =   '---i-j-k-l---i-j-k-l---i-j-k-l---i-j-k-l-|';

    const result = e1.concatMapTo(inner);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(inner.subscriptions).toBe(innersubs);
  });

  it('should handle an empty source', () => {
    const e1 = cold( '|');
    const e1subs =   '(^!)';
    const inner = cold('-1-2-3|');
    const innersubs = [];
    const expected = '|';

    const result = e1.concatMapTo(inner);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(inner.subscriptions).toBe(innersubs);
  });

  it('should handle a never source', () => {
    const e1 = cold( '-');
    const e1subs =   '^';
    const inner = cold('-1-2-3|');
    const innersubs = [];
    const expected = '-';

    const result = e1.concatMapTo(inner);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(inner.subscriptions).toBe(innersubs);
  });

  it('should error immediately if given a just-throw source', () => {
    const e1 = cold( '#');
    const e1subs =   '(^!)';
    const inner = cold('-1-2-3|');
    const innersubs = [];
    const expected = '#';

    const result = e1.concatMapTo(inner);

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

    const result = e1.concatMapTo(inner);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(inner.subscriptions).toBe(innersubs);
  });

  it('should return a never if the mapped inner is never', () => {
    const e1 =    cold('--a-b--c-|');
    const e1subs =     '^         ';
    const inner = cold('-');
    const innersubs =  '  ^       ';
    const expected =   '----------';

    const result = e1.concatMapTo(inner);

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

    const result = e1.concatMapTo(inner);

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

    const result = e1.concatMapTo(inner);

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

    const result = e1.concatMapTo(inner);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(inner.subscriptions).toBe(innersubs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    const values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
    const e1 =     hot('-a---b---c---d---| ');
    const e1subs =     '^                 !';
    const inner =  cold('--i-j-k-l-|       ', values);
    const innersubs = [' ^         !       ',
                     '           ^      !'];
    const expected =   '---i-j-k-l---i-j-k-';
    const unsub =      '                  !';

    const result = e1
      .mergeMap((x: any) => Observable.of(x))
      .concatMapTo(inner)
      .mergeMap((x: any) => Observable.of(x));

    expectObservable(result, unsub).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(inner.subscriptions).toBe(innersubs);
  });

  it('should concatMapTo many outer to many inner, inner never completes', () => {
    const values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
    const e1 =     hot('-a---b---c---d---|');
    const e1subs =     '^                 ';
    const inner =  cold('--i-j-k-l-       ', values);
    const innersubs =  ' ^                ';
    const expected =   '---i-j-k-l--------';

    const result = e1.concatMapTo(inner);

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

    const result = e1.concatMapTo(inner);

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

    const result = e1.concatMapTo(inner);

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

    const result = e1.concatMapTo(inner);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(inner.subscriptions).toBe(innersubs);
  });

  it('should concatMapTo many outer to an array', () => {
    const e1 =   hot('2-----4--------3--------2-------|');
    const expected = '(0123)(0123)---(0123)---(0123)--|';

    const result = e1.concatMapTo(['0', '1', '2', '3']);

    expectObservable(result).toBe(expected);
  });

  it('should concatMapTo many outer to inner arrays, using resultSelector', () => {
    const e1 =   hot('2-----4--------3--------2-------|');
    const expected = '(2345)(4567)---(3456)---(2345)--|';

    const result = e1.concatMapTo(['0', '1', '2', '3'],
      (x: string, y: string) => String(parseInt(x) + parseInt(y)));

    expectObservable(result).toBe(expected);
  });

  it('should concatMapTo many outer to inner arrays, and outer throws', () => {
    const e1 =   hot('2-----4--------3--------2-------#');
    const expected = '(0123)(0123)---(0123)---(0123)--#';

    const result = e1.concatMapTo(['0', '1', '2', '3']);

    expectObservable(result).toBe(expected);
  });

  it('should concatMapTo many outer to inner arrays, resultSelector, outer throws', () => {
    const e1 =   hot('2-----4--------3--------2-------#');
    const expected = '(2345)(4567)---(3456)---(2345)--#';

    const result = e1.concatMapTo(['0', '1', '2', '3'],
      (x: string, y: string) => String(parseInt(x) + parseInt(y)));

    expectObservable(result).toBe(expected);
  });

  it('should mergeMap many outer to inner arrays, outer unsubscribed early', () => {
    const e1 =   hot('2-----4--------3--------2-------|');
    const unsub =    '             !';
    const expected = '(0123)(0123)--';

    const result = e1.concatMapTo(['0', '1', '2', '3']);

    expectObservable(result, unsub).toBe(expected);
  });

  it('should concatMapTo many outer to inner arrays, resultSelector, outer unsubscribed', () => {
    const e1 =   hot('2-----4--------3--------2-------|');
    const unsub =    '             !';
    const expected = '(2345)(4567)--';

    const result = e1.concatMapTo(['0', '1', '2', '3'],
      (x: string, y: string) => String(parseInt(x) + parseInt(y)));

    expectObservable(result, unsub).toBe(expected);
  });

  it('should concatMapTo many outer to inner arrays, resultSelector throws', () => {
    const e1 =   hot('2-----4--------3--------2-------|');
    const expected = '(2345)(4567)---#';

    const result = e1.concatMapTo(['0', '1', '2', '3'], (x: string, y: string) => {
      if (x === '3') {
        throw 'error';
      }
      return String(parseInt(x) + parseInt(y));
    });

    expectObservable(result).toBe(expected);
  });

  it('should map values to constant resolved promises and concatenate', (done: MochaDone) => {
    const source = Rx.Observable.from([4, 3, 2, 1]);

    const results = [];
    source.concatMapTo(Observable.from(Promise.resolve(42))).subscribe(
      (x: any) => {
        results.push(x);
      },
      (err: any) => {
        done(new Error('Subscriber error handler not supposed to be called.'));
      },
      () => {
        expect(results).to.deep.equal([42, 42, 42, 42]);
        done();
      });
  });

  it('should map values to constant rejected promises and concatenate', (done: MochaDone) => {
    const source = Rx.Observable.from([4, 3, 2, 1]);

    source.concatMapTo(Observable.from(Promise.reject(42))).subscribe(
      (x: any) => {
        done(new Error('Subscriber next handler not supposed to be called.'));
      },
      (err: any) => {
        expect(err).to.equal(42);
        done();
      },
      () => {
        done(new Error('Subscriber complete handler not supposed to be called.'));
      });
  });

  it('should concatMapTo values to resolved promises with resultSelector', (done: MochaDone) => {
    const source = Rx.Observable.from([4, 3, 2, 1]);
    const resultSelectorCalledWith = [];
    const inner = Observable.from(Promise.resolve(42));
    const resultSelector = function (outerVal, innerVal, outerIndex, innerIndex) {
      resultSelectorCalledWith.push([].slice.call(arguments));
      return 8;
    };

    const results = [];
    const expectedCalls = [
      [4, 42, 0, 0],
      [3, 42, 1, 0],
      [2, 42, 2, 0],
      [1, 42, 3, 0]
    ];
    source.concatMapTo(inner, resultSelector).subscribe(
      (x: any) => {
        results.push(x);
      },
      (err: any) => {
        done(new Error('Subscriber error handler not supposed to be called.'));
      },
      () => {
        expect(results).to.deep.equal([8, 8, 8, 8]);
        expect(resultSelectorCalledWith).to.deep.equal(expectedCalls);
        done();
      });
  });

  it('should concatMapTo values to rejected promises with resultSelector', (done: MochaDone) => {
    const source = Rx.Observable.from([4, 3, 2, 1]);
    const inner = Observable.from(Promise.reject(42));
    const resultSelector = () => {
      throw 'this should not be called';
    };

    source.concatMapTo(inner, resultSelector).subscribe(
      (x: any) => {
        done(new Error('Subscriber next handler not supposed to be called.'));
      },
      (err: any) => {
        expect(err).to.equal(42);
        done();
      },
      () => {
        done(new Error('Subscriber complete handler not supposed to be called.'));
      });
  });
});
