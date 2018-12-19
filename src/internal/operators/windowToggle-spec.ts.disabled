import { expect } from 'chai';
import { Observable, NEVER, of, ObjectUnsubscribedError, EMPTY } from 'rxjs';
import { windowToggle, tap, mergeMap } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { assertDeepEquals } from 'rxjs/internal/test_helpers/assertDeepEquals';

/** @test {windowToggle} */
describe('windowToggle', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(assertDeepEquals);
  });

  // asDiagram('windowToggle')
  it('should emit windows governed by openings and closings', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const source = hot('--1--2--^-a--b--c--d--e--f--g--h-|');
      const subs =               '^                        !';
      const e2 = cold(           '----w--------w--------w--|');
      const e2subs =             '^                        !';
      const e3 = cold(               '-----|                ');
      //                                     -----(c|)
      //                                              -----(c|)
      const e3subs = [           '    ^    !                ', // eslint-disable-line array-bracket-spacing
                                 '             ^    !       ',
                                 '                      ^  !'];
      const expected =           '----x--------y--------z--|';
      const x = cold(                '-b--c|                ');
      const y = cold(                         '-e--f|       ');
      const z = cold(                                  '-h-|');
      const values = { x, y, z };

      const result = source.pipe(windowToggle(e2, () => e3));

      expectObservable(result).toBe(expected, values);
      expectSubscriptionsTo(source).toBe(subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
      expectSubscriptionsTo(e3).toBe(e3subs);
    });
  });

  it('should emit windows that are opened by an observable from the first argument ' +
    'and closed by an observable returned by the function in the second argument',
  () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('--1--2--^--a--b--c--d--e--f--g--h--|');
      const e1subs =         '^                          !';
      const e2 = cold(       '--------x-------x-------x--|');
      const e2subs =         '^                          !';
      const e3 = cold(               '----------(x|)      ');
      //                                      ----------(x|)
      //                                              ----------(x|)
      const e3subs = [       '        ^         !         ',
                             '                ^         ! ',
                             '                        ^  !'];
      const expected =       '--------x-------y-------z--|';
      const x = cold(                '-c--d--e--(f|)      ');
      const y = cold(                        '--f--g--h-| ');
      const z = cold(                                '---|');
      const values = { x, y, z };

      const source = e1.pipe(windowToggle(e2, (value: string) => {
        expect(value).to.equal('x');
        return e3;
      }));

      expectObservable(source).toBe(expected, values);
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
      expectSubscriptionsTo(e3).toBe(e3subs);
    });
  });

  it('should emit windows using constying cold closings', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('--a--^---b---c---d---e---f---g---h------|      ');
      const e1subs =      '^                                  !      ';
      const e2 =     cold('--x-----------y--------z---|              ');
      const e2subs =      '^                          !              ';
      const close = [
        cold(             '---------------s--|                     '),
        cold(                         '----(s|)                    '),
        cold(                                  '---------------(s|)')];
      const closeSubs = [ '  ^              !                        ', // eslint-disable-line array-bracket-spacing
                        '              ^   !                       ',
                        '                       ^           !      '];
      const expected =    '--x-----------y--------z-----------|      ';
      const x = cold(       '--b---c---d---e|                        ');
      const y = cold(                   '--e-|                       ');
      const z = cold(                            '-g---h------|      ');
      const values = { x, y, z };

      let i = 0;
      const result = e1.pipe(windowToggle(e2, () => close[i++]));

      expectObservable(result).toBe(expected, values);
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
      expectSubscriptionsTo(close[0]).toBe(closeSubs[0]);
      expectSubscriptionsTo(close[1]).toBe(closeSubs[1]);
      expectSubscriptionsTo(close[2]).toBe(closeSubs[2]);
    });
  });

  it('should emit windows using constying hot closings', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('--a--^---b---c---d---e---f---g---h------|   ');
      const e1subs =      '^                                  !   ';
      const e2 =     cold('--x-----------y--------z---|           ');
      const e2subs =      '^                          !           ';
      const closings = [
        {obs: hot(  '-1--^----------------s-|                   '), // eslint-disable-line key-spacing
        sub:           '  ^              !                     '}, // eslint-disable-line key-spacing
        {obs: hot(      '-----3----4-------(s|)                 '), // eslint-disable-line key-spacing
        sub:           '              ^   !                    '}, // eslint-disable-line key-spacing
        {obs: hot(      '-------3----4-------5----------------s|'), // eslint-disable-line key-spacing
        sub:           '                       ^           !   '}]; // eslint-disable-line key-spacing
      const expected =    '--x-----------y--------z-----------|   ';
      const x = cold(       '--b---c---d---e|                     ');
      const y = cold(                   '--e-|                    ');
      const z = cold(                            '-g---h------|   ');
      const values = { x, y, z };

      let i = 0;
      const result = e1.pipe(windowToggle(e2, () => closings[i++].obs));

      expectObservable(result).toBe(expected, values);
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
      expectSubscriptionsTo(closings[0].obs).toBe(closings[0].sub);
      expectSubscriptionsTo(closings[1].obs).toBe(closings[1].sub);
      expectSubscriptionsTo(closings[2].obs).toBe(closings[2].sub);
    });
  });

  it('should emit windows using constying empty delayed closings', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('--a--^---b---c---d---e---f---g---h------|   ');
      const e1subs =      '^                                  !   ';
      const e2 =     cold('--x-----------y--------z---|           ');
      const e2subs =      '^                          !           ';
      const close = [cold(  '---------------|                     '),
        cold(                         '----|                    '),
        cold(                                  '---------------|')];
      const expected =    '--x-----------y--------z-----------|   ';
      const x = cold(       '--b---c---d---e|                     ');
      const y = cold(                   '--e-|                    ');
      const z = cold(                            '-g---h------|   ');
      const values = { x, y, z };

      let i = 0;
      const result = e1.pipe(windowToggle(e2, () => close[i++]));

      expectObservable(result).toBe(expected, values);
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
    });
  });

  it('should emit windows using constying cold closings, outer unsubscribed early', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('--a--^---b---c---d---e---f---g---h------|      ');
      const e1subs =      '^                !                        ';
      const e2 =     cold('--x-----------y--------z---|              ');
      const e2subs =      '^                !                        ';
      const close = [cold(  '-------------s---|                     '),
        cold(                         '-----(s|)                   '),
        cold(                                  '---------------(s|)')];
      const closeSubs =  ['  ^            !                          ',
                        '              ^  !                        '];
      const expected =    '--x-----------y---                        ';
      const x = cold(       '--b---c---d--|                          ');
      const y = cold(                   '--e-                        ');
      const unsub =       '                 !                        ';
      const values = { x, y };

      let i = 0;
      const result = e1.pipe(windowToggle(e2, () => close[i++]));

      expectObservable(result, unsub).toBe(expected, values);
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
      expectSubscriptionsTo(close[0]).toBe(closeSubs[0]);
      expectSubscriptionsTo(close[1]).toBe(closeSubs[1]);
      expectSubscriptionsTo(close[2]).toBe([]);
    });
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('--a--^---b---c---d---e---f---g---h------|      ');
      const e1subs =      '^              !                          ';
      const e2 =     cold('--x-----------y--------z---|              ');
      const e2subs =      '^              !                          ';
      const close = [cold(  '---------------s--|                     '),
        cold(                         '----(s|)                    '),
        cold(                                  '---------------(s|)')];
      const closeSubs =  ['  ^            !                          ',
                        '              ^!                          '];
      const expected =    '--x-----------y-                          ';
      const x = cold(       '--b---c---d---                          ');
      const y = cold(                   '--                          ');
      const unsub =       '               !                          ';
      const values = { x, y };

      let i = 0;
      const result = e1.pipe(
        mergeMap(x => of(x)),
        windowToggle(e2, () => close[i++]),
        mergeMap(x => of(x)),
      );

      expectObservable(result, unsub).toBe(expected, values);
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
      expectSubscriptionsTo(close[0]).toBe(closeSubs[0]);
      expectSubscriptionsTo(close[1]).toBe(closeSubs[1]);
    });
  });

  // NOTE: In v7, windows are no longer Subjects, so ObjectUnsubscribedError would not
  //   be thrown

  // it('should dispose window Subjects if the outer is unsubscribed early', () => {
  //   testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo, time }) => {
  //     const source = hot('--a--b--c--d--e--f--g--h--|');
  //     const open =  cold('o-------------------------|');
  //     const sourceSubs = '^        !                 ';
  //     const expected =   'x---------                 ';
  //     const x = cold(    '--a--b--c-                 ');
  //     const unsub =      '         !                 ';
  //     const late =  time('---------------|           ');
  //     const values = { x };

  //     let window: Observable<string>;
  //     const result = source.pipe(
  //       windowToggle(open, () => NEVER),
  //       tap(w => { window = w; }),
  //     );

  //     expectObservable(result, unsub).toBe(expected, values);
  //     expectSubscriptionsTo(source).toBe(sourceSubs);
  //     testScheduler.schedule(() => {
  //       expect(() => {
  //         window.subscribe();
  //       }).to.throw(ObjectUnsubscribedError);
  //     }, late);
  //   });
  // });

  it('should propagate error thrown from closingSelector', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('--a--^---b---c---d---e---f---g---h------|      ');
      const e1subs =      '^             !                           ';
      const e2 =     cold('--x-----------y--------z---|              ');
      const e2subs =      '^             !                           ';
      const close = [cold(  '---------------s--|                     '),
        cold(                         '----(s|)                    '),
        cold(                                  '---------------(s|)')];
      const expected =    '--x-----------#----                       ';
      const x = cold(       '--b---c---d-#                           ');
      const values = { x: x };

      let i = 0;
      const result = e1.pipe(windowToggle(e2, () => {
        if (i === 1) {
          throw 'error';
        }
        return close[i++];
      }));

      expectObservable(result).toBe(expected, values);
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
    });
  });

  it('should propagate error emitted from a closing', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('--a--^---b---c---d---e---f---g---h------|');
      const e1subs =      '^             !                     ';
      const e2 =     cold('--x-----------y--------z---|        ');
      const e2subs =      '^             !                     ';
      const close = [cold(  '---------------s--|               '),
        cold(                         '#                     ')];
      const expected =    '--x-----------(y#)                  ';
      const x = cold(       '--b---c---d-#                     ');
      const y = cold(                   '#                     ');
      const values = { x, y };

      let i = 0;
      const result = e1.pipe(windowToggle(e2, () => close[i++]));

      expectObservable(result).toBe(expected, values);
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
    });
  });

  it('should propagate error emitted late from a closing', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('--a--^---b---c---d---e---f---g---h------|');
      const e1subs =      '^                  !                ';
      const e2 =     cold('--x-----------y--------z---|        ');
      const e2subs =      '^                  !                ';
      const close = [cold(  '---------------s--|               '),
        cold(                           '-----#                ')];
      const expected =    '--x-----------y----#                ';
      const x = cold(       '--b---c---d---e|                  ');
      const y = cold(                   '--e--#                ');
      const values = { x, y };

      let i = 0;
      const result = e1.pipe(windowToggle(e2, () => close[i++]));

      expectObservable(result).toBe(expected, values);
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
    });
  });

  it('should handle errors', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('--a--^---b---c---d---e--#                ');
      const e1subs =      '^                  !                ';
      const e2 =     cold('--x-----------y--------z---|        ');
      const e2subs =      '^                  !                ';
      const close = [cold(  '---------------s--|               '),
        cold(                         '-------s|             ')];
      const expected =    '--x-----------y----#                ';
      const x = cold(       '--b---c---d---e|                  ');
      const y = cold(                   '--e--#                ');
      const values = { x, y };

      let i = 0;
      const result = e1.pipe(windowToggle(e2, () => close[i++]));

      expectObservable(result).toBe(expected, values);
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
    });
  });

  it('should handle empty source', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =  cold('|');
      const e1subs =   '(^!)';
      const e2 =  cold('--o-----|');
      const e2subs =   '(^!)';
      const e3 = cold(   '-----c--|');
      const expected = '|';

      const result = e1.pipe(windowToggle(e2, () => e3));

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
    });
  });

  it('should handle throw', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = cold('#');
      const e1subs =  '(^!)';
      const e2 = cold('--o-----|');
      const e2subs =  '(^!)';
      const e3 = cold('-----c--|');
      const expected = '#';

      const result = e1.pipe(windowToggle(e2, () => e3));

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
    });
  });

  it('should handle never', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('-');
      const e1subs =   '^                                           !';
      const e2 =  cold('--o-----o------o-----o---o-----|             ');
      const e2subs =   '^                              !             ';
      const e3 =  cold(  '--c-|                                      ');
      const expected = '--u-----v------x-----y---z-------------------';
      const u = cold(    '--|                                        ');
      const v = cold(          '--|                                  ');
      const x = cold(                 '--|                           ');
      const y = cold(                       '--|                     ');
      const z = cold(                           '--|                 ');
      const unsub =    '                                            !';
      const values = { u: u, v: v, x, y, z };

      const result = e1.pipe(windowToggle(e2, () => e3));

      expectObservable(result, unsub).toBe(expected, values);
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
    });
  });

  it('should handle a never opening Observable', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('--a--^---b---c---d---e---f---g---h------|');
      const e1subs =      '^                                  !';
      const e2 = cold(    '-');
      const e2subs =      '^                                  !';
      const e3 =  cold(   '--c-|                               ');
      const expected =    '-----------------------------------|';

      const result = e1.pipe(windowToggle(e2, () => e3));

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
    });
  });

  it('should handle a never closing Observable', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('--a--^---b---c---d---e---f---g---h------|');
      const e1subs =      '^                                  !';
      const e2 = cold(    '---o---------------o-----------|    ');
      const e2subs =      '^                              !    ';
      const e3 =  cold('-');
      const expected =    '---x---------------y---------------|';
      const x = cold(        '-b---c---d---e---f---g---h------|');
      const y = cold(                        '-f---g---h------|');
      const values = { x, y };

      const result = e1.pipe(windowToggle(e2, () => e3));

      expectObservable(result).toBe(expected, values);
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
    });
  });

  it('should handle opening Observable that just throws', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('--a--^---b---c---d---e---f---g---h------|');
      const e1subs =      '(^!)';
      const e2 = cold(    '#');
      const e2subs =      '(^!)';
      const e3 = cold(    '--c-|');
      const subs =        '(^!)';
      const expected =    '#';

      const result = e1.pipe(windowToggle(e2, () => e3));

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(e1).toBe(subs);
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
    });
  });

  it ('should handle empty closing observable', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('--a--^---b---c---d---e---f---g---h------|');
      const e1subs =      '^                                  !';
      const e2 = cold(    '---o---------------o-----------|    ');
      const e2subs =      '^                              !    ';
      const e3 =  EMPTY;
      const expected =    '---x---------------y---------------|';
      const x = cold(        '|');
      const y = cold(                        '|');
      const values = { x, y };

      const result = e1.pipe(windowToggle(e2, () => e3));

      expectObservable(result).toBe(expected, values);
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
    });
  });
});
