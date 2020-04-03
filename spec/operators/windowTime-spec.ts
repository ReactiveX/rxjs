import { windowTime, mergeMap } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { of, Observable } from 'rxjs';
import { observableMatcher } from '../helpers/observableMatcher';

/** @test {windowTime} */
describe('windowTime operator', () => {
  let rxTestScheduler: TestScheduler;

  beforeEach(() => {
    rxTestScheduler = new TestScheduler(observableMatcher);
  });

  it('should emit windows given windowTimeSpan and windowCreationInterval', () => {
    rxTestScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const source = hot('--1--2--^-a--b--c--d--e---f--g--h-|');
      const subs =               '^-------------------------!';
      //  10 frames              0---------1---------2-----|
      //  5                      -----|
      //  5                                -----|
      //  5                                          -----|
      const expected =           'x---------y---------z-----|';
      const x = cold(            '--a--(b|)                  ');
      const y = cold(                      '-d--e|           ');
      const z = cold(                                '-g--h| ');
      const values = { x, y, z };

      const result = source.pipe(windowTime(5, 10, rxTestScheduler));

      expectObservable(result).toBe(expected, values);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });

  it('should close windows after max count is reached', () => {
    rxTestScheduler.run(({ hot, time, cold, expectObservable, expectSubscriptions }) => {
      const source = hot('--1--2--^--a--b--c--d--e--f--g-----|');
      const subs =               '^--------------------------!';
      const timeSpan = time(     '----------|');
      //  10 frames              0---------1---------2------|
      const expected =           'x---------y---------z------|';
      const x = cold(            '---a--(b|)                  ');
      const y = cold(                      '--d--(e|)         ');
      const z = cold(                                '-g-----|');
      const values = { x, y, z };

      const result = source.pipe(windowTime(timeSpan, null as any, 2, rxTestScheduler));

      expectObservable(result).toBe(expected, values);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });

  it('should close window after max count is reached with windowCreationInterval', () => {
    rxTestScheduler.run(({ hot, cold, expectSubscriptions, expectObservable }) => {
      const source = hot('--1--2--^-a--b--c--de-f---g--h--i-|');
      const subs =               '^-------------------------!';
      //  10 frames              0---------1---------2-----|
      //  5                      -----|
      //  5                                -----|');
      //  5                                          -----|');
      const expected =           'x---------y---------z-----|';
      const x = cold('            --a--(b|)                 ');
      const y = cold('                      -de-(f|)         ');
      const z = cold('                                -h--i| ');
      const values = { x, y, z };

      const result = source.pipe(windowTime(5, 10, 3, rxTestScheduler));

      expectObservable(result).toBe(expected, values);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });

  it('should emit windows given windowTimeSpan', () => {
    rxTestScheduler.run(({ hot, cold, time, expectSubscriptions, expectObservable }) => {
      const source = hot('--1--2--^--a--b--c--d--e--f--g--h--|');
      const subs =               '^--------------------------!';
      const timeSpan = time(     '----------|');
      //  10 frames            0---------1---------2------|
      const expected =           'x---------y---------z------|';
      const x = cold(            '---a--b--c|                 ');
      const y = cold(                      '--d--e--f-|       ');
      const z = cold(                                '-g--h--|');
      const values = { x, y, z };

      const result = source.pipe(windowTime(timeSpan, rxTestScheduler));

      expectObservable(result).toBe(expected, values);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });

  it('should emit windows given windowTimeSpan and windowCreationInterval', () => {
    rxTestScheduler.run(({ hot, time, cold, expectSubscriptions, expectObservable }) => {
      const source = hot('--1--2--^--a--b--c--d--e--f--g--h--|');
      const subs =               '^--------------------------!';
      const timeSpan = time(     '-----|');
      const interval = time(               '----------|');
      //  10 frames            0---------1---------2------|
      //  5                     ----|
      //  5                               ----|
      //  5                                         ----|
      const expected =           'x---------y---------z------|';
      const x = cold(            '---a-|                      ');
      const y = cold(                      '--d--(e|)         ');
      const z = cold(                                '-g--h|  ');
      const values = { x, y, z };

      const result = source.pipe(windowTime(timeSpan, interval, rxTestScheduler));

      expectObservable(result).toBe(expected, values);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });

  it('should return a single empty window if source is empty', () => {
    rxTestScheduler.run(({ cold, time, expectSubscriptions, expectObservable }) => {
      const source =   cold('|');
      const subs =          '(^!)';
      const expected =      '(w|)';
      const w =        cold('|');
      const expectedValues = { w };
      const timeSpan = time('-----|');
      const interval = time('----------|');

      const result = source.pipe(windowTime(timeSpan, interval, rxTestScheduler));

      expectObservable(result).toBe(expected, expectedValues);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });

  it('should split a Just source into a single window identical to source', () => {
    rxTestScheduler.run(({ cold, time, expectSubscriptions, expectObservable }) => {
      const source =   cold('(a|)');
      const subs =          '(^!)';
      const expected =      '(w|)';
      const w =        cold('(a|)');
      const expectedValues = { w };
      const timeSpan = time('-----|');
      const interval = time('----------|');

      const result = source.pipe(windowTime(timeSpan, interval, rxTestScheduler));

      expectObservable(result).toBe(expected, expectedValues);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });

  it('should be able to split a never Observable into timely empty windows', () => {
    rxTestScheduler.run(({ hot, cold, time, expectSubscriptions, expectObservable }) => {
      const source =    hot('^----------');
      const subs =          '^---------!';
      const expected =      'a--b--c--d-';
      const timeSpan = time('---|');
      const interval = time(   '---|');
      const a =        cold('---|       ');
      const b =        cold(   '---|    ');
      const c =        cold(      '---| ');
      const d =        cold(         '--');
      const unsub =         '----------!';
      const expectedValues = { a, b, c, d };

      const result = source.pipe(windowTime(timeSpan, interval, rxTestScheduler));

      expectObservable(result, unsub).toBe(expected, expectedValues);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });

  it('should emit an error-only window if outer is a simple throw-Observable', () => {
    rxTestScheduler.run(({ cold, time, expectSubscriptions, expectObservable }) => {
      const source =   cold('#');
      const subs =          '(^!)';
      const expected =      '(w#)';
      const w =        cold('#');
      const expectedValues = { w };
      const timeSpan = time('-----|');
      const interval = time('----------|');

      const result = source.pipe(windowTime(timeSpan, interval, rxTestScheduler));

      expectObservable(result).toBe(expected, expectedValues);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });

  it('should handle source Observable which eventually emits an error', () => {
    rxTestScheduler.run(({ hot, cold, time, expectSubscriptions, expectObservable }) => {
      const source = hot('--1--2--^--a--b--c--d--e--f--g--h--#');
      const subs =               '^--------------------------!';
      const timeSpan = time(     '-----|');
      const interval = time(               '----------|');
      //  10 frames            0---------1---------2------|
      //  5                     ----|
      //  5                               ----|
      //  5                                         ----|
      const expected =           'x---------y---------z------#';
      const x = cold(            '---a-|                      ');
      const y = cold(                      '--d--(e|)         ');
      const z = cold(                                '-g--h|  ');
      const values = { x, y, z };

      const result = source.pipe(windowTime(timeSpan, interval, rxTestScheduler));

      expectObservable(result).toBe(expected, values);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });

  it('should emit windows given windowTimeSpan and windowCreationInterval, but outer is unsubscribed early', () => {
    rxTestScheduler.run(({ hot, cold, time, expectSubscriptions, expectObservable }) => {
      const source = hot('--1--2--^--a--b--c--d--e--f--g--h--|');
      const subs =               '^----------!                ';
      const timeSpan = time(     '-----|');
      const interval = time(               '----------|');
      //  10 frames              0---------1---------2------|
      //  5                      ----|
      //  5                                ----|
      //  5                                          ----|
      const expected =           'x---------y-                ';
      const x = cold(            '---a-|                      ');
      const y = cold(                      '--                ');
      const unsub =              '-----------!                ';
      const values = { x, y };

      const result = source.pipe(windowTime(timeSpan, interval, rxTestScheduler));

      expectObservable(result, unsub).toBe(expected, values);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    rxTestScheduler.run(({ hot, cold, time, expectSubscriptions, expectObservable }) => {
      const source = hot('--1--2--^--a--b--c--d--e--f--g--h--|');
      const sourcesubs =         '^-------------!             ';
      const timeSpan = time(     '-----|');
      const interval = time(               '----------|');
      //  10 frames              0---------1---------2------|
      //  5                      ----|
      //  5                                ----|
      //  5                                          ----|
      const expected =           'x---------y----             ';
      const x = cold(            '---a-|                      ');
      const y = cold(                      '--d--             ');
      const unsub =              '--------------!             ';
      const values = { x, y };

      const result = source.pipe(
        mergeMap((x: string) => of(x)),
        windowTime(timeSpan, interval, rxTestScheduler),
        mergeMap((x: Observable<string>) => of(x))
      );

      expectObservable(result, unsub).toBe(expected, values);
      expectSubscriptions(source.subscriptions).toBe(sourcesubs);
    });
  });

  it('should not error if maxWindowSize is hit while nexting to other windows.', () => {
    rxTestScheduler.run(({ cold, time, expectObservable }) => {
      const source = cold('                ----a---b---c---d---e---f---g---h---i---j---');
      const windowTimeSpan = time('        ------------|');
      const windowCreationInterval = time('--------|');
      const maxWindowSize = 4;
      const a = cold('                     ----a---b---|');
      //                                   ------------|
      const b = cold('                             b---c---d---(e|)');
      const c = cold('                                     ----e---f---(g|)');
      const d = cold('                                             ----g---h---(i|)');
      const e = cold('                                                     ----i---j--');
      const f = cold('                                                             ---');
      const expected = '                   a-------b-------c-------d-------e-------f---';
      const killSub = '                    ------------------------------------------!';
      const values = {a, b, c, d, e, f};
      const result = source.pipe(
        windowTime(
          windowTimeSpan,
          windowCreationInterval,
          maxWindowSize,
          rxTestScheduler
        ),
      );
      expectObservable(result, killSub).toBe(expected, values);
    });
  });
});
