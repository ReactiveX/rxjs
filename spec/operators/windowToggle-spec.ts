/** @prettier */
import { expect } from 'chai';
import { Observable, NEVER, of, ObjectUnsubscribedError, EMPTY } from 'rxjs';
import { windowToggle, tap, mergeMap } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { observableMatcher } from '../helpers/observableMatcher';

/** @test {windowToggle} */
describe('windowToggle', () => {
  let rxTestScheduler: TestScheduler;

  beforeEach(() => {
    rxTestScheduler = new TestScheduler(observableMatcher);
  });

  it('should emit windows governed by openings and closings', () => {
    rxTestScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e2 = cold('         ----w--------w--------w--|');
      const e2subs = '          ^------------------------!';
      const e3 = cold('             -----x                ');
      //                                     -----x
      //                                              -----x
      const e3subs = [
        '                       ----^----!                ',
        '                       -------------^----!       ',
        '                       ----------------------^--!',
      ];
      const e1 = hot('  --1--2--^-a--b--c--d--e--f--g--h-|');
      const e1subs = '          ^------------------------!';
      const expected = '        ----x--------y--------z--|';
      const x = cold('              -b--c|                ');
      const y = cold('                       -e--f|       ');
      const z = cold('                                -h-|');
      const values = { x, y, z };

      const result = e1.pipe(windowToggle(e2, () => e3));

      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
      expectSubscriptions(e3.subscriptions).toBe(e3subs);
    });
  });

  it('should emit windows that are opened by an observable from the first argument and closed by an observable returned by the function in the second argument', () => {
    rxTestScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e2 = cold('       --------x-------x-------x--|');
      const e2subs = '        ^--------------------------!';
      const e3 = cold('               ----------(x|)      ');
      //                                      ----------(x|)
      //                                              ----------(x|)
      const e3subs = [
        '                     --------^---------!         ',
        '                     ----------------^---------! ',
        '                     ------------------------^--!',
      ];

      const e1 = hot('--1--2--^--a--b--c--d--e--f--g--h--|');
      const e1subs = '        ^--------------------------!';
      const expected = '      --------x-------y-------z--|';
      const x = cold('                -c--d--e--(f|)      ');
      const y = cold('                        --f--g--h-| ');
      const z = cold('                                ---|');
      const values = { x, y, z };

      const source = e1.pipe(
        windowToggle(e2, (value: string) => {
          expect(value).to.equal('x');
          return e3;
        })
      );

      expectObservable(source).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
      expectSubscriptions(e3.subscriptions).toBe(e3subs);
    });
  });

  it('should emit windows using varying cold closings', () => {
    rxTestScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e2 = cold('    --x-----------y--------z---|            ');
      const e2subs = '     ^--------------------------!            ';
      const close = [
        cold('               ---------------s--|                   '),
        cold('                           ----(s|)                  '),
        cold('                                  ---------------(s|)'),
      ];
      const closeSubs = [
        '                  --^--------------!                      ',
        '                  --------------^---!                     ',
        '                  -----------------------^-----------!    ',
      ];

      const e1 = hot('--a--^---b---c---d---e---f---g---h------|    ');
      const e1subs = '     ^----------------------------------!    ';
      const expected = '   --x-----------y--------z-----------|    ';
      const x = cold('       --b---c---d---e|                      ');
      const y = cold('                   --e-|                     ');
      const z = cold('                            -g---h------|    ');
      const values = { x, y, z };

      let i = 0;
      const result = e1.pipe(windowToggle(e2, () => close[i++]));

      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
      expectSubscriptions(close[0].subscriptions).toBe(closeSubs[0]);
      expectSubscriptions(close[1].subscriptions).toBe(closeSubs[1]);
      expectSubscriptions(close[2].subscriptions).toBe(closeSubs[2]);
    });
  });

  it('should emit windows using varying hot closings', () => {
    rxTestScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e2 = cold('    --x-----------y--------z---|           ');
      const e2subs = '     ^--------------------------!           ';
      const closings = [
        hot('          -1--^----------------s-|                   '),
        hot('              -----3----4-------(s|)                 '),
        hot('              -------3----4-------5----------------s|'),
      ];
      const closingSubs = [
        '                  --^--------------!                     ',
        '                  --------------^---!                    ',
        '                  -----------------------^-----------!   ',
      ];

      const e1 = hot('--a--^---b---c---d---e---f---g---h------|   ');
      const e1subs = '     ^----------------------------------!   ';
      const expected = '   --x-----------y--------z-----------|   ';
      const x = cold('       --b---c---d---e|                     ');
      const y = cold('                   --e-|                    ');
      const z = cold('                            -g---h------|   ');
      const values = { x, y, z };

      let i = 0;
      const result = e1.pipe(windowToggle(e2, () => closings[i++]));

      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
      expectSubscriptions(closings[0].subscriptions).toBe(closingSubs[0]);
      expectSubscriptions(closings[1].subscriptions).toBe(closingSubs[1]);
      expectSubscriptions(closings[2].subscriptions).toBe(closingSubs[2]);
    });
  });

  it('should emit windows using varying empty delayed closings', () => {
    rxTestScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e2 = cold('    --x-----------y--------z---|           ');
      const e2subs = '     ^--------------------------!           ';
      const close = [
        cold('               ---------------|                     '),
        cold('                           ----|                    '),
        cold('                                    ---------------|'),
      ];

      const e1 = hot('--a--^---b---c---d---e---f---g---h------|   ');
      const e1subs = '     ^----------------------------------!   ';
      const expected = '   --x-----------y--------z-----------|   ';
      const x = cold('       --b---c---d---e---f---g---h------|   ');
      const y = cold('                   --e---f---g---h------|   ');
      const z = cold('                            -g---h------|   ');
      const values = { x, y, z };

      let i = 0;
      const result = e1.pipe(windowToggle(e2, () => close[i++]));

      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should emit windows using varying cold closings, outer unsubscribed early', () => {
    rxTestScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e2 = cold('    --x-----------y--------z---|              ');
      const e2subs = '     ^----------------!                        ';
      const close = [
        cold('               -------------s---|                      '),
        cold('                           -----(s|)                   '),
        cold('                                    ---------------(s|)'),
      ];
      const closeSubs = [
        '                  --^------------!                          ',
        '                  --------------^--!                        ',
      ];

      const e1 = hot('--a--^---b---c---d---e---f---g---h------|      ');
      const e1subs = '     ^----------------!                        ';
      const expected = '   --x-----------y---                        ';
      const x = cold('       --b---c---d--|                          ');
      const y = cold('                   --e-                        ');
      const unsub = '      -----------------!                        ';
      const values = { x, y };

      let i = 0;
      const result = e1.pipe(windowToggle(e2, () => close[i++]));

      expectObservable(result, unsub).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
      expectSubscriptions(close[0].subscriptions).toBe(closeSubs[0]);
      expectSubscriptions(close[1].subscriptions).toBe(closeSubs[1]);
      expectSubscriptions(close[2].subscriptions).toBe([]);
    });
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    rxTestScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e2 = cold('    --x-----------y--------z---|              ');
      const e2subs = '     ^--------------!                          ';
      const close = [
        cold('               ---------------s--|                     '),
        cold('                           ----(s|)                    '),
        cold('                                    ---------------(s|)'),
      ];
      const closeSubs = [
        '                  --^------------!                          ',
        '                  --------------^!                          ',
      ];
      const e1 = hot('--a--^---b---c---d---e---f---g---h------|      ');
      const e1subs = '     ^--------------!                          ';
      const expected = '   --x-----------y-                          ';
      const x = cold('       --b---c---d---                          ');
      const y = cold('                   --                          ');
      const unsub = '      ---------------!                          ';
      const values = { x, y };

      let i = 0;
      const result = e1.pipe(
        mergeMap((x) => of(x)),
        windowToggle(e2, () => close[i++]),
        mergeMap((x) => of(x))
      );

      expectObservable(result, unsub).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
      expectSubscriptions(close[0].subscriptions).toBe(closeSubs[0]);
      expectSubscriptions(close[1].subscriptions).toBe(closeSubs[1]);
    });
  });

  it('should dispose window Subjects if the outer is unsubscribed early', () => {
    rxTestScheduler.run(({ hot, cold, expectObservable, expectSubscriptions, time }) => {
      const open = cold(' o-------------------------|');
      const e1 = hot('    --a--b--c--d--e--f--g--h--|');
      const e1subs = '    ^--------!                 ';
      const expected = '  x---------                 ';
      const x = cold('    --a--b--c-                 ');
      const unsub = '     ---------!                 ';
      const late = time(' ---------------|           ');
      const values = { x };

      let window: Observable<string>;
      const result = e1.pipe(
        windowToggle(open, () => NEVER),
        tap((w) => {
          window = w;
        })
      );

      expectObservable(result, unsub).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      rxTestScheduler.schedule(() => {
        expect(() => {
          window.subscribe();
        }).to.throw(ObjectUnsubscribedError);
      }, late);
    });
  });

  it('should propagate error thrown from closingSelector', () => {
    rxTestScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e2 = cold('    --x-----------y--------z---|              ');
      const e2subs = '     ^-------------!                           ';
      const close = [
        cold('               ---------------s--|                     '),
        cold('                           ----(s|)                    '),
        cold('                                    ---------------(s|)'),
      ];

      const e1 = hot('--a--^---b---c---d---e---f---g---h------|      ');
      const e1subs = '     ^-------------!                           ';
      const expected = '   --x-----------#----                       ';
      const x = cold('       --b---c---d-#                           ');
      const values = { x: x };

      let i = 0;
      const result = e1.pipe(
        windowToggle(e2, () => {
          if (i === 1) {
            throw 'error';
          }
          return close[i++];
        })
      );

      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should propagate error emitted from a closing', () => {
    rxTestScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e2 = cold('    --x-----------y--------z---|        ');
      const e2subs = '     ^-------------!                     ';
      // prettier-ignore
      const close = [
        cold('               ---------------s--|               '),
        cold('                           #                     ')
      ];

      const e1 = hot('--a--^---b---c---d---e---f---g---h------|');
      const e1subs = '     ^-------------!                     ';
      const expected = '   --x-----------(y#)                  ';
      const x = cold('       --b---c---d-#                     ');
      const y = cold('                   #                     ');
      const values = { x, y };

      let i = 0;
      const result = e1.pipe(windowToggle(e2, () => close[i++]));

      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should propagate error emitted late from a closing', () => {
    rxTestScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e2 = cold('    --x-----------y--------z---|        ');
      const e2subs = '     ^------------------!                ';
      // prettier-ignore
      const close = [
        cold('               ---------------s--|               '),
        cold('                           -----#                ')
      ];

      const e1 = hot('--a--^---b---c---d---e---f---g---h------|');
      const e1subs = '     ^------------------!                ';
      const expected = '   --x-----------y----#                ';
      const x = cold('       --b---c---d---e|                  ');
      const y = cold('                   --e--#                ');
      const values = { x, y };

      let i = 0;
      const result = e1.pipe(windowToggle(e2, () => close[i++]));

      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should handle errors', () => {
    rxTestScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e2 = cold('    --x-----------y--------z---|        ');
      const e2subs = '     ^------------------!                ';
      // prettier-ignore
      const close = [
        cold('               ---------------s--|               '),
        cold('                           -------s|             ')
      ];

      const e1 = hot('--a--^---b---c---d---e--#                ');
      const e1subs = '     ^------------------!                ';
      const expected = '   --x-----------y----#                ';
      const x = cold('       --b---c---d---e|                  ');
      const y = cold('                   --e--#                ');
      const values = { x, y };

      let i = 0;
      const result = e1.pipe(windowToggle(e2, () => close[i++]));

      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should handle empty source', () => {
    rxTestScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e2 = cold('--o-----|');
      const e2subs = '   (^!)';
      const e3 = cold('  -----c--|');

      const e1 = cold('  |');
      const e1subs = '   (^!)';
      const expected = ' |';

      const result = e1.pipe(windowToggle(e2, () => e3));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should handle throw', () => {
    rxTestScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e2 = cold(' --o-----|');
      const e2subs = '  (^!)';
      const e3 = cold(' -----c--|');

      const e1 = cold(' #');
      const e1subs = '  (^!)';
      const expected = '#';

      const result = e1.pipe(windowToggle(e2, () => e3));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should handle never', () => {
    rxTestScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e2 = cold(' --o-----o------o-----o---o-----|             ');
      const e2subs = '  ^------------------------------!             ';
      const e3 = cold('   --c-|                                      ');

      const e1 = hot('  -                                            ');
      const e1subs = '  ^-------------------------------------------!';
      const expected = '--u-----v------x-----y---z-------------------';
      const u = cold('    --|                                        ');
      const v = cold('          --|                                  ');
      const x = cold('                 --|                           ');
      const y = cold('                       --|                     ');
      const z = cold('                           --|                 ');
      const unsub = '   --------------------------------------------!';
      const values = { u: u, v: v, x, y, z };

      const result = e1.pipe(windowToggle(e2, () => e3));

      expectObservable(result, unsub).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should handle a never opening Observable', () => {
    rxTestScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e2 = cold('    -                                   ');
      const e2subs = '     ^----------------------------------!';
      const e3 = cold('    --c-|                               ');

      const e1 = hot('--a--^---b---c---d---e---f---g---h------|');
      const e1subs = '     ^----------------------------------!';
      const expected = '   -----------------------------------|';

      const result = e1.pipe(windowToggle(e2, () => e3));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should handle a never closing Observable', () => {
    rxTestScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e2 = cold('    ---o---------------o-----------|    ');
      const e2subs = '     ^------------------------------!    ';
      const e3 = cold('       -                                ');
      //                                      -

      const e1 = hot('--a--^---b---c---d---e---f---g---h------|');
      const e1subs = '     ^----------------------------------!';
      const expected = '   ---x---------------y---------------|';
      const x = cold('        -b---c---d---e---f---g---h------|');
      const y = cold('                        -f---g---h------|');
      const values = { x, y };

      const result = e1.pipe(windowToggle(e2, () => e3));

      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should handle opening Observable that just throws', () => {
    rxTestScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e2 = cold('    #                                   ');
      const e2subs = '     (^!)                                ';
      const e3 = cold('    --c-|                               ');
      const subs = '       (^!)                                ';

      const e1 = hot('--a--^---b---c---d---e---f---g---h------|');
      const e1subs = '     (^!)                                ';
      const expected = '   #                                   ';

      const result = e1.pipe(windowToggle(e2, () => e3));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(subs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should handle empty closing observable', () => {
    rxTestScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e2 = cold('    ---o---------------o-----------|    ');
      const e2subs = '     ^------------------------------!    ';
      const e3 = EMPTY;

      const e1 = hot('--a--^---b---c---d---e---f---g---h------|');
      const e1subs = '     ^----------------------------------!';
      const expected = '   ---x---------------y---------------|';
      const x = cold('        -b---c---d---e---f---g---h------|');
      const y = cold('                        -f---g---h------|');
      const values = { x, y };

      const result = e1.pipe(windowToggle(e2, () => e3));

      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
});
