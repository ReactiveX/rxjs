import * as Rx from '../../dist/cjs/Rx';
declare const {hot, cold, expectObservable, expectSubscriptions};
import {DoneSignature} from '../helpers/test-helper';

const Observable = Rx.Observable;

/** @test {mergeMapTo} */
describe('Observable.prototype.mergeMapTo', () => {
  it('should mergeMapTo many regular interval inners', () => {
    const x =   cold('----1---2---3---(4|)                        ');
    const xsubs =   ['^               !                           ',
    //                  ----1---2---3---(4|)
                   '    ^               !                       ',
    //                              ----1---2---3---(4|)
                   '                ^               !           ',
    //                                      ----1---2---3---(4|)
                   '                        ^               !   '];
    const e1 =   hot('a---b-----------c-------d-------|           ');
    const e1subs =   '^                                       !';
    const expected = '----1---(21)(32)(43)(41)2---(31)(42)3---(4|)';

    const source = e1.mergeMapTo(x);

    expectObservable(source).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should map values to constant resolved promises and merge', (done: DoneSignature) => {
    const source = Rx.Observable.from([4, 3, 2, 1]);

    const results = [];
    source.mergeMapTo(Observable.from(Promise.resolve(42))).subscribe(
      (x: any) => {
        results.push(x);
      },
      (err: any) => {
        done.fail('Subscriber error handler not supposed to be called.');
      },
      () => {
        expect(results).toEqual([42, 42, 42, 42]);
        done();
      });
  });

  it('should map values to constant rejected promises and merge', (done: DoneSignature) => {
    const source = Rx.Observable.from([4, 3, 2, 1]);

    source.mergeMapTo(Observable.from(Promise.reject(42))).subscribe(
      (x: any) => {
        done.fail('Subscriber next handler not supposed to be called.');
      },
      (err: any) => {
        expect(err).toEqual(42);
        done();
      },
      () => {
        done.fail('Subscriber complete handler not supposed to be called.');
      });
  });

  it('should mergeMapTo values to resolved promises with resultSelector', (done: DoneSignature) => {
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
      [1, 42, 3, 0],
    ];
    source.mergeMapTo(inner, resultSelector).subscribe(
      (x: any) => {
        results.push(x);
      },
      (err: any) => {
        done.fail('Subscriber error handler not supposed to be called.');
      },
      () => {
        expect(results).toEqual([8, 8, 8, 8]);
        (<any>expect(resultSelectorCalledWith)).toDeepEqual(expectedCalls);
        done();
      });
  });

  it('should mergeMapTo values to rejected promises with resultSelector', (done: DoneSignature) => {
    const source = Rx.Observable.from([4, 3, 2, 1]);
    const inner = Observable.from(Promise.reject(42));
    const resultSelector = () => {
      throw 'this should not be called';
    };

    source.mergeMapTo(inner, resultSelector).subscribe(
      (x: any) => {
        done.fail('Subscriber next handler not supposed to be called.');
      },
      (err: any) => {
        expect(err).toEqual(42);
        done();
      },
      () => {
        done.fail('Subscriber complete handler not supposed to be called.');
      });
  });

  it('should mergeMapTo many outer values to many inner values', () => {
    const values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
    const e1 =     hot('-a-------b-------c-------d-------|            ');
    const e1subs =     '^                                            !';
    const inner =  cold('----i---j---k---l---|                        ', values);
    const innersubs = [' ^                   !                        ',
                     '         ^                   !                ',
                     '                 ^                   !        ',
                     '                         ^                   !'];
    const expected =   '-----i---j---(ki)(lj)(ki)(lj)(ki)(lj)k---l---|';

    expectObservable(e1.mergeMapTo(inner)).toBe(expected, values);
    expectSubscriptions(inner.subscriptions).toBe(innersubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMapTo many outer to many inner, complete late', () => {
    const values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
    const e1 =     hot('-a-------b-------c-------d-----------------------|');
    const e1subs =     '^                                                !';
    const inner =  cold('----i---j---k---l---|', values);
    const innersubs = [' ^                   !                            ',
                     '         ^                   !                    ',
                     '                 ^                   !            ',
                     '                         ^                   !    '];
    const expected =   '-----i---j---(ki)(lj)(ki)(lj)(ki)(lj)k---l-------|';

    expectObservable(e1.mergeMapTo(inner)).toBe(expected, values);
    expectSubscriptions(inner.subscriptions).toBe(innersubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMapTo many outer to many inner, outer never completes', () => {
    const values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
    const e1 =     hot('-a-------b-------c-------d-------e---------------f------');
    const e1subs =     '^                                                      !';
    const inner = cold( '----i---j---k---l---|', values);
    const innersubs = [' ^                   !                                  ',
                     '         ^                   !                          ',
                     '                 ^                   !                  ',
                     '                         ^                   !          ',
                     '                                 ^                   !  ',
                     '                                                 ^     !'];
    const unsub =      '                                                       !';
    const expected =   '-----i---j---(ki)(lj)(ki)(lj)(ki)(lj)(ki)(lj)k---l---i-';

    const source = e1.mergeMapTo(inner);
    expectObservable(source, unsub).toBe(expected, values);
    expectSubscriptions(inner.subscriptions).toBe(innersubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    const values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
    const e1 =     hot('-a-------b-------c-------d-------e---------------f------');
    const e1subs =     '^                                                      !';
    const inner = cold( '----i---j---k---l---|', values);
    const innersubs = [' ^                   !                                  ',
                     '         ^                   !                          ',
                     '                 ^                   !                  ',
                     '                         ^                   !          ',
                     '                                 ^                   !  ',
                     '                                                 ^     !'];
    const unsub =      '                                                       !';
    const expected =   '-----i---j---(ki)(lj)(ki)(lj)(ki)(lj)(ki)(lj)k---l---i-';

    const source = e1
      .map(function (x) { return x; })
      .mergeMapTo(inner)
      .map(function (x) { return x; });

    expectObservable(source, unsub).toBe(expected, values);
    expectSubscriptions(inner.subscriptions).toBe(innersubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMapTo many outer to many inner, inner never completes', () => {
    const values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
    const e1 =     hot('-a-------b-------c-------d-------|         ');
    const e1subs =     '^                                          ';
    const inner =  cold('----i---j---k---l-', values);
    const innersubs = [' ^                                         ',
                     '         ^                                 ',
                     '                 ^                         ',
                     '                         ^                 '];
    const expected =   '-----i---j---(ki)(lj)(ki)(lj)(ki)(lj)k---l-';

    expectObservable(e1.mergeMapTo(inner)).toBe(expected, values);
    expectSubscriptions(inner.subscriptions).toBe(innersubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMapTo many outer to many inner, and inner throws', () => {
    const values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
    const e1 =     hot('-a-------b-------c-------d-------|');
    const e1subs =     '^                        !        ';
    const inner =  cold('----i---j---k---l-------#        ', values);
    const innersubs = [' ^                       !        ',
                     '         ^               !        ',
                     '                 ^       !        ',
                     '                         (^!)     '];
    const expected =   '-----i---j---(ki)(lj)(ki)#';

    expectObservable(e1.mergeMapTo(inner)).toBe(expected, values);
    expectSubscriptions(inner.subscriptions).toBe(innersubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMapTo many outer to many inner, and outer throws', () => {
    const values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
    const e1 =     hot('-a-------b-------c-------d-------#');
    const e1subs =     '^                                !';
    const inner =  cold('----i---j---k---l---|            ', values);
    const innersubs = [' ^                   !            ',
                     '         ^                   !    ',
                     '                 ^               !',
                     '                         ^       !'];
    const expected =   '-----i---j---(ki)(lj)(ki)(lj)(ki)#';

    expectObservable(e1.mergeMapTo(inner)).toBe(expected, values);
    expectSubscriptions(inner.subscriptions).toBe(innersubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMapTo many outer to many inner, both inner and outer throw', () => {
    const values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
    const e1 =     hot('-a-------b-------c-------d-------#');
    const e1subs =     '^                    !';
    const inner =  cold('----i---j---k---l---#', values);
    const innersubs = [' ^                   !',
                     '         ^           !',
                     '                 ^   !'];
    const expected =   '-----i---j---(ki)(lj)#';

    expectObservable(e1.mergeMapTo(inner)).toBe(expected, values);
    expectSubscriptions(inner.subscriptions).toBe(innersubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMapTo many cold Observable, with parameter concurrency=1', () => {
    const values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
    const e1 =     hot('-a-------b-------c---|                                        ');
    const e1subs =     '^                                                            !';
    const inner =  cold('----i---j---k---l---|                                        ', values);
    const innersubs = [' ^                   !                                        ',
                     '                     ^                   !                    ',
                     '                                         ^                   !'];
    const expected =   '-----i---j---k---l-------i---j---k---l-------i---j---k---l---|';

    function resultSelector(oV, iV, oI, iI) { return iV; }
    const result = e1.mergeMapTo(inner, resultSelector, 1);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(inner.subscriptions).toBe(innersubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMap to many cold Observable, with parameter concurrency=2', () => {
    const values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
    const e1 =     hot('-a-------b-------c---|                    ');
    const e1subs =     '^                                        !';
    const inner =  cold('----i---j---k---l---|                    ', values);
    const innersubs = [' ^                   !                    ',
                     '         ^                   !            ',
                     '                     ^                   !'];
    const expected =   '-----i---j---(ki)(lj)k---(li)j---k---l---|';

    function resultSelector(oV, iV, oI, iI) { return iV; }
    const result = e1.mergeMapTo(inner, resultSelector, 2);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(inner.subscriptions).toBe(innersubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMapTo many outer to arrays', () => {
    const e1 =   hot('2-----4--------3--------2-------|');
    const e1subs =   '^                               !';
    const expected = '(0123)(0123)---(0123)---(0123)--|';

    const source = e1.mergeMapTo(<any>['0', '1', '2', '3']);

    expectObservable(source).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMapTo many outer to inner arrays, using resultSelector', () => {
    const e1 =   hot('2-----4--------3--------2-------|');
    const e1subs =   '^                               !';
    const expected = '(2345)(4567)---(3456)---(2345)--|';

    const source = e1.mergeMapTo(<any>['0', '1', '2', '3'],
      (x: string, y: string) => String(parseInt(x) + parseInt(y)));

    expectObservable(source).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMapTo many outer to inner arrays, and outer throws', () => {
    const e1 =   hot('2-----4--------3--------2-------#');
    const e1subs =   '^                               !';
    const expected = '(0123)(0123)---(0123)---(0123)--#';

    const source = e1.mergeMapTo(<any>['0', '1', '2', '3']);

    expectObservable(source).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMapTo many outer to inner arrays, resultSelector, outer throws', () => {
    const e1 =   hot('2-----4--------3--------2-------#');
    const e1subs =   '^                               !';
    const expected = '(2345)(4567)---(3456)---(2345)--#';

    const source = e1.mergeMapTo(<any>['0', '1', '2', '3'],
    (x: string, y: string) => String(parseInt(x) + parseInt(y)));

    expectObservable(source).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMapTo many outer to inner arrays, outer gets unsubscribed', () => {
    const e1 =   hot('2-----4--------3--------2-------|');
    const e1subs =   '^            !';
    const unsub =    '             !';
    const expected = '(0123)(0123)--';

    const source = e1.mergeMapTo(<any>['0', '1', '2', '3']);

    expectObservable(source, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMapTo many outer to inner arrays, resultSelector, outer unsubscribed', () => {
    const e1 =   hot('2-----4--------3--------2-------|');
    const e1subs =   '^            !';
    const unsub =    '             !';
    const expected = '(2345)(4567)--';

    const source = e1.mergeMapTo(<any>['0', '1', '2', '3'],
      (x: string, y: string) => String(parseInt(x) + parseInt(y)));

    expectObservable(source, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMapTo many outer to inner arrays, resultSelector throws', () => {
    const e1 =   hot('2-----4--------3--------2-------|');
    const e1subs =   '^              !';
    const expected = '(2345)(4567)---#';

    const source = e1.mergeMapTo(<any>['0', '1', '2', '3'], (outer: string, inner: string) => {
      if (outer === '3') {
        throw 'error';
      }
      return String(parseInt(outer) + parseInt(inner));
    });

    expectObservable(source).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should map and flatten', () => {
    const source = Observable.of(1, 2, 3, 4).mergeMapTo(Observable.of('!'));

    const expected = ['!', '!', '!', '!'];
    let completed = false;

    source.subscribe((x: string) => {
      expect(x).toBe(expected.shift());
    }, null, () => {
      expect(expected.length).toBe(0);
      completed = true;
    });

    expect(completed).toBe(true);
  });

  it('should map and flatten an Array', () => {
    const source = Observable.of(1, 2, 3, 4).mergeMapTo(<any>['!']);

    const expected = ['!', '!', '!', '!'];
    let completed = false;

    source.subscribe((x: string) => {
      expect(x).toBe(expected.shift());
    }, null, () => {
      expect(expected.length).toBe(0);
      completed = true;
    });

    expect(completed).toBe(true);
  });
});
