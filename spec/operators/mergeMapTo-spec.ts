import { expect } from 'chai';
import { hot, cold, expectObservable, expectSubscriptions } from '../helpers/marble-testing';
import { mergeMapTo, map } from 'rxjs/operators';
import { from, of, Observable } from 'rxjs';

declare const type: Function;
declare const asDiagram: Function;

/** @test {mergeMapTo} */
describe('mergeMapTo', () => {
  asDiagram('mergeMapTo( 10\u2014\u201410\u2014\u201410\u2014| )')
  ('should map-and-flatten each item to an Observable', () => {
    const e1 =    hot('--1-----3--5-------|');
    const e1subs =    '^                  !';
    const e2 =   cold('x-x-x|              ', {x: 10});
    const expected =  '--x-x-x-x-xxxx-x---|';
    const values = {x: 10};

    const result = e1.pipe(mergeMapTo(e2));

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should support the deprecated resultSelector', () => {
    const results: Array<number[]> = [];

    of(1, 2, 3).pipe(
      mergeMapTo(
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
      mergeMapTo(
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

  it('should mergeMapTo many regular interval inners', () => {
    const x =   cold('----1---2---3---(4|)                        ');
    const xsubs =   ['^               !                           ',
    //                  ----1---2---3---(4|)
                   '    ^               !                         ',
    //                              ----1---2---3---(4|)
                   '                ^               !             ',
    //                                      ----1---2---3---(4|)
                   '                        ^               !     '];
    const e1 =   hot('a---b-----------c-------d-------|           ');
    const e1subs =   '^                               !           ';
    const expected = '----1---(21)(32)(43)(41)2---(31)(42)3---(4|)';

    const source = e1.pipe(mergeMapTo(x));

    expectObservable(source).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should map values to constant resolved promises and merge', (done) => {
    const source = from([4, 3, 2, 1]);

    const results: number[] = [];
    source.pipe(mergeMapTo(from(Promise.resolve(42)))).subscribe(
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

  it('should map values to constant rejected promises and merge', (done) => {
    const source = from([4, 3, 2, 1]);

    source.pipe(mergeMapTo((from(Promise.reject(42))))).subscribe(
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

  it('should mergeMapTo many outer values to many inner values', () => {
    const values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
    const e1 =     hot('-a-------b-------c-------d-------|            ');
    const e1subs =     '^                                !            ';
    const inner =  cold('----i---j---k---l---|                        ', values);
    const innersubs = [' ^                   !                        ',
                       '         ^                   !                ',
                       '                 ^                   !        ',
                       '                         ^                   !'];
    const expected =   '-----i---j---(ki)(lj)(ki)(lj)(ki)(lj)k---l---|';

    expectObservable(e1.pipe(mergeMapTo(inner))).toBe(expected, values);
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

    expectObservable(e1.pipe(mergeMapTo(inner))).toBe(expected, values);
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

    const source = e1.pipe(mergeMapTo(inner));
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

    const source = e1.pipe(
      map(x => x),
      mergeMapTo(inner),
      map(x => x),
    );

    expectObservable(source, unsub).toBe(expected, values);
    expectSubscriptions(inner.subscriptions).toBe(innersubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMapTo many outer to many inner, inner never completes', () => {
    const values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
    const e1 =     hot('-a-------b-------c-------d-------|         ');
    const e1subs =     '^                                !         ';
    const inner =  cold('----i---j---k---l-', values);
    const innersubs = [' ^                                         ',
                       '         ^                                 ',
                       '                 ^                         ',
                       '                         ^                 '];
    const expected =   '-----i---j---(ki)(lj)(ki)(lj)(ki)(lj)k---l-';

    expectObservable(e1.pipe(mergeMapTo(inner))).toBe(expected, values);
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

    expectObservable(e1.pipe(mergeMapTo(inner))).toBe(expected, values);
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

    expectObservable(e1.pipe(mergeMapTo(inner))).toBe(expected, values);
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

    expectObservable(e1.pipe(mergeMapTo(inner))).toBe(expected, values);
    expectSubscriptions(inner.subscriptions).toBe(innersubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMapTo many cold Observable, with parameter concurrency=1, without resultSelector', () => {
    const values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
    const e1 =     hot('-a-------b-------c---|                                        ');
    const e1subs =     '^                    !                                        ';
    const inner =  cold('----i---j---k---l---|                                        ', values);
    const innersubs = [' ^                   !                                        ',
                       '                     ^                   !                    ',
                       '                                         ^                   !'];
    const expected =   '-----i---j---k---l-------i---j---k---l-------i---j---k---l---|';

    const result = e1.pipe(mergeMapTo(inner, 1));

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(inner.subscriptions).toBe(innersubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMap to many cold Observable, with parameter concurrency=2, without resultSelector', () => {
    const values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
    const e1 =     hot('-a-------b-------c---|                    ');
    const e1subs =     '^                    !                    ';
    const inner =  cold('----i---j---k---l---|                    ', values);
    const innersubs = [' ^                   !                    ',
                       '         ^                   !            ',
                       '                     ^                   !'];
    const expected =   '-----i---j---(ki)(lj)k---(li)j---k---l---|';

    const result = e1.pipe(mergeMapTo(inner, 2));

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(inner.subscriptions).toBe(innersubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMapTo many outer to arrays', () => {
    const e1 =   hot('2-----4--------3--------2-------|');
    const e1subs =   '^                               !';
    const expected = '(0123)(0123)---(0123)---(0123)--|';

    const source = e1.pipe(mergeMapTo(['0', '1', '2', '3']));

    expectObservable(source).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMapTo many outer to inner arrays, and outer throws', () => {
    const e1 =   hot('2-----4--------3--------2-------#');
    const e1subs =   '^                               !';
    const expected = '(0123)(0123)---(0123)---(0123)--#';

    const source = e1.pipe(mergeMapTo(['0', '1', '2', '3']));

    expectObservable(source).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMapTo many outer to inner arrays, outer gets unsubscribed', () => {
    const e1 =   hot('2-----4--------3--------2-------|');
    const e1subs =   '^            !';
    const unsub =    '             !';
    const expected = '(0123)(0123)--';

    const source = e1.pipe(mergeMapTo(['0', '1', '2', '3']));

    expectObservable(source, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should map and flatten', () => {
    const source = of(1, 2, 3, 4).pipe(mergeMapTo(of('!')));

    const expected = ['!', '!', '!', '!'];
    let completed = false;

    source.subscribe((x) => {
      expect(x).to.equal(expected.shift());
    }, null, () => {
      expect(expected.length).to.equal(0);
      completed = true;
    });

    expect(completed).to.be.true;
  });

  it('should map and flatten an Array', () => {
    const source = of(1, 2, 3, 4).pipe(mergeMapTo(['!']));

    const expected = ['!', '!', '!', '!'];
    let completed = false;

    source.subscribe((x) => {
      expect(x).to.equal(expected.shift());
    }, null, () => {
      expect(expected.length).to.equal(0);
      completed = true;
    });

    expect(completed).to.be.true;
  });

  type('should support type signatures', () => {
    let o: Observable<number>;
    let m: Observable<string>;

    /* tslint:disable:no-unused-variable */
    let a1: Observable<string> = o.pipe(mergeMapTo(m));
    let a2: Observable<string> = o.pipe(mergeMapTo(m, 3));
    /* tslint:enable:no-unused-variable */
  });
});
