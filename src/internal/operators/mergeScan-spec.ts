import { TestScheduler } from 'rxjs/testing';
import { of, defer, EMPTY, NEVER, concat, throwError } from 'rxjs';
import { mergeScan, delay, mergeMap, takeWhile, startWith } from 'rxjs/operators';
import { expect } from 'chai';
import { assertDeepEquals } from 'rxjs/internal/test_helpers/assertDeepEquals';

/** @test {mergeScan} */
describe('mergeScan', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(assertDeepEquals);
  })

  it('should mergeScan things', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('--a--^--b--c--d--e--f--g--|');
      const e1subs =      '^                    !';
      const expected =    '---u--v--w--x--y--z--|';

      const values = {
        u: ['b'],
        v: ['b', 'c'],
        w: ['b', 'c', 'd'],
        x: ['b', 'c', 'd', 'e'],
        y: ['b', 'c', 'd', 'e', 'f'],
        z: ['b', 'c', 'd', 'e', 'f', 'g']
      };

      const source = e1.pipe(mergeScan((acc, x) => of([...acc, x]), []));

      expectObservable(source).toBe(expected, values);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should handle errors', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('--a--^--b--c--d--#');
      const e1subs =      '^           !';
      const expected =    '---u--v--w--#';

      const values = {
        u: ['b'],
        v: ['b', 'c'],
        w: ['b', 'c', 'd']
      };

      const source = e1.pipe(mergeScan((acc, x) => of([...acc, x]), []));

      expectObservable(source).toBe(expected, values);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should mergeScan values and be able to asynchronously project them', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('--a--^--b--c--d--e--f--g--|');
      const e1subs =      '^                    !';
      const expected =    '-----u--v--w--x--y--z|';

      const values = {
        u: ['b'],
        v: ['b', 'c'],
        w: ['b', 'c', 'd'],
        x: ['b', 'c', 'd', 'e'],
        y: ['b', 'c', 'd', 'e', 'f'],
        z: ['b', 'c', 'd', 'e', 'f', 'g']
      };

      const source = e1.pipe(mergeScan((acc, x) =>
        of([...acc, x]).pipe(delay(2, testScheduler)), []));

      expectObservable(source).toBe(expected, values);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should not stop ongoing async projections when source completes', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('--a--^--b--c--d--e--f--g--|');
      const e1subs =      '^                    !';
      const expected =    '--------u--v--w--x--y--(z|)';

      const values = {
        u: ['b'],
        v: ['c'],
        w: ['b', 'd'],
        x: ['c', 'e'],
        y: ['b', 'd', 'f'],
        z: ['c', 'e', 'g'],
      };

      const source = e1.pipe(mergeScan((acc, x) =>
        of([...acc, x]).pipe(delay(5, testScheduler)), []));

      expectObservable(source).toBe(expected, values);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should interrupt ongoing async projections when result is unsubscribed early', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('--a--^--b--c--d--e--f--g--|');
      const e1subs =      '^               !     ';
      const expected =    '--------u--v--w--     ';

      const values = {
        u: ['b'],
        v: ['c'],
        w: ['b', 'd'],
        x: ['c', 'e'],
        y: ['b', 'd', 'f'],
        z: ['c', 'e', 'g'],
      };

      const source = e1.pipe(mergeScan((acc, x) =>
        of([...acc, x]).pipe(delay(5, testScheduler)), []));

      expectObservable(source, e1subs).toBe(expected, values);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('--a--^--b--c--d--e--f--g--|');
      const e1subs =      '^               !     ';
      const expected =    '--------u--v--w--     ';
      const unsub =       '                !     ';

      const values = {
        u: ['b'],
        v: ['c'],
        w: ['b', 'd'],
        x: ['c', 'e'],
        y: ['b', 'd', 'f'],
        z: ['c', 'e', 'g'],
      };

      const source = e1
        .pipe(
          mergeMap((x) => of(x)),
          mergeScan((acc, x) =>
            of([...acc, x]).pipe(
              delay(5, testScheduler)
            )
          , []),
          mergeMap(function (x) { return of(x); })
        );

      expectObservable(source, unsub).toBe(expected, values);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should stop listening to a synchronous observable when unsubscribed', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const sideEffects: number[] = [];
      const synchronousObservable = concat(
        defer(() => {
          sideEffects.push(1);
          return of(1);
        }),
        defer(() => {
          sideEffects.push(2);
          return of(2);
        }),
        defer(() => {
          sideEffects.push(3);
          return of(3);
        })
      );

      of(null).pipe(
        mergeScan(() => synchronousObservable, 0),
        takeWhile((x) => x != 2) // unsubscribe at the second side-effect
      ).subscribe(() => { /* noop */ });

      expect(sideEffects).to.deep.equal([1, 2]);
    });
  });

  it('should handle errors in the projection function', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('--a--^--b--c--d--e--f--g--|');
      const e1subs =      '^        !';
      const expected =    '---u--v--#';

      const values = {
        u: ['b'],
        v: ['b', 'c']
      };

      const source = e1.pipe(mergeScan((acc, x) => {
        if (x === 'd') {
          throw 'bad!';
        }
        return of([...acc, x]);
      }, []));

      expectObservable(source).toBe(expected, values, 'bad!');
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should propagate errors from the projected Observable', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('--a--^--b--c--d--e--f--g--|');
      const e1subs =      '^  !';
      const expected =    '---#';

      const source = e1.pipe(mergeScan(() => throwError('bad!'), []));

      expectObservable(source).toBe(expected, undefined, 'bad!');
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should handle an empty projected Observable', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('--a--^--b--c--d--e--f--g--|');
      const e1subs =      '^                    !';
      const expected =    '---------------------(x|)';

      const values = { x: <string[]>[] };

      const source = e1.pipe(mergeScan(() => EMPTY, []));

      expectObservable(source).toBe(expected, values);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should handle a never projected Observable', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('--a--^--b--c--d--e--f--g--|');
      const e1subs =      '^                    !';
      const expected =    '----------------------';

      const values = { x: <string[]>[] };

      const source = e1.pipe(mergeScan((acc, x) => NEVER, []));

      expectObservable(source).toBe(expected, values);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('handle empty', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =  cold('|');
      const e1subs =   '(^!)';
      const expected = '(u|)';

      const values = {
        u: <string[]>[]
      };

      const source = e1.pipe(mergeScan((acc, x) => of([...acc, x]), []));

      expectObservable(source).toBe(expected, values);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('handle never', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =  cold('-');
      const e1subs =   '^';
      const expected = '-';

      const source = e1.pipe(mergeScan((acc, x) => of([...acc, x]), []));

      expectObservable(source).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('handle throw', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =  cold('#');
      const e1subs =   '(^!)';
      const expected = '#';

      const source = e1.pipe(mergeScan((acc, x) => of([...acc, x]), []));

      expectObservable(source).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should mergeScan unsubscription', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('--a--^--b--c--d--e--f--g--|');
      const expected =    '---u--v--w--x--';
      const sub =         '^             !';
      const values = {
        u: ['b'],
        v: ['b', 'c'],
        w: ['b', 'c', 'd'],
        x: ['b', 'c', 'd', 'e'],
        y: ['b', 'c', 'd', 'e', 'f'],
        z: ['b', 'c', 'd', 'e', 'f', 'g']
      };

      const source = e1.pipe(mergeScan((acc, x) => of([...acc, x]), []));

      expectObservable(source, sub).toBe(expected, values);
      expectSubscriptionsTo(e1).toBe(sub);
    });
  });

  it('should mergescan projects cold Observable with single concurrency', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('--a--b--c--|');
      const e1subs =   '^          !';

      const inner = [
        cold(          '--d--e--f--|                      '),
        cold(                     '--g--h--i--|           '),
        cold(                                '--j--k--l--|')
      ];

      const xsubs =    '  ^          !';
      const ysubs =    '             ^          !';
      const zsubs =    '                        ^          !';

      const expected = '--x-d--e--f--f-g--h--i--i-j--k--l--|';

      let index = 0;
      const source = e1.pipe(mergeScan((acc, x) => {
        const value = inner[index++];
        return value.pipe(startWith(acc));
      }, 'x', 1));

      expectObservable(source).toBe(expected);

      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(inner[0]).toBe(xsubs);
      expectSubscriptionsTo(inner[1]).toBe(ysubs);
      expectSubscriptionsTo(inner[2]).toBe(zsubs);
    });
  });

  it('should emit accumulator if inner completes without value', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('--a--^--b--c--d--e--f--g--|');
      const e1subs =      '^                    !';
      const expected =    '---------------------(x|)';

      const source = e1.pipe(mergeScan((acc, x) => EMPTY, ['1']));

      expectObservable(source).toBe(expected, {x: ['1']});
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should emit accumulator if inner completes without value after source completes', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('--a--^--b--c--d--e--f--g--|');
      const e1subs =      '^                    !';
      const expected =    '---------------------(x|)';

      const source = e1.pipe(
        mergeScan((acc, x) => EMPTY.pipe(delay(5, testScheduler)), ['1'])
      );

      expectObservable(source).toBe(expected, {x: ['1']});
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should mergescan projects hot Observable with single concurrency', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('---a---b---c---|');
      const e1subs =   '^              !';

      const inner = [
        hot(         '--d--e--f--|'),
        hot(         '----g----h----i----|'),
        hot(         '------j------k-------l------|')
      ];

      const xsubs =    '   ^       !';
      const ysubs =    '           ^       !';
      const zsubs =    '                   ^        !';

      const expected = '---x-e--f--f--i----i-l------|';

      let index = 0;
      const source = e1.pipe(mergeScan((acc, x) => {
        const value = inner[index++];
        return value.pipe(startWith(acc));
      }, 'x', 1));

      expectObservable(source).toBe(expected);

      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(inner[0]).toBe(xsubs);
      expectSubscriptionsTo(inner[1]).toBe(ysubs);
      expectSubscriptionsTo(inner[2]).toBe(zsubs);
    });
  });

  it('should mergescan projects cold Observable with dual concurrency', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('----a----b----c----|');
      const e1subs =   '^                  !';

      const inner = [
        cold(            '---d---e---f---|               '),
        cold(                 '---g---h---i---|          '),
        cold(                           '---j---k---l---|')
      ];

      const xsubs =    '    ^              !';
      const ysubs =    '         ^              !';
      const zsubs =    '                   ^              !';

      const expected = '----x--d-d-eg--fh--hi-j---k---l---|';

      let index = 0;
      const source = e1.pipe(mergeScan((acc, x) => {
        const value = inner[index++];
        return value.pipe(startWith(acc));
      }, 'x', 2));

      expectObservable(source).toBe(expected);

      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(inner[0]).toBe(xsubs);
      expectSubscriptionsTo(inner[1]).toBe(ysubs);
      expectSubscriptionsTo(inner[2]).toBe(zsubs);
    });
  });

  it('should mergescan projects hot Observable with dual concurrency', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('---a---b---c---|');
      const e1subs =   '^              !';

      const inner = [
        hot(         '--d--e--f--|'),
        hot(         '----g----h----i----|'),
        hot(         '------j------k-------l------|')
      ];

      const xsubs =    '   ^       !';
      const ysubs =    '       ^           !';
      const zsubs =    '           ^                !';

      const expected = '---x-e-efh-h-ki------l------|';

      let index = 0;
      const source = e1.pipe(mergeScan((acc, x) => {
        const value = inner[index++];
        return value.pipe(startWith(acc));
      }, 'x', 2));

      expectObservable(source).toBe(expected);

      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(inner[0]).toBe(xsubs);
      expectSubscriptionsTo(inner[1]).toBe(ysubs);
      expectSubscriptionsTo(inner[2]).toBe(zsubs);
    });
  });
});
