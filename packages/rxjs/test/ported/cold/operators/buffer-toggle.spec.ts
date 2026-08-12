// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/bufferToggle-spec.ts
import { describe, expect, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { bufferToggle } from 'rxjs/buffer-toggle';
import { ColdObservable } from 'rxjs/cold-observable';
import { EMPTY } from 'rxjs/empty';
import { mergeMap } from 'rxjs/merge-map';
describe('bufferToggle (cold)', () => {
  it('should emit buffers using hot openings and hot closings', async () => {
    await rxTest(({ hot, expectObservable }) => {
      const e1 = hot('  ---a---b---c---d---e---f---g---|');
      const e2 = hot('  --o------------------o---------|');
      const e3 = hot('  ---------c---------------c-----|');
      const expected = '---------x---------------y-----|';
      const values = {
        x: ['a', 'b'],
        y: ['f'],
      };
      const result = e1[bufferToggle](e2, (x) => e3);
      expectObservable(result).toBe(expected, values);
    });
  });
  it('should emit buffers that are opened by an observable from the first argument and closed by an observable returned by the function in the second argument', async () => {
    await rxTest(({ hot, cold, expectObservable }) => {
      const e1 = hot('  -----a----b----c----d----e----f----g----h----i----|');
      const e2 = cold(' -------------x-------------y--------------z-------|');
      const e3 = cold('              ---------------(j|)');
      //                                           ---------------(j|)
      //                                                          ---------------(j|)
      const expected = '----------------------------q-------------r-------(s|)';
      const values = {
        q: ['c', 'd', 'e'],
        r: ['f', 'g', 'h'],
        s: ['i'],
      };
      const innerVals = ['x', 'y', 'z'];
      expectObservable(
        e1[bufferToggle](e2, (x) => {
          expect(x).toBe(innerVals.shift());
          return e3;
        })
      ).toBe(expected, values);
    });
  });
  it('should emit buffers using varying cold closings', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^---b---c---d---e---f---g---h------|      ');
      const e2 = cold('    --x-----------y--------z---|              ');
      const subs = '       ^----------------------------------!      ';
      const closings = [
        cold('               ---------------s--|                     '),
        cold('                           ----(s|)                    '),
        cold('                                    ---------------(s|)'),
      ];
      const closeSubs = [
        '                 --^--------------!                         ',
        '                 --------------^---!                        ',
        '                 -----------------------^-----------!       ',
      ];
      const expected = '  -----------------ij----------------(k|)    ';
      const values = {
        i: ['b', 'c', 'd', 'e'],
        j: ['e'],
        k: ['g', 'h'],
      };
      let i = 0;
      const result = e1[bufferToggle](e2, () => closings[i++]);
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(subs);
      expectSubscriptions(closings[0].subscriptions).toBe(closeSubs[0]);
      expectSubscriptions(closings[1].subscriptions).toBe(closeSubs[1]);
      expectSubscriptions(closings[2].subscriptions).toBe(closeSubs[2]);
    });
  });
  it('should emit buffers using varying hot closings', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^---b---c---d---e---f---g---h------|   ');
      const e2 = cold('    --x-----------y--------z---|           ');
      const subs = '       ^----------------------------------!   ';
      const closings = [
        {
          obs: hot('   -1--^----------------s-|                   '),
          sub: '           --^--------------!                     ',
        },
        {
          obs: hot('       -----3----4-------(s|)                 '),
          sub: '           --------------^---!                    ',
        },
        {
          obs: hot('       -------3----4-------5----------------s|'),
          sub: '           -----------------------^-----------!   ',
        },
      ];
      const expected = '   -----------------ij----------------(k|)';
      const values = {
        i: ['b', 'c', 'd', 'e'],
        j: ['e'],
        k: ['g', 'h'],
      };
      let i = 0;
      const result = e1[bufferToggle](e2, () => closings[i++].obs);
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(subs);
      for (let j = 0; j < closings.length; j++) {
        expectSubscriptions(closings[j].obs.subscriptions).toBe(closings[j].sub);
      }
    });
  });
  it('should emit buffers using varying empty delayed closings', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^---b---c---d---e---f---g---h------|     ');
      const e2 = cold('    --x-----------y--------z---|             ');
      const subs = '       ^----------------------------------!     ';
      const closings = [
        cold('               ---------------|                       '),
        cold('                           ----|                      '),
        cold('                                    ---------------|  '),
      ];
      const expected = '   -----------------------------------(ijk|)';
      const values = {
        i: ['b', 'c', 'd', 'e', 'f', 'g', 'h'],
        j: ['e', 'f', 'g', 'h'],
        k: ['g', 'h'],
      };
      let i = 0;
      const result = e1[bufferToggle](e2, () => closings[i++]);
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });
  it('should emit buffers using varying cold closings, outer unsubscribed early', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^---b---c---d---e---f---g---h------|      ');
      const subs = '       ^---------!                               ';
      const e2 = cold('    --x-----------y--------z---|              ');
      const closings = [
        cold('               ---------------s--|                     '),
        cold('                           ----(s|)                    '),
        cold('                                    ---------------(s|)'),
      ];
      const csub0 = '      --^-------!                               ';
      const expected = '   -----------                               ';
      const unsub = '      ----------!                               ';
      const values = {
        i: ['b', 'c', 'd', 'e'],
      };
      let i = 0;
      const result = e1[bufferToggle](e2, () => closings[i++]);
      expectObservable(result, unsub).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(subs);
      expectSubscriptions(closings[0].subscriptions).toBe(csub0);
      expectSubscriptions(closings[1].subscriptions).toBe([]);
      expectSubscriptions(closings[2].subscriptions).toBe([]);
    });
  });
  it('should not break unsubscription chains when result is unsubscribed explicitly', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^---b---c---d---e---f---g---h------|      ');
      const subs = '       ^-----------------!                       ';
      const e2 = cold('    --x-----------y--------z---|              ');
      const closings = [
        cold('               ---------------s--|                     '),
        cold('                           ----(s|)                    '),
        cold('                                    ---------------(s|)'),
      ];
      const expected = '   -----------------i-                       ';
      const unsub = '      ------------------!                       ';
      const values = {
        i: ['b', 'c', 'd', 'e'],
      };
      let i = 0;
      const result = e1[mergeMap]((x) => ColdObservable.from([x]))
        [bufferToggle](e2, () => closings[i++])
        [mergeMap]((x) => ColdObservable.from([x]));
      expectObservable(result, unsub).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });
  it('should propagate error thrown from closingSelector', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^---b---c---d---e---f---g---h------|      ');
      const e2 = cold('    --x-----------y--------z---|              ');
      const subs = '       ^-------------!                           ';
      const closings = [
        cold('               ---------------s--|                     '),
        cold('                           ----(s|)                    '),
        cold('                                    ---------------(s|)'),
      ];
      const closeSubs0 = ' --^-----------!                           ';
      const expected = '   --------------#                           ';
      let i = 0;
      const result = e1[bufferToggle](e2, () => {
        if (i === 1) {
          throw 'error';
        }
        return closings[i++];
      });
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(subs);
      expectSubscriptions(closings[0].subscriptions).toBe(closeSubs0);
      expectSubscriptions(closings[1].subscriptions).toBe([]);
      expectSubscriptions(closings[2].subscriptions).toBe([]);
    });
  });
  it('should propagate error emitted from a closing', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^---b---c---d---e---f---g---h------|');
      const e2 = cold('    --x-----------y--------z---|        ');
      const subs = '       ^-------------!                     ';
      const closings = [
        cold('               ---------------s--|               '),
        cold('                           #                     '),
      ];
      const closeSubs = [
        '                  --^-----------!                     ',
        '                  --------------(^!)                  ',
      ];
      const expected = '   --------------#                     ';
      let i = 0;
      const result = e1[bufferToggle](e2, () => closings[i++]);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(subs);
      expectSubscriptions(closings[0].subscriptions).toBe(closeSubs[0]);
      expectSubscriptions(closings[1].subscriptions).toBe(closeSubs[1]);
    });
  });
  it('should propagate error emitted late from a closing', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^---b---c---d---e---f---g---h------|');
      const e2 = cold('    --x-----------y--------z---|        ');
      const subs = '       ^------------------!                ';
      const closings = [
        cold('               ---------------s--|               '),
        cold('                           -----#                '),
      ];
      const closeSubs = [
        '                  --^--------------!                  ',
        '                  --------------^----!                ',
      ];
      const expected = '   -----------------i-#                ';
      const values = {
        i: ['b', 'c', 'd', 'e'],
      };
      let i = 0;
      const result = e1[bufferToggle](e2, () => closings[i++]);
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(subs);
      expectSubscriptions(closings[0].subscriptions).toBe(closeSubs[0]);
      expectSubscriptions(closings[1].subscriptions).toBe(closeSubs[1]);
    });
  });
  it('should handle errors', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^---b---c---d---e--#        ');
      const e2 = cold('    --x-----------y--------z---|');
      const subs = '       ^------------------!        ';
      // prettier-ignore
      const closings = [
                cold('               ---------------s--|       '),
                cold('                           -------s|     '),
            ];
      // prettier-ignore
      const closeSubs = [
                '                  --^--------------!          ',
                '                  --------------^----!        ',
            ];
      const expected = '   -----------------i-#        ';
      const values = {
        i: ['b', 'c', 'd', 'e'],
      };
      let i = 0;
      const result = e1[bufferToggle](e2, () => closings[i++]);
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(subs);
      expectSubscriptions(closings[0].subscriptions).toBe(closeSubs[0]);
      expectSubscriptions(closings[1].subscriptions).toBe(closeSubs[1]);
    });
  });
  it('should handle empty source', async () => {
    await rxTest(({ cold, expectObservable }) => {
      const e1 = cold(' |');
      const e2 = cold(' --o-----|');
      const e3 = cold('   -----c--|');
      const expected = '|';
      const values = { x: [] };
      const result = e1[bufferToggle](e2, () => e3);
      expectObservable(result).toBe(expected, values);
    });
  });
  it('should handle throw', async () => {
    await rxTest(({ cold, expectObservable }) => {
      const e1 = cold(' #');
      const e2 = cold(' --o-----|');
      const e3 = cold('   -----c--|');
      const expected = '#';
      const values = { x: [] };
      const result = e1[bufferToggle](e2, () => e3);
      expectObservable(result).toBe(expected, values);
    });
  });
  it('should handle never', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -');
      const e2 = cold(' --o-----o------o-----o---o-----|');
      const e3 = cold('   --c-|');
      //                        --c-|
      //                               --c-|
      //                                     --c-|
      //                                         --c-|
      const unsub = '   --------------------------------------------!';
      const subs = '    ^-------------------------------------------!';
      const expected = '----x-----x------x-----x---x-----------------';
      const values = { x: [] };
      const result = e1[bufferToggle](e2, () => e3);
      expectObservable(result, unsub).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });
  it('should handle a never opening Observable', async () => {
    await rxTest(({ hot, cold, expectObservable }) => {
      const e1 = hot('--a--^---b---c---d---e---f---g---h------|');
      const e2 = cold('    -');
      const e3 = cold('    --c-|');
      const expected = '   -----------------------------------|';
      const result = e1[bufferToggle](e2, () => e3);
      expectObservable(result).toBe(expected);
    });
  });
  it('should handle a never closing Observable', async () => {
    await rxTest(({ hot, cold, expectObservable }) => {
      const e1 = hot('--a--^---b---c---d---e---f---g---h------|    ');
      const e2 = cold('    ---o---------------o-----------|        ');
      const e3 = cold('    -');
      const expected = '   -----------------------------------(xy|)';
      const values = {
        x: ['b', 'c', 'd', 'e', 'f', 'g', 'h'],
        y: ['f', 'g', 'h'],
      };
      const result = e1[bufferToggle](e2, () => e3);
      expectObservable(result).toBe(expected, values);
    });
  });
  it('should handle opening Observable that just throws', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^---b---c---d---e---f---g---h------|');
      const e1subs = '     (^!)';
      const e2 = cold('    #');
      const e2subs = '     (^!)';
      const e3 = cold('    --c-|');
      const expected = '   #';
      const result = e1[bufferToggle](e2, () => e3);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should handle empty closing observable', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^---b---c---d---e---f---g---h------|     ');
      const subs = '       ^----------------------------------!     ';
      const e2 = cold('    --x-----------y--------z---|             ');
      const expected = '   -----------------------------------(ijk|)';
      const values = {
        i: ['b', 'c', 'd', 'e', 'f', 'g', 'h'],
        j: ['e', 'f', 'g', 'h'],
        k: ['g', 'h'],
      };
      const result = e1[bufferToggle](e2, () => EMPTY);
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });
});
