// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/mergeAll-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { mergeMap } from 'rxjs/merge-map';
describe('mergeAll (platform)', () => {
  it('should merge a hot observable of cold observables', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const x = observable('    --a---b--c---d--|      ');
      const xsubs = '   --^---------------!      ';
      const y = observable('           ----e---f--g---|');
      const ysubs = '   ---------^--------------!';
      const e1 = hot('  --x------y-------|       ', { x: x, y: y });
      const e1subs = '  ^----------------!       ';
      const expected = '----a---b--c-e-d-f--g---|';
      expectObservable(e1[mergeMap]((value) => value, { concurrent: Infinity })).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should merge all observables in an observable', async () => {
    await rxTest(({ expectObservable }) => {
      // prettier-ignore
      const e1 = Observable.from([
                Observable.from(['a']),
                Observable.from(['b']),
                Observable.from(['c'])
            ]);
      const expected = '(abc|)';
      expectObservable(e1[mergeMap]((value) => value, { concurrent: Infinity })).toBe(expected);
    });
  });
  it('should throw if any child observable throws', async () => {
    await rxTest(({ expectObservable }) => {
      // prettier-ignore
      const e1 = Observable.from([
                Observable.from(['a']),
                new Observable(subscriber => {
                    subscriber.error(('error'));
                }),
                Observable.from(['c'])
            ]);
      const expected = '(a#)';
      expectObservable(e1[mergeMap]((value) => value, { concurrent: Infinity })).toBe(expected);
    });
  });
  it('should handle merging a hot observable of observables', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const x = observable('    a---b---c---|   ');
      const xsubs = '   --^-----------!   ';
      const y = observable('       d---e---f---|');
      const ysubs = '   -----^-----------!';
      const e1 = hot('  --x--y--|         ', { x: x, y: y });
      const e1subs = '  ^-------!         ';
      const expected = '--a--db--ec--f---|';
      expectObservable(e1[mergeMap]((value) => value, { concurrent: Infinity })).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should merge one cold Observable at a time with parameter concurrency=1', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const x = observable('    a---b---c---|            ');
      const xsubs = '   --^-----------!            ';
      const y = observable('                d---e---f---|');
      const ysubs = '   --------------^-----------!';
      const e1 = hot('  --x--y--|                  ', { x: x, y: y });
      const e1subs = '  ^-------!                  ';
      const expected = '--a---b---c---d---e---f---|';
      expectObservable(e1[mergeMap]((value) => value, { concurrent: 1 })).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should merge two cold Observables at a time with parameter concurrency=2', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const x = observable('    a---b---c---|        ');
      const xsubs = '   --^-----------!        ';
      const y = observable('       d---e---f---|     ');
      const ysubs = '   -----^-----------!     ';
      const z = observable('                --g---h-|');
      const zsubs = '   --------------^-------!';
      const e1 = hot('  --x--y--z--|           ', { x: x, y: y, z: z });
      const e1subs = '  ^----------!           ';
      const expected = '--a--db--ec--f--g---h-|';
      expectObservable(e1[mergeMap]((value) => value, { concurrent: 2 })).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(z.subscriptions).toBe(zsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should merge one hot Observable at a time with parameter concurrency=1', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const x = hot('   ---a---b---c---|          ');
      const xsubs = '   --^------------!          ';
      const y = hot('   -------------d---e---f---|');
      const ysubs = '   ---------------^---------!';
      const e1 = hot('  --x--y--|                 ', { x: x, y: y });
      const e1subs = '  ^-------!                 ';
      const expected = '---a---b---c-----e---f---|';
      expectObservable(e1[mergeMap]((value) => value, { concurrent: 1 })).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should merge two hot Observables at a time with parameter concurrency=2', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const x = hot('   i--a---b---c---|        ');
      const xsubs = '   --^------------!        ';
      const y = hot('   -i-i--d---e---f---|     ');
      const ysubs = '   -----^------------!     ';
      const z = hot('   --i--i--i--i-----g---h-|');
      const zsubs = '   ---------------^-------!';
      const e1 = hot('  --x--y--z--|            ', { x: x, y: y, z: z });
      const e1subs = '  ^----------!            ';
      const expected = '---a--db--ec--f--g---h-|';
      expectObservable(e1[mergeMap]((value) => value, { concurrent: 2 })).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(z.subscriptions).toBe(zsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should handle merging a hot observable of observables, outer unsubscribed early', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const x = observable('    a---b---c---|   ');
      const xsubs = '   --^---------!     ';
      const y = observable('       d---e---f---|');
      const ysubs = '   -----^------!     ';
      const e1 = hot('  --x--y--|         ', { x: x, y: y });
      const e1subs = '  ^-------!         ';
      const expected = '--a--db--ec--     ';
      const unsub = '   ------------!     ';
      expectObservable(
        e1[mergeMap]((value) => value, { concurrent: Infinity }),
        unsub
      ).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not break unsubscription chains when result is unsubscribed explicitly', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const x = observable('    a---b---c---|   ');
      const xsubs = '   --^---------!     ';
      const y = observable('       d---e---f---|');
      const ysubs = '   -----^------!     ';
      const e1 = hot('  --x--y--|         ', { x: x, y: y });
      const e1subs = '  ^-------!         ';
      const expected = '--a--db--ec--     ';
      const unsub = '   ------------!     ';
      const result = e1[mergeMap]((x) => Observable.from([x]))
        [mergeMap]((value) => value, { concurrent: Infinity })
        [mergeMap]((x) => Observable.from([x]));
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should merge parallel emissions', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const x = observable('    ----a----b----c---|');
      const xsubs = '   --^-----------------!';
      const y = observable('       -d----e----f---|');
      const ysubs = '   -----^--------------!';
      const e1 = hot('  --x--y--|            ', { x: x, y: y });
      const e1subs = '  ^-------!            ';
      const expected = '------(ad)-(be)-(cf)|';
      expectObservable(e1[mergeMap]((value) => value, { concurrent: Infinity })).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should merge empty and empty', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const x = observable('    |      ');
      const xsubs = '   --(^!)   ';
      const y = observable('       |   ');
      const ysubs = '   -----(^!)';
      const e1 = hot('  --x--y--|', { x: x, y: y });
      const e1subs = '  ^-------!';
      const expected = '--------|';
      expectObservable(e1[mergeMap]((value) => value, { concurrent: Infinity })).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should merge three empties', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const x = observable('    |         ');
      const xsubs = '   --(^!)      ';
      const y = observable('       |      ');
      const ysubs = '   -----(^!)   ';
      const z = observable('         |    ');
      const zsubs = '   -------(^!) ';
      const e1 = hot('  --x--y-z---|', { x: x, y: y, z: z });
      const e1subs = '  ^----------!';
      const expected = '-----------|';
      expectObservable(e1[mergeMap]((value) => value, { concurrent: Infinity })).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(z.subscriptions).toBe(zsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should merge never and empty', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const x = observable('    -      ');
      const xsubs = '--^------!';
      const y = observable('       |   ');
      const ysubs = '   -----(^!)';
      const e1 = hot('  --x--y--|', { x: x, y: y });
      const e1subs = '  ^-------!';
      const expected = '---------';
      expectObservable(
        e1[mergeMap]((value) => value, { concurrent: Infinity }),
        '^--------!'
      ).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should merge never and never', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const x = observable('    -      ');
      const xsubs = '--^------!';
      const y = observable('       -   ');
      const ysubs = '-----^---!';
      const e1 = hot('  --x--y--|', { x: x, y: y });
      const e1subs = '  ^-------!';
      const expected = '---------';
      expectObservable(
        e1[mergeMap]((value) => value, { concurrent: Infinity }),
        '^--------!'
      ).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should merge empty and throw', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const x = observable('    |      ');
      const xsubs = '   --(^!)   ';
      const y = observable('       #   ');
      const ysubs = '   -----(^!)';
      const e1 = hot('  --x--y--|', { x: x, y: y });
      const e1subs = '  ^----!   ';
      const expected = '-----#   ';
      expectObservable(e1[mergeMap]((value) => value, { concurrent: Infinity })).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should merge never and throw', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const x = observable('    -      ');
      const xsubs = '   --^--!   ';
      const y = observable('       #   ');
      const ysubs = '   -----(^!)';
      const e1 = hot('  --x--y--|', { x: x, y: y });
      const e1subs = '  ^----!   ';
      const expected = '-----#   ';
      expectObservable(e1[mergeMap]((value) => value, { concurrent: Infinity })).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should merge empty and eventual error', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const x = observable('    |         ');
      const xsubs = '   --(^!)      ';
      const y = observable('       ------#');
      const ysubs = '   -----^-----!';
      const e1 = hot('  --x--y--|   ', { x: x, y: y });
      const e1subs = '  ^-------!   ';
      const expected = '-----------#';
      expectObservable(e1[mergeMap]((value) => value, { concurrent: Infinity })).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should merge never and eventual error', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const x = observable('    -         ');
      const xsubs = '   --^--------!';
      const y = observable('       ------#');
      const ysubs = '   -----^-----!';
      const e1 = hot('  --x--y--|   ', { x: x, y: y });
      const e1subs = '  ^-------!   ';
      const expected = '-----------#';
      expectObservable(e1[mergeMap]((value) => value, { concurrent: Infinity })).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should take an empty source and return empty too', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' |   ');
      const e1subs = '  (^!)';
      const expected = '|   ';
      expectObservable(e1[mergeMap]((value) => value, { concurrent: Infinity })).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should take a never source and return never too', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' -');
      const e1subs = '^!';
      const expected = '-';
      expectObservable(
        e1[mergeMap]((value) => value, { concurrent: Infinity }),
        '^!'
      ).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should take a throw source and return throw too', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' #   ');
      const e1subs = '  (^!)';
      const expected = '#   ';
      expectObservable(e1[mergeMap]((value) => value, { concurrent: Infinity })).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should handle merging a hot observable of non-overlapped observables', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const x = observable('    a-b---------|                 ');
      const xsubs = '   --^-----------!                 ';
      const y = observable('              c-d-e-f-|           ');
      const ysubs = '   ------------^-------!           ';
      const z = observable('                       g-h-i-j-k-|');
      const zsubs = '   ---------------------^---------!';
      const e1 = hot('  --x---------y--------z--------| ', { x: x, y: y, z: z });
      const e1subs = '  ^-----------------------------! ';
      const expected = '--a-b-------c-d-e-f--g-h-i-j-k-|';
      expectObservable(e1[mergeMap]((value) => value, { concurrent: Infinity })).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(z.subscriptions).toBe(zsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should raise error if inner observable raises error', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const x = observable('    a-b---------|                 ');
      const xsubs = '   --^-----------!                 ';
      const y = observable('              c-d-e-f-#           ');
      const ysubs = '   ------------^-------!           ';
      const z = observable('                       g-h-i-j-k-|');
      const zsubs = [];
      const e1 = hot('  --x---------y--------z--------| ', { x: x, y: y, z: z });
      const e1subs = '  ^-------------------!           ';
      const expected = '--a-b-------c-d-e-f-#           ';
      expectObservable(e1[mergeMap]((value) => value, { concurrent: Infinity })).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(z.subscriptions).toBe(zsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should raise error if outer observable raises error', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const x = observable('    a-b---------|      ');
      const xsubs = '   --^-----------!      ';
      const y = observable('              c-d-e-f-|');
      const ysubs = '   ------------^---!    ';
      const e1 = hot('  --x---------y---#    ', { x: x, y: y });
      const e1subs = '  ^---------------!    ';
      const expected = '--a-b-------c-d-#    ';
      expectObservable(e1[mergeMap]((value) => value, { concurrent: Infinity })).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
});
