/** @prettier */
import { windowWhen, mergeMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { observableMatcher } from '../helpers/observableMatcher';

/** @test {windowWhen} */
describe('windowWhen', () => {
  let rxTestScheduler: TestScheduler;

  beforeEach(() => {
    rxTestScheduler = new TestScheduler(observableMatcher);
  });

  it('should emit windows that close and reopen', () => {
    rxTestScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e2 = cold('       -----------|                ');
      //                                 -----------|
      //                                            -----------|
      const e2subs = [
        '                     ^----------!                ',
        '                     -----------^----------!     ',
        '                     ----------------------^----!',
      ];
      const e1 = hot('   --a--^--b--c--d--e--f--g--h--i--|');
      const e1subs = '        ^--------------------------!';
      const expected = '      a----------b----------c----|';

      const a = cold('        ---b--c--d-|                ');
      const b = cold('                   -e--f--g--h|     ');
      const c = cold('                              --i--|');
      const values = { a: a, b: b, c: c };

      const source = e1.pipe(windowWhen(() => e2));

      expectObservable(source).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should emit windows using varying cold closings', () => {
    rxTestScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const closings = [
        cold('               -----------------s--|                    '),
        cold('                                -----(s|)               '),
        cold('                                     ---------------(s|)'),
      ];
      const closeSubs = [
        '                    ^----------------!                       ',
        '                    -----------------^----!                  ',
        '                    ----------------------^------------!     ',
      ];
      const e1 = hot('  --a--^---b---c---d---e---f---g---h------|     ');
      const e1subs = '       ^----------------------------------!     ';
      const expected = '     x----------------y----z------------|     ';

      const x = cold('       ----b---c---d---e|                       ');
      const y = cold('                        ---f-|                  ');
      const z = cold('                             --g---h------|     ');
      const values = { x: x, y: y, z: z };

      let i = 0;
      const result = e1.pipe(windowWhen(() => closings[i++]));

      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(closings[0].subscriptions).toBe(closeSubs[0]);
      expectSubscriptions(closings[1].subscriptions).toBe(closeSubs[1]);
      expectSubscriptions(closings[2].subscriptions).toBe(closeSubs[2]);
    });
  });

  it('should emit windows using varying hot closings', () => {
    rxTestScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const closings = [
        hot('            -1--^----------------s-|                   '),
        hot('                -----3----4-----------(s|)             '),
        hot('                -------3----4-------5----------------s|'),
      ];
      const closeSubs = [
        '                    ^----------------!                     ',
        '                    -----------------^----!                ',
        '                    ----------------------^------------!   ',
      ];
      const e1 = hot('  --a--^---b---c---d---e---f---g---h------|   ');
      const subs = '         ^----------------------------------!   ';
      const expected = '     x----------------y----z------------|   ';

      const x = cold('       ----b---c---d---e|                     ');
      const y = cold('                        ---f-|                ');
      const z = cold('                             --g---h------|   ');
      const values = { x: x, y: y, z: z };

      let i = 0;
      const result = e1.pipe(windowWhen(() => closings[i++]));

      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(subs);
      expectSubscriptions(closings[0].subscriptions).toBe(closeSubs[0]);
      expectSubscriptions(closings[1].subscriptions).toBe(closeSubs[1]);
      expectSubscriptions(closings[2].subscriptions).toBe(closeSubs[2]);
    });
  });

  it('should emit windows using varying empty delayed closings', () => {
    rxTestScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const closings = [
        cold('             -----------------|                    '),
        cold('                              -----|               '),
        cold('                                   ---------------|'),
      ];
      const closeSubs = [
        '                  ^----------------!                    ',
        '                  -----------------^----!               ',
        '                  ----------------------^------------!  ',
      ];
      const e1 = hot('--a--^---b---c---d---e---f---g---h------|  ');
      const e1subs = '     ^----------------------------------!  ';
      const expected = '   x----------------y----z------------|  ';

      const x = cold('     ----b---c---d---e|                    ');
      const y = cold('                      ---f-|               ');
      const z = cold('                           --g---h------|  ');
      const values = { x: x, y: y, z: z };

      let i = 0;
      const result = e1.pipe(windowWhen(() => closings[i++]));

      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(closings[0].subscriptions).toBe(closeSubs[0]);
      expectSubscriptions(closings[1].subscriptions).toBe(closeSubs[1]);
      expectSubscriptions(closings[2].subscriptions).toBe(closeSubs[2]);
    });
  });

  it('should emit windows using varying cold closings, outer unsubscribed early', () => {
    rxTestScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const closings = [
        cold('               -----------------s--|               '),
        cold('                                ---------(s|)      '),
      ];
      const closeSubs = [
        '                    ^----------------!                  ',
        '                    -----------------^---!              ',
      ];
      const e1 = hot('  --a--^---b---c---d---e---f---g---h------|');
      const e1subs = '       ^--------------------!              ';
      const expected = '     x----------------y----              ';
      const unsub = '        ---------------------!              ';

      const x = cold('       ----b---c---d---e|                  ');
      const y = cold('                        ---f-              ');
      const values = { x: x, y: y };

      let i = 0;
      const result = e1.pipe(windowWhen(() => closings[i++]));

      expectObservable(result, unsub).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(closings[0].subscriptions).toBe(closeSubs[0]);
      expectSubscriptions(closings[1].subscriptions).toBe(closeSubs[1]);
    });
  });

  it('should not break unsubscription chain when unsubscribed explicitly', () => {
    rxTestScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const closings = [
        cold('               -----------------s--|               '),
        cold('                                ---------(s|)      '),
      ];
      const closeSubs = [
        '                    ^----------------!                  ',
        '                    -----------------^---!              ',
      ];
      const e1 = hot('  --a--^---b---c---d---e---f---g---h------|');
      const e1subs = '       ^--------------------!              ';
      const expected = '     x----------------y----              ';
      const unsub = '        ---------------------!              ';

      const x = cold('       ----b---c---d---e|                  ');
      const y = cold('                        ---f-              ');
      const values = { x: x, y: y };

      let i = 0;
      const result = e1.pipe(
        mergeMap((x: string) => of(x)),
        windowWhen(() => closings[i++]),
        mergeMap((x: Observable<string>) => of(x))
      );

      expectObservable(result, unsub).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(closings[0].subscriptions).toBe(closeSubs[0]);
      expectSubscriptions(closings[1].subscriptions).toBe(closeSubs[1]);
    });
  });

  it('should propagate error thrown from closingSelector', () => {
    rxTestScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const closings = [
        cold('                 -----------------s--|                    '),
        cold('                                  -----(s|)               '),
        cold('                                       ---------------(s|)'),
      ];
      const closeSubs = ['     ^----------------!                       '];
      const e1 = hot('    --a--^---b---c---d---e---f---g---h------|     ');
      const e1subs = '         ^----------------!                       ';
      const expected = '       x----------------(y#)                    ';

      const x = cold('         ----b---c---d---e|                       ');
      const y = cold('                          #                       ');
      const values = { x: x, y: y };

      let i = 0;
      const result = e1.pipe(
        windowWhen(() => {
          if (i === 1) {
            throw 'error';
          }
          return closings[i++];
        })
      );

      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(closings[0].subscriptions).toBe(closeSubs[0]);
    });
  });

  it('should propagate error emitted from a closing', () => {
    rxTestScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const closings = [
        cold('               -----------------s--|               '),
        cold('                                #                  '),
      ];
      const closeSubs = [
        '                    ^----------------!                  ',
        '                    -----------------(^!)               ',
      ];
      const e1 = hot('  --a--^---b---c---d---e---f---g---h------|');
      const e1subs = '       ^----------------!                  ';
      const expected = '     x----------------(y#)               ';

      const x = cold('       ----b---c---d---e|                  ');
      const y = cold('                        #                  ');
      const values = { x: x, y: y };

      let i = 0;
      const result = e1.pipe(windowWhen(() => closings[i++]));

      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(closings[0].subscriptions).toBe(closeSubs[0]);
      expectSubscriptions(closings[1].subscriptions).toBe(closeSubs[1]);
    });
  });

  it('should propagate error emitted late from a closing', () => {
    rxTestScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const closings = [
        cold('               -----------------s--|               '),
        cold('                                -----#             '),
      ];
      const closeSubs = [
        '                    ^----------------!                  ',
        '                    -----------------^----!             ',
      ];
      const e1 = hot('  --a--^---b---c---d---e---f---g---h------|');
      const e1subs = '       ^---------------------!             ';
      const expected = '     x----------------y----#             ';

      const x = cold('       ----b---c---d---e|                  ');
      const y = cold('                        ---f-#             ');
      const values = { x: x, y: y };

      let i = 0;
      const result = e1.pipe(windowWhen(() => closings[i++]));

      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(closings[0].subscriptions).toBe(closeSubs[0]);
      expectSubscriptions(closings[1].subscriptions).toBe(closeSubs[1]);
    });
  });

  it('should propagate errors emitted from the source', () => {
    rxTestScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      // prettier-ignore
      const closings = [
        cold('               -----------------s--|       '),
        cold('                                -------(s|)'),
      ];
      // prettier-ignore
      const closeSubs = [
        '                    ^----------------!          ',
        '                    -----------------^----!     ',
      ];
      const e1 = hot('  --a--^---b---c---d---e---f-#     ');
      const e1subs = '       ^---------------------!     ';
      const expected = '     x----------------y----#     ';

      const x = cold('       ----b---c---d---e|          ');
      const y = cold('                        ---f-#     ');
      const values = { x: x, y: y };

      let i = 0;
      const result = e1.pipe(windowWhen(() => closings[i++]));

      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(closings[0].subscriptions).toBe(closeSubs[0]);
      expectSubscriptions(closings[1].subscriptions).toBe(closeSubs[1]);
    });
  });

  it('should handle empty source', () => {
    rxTestScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e2 = cold(' -----c--|');
      const e2subs = '  (^!)     ';
      const e1 = cold(' |        ');
      const e1subs = '  (^!)     ';
      const expected = '(w|)     ';
      const win = cold('|        ');
      const values = { w: win };

      const result = e1.pipe(windowWhen(() => e2));

      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should handle a never source', () => {
    rxTestScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e2 = cold(' -----c--|         ');
      //                     -----c--|
      //                        -----c--|
      //                             -----
      const e2subs = [
        '               ^----!            ',
        '               -----^----!       ',
        '               ----------^----!  ',
        '               ---------------^-!',
      ];
      const e1 = cold(' -                 ');
      const e1subs = '  ^----------------!';
      const expected = 'a----b----c----d--';
      const unsub = '   -----------------!';

      const win = cold('-----|');
      //                     -----|
      //                          -----|
      const d = cold('                 ---');
      const values = { a: win, b: win, c: win, d: d };

      const result = e1.pipe(windowWhen(() => e2));

      expectObservable(result, unsub).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should handle throw', () => {
    rxTestScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e2 = cold(' -----c--|');
      const e2subs = '  (^!)     ';
      const e1 = cold(' #        ');
      const e1subs = '  (^!)     ';
      const expected = '(w#)     ';
      const win = cold('#        ');
      const values = { w: win };

      const result = e1.pipe(windowWhen(() => e2));

      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should handle a never closing Observable', () => {
    rxTestScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e2 = cold('      -                                  ');
      const e2subs = '       ^----------------------------------!';
      const e1 = hot('  --a--^---b---c---d---e---f---g---h------|');
      const e1subs = '       ^----------------------------------!';
      const expected = '     x----------------------------------|';

      const x = cold('       ----b---c---d---e---f---g---h------|');
      const values = { x: x };

      const result = e1.pipe(windowWhen(() => e2));

      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should handle a throw closing Observable', () => {
    rxTestScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e2 = cold('      #                                   ');
      const e2subs = '       (^!)                                ';
      const e1 = hot('  --a--^---b---c---d---e---f---g---h------|');
      const e1subs = '       (^!)                                ';
      const expected = '     (x#)                                ';

      const x = cold('       #                                   ');
      const values = { x: x };

      const result = e1.pipe(windowWhen(() => e2));

      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
});
