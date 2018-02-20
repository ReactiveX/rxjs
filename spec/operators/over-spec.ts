import { expect } from 'chai';
import { hot, cold, expectObservable, expectSubscriptions } from '../helpers/marble-testing';
import { Observable } from '../../src/Rx';
import { from } from '../../src/internal/observable/from';
import { over } from '../../src/internal/helpers/over';
import { mergeMap } from '../../src/internal/operators/mergeMap';
import { TestScheduler } from '../../src/testing';

declare const rxTestScheduler: TestScheduler;
declare const type: Function;
declare const asDiagram: Function;

/** @test {mapOver} */
describe('Observable.prototype.mapOver', () => {
  it('should mapOver values to resolved promises with resultSelector', (done) => {
    const source = Observable.from([4, 3, 2, 1]);
    const resultSelectorCalledWith: number[][] = [];
    const project = function (value: number, index: number) {
      return Observable.from(Promise.resolve([value, index]));
    };
    const resultSelector = function (outerVal: number, innerVal: number[], outerIndex: number, innerIndex: number) {
      resultSelectorCalledWith.push([].slice.call(arguments));
      return 8;
    };

    const results: number[] = [];
    const expectedCalls = [
      [4, [4, 0], 0, 0],
      [3, [3, 1], 1, 0],
      [2, [2, 2], 2, 0],
      [1, [1, 3], 3, 0],
    ];
    source.pipe(mergeMap(over(project, resultSelector))).subscribe(
      (x) => {
        results.push(x);
      },
      (err) => {
        done(new Error('Subscriber error handler not supposed to be called.'));
      },
      () => {
        expect(results).to.deep.equal([8, 8, 8, 8]);
        expect(resultSelectorCalledWith).to.deep.equal(expectedCalls);
        done();
      });
  });

  it('should mapOver values to rejected promises with resultSelector', (done) => {
    const source = Observable.from([4, 3, 2, 1]);
    const project = function (value: number, index: number) {
      return Observable.from(Promise.reject('' + value + '-' + index));
    };
    const resultSelector = () => {
      throw 'this should not be called';
    };

    source.mergeMap(over(project, resultSelector)).subscribe(
      (x) => {
        done(new Error('Subscriber next handler not supposed to be called.'));
      },
      (err) => {
        expect(err).to.equal('4-0');
        done();
      },
      () => {
        done(new Error('Subscriber complete handler not supposed to be called.'));
      });
  });

  // TODO: Figure out why the timing is off here
  it('should mapOver to many cold Observable, with parameter concurrency=1', () => {
    const values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
    const e1 =      hot('-a-------b-------c---|                                        ');
    const e1subs =      '^                                                            !';
    const inner =  cold('----i---j---k---l---|                                        ', values);
    const innersubs = [
                     ' ^                   !                                        ',
                     '                     ^                   !                    ',
                     '                                         ^                   !'
                    ];
    const expected =   '-----i---j---k---l-------i---j---k---l-------i---j---k---l---|';

    function project() { return inner; }
    function resultSelector(oV: string, iV: string, oI: number, iI: number) { return iV; }
    const result = e1.mergeMap(over(project, resultSelector), 1);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(inner.subscriptions).toBe(innersubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  // TODO: Figure out why the timing is off here
  it('should mapOver to many cold Observable, with parameter concurrency=2', () => {
    const values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
    const e1 =     hot('-a-------b-------c---|                    ');
    const e1subs =     '^                                        !';
    const inner =  cold('----i---j---k---l---|                    ', values);
    const innersubs = [' ^                   !                    ',
                     '         ^                   !            ',
                     '                     ^                   !'];
    const expected =   '-----i---j---(ki)(lj)k---(li)j---k---l---|';

    function project() { return inner; }
    function resultSelector(oV: string, iV: string, oI: number, iI: number) { return iV; }
    const result = e1.mergeMap(over(project, resultSelector), 2);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(inner.subscriptions).toBe(innersubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  // TODO: Figure out why the timing is off here
  it('should mapOver to many hot Observable, with parameter concurrency=1', () => {
    const values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
    const e1 =     hot('-a-------b-------c---|                                        ');
    const e1subs =     '^                                                            !';
    const hotA =   hot('x----i---j---k---l---|                                        ', values);
    const hotB =   hot('-x-x-xxxx-x-x-xxxxx-x----i---j---k---l---|                    ', values);
    const hotC =   hot('x-xxxx---x-x-x-x-x-xx--x--x-x--x--xxxx-x-----i---j---k---l---|', values);
    const asubs =      ' ^                   !                                        ';
    const bsubs =      '                     ^                   !                    ';
    const csubs =      '                                         ^                   !';
    const expected =   '-----i---j---k---l-------i---j---k---l-------i---j---k---l---|';
    const inners = { a: hotA, b: hotB, c: hotC };

    function project(x: string) { return inners[x]; }
    function resultSelector(oV: string, iV: string, oI: number, iI: number) { return iV; }
    const result = e1.mergeMap(over(project, resultSelector), 1);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(hotA.subscriptions).toBe(asubs);
    expectSubscriptions(hotB.subscriptions).toBe(bsubs);
    expectSubscriptions(hotC.subscriptions).toBe(csubs);
  });

  // TODO: Figure out why the timing is off here
  it('should mapOver to many hot Observable, with parameter concurrency=2', () => {
    const values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
    const e1 =     hot('-a-------b-------c---|                    ');
    const e1subs =     '^                                        !';
    const hotA =   hot('x----i---j---k---l---|                    ', values);
    const hotB =   hot('-x-x-xxxx----i---j---k---l---|            ', values);
    const hotC =   hot('x-xxxx---x-x-x-x-x-xx----i---j---k---l---|', values);
    const asubs =      ' ^                   !                    ';
    const bsubs =      '         ^                   !            ';
    const csubs =      '                     ^                   !';
    const expected =   '-----i---j---(ki)(lj)k---(li)j---k---l---|';
    const inners = { a: hotA, b: hotB, c: hotC };

    function project(x: string) { return inners[x]; }
    function resultSelector(oV: string, iV: string, oI: number, iI: number) { return iV; }
    const result = e1.mergeMap(over(project, resultSelector), 2);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(hotA.subscriptions).toBe(asubs);
    expectSubscriptions(hotB.subscriptions).toBe(bsubs);
    expectSubscriptions(hotC.subscriptions).toBe(csubs);
  });

  function arrayRepeat(value: any, times: number): any {
    const results = [];
    for (let i = 0; i < times; i++) {
      results.push(value);
    }
    return results;
  }

  it('should mapOver many outer to inner arrays, resultSelector throws', () => {
    const e1 =   hot('2-----4--------3--------2-------|');
    const e1subs  =  '^              !                 ';
    const expected = '(44)--(8888)---#                 ';

    const source = e1.mergeMap(over((value) => arrayRepeat(value, +value),
      (inner, outer) => {
        if (outer === '3') {
          throw 'error';
        }
        return String((+outer) + parseInt(inner));
    }));

    expectObservable(source).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mapOver many outer to inner arrays, resultSelector, project throws', () => {
    const e1 =   hot('2-----4--------3--------2-------|');
    const e1subs  =  '^              !                 ';
    const expected = '(44)--(8888)---#                 ';

    let invoked = 0;
    const source = e1.mergeMap(over((value) => {
      invoked++;
      if (invoked === 3) {
        throw 'error';
      }
      return arrayRepeat(value, +value);
    }, (inner, outer) => {
      return String((+outer) + parseInt(inner));
    }));

    expectObservable(source).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  type('should support type signatures', () => {
    let o: Observable<number>;

    /* tslint:disable:no-unused-variable */
    let a3: Observable<{ o: number; i: string; }> = o.mergeMap(over(x => x.toString(), (o, i) => ({ o, i })));
    /* tslint:enable:no-unused-variable */
  });
});
