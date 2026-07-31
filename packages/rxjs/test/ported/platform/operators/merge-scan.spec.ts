// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/mergeScan-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { delay } from 'rxjs/delay';
import { EMPTY } from 'rxjs/empty';
import { mergeMap } from 'rxjs/merge-map';
import { mergeScan } from 'rxjs/merge-scan';
import { NEVER } from 'rxjs/never';
import { startWith } from 'rxjs/start-with';
describe('mergeScan (platform)', () => {
  it('should mergeScan things', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
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
      const result = e1[mergeScan]((acc, x) => Observable.from([acc.concat(x)]), []);
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should handle errors', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^--b--c--d--#');
      const e1subs = '     ^-----------!';
      const expected = '   ---u--v--w--#';
      const values = {
        u: ['b'],
        v: ['b', 'c'],
        w: ['b', 'c', 'd'],
      };
      const result = e1[mergeScan]((acc, x) => Observable.from([acc.concat(x)]), []);
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should mergeScan values and be able to asynchronously project them', async () => {
    await rxTest(({ hot, time, expectObservable, expectSubscriptions }) => {
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
      const result = e1[mergeScan]((acc, x) => Observable.from([acc.concat(x)])[delay](t), []);
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not stop ongoing async projections when source completes', async () => {
    await rxTest(({ hot, time, expectObservable, expectSubscriptions }) => {
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
      const result = e1[mergeScan]((acc, x) => Observable.from([acc.concat(x)])[delay](t), []);
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should interrupt ongoing async projections when result is unsubscribed early', async () => {
    await rxTest(({ hot, time, expectObservable, expectSubscriptions }) => {
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
      const result = e1[mergeScan]((acc, x) => Observable.from([acc.concat(x)])[delay](t), []);
      expectObservable(result, unsub).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not break unsubscription chains when result is unsubscribed explicitly', async () => {
    await rxTest(({ hot, time, expectObservable, expectSubscriptions }) => {
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
      const result = e1[mergeMap]((x) => Observable.from([x]))
        [mergeScan]((acc, x) => Observable.from([acc.concat(x)])[delay](t), [])
        [mergeMap]((x) => Observable.from([x]));
      expectObservable(result, unsub).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should handle errors in the projection function', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^--b--c--d--e--f--g--|');
      const e1subs = '     ^--------!';
      const expected = '   ---u--v--#';
      const values = {
        u: ['b'],
        v: ['b', 'c'],
      };
      const result = e1[mergeScan]((acc, x) => {
        if (x === 'd') {
          throw new Error('bad!');
        }
        return Observable.from([acc.concat(x)]);
      }, []);
      expectObservable(result).toBe(expected, values, new Error('bad!'));
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should propagate errors from the projected Observable', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^--b--c--d--e--f--g--|');
      const e1subs = '     ^--!';
      const expected = '   ---#';
      const result = e1[mergeScan](
        () =>
          new Observable((subscriber) => {
            subscriber.error(new Error('bad!'));
          }),
        []
      );
      expectObservable(result).toBe(expected, undefined, new Error('bad!'));
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should handle an empty projected Observable', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^--b--c--d--e--f--g--|');
      const e1subs = '     ^--------------------!';
      const expected = '   ---------------------|';
      const result = e1[mergeScan](() => EMPTY, []);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should handle a never projected Observable', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^--b--c--d--e--f--g--|');
      const e1subs = '     ^--------------------!';
      const expected = '   ----------------------';
      const result = e1[mergeScan](() => NEVER, []);
      expectObservable(result, '^---------------------!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('handle empty', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' |   ');
      const e1subs = '  (^!)';
      const expected = '|   ';
      const result = e1[mergeScan]((acc, x) => Observable.from([acc.concat(x)]), []);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('handle never', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' -');
      const e1subs = '^!';
      const expected = '-';
      const result = e1[mergeScan]((acc, x) => Observable.from([acc.concat(x)]), []);
      expectObservable(result, '^!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('handle throw', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' #   ');
      const e1subs = '  (^!)';
      const expected = '#   ';
      const result = e1[mergeScan]((acc, x) => Observable.from([acc.concat(x)]), []);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should mergeScan unsubscription', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
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
      const result = e1[mergeScan]((acc, x) => Observable.from([acc.concat(x)]), []);
      expectObservable(result, unsub).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should mergeScan projects cold Observable with single concurrency', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const inner = [
        observable('            --d--e--f--|                      '),
        observable('                       --g--h--i--|           '),
        observable('                                  --j--k--l--|'),
      ];
      const xsubs = '   --^----------!                      ';
      const ysubs = '   -------------^----------!           ';
      const zsubs = '   ------------------------^----------!';
      const e1 = hot('  --0--1--2--|                        ');
      const e1subs = '  ^----------!                        ';
      const expected = '--x-d--e--f--f-g--h--i--i-j--k--l--|';
      const result = e1[mergeScan]((acc, x) => inner[+x][startWith](acc), 'x', 1);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(inner[0].subscriptions).toBe(xsubs);
      expectSubscriptions(inner[1].subscriptions).toBe(ysubs);
      expectSubscriptions(inner[2].subscriptions).toBe(zsubs);
    });
  });
  it('should not emit accumulator if inner completes without value', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^--b--c--d--e--f--g--|');
      const e1subs = '     ^--------------------!';
      const expected = '   ---------------------|';
      const result = e1[mergeScan](() => EMPTY, ['1']);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not emit accumulator if inner completes without value after source completes', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const x = observable('        -----|   ');
      //                         -----|
      // prettier-ignore
      const xsubs = [
                '                  ---^----!   ',
                '                  ------^----!',
            ];
      const e1 = hot('--a--^--b--c--|  ');
      const e1subs = '     ^--------!  ';
      const expected = '   -----------|';
      const result = e1[mergeScan](() => x, '1');
      expectObservable(result).toBe([{ frame: 9, notification: { kind: 'C' } }]);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(x.subscriptions).toBe(['---^----!']);
    });
  });
  it('should mergeScan projects hot Observable with single concurrency', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
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
      const result = e1[mergeScan]((acc, x) => inner[+x][startWith](acc), 'x', 1);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(inner[0].subscriptions).toBe(xsubs);
      expectSubscriptions(inner[1].subscriptions).toBe(ysubs);
      expectSubscriptions(inner[2].subscriptions).toBe(zsubs);
    });
  });
  it('should mergeScan projects cold Observable with dual concurrency', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const inner = [
        observable('              ---d---e---f---|               '),
        observable('                   ---g---h---i---|          '),
        observable('                             ---j---k---l---|'),
      ];
      const xsubs = '   ----^--------------!               ';
      const ysubs = '   ---------^--------------!          ';
      const zsubs = '   -------------------^--------------!';
      const e1 = hot('  ----0----1----2----|               ');
      const e1subs = '  ^------------------!               ';
      const expected = '----x--d-d-eg--fh--hi-j---k---l---|';
      const result = e1[mergeScan]((acc, x) => inner[+x][startWith](acc), 'x', 2);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(inner[0].subscriptions).toBe(xsubs);
      expectSubscriptions(inner[1].subscriptions).toBe(ysubs);
      expectSubscriptions(inner[2].subscriptions).toBe(zsubs);
    });
  });
  it('should mergeScan projects hot Observable with dual concurrency', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
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
      const result = e1[mergeScan]((acc, x) => inner[+x][startWith](acc), 'x', 2);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(inner[0].subscriptions).toBe(xsubs);
      expectSubscriptions(inner[1].subscriptions).toBe(ysubs);
      expectSubscriptions(inner[2].subscriptions).toBe(zsubs);
    });
  });
});
