import { expect } from 'chai';
import { hot, cold, expectObservable, expectSubscriptions } from '../helpers/marble-testing';
import { reduce, mergeMap } from 'rxjs/operators';
import { range, of, Observable } from 'rxjs';

declare const type: Function;
declare const asDiagram: Function;

/** @test {reduce} */
describe('reduce operator', () => {
  asDiagram('reduce((acc, curr) => acc + curr, 0)')('should reduce', () => {
    const values = {
      a: 1, b: 3, c: 5, x: 9
    };
    const e1 =     hot('--a--b--c--|', values);
    const e1subs =     '^          !';
    const expected =   '-----------(x|)';

    const reduceFunction = function (o: number, x: number) {
      return o + x;
    };

    expectObservable(e1.pipe(reduce(reduceFunction, 0))).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should reduce with seed', () => {
    const e1 =     hot('--a--b--|');
    const e1subs =     '^       !';
    const expected =   '--------(x|)';

    const seed = 'n';
    const reduceFunction = function (o: string, x: string) {
      return o + x;
    };

    expectObservable(e1.pipe(reduce(reduceFunction, seed))).toBe(expected, {x: seed + 'ab'});
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should reduce with a seed of undefined', () => {
    const e1 = hot('--a--^--b--c--d--e--f--g--|');
    const e1subs =      '^                    !';
    const expected =    '---------------------(x|)';

    const values = {
      x: 'undefined b c d e f g'
    };

    const source = e1.pipe(reduce((acc: any, x: string) => acc + ' ' + x, undefined));

    expectObservable(source).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should reduce without a seed', () => {
    const e1 = hot('--a--^--b--c--d--e--f--g--|');
    const e1subs =      '^                    !';
    const expected =    '---------------------(x|)';

    const values = {
      x: 'b c d e f g'
    };

    const source = e1.pipe(reduce((acc: any, x: string) => acc + ' ' + x));

    expectObservable(source).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should reduce with index without seed', (done: MochaDone) => {
    const idx = [1, 2, 3, 4, 5];

    range(0, 6).pipe(reduce((acc, value, index) => {
      expect(idx.shift()).to.equal(index);
      return value;
    })).subscribe(null, null, () => {
      expect(idx).to.be.empty;
      done();
    });
  });

  it('should reduce with index with seed', (done: MochaDone) => {
    const idx = [0, 1, 2, 3, 4, 5];

    range(0, 6).pipe(reduce((acc, value, index) => {
      expect(idx.shift()).to.equal(index);
      return value;
    }, -1)).subscribe(null, null, () => {
      expect(idx).to.be.empty;
      done();
    });
  });

  it('should reduce with seed if source is empty', () => {
    const e1 = hot('--a--^-------|');
    const e1subs =      '^       !';
    const expected =    '--------(x|)';

    const expectedValue = '42';
    const reduceFunction = function (o: string, x: string) {
      return o + x;
    };

    expectObservable(e1.pipe(reduce(reduceFunction, expectedValue))).toBe(expected, {x: expectedValue});
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should raise error if reduce function throws without seed', () => {
    const e1 =     hot('--a--b--|');
    const e1subs =     '^    !   ';
    const expected =   '-----#   ';

    const reduceFunction = function (o: string, x: string) {
      throw 'error';
    };

    expectObservable(e1.pipe(reduce(reduceFunction))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should allow unsubscribing explicitly and early', () => {
    const e1 =     hot('--a--b--|');
    const unsub =      '      !  ';
    const e1subs =     '^     !  ';
    const expected =   '-------  ';

    const reduceFunction = function (o: string, x: string) {
      return o + x;
    };

    const result = e1.pipe(reduce(reduceFunction));

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    const e1 =     hot('--a--b--|');
    const e1subs =     '^     !  ';
    const expected =   '-------  ';
    const unsub =      '      !  ';

    const reduceFunction = function (o: string, x: string) {
      return o + x;
    };

    const result = e1.pipe(
      mergeMap((x: string) => of(x)),
      reduce(reduceFunction),
      mergeMap((x: string) => of(x))
    );

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should raise error if source emits and raises error with seed', () => {
    const e1 =   hot('--a--b--#');
    const e1subs =   '^       !';
    const expected = '--------#';

    const expectedValue = '42';
    const reduceFunction = function (o: string, x: string) {
      return o + x;
    };

    expectObservable(e1.pipe(reduce(reduceFunction, expectedValue))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should raise error if source raises error with seed', () => {
    const e1 =   hot('----#');
    const e1subs =   '^   !';
    const expected = '----#';

    const expectedValue = '42';
    const reduceFunction = function (o: string, x: string) {
      return o + x;
    };

    expectObservable(e1.pipe(reduce(reduceFunction, expectedValue))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should raise error if reduce function throws with seed', () => {
    const e1 =     hot('--a--b--|');
    const e1subs =     '^ !     ';
    const expected =   '--#     ';

    const seed = 'n';
    const reduceFunction = function (o: string, x: string) {
      throw 'error';
    };

    expectObservable(e1.pipe(reduce<string>(reduceFunction, seed))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not complete with seed if source emits but does not completes', () => {
    const e1 =     hot('--a--');
    const e1subs =     '^    ';
    const expected =   '-----';

    const seed = 'n';
    const reduceFunction = function (o: string, x: string) {
      return o + x;
    };

    expectObservable(e1.pipe(reduce(reduceFunction, seed))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not complete with seed if source never completes', () => {
    const e1 =  cold('-');
    const e1subs =   '^';
    const expected = '-';

    const seed = 'n';
    const reduceFunction = function (o: string, x: string) {
      return o + x;
    };

    expectObservable(e1.pipe(reduce(reduceFunction, seed))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not complete without seed if source emits but does not completes', () => {
    const e1 =   hot('--a--b--');
    const e1subs =   '^       ';
    const expected = '--------';

    const reduceFunction = function (o: string, x: string) {
      return o + x;
    };

    expectObservable(e1.pipe(reduce(reduceFunction))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not complete without seed if source never completes', () => {
    const e1 =  cold('-');
    const e1subs =   '^';
    const expected = '-';

    const reduceFunction = function (o: string, x: string) {
      return o + x;
    };

    expectObservable(e1.pipe(reduce(reduceFunction))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should reduce if source does not emit without seed', () => {
    const e1 = hot('--a--^-------|');
    const e1subs =      '^       !';
    const expected =    '--------|';

    const reduceFunction = function (o: string, x: string) {
      return o + x;
    };

    expectObservable(e1.pipe(reduce(reduceFunction))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should raise error if source emits and raises error without seed', () => {
    const e1 =   hot('--a--b--#');
    const e1subs =   '^       !';
    const expected = '--------#';

    const reduceFunction = function (o: string, x: string) {
      return o + x;
    };

    expectObservable(e1.pipe(reduce(reduceFunction))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should raise error if source raises error without seed', () => {
    const e1 =   hot('----#');
    const e1subs =   '^   !';
    const expected = '----#';

    const reduceFunction = function (o: string, x: string) {
      return o + x;
    };

    expectObservable(e1.pipe(reduce(reduceFunction))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  type('should accept array typed reducers', () => {
    let a: Observable<{ a: number; b: string }>;
    a.pipe(reduce((acc, value) => acc.concat(value), []));
  });

  type('should accept T typed reducers', () => {
    let a: Observable<{ a: number; b: string }>;
    const reduced = a.pipe(reduce((acc, value) => {
      value.a = acc.a;
      value.b = acc.b;
      return acc;
    }));

    reduced.subscribe(r => {
      r.a.toExponential();
      r.b.toLowerCase();
    });
  });

  type('should accept T typed reducers when T is an array', () => {
    let a: Observable<number[]>;
    const reduced = a.pipe(reduce((acc, value) => {
      return acc.concat(value);
    }, []));

    reduced.subscribe(rs => {
      rs[0].toExponential();
    });
  });

  type('should accept R typed reduces when R is an array of T', () => {
    let a: Observable<number>;
    const reduced = a.pipe(reduce((acc, value) => {
      acc.push(value);
      return acc;
    }, []));

    reduced.subscribe(rs => {
      rs[0].toExponential();
    });
  });

  type('should accept R typed reducers when R is assignable to T', () => {
    let a: Observable<{ a?: number; b?: string }>;
    const reduced = a.pipe(reduce((acc, value) => {
      value.a = acc.a;
      value.b = acc.b;
      return acc;
    }, {} as { a?: number; b?: string }));

    reduced.subscribe(r => {
      r.a.toExponential();
      r.b.toLowerCase();
    });
  });

  type('should accept R typed reducers when R is not assignable to T', () => {
    let a: Observable<{ a: number; b: string }>;
    const seed = {
      as: [1],
      bs: ['a']
    };
    const reduced = a.pipe(reduce((acc, value: {a: number, b: string}) => {
      acc.as.push(value.a);
      acc.bs.push(value.b);
      return acc;
    }, seed));

    reduced.subscribe(r => {
      r.as[0].toExponential();
      r.bs[0].toLowerCase();
    });
  });

  type('should accept R typed reducers and reduce to type R', () => {
    let a: Observable<{ a: number; b: string }>;
    const reduced = a.pipe(reduce<{ a?: number; b?: string }>((acc, value) => {
      value.a = acc.a;
      value.b = acc.b;
      return acc;
    }, {}));

    reduced.subscribe(r => {
      r.a.toExponential();
      r.b.toLowerCase();
    });
  });

  type('should accept array of R typed reducers and reduce to array of R', () => {
    let a: Observable<number>;
    const reduced = a.pipe(reduce<number, string[]>((acc, cur) => {
      console.log(acc);
      acc.push(cur.toString());
      return acc;
    }, [] as string[]));

    reduced.subscribe(rs => {
      rs[0].toLowerCase();
    });
  });
});
