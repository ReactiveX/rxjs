/** @prettier */
import { TestScheduler } from 'rxjs/testing';
import { of, defer, EMPTY, NEVER, concat, throwError, Observable } from 'rxjs';
import { mergeScan, delay, mergeMap, takeWhile, startWith, take } from 'rxjs/operators';
import { expect } from 'chai';
import { observableMatcher } from '../helpers/observableMatcher';

/** @test {mergeScan} */
describe('mergeScan', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(observableMatcher);
  });

  it('should mergeScan things', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^--b--c--d--e--f--g--|');
      const e1subs = '     ^--------------------!';
      const expected = '   ---u--v--w--x--y--z--|';

      const values = {
        u: ['b'],
        v: ['b', 'c'],
        w: ['b', 'c', 'd'],
        x: ['b', 'c', 'd', 'e'],
        y: ['b', 'c', 'd', 'e', 'f'],
        z: ['b', 'c', 'd', 'e', 'f', 'g'],
      };

      const result = e1.pipe(mergeScan((acc, x) => of(acc.concat(x)), [] as string[]));

      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should handle errors', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^--b--c--d--#');
      const e1subs = '     ^-----------!';
      const expected = '   ---u--v--w--#';

      const values = {
        u: ['b'],
        v: ['b', 'c'],
        w: ['b', 'c', 'd'],
      };

      const result = e1.pipe(mergeScan((acc, x) => of(acc.concat(x)), [] as string[]));

      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should mergeScan values and be able to asynchronously project them', () => {
    testScheduler.run(({ hot, time, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^--b--c--d--e--f--g--|');
      const e1subs = '     ^--------------------!';
      const t = time('        --|                '); // t = 2
      //                         --|
      //                            --|
      //                               --|
      //                                  --|
      //                                     --|
      const expected = '   -----u--v--w--x--y--z|';

      const values = {
        u: ['b'],
        v: ['b', 'c'],
        w: ['b', 'c', 'd'],
        x: ['b', 'c', 'd', 'e'],
        y: ['b', 'c', 'd', 'e', 'f'],
        z: ['b', 'c', 'd', 'e', 'f', 'g'],
      };

      const result = e1.pipe(mergeScan((acc, x) => of(acc.concat(x)).pipe(delay(t)), [] as string[]));

      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not stop ongoing async projections when source completes', () => {
    testScheduler.run(({ hot, time, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^--b--c--d--e--f--g--|     ');
      const e1subs = '     ^--------------------!     ';
      const t = time('        -----|'); //          acc = []; x = 'b'; acc.concat(x) = ['b']; t = 5
      //                         -----|             acc = []; x = 'c'; acc.concat(x) = ['c']
      //                            -----|          acc = ['b']; x = 'd'; acc.concat(x) = ['b', 'd']
      //                               -----|       acc = ['c']; x = 'e'; acc.concat(x) = ['c', 'e']
      //                                  -----|    acc = ['b', 'd']; x = 'f'; acc.concat(x) = ['b', 'd', 'f']
      //                                     -----| acc = ['c', 'e']; x = 'g'; acc.concat(x) = ['c', 'e', 'g']
      const expected = '   --------u--v--w--x--y--(z|)';

      const values = {
        u: ['b'],
        v: ['c'],
        w: ['b', 'd'],
        x: ['c', 'e'],
        y: ['b', 'd', 'f'],
        z: ['c', 'e', 'g'],
      };

      const result = e1.pipe(mergeScan((acc, x) => of(acc.concat(x)).pipe(delay(t)), [] as string[]));

      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should interrupt ongoing async projections when result is unsubscribed early', () => {
    testScheduler.run(({ hot, time, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^--b--c--d--e--f--g--|');
      const e1subs = '     ^---------------!     ';
      const t = time('        -----|'); // acc = []; x = 'b'; acc.concat(x) = ['b']; t = 5
      //                         -----|    acc = []; x = 'c'; acc.concat(x) = ['c']
      //                            -----| acc = ['b']; x = 'd'; acc.concat(x) = ['b', 'd']
      const expected = '   --------u--v--w--     ';
      const unsub = '      ----------------!     ';

      const values = {
        u: ['b'],
        v: ['c'],
        w: ['b', 'd'],
      };

      const result = e1.pipe(mergeScan((acc, x) => of(acc.concat(x)).pipe(delay(t)), [] as string[]));

      expectObservable(result, unsub).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    testScheduler.run(({ hot, time, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^--b--c--d--e--f--g--|');
      const e1subs = '     ^---------------!     ';
      const t = time('        -----|'); // acc = []; x = 'b'; acc.concat(x) = ['b']; t = 5
      //                         -----|    acc = []; x = 'c'; acc.concat(x) = ['c']
      //                            -----| acc = ['b']; x = 'd'; acc.concat(x) = ['b', 'd']
      const expected = '   --------u--v--w--     ';
      const unsub = '      ----------------!     ';

      const values = {
        u: ['b'],
        v: ['c'],
        w: ['b', 'd'],
      };

      const result = e1.pipe(
        mergeMap((x) => of(x)),
        mergeScan((acc, x) => of(acc.concat(x)).pipe(delay(t)), [] as string[]),
        mergeMap((x) => of(x))
      );

      expectObservable(result, unsub).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should stop listening to a synchronous observable when unsubscribed', () => {
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

    of(null)
      .pipe(
        mergeScan(() => synchronousObservable, 0),
        takeWhile((x) => x != 2) // unsubscribe at the second side-effect
      )
      .subscribe(() => {
        /* noop */
      });

    expect(sideEffects).to.deep.equal([1, 2]);
  });

  it('should handle errors in the projection function', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^--b--c--d--e--f--g--|');
      const e1subs = '     ^--------!';
      const expected = '   ---u--v--#';

      const values = {
        u: ['b'],
        v: ['b', 'c'],
      };

      const result = e1.pipe(
        mergeScan((acc, x) => {
          if (x === 'd') {
            throw new Error('bad!');
          }
          return of(acc.concat(x));
        }, [] as string[])
      );

      expectObservable(result).toBe(expected, values, new Error('bad!'));
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should propagate errors from the projected Observable', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^--b--c--d--e--f--g--|');
      const e1subs = '     ^--!';
      const expected = '   ---#';

      const result = e1.pipe(mergeScan(() => throwError(() => new Error('bad!')), []));

      expectObservable(result).toBe(expected, undefined, new Error('bad!'));
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should handle an empty projected Observable', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^--b--c--d--e--f--g--|');
      const e1subs = '     ^--------------------!';
      const expected = '   ---------------------|';

      const result = e1.pipe(mergeScan(() => EMPTY, []));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should handle a never projected Observable', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^--b--c--d--e--f--g--|');
      const e1subs = '     ^--------------------!';
      const expected = '   ----------------------';

      const result = e1.pipe(mergeScan(() => NEVER, []));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('handle empty', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' |   ');
      const e1subs = '  (^!)';
      const expected = '|   ';

      const result = e1.pipe(mergeScan((acc, x) => of(acc.concat(x)), [] as string[]));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('handle never', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' -');
      const e1subs = '  ^';
      const expected = '-';

      const result = e1.pipe(mergeScan((acc, x) => of(acc.concat(x)), [] as string[]));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('handle throw', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' #   ');
      const e1subs = '  (^!)';
      const expected = '#   ';

      const result = e1.pipe(mergeScan((acc, x) => of(acc.concat(x)), [] as string[]));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should mergeScan unsubscription', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^--b--c--d--e--f--g--|');
      const e1subs = '     ^-------------!       ';
      const expected = '   ---u--v--w--x--       ';
      const unsub = '      --------------!       ';

      const values = {
        u: ['b'],
        v: ['b', 'c'],
        w: ['b', 'c', 'd'],
        x: ['b', 'c', 'd', 'e'],
      };

      const result = e1.pipe(mergeScan((acc, x) => of(acc.concat(x)), [] as string[]));

      expectObservable(result, unsub).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should mergeScan projects cold Observable with single concurrency', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const inner = [
        cold('            --d--e--f--|                      '),
        cold('                       --g--h--i--|           '),
        cold('                                  --j--k--l--|'),
      ];
      const xsubs = '   --^----------!                      ';
      const ysubs = '   -------------^----------!           ';
      const zsubs = '   ------------------------^----------!';

      const e1 = hot('  --0--1--2--|                        ');
      const e1subs = '  ^----------!                        ';
      const expected = '--x-d--e--f--f-g--h--i--i-j--k--l--|';

      const result = e1.pipe(mergeScan((acc, x) => inner[+x].pipe(startWith(acc)), 'x', 1));

      expectObservable(result).toBe(expected);

      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(inner[0].subscriptions).toBe(xsubs);
      expectSubscriptions(inner[1].subscriptions).toBe(ysubs);
      expectSubscriptions(inner[2].subscriptions).toBe(zsubs);
    });
  });

  it('should not emit accumulator if inner completes without value', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^--b--c--d--e--f--g--|');
      const e1subs = '     ^--------------------!';
      const expected = '   ---------------------|';

      const result = e1.pipe(mergeScan(() => EMPTY, ['1']));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not emit accumulator if inner completes without value after source completes', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const x = cold('        -----|   ');
      //                         -----|
      // prettier-ignore
      const xsubs = [
        '                  ---^----!   ',
        '                  ------^----!',
      ];
      const e1 = hot('--a--^--b--c--|  ');
      const e1subs = '     ^--------!  ';
      const expected = '   -----------|';

      const result = e1.pipe(mergeScan(() => x, '1'));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
    });
  });

  it('should mergeScan projects hot Observable with single concurrency', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const inner = [
        hot('           --d--e--f--|                 '),
        hot('           ----g----h----i----|         '),
        hot('           ------j------k-------l------|'),
      ];
      const xsubs = '   ---^-------!                 ';
      const ysubs = '   -----------^-------!         ';
      const zsubs = '   -------------------^--------!';
      const e1 = hot('  ---0---1---2---|             ');
      const e1subs = '  ^--------------!             ';
      const expected = '---x-e--f--f--i----i-l------|';

      const result = e1.pipe(mergeScan((acc, x) => inner[+x].pipe(startWith(acc)), 'x', 1));

      expectObservable(result).toBe(expected);

      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(inner[0].subscriptions).toBe(xsubs);
      expectSubscriptions(inner[1].subscriptions).toBe(ysubs);
      expectSubscriptions(inner[2].subscriptions).toBe(zsubs);
    });
  });

  it('should mergeScan projects cold Observable with dual concurrency', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const inner = [
        cold('              ---d---e---f---|               '),
        cold('                   ---g---h---i---|          '),
        cold('                             ---j---k---l---|'),
      ];
      const xsubs = '   ----^--------------!               ';
      const ysubs = '   ---------^--------------!          ';
      const zsubs = '   -------------------^--------------!';
      const e1 = hot('  ----0----1----2----|               ');
      const e1subs = '  ^------------------!               ';
      const expected = '----x--d-d-eg--fh--hi-j---k---l---|';

      const result = e1.pipe(mergeScan((acc, x) => inner[+x].pipe(startWith(acc)), 'x', 2));

      expectObservable(result).toBe(expected);

      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(inner[0].subscriptions).toBe(xsubs);
      expectSubscriptions(inner[1].subscriptions).toBe(ysubs);
      expectSubscriptions(inner[2].subscriptions).toBe(zsubs);
    });
  });

  it('should mergeScan projects hot Observable with dual concurrency', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const inner = [
        hot('           --d--e--f-----|              '),
        hot('           ----g----h------i----|       '),
        hot('           ------j--------k-----l------|'),
      ];
      const xsubs = '   ---^----------!              ';
      const ysubs = '   -------^-------------!       ';
      const zsubs = '   --------------^-------------!';
      const e1 = hot('  ---0---1---2---|             ');
      const e1subs = '  ^--------------!             ';
      const expected = '---x-e-efh----hki----l------|';

      const result = e1.pipe(mergeScan((acc, x) => inner[+x].pipe(startWith(acc)), 'x', 2));

      expectObservable(result).toBe(expected);

      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(inner[0].subscriptions).toBe(xsubs);
      expectSubscriptions(inner[1].subscriptions).toBe(ysubs);
      expectSubscriptions(inner[2].subscriptions).toBe(zsubs);
    });
  });

  it('should pass current index to accumulator', () => {
    const recorded: number[] = [];
    const e1 = of('a', 'b', 'c', 'd');

    e1.pipe(
      mergeScan((acc, x, index) => {
        recorded.push(index);
        return of(index);
      }, 0)
    ).subscribe();

    expect(recorded).to.deep.equal([0, 1, 2, 3]);
  });

  it('should stop listening to a synchronous observable when unsubscribed', () => {
    const sideEffects: number[] = [];
    const synchronousObservable = new Observable<number>((subscriber) => {
      // This will check to see if the subscriber was closed on each loop
      // when the unsubscribe hits (from the `take`), it should be closed
      for (let i = 0; !subscriber.closed && i < 10; i++) {
        sideEffects.push(i);
        subscriber.next(i);
      }
    });

    synchronousObservable
      .pipe(
        mergeScan((acc, value) => of(value), 0),
        take(3)
      )
      .subscribe(() => {
        /* noop */
      });

    expect(sideEffects).to.deep.equal([0, 1, 2]);
  });
});
