import { windowTime, mergeMap } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { of, Observable } from 'rxjs';
import { assertDeepEquals } from 'rxjs/internal/test_helpers/assertDeepEquals';


/** @test {windowTime} */
describe('windowTime operator', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(assertDeepEquals);
  });

  //asDiagram('windowTime(5, 10)')
  it('should emit windows given windowTimeSpan and windowCreationInterval', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const source = hot('--1--2--^-a--b--c--d--e---f--g--h-|');
      const subs =               '^                         !';
      //  10 frames            0---------1---------2-----|
      //  5                     ----|
      //  5                               ----|
      //  5                                         ----|
      const expected =           'x---------y---------z-----|';
      const x = cold(            '--a--(b|)                  ');
      const y = cold(                      '-d--e|           ');
      const z = cold(                                '-g--h| ');
      const values = { x, y, z };

      const result = source.pipe(windowTime(5, 10, testScheduler));

      expectObservable(result).toBe(expected, values);
      expectSubscriptionsTo(source).toBe(subs);
    });
  });

  it('should close windows after max count is reached', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo, time }) => {
      const source = hot('--1--2--^--a--b--c--d--e--f--g-----|');
      const subs =               '^                          !';
      const timeSpan = time(     '----------|');
      //  10 frames               0---------1---------2------|
      const expected =           'x---------y---------z------|';
      const x = cold(            '---a--(b|)                  ');
      const y = cold(                      '--d--(e|)         ');
      const z = cold(                                '-g-----|');
      const values = { x, y, z };

      const result = source.pipe(windowTime(timeSpan, null, 2, testScheduler));

      expectObservable(result).toBe(expected, values);
      expectSubscriptionsTo(source).toBe(subs);
    });
  });

  it('should close window after max count is reached with windowCreationInterval', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo, time}) => {
      const source = hot('--1--2--^-a--b--c--de-f---g--h--i-|');
      const subs =               '^                         !';
      //  10 frames               0---------1---------2-----|
      //  5                       ----|
      //  5                                 ----|
      //  5                                           ----|
      const expected =           'x---------y---------z-----|';
      const x = cold(            '--a--(b|)                  ');
      const y = cold(                      '-de-(f|)         ');
      const z = cold(                                '-h--i| ');
      const values = { x, y, z };

      const result = source.pipe(windowTime(5, 10, 3, testScheduler));

      expectObservable(result).toBe(expected, values);
      expectSubscriptionsTo(source).toBe(subs);
    });
  });

  it('should emit windows given windowTimeSpan', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo, time }) => {
      const source = hot('--1--2--^--a--b--c--d--e--f--g--h--|');
      const subs =               '^                          !';
      const timeSpan = time(     '----------|');
      //  10 frames               0---------1---------2------|
      const expected =           'x---------y---------z------|';
      const x = cold(            '---a--b--c|                 ');
      const y = cold(                      '--d--e--f-|       ');
      const z = cold(                                '-g--h--|');
      const values = { x, y, z };

      const result = source.pipe(windowTime(timeSpan, testScheduler));

      expectObservable(result).toBe(expected, values);
      expectSubscriptionsTo(source).toBe(subs);
    });
  });

  it('should emit windows given windowTimeSpan and windowCreationInterval', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo, time }) => {
      const source = hot('--1--2--^--a--b--c--d--e--f--g--h--|');
      const subs =               '^                          !';
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

      const result = source.pipe(windowTime(timeSpan, interval, testScheduler));

      expectObservable(result).toBe(expected, values);
      expectSubscriptionsTo(source).toBe(subs);
    });
  });

  it('should return a single empty window if source is empty', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo, time }) => {
      const source =   cold('|');
      const subs =          '(^!)';
      const expected =      '(w|)';
      const w =        cold('|');
      const expectedValues = { w };
      const timeSpan = time('-----|');
      const interval = time('----------|');

      const result = source.pipe(windowTime(timeSpan, interval, testScheduler));

      expectObservable(result).toBe(expected, expectedValues);
      expectSubscriptionsTo(source).toBe(subs);
    });
  });

  it('should split a Just source into a single window identical to source', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo, time }) => {
      const source =   cold('(a|)');
      const subs =          '(^!)';
      const expected =      '(w|)';
      const w =        cold('(a|)');
      const expectedValues = { w };
      const timeSpan = time('-----|');
      const interval = time('----------|');

      const result = source.pipe(windowTime(timeSpan, interval, testScheduler));

      expectObservable(result).toBe(expected, expectedValues);
      expectSubscriptionsTo(source).toBe(subs);
    });
  });

  it('should be able to split a never Observable into timely empty windows', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo, time }) => {
      const source =    hot('^----------');
      const subs =          '^         !';
      const expected =      'a--b--c--d-';
      const timeSpan = time('---|');
      const interval = time(   '---|');
      const a =        cold('---|       ');
      const b =        cold(   '---|    ');
      const c =        cold(      '---| ');
      const d =        cold(         '--');
      const unsub =         '          !';
      const expectedValues = { a, b, c, d };

      const result = source.pipe(windowTime(timeSpan, interval, testScheduler));

      expectObservable(result, unsub).toBe(expected, expectedValues);
      expectSubscriptionsTo(source).toBe(subs);
    });
  });

  it('should emit an error-only window if outer is a simple throw-Observable', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo, time }) => {
      const source =   cold('#');
      const subs =          '(^!)';
      const expected =      '(w#)';
      const w =        cold('#');
      const expectedValues = { w };
      const timeSpan = time('-----|');
      const interval = time('----------|');

      const result = source.pipe(windowTime(timeSpan, interval, testScheduler));

      expectObservable(result).toBe(expected, expectedValues);
      expectSubscriptionsTo(source).toBe(subs);
    });
  });

  it('should handle source Observable which eventually emits an error', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo, time }) => {
      const source = hot('--1--2--^--a--b--c--d--e--f--g--h--#');
      const subs =               '^                          !';
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

      const result = source.pipe(windowTime(timeSpan, interval, testScheduler));

      expectObservable(result).toBe(expected, values);
      expectSubscriptionsTo(source).toBe(subs);
    });
  });

  it('should emit windows given windowTimeSpan and windowCreationInterval, ' +
  'but outer is unsubscribed early', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo, time }) => {
      const source = hot('--1--2--^--a--b--c--d--e--f--g--h--|');
      const subs =               '^          !                ';
      const timeSpan = time(     '-----|');
      const interval = time(               '----------|');
      //  10 frames            0---------1---------2------|
      //  5                     ----|
      //  5                               ----|
      //  5                                         ----|
      const expected =           'x---------y-                ';
      const x = cold(            '---a-|                      ');
      const y = cold(                      '--                ');
      const unsub =              '           !                ';
      const values = { x, y };

      const result = source.pipe(windowTime(timeSpan, interval, testScheduler));

      expectObservable(result, unsub).toBe(expected, values);
      expectSubscriptionsTo(source).toBe(subs);
    });
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo, time}) => {
      const source = hot('--1--2--^--a--b--c--d--e--f--g--h--|');
      const sourcesubs =         '^             !             ';
      const timeSpan = time(     '-----|');
      const interval = time(               '----------|');
      //  10 frames            0---------1---------2------|
      //  5                     ----|
      //  5                               ----|
      //  5                                         ----|
      const expected =           'x---------y----             ';
      const x = cold(            '---a-|                      ');
      const y = cold(                      '--d--             ');
      const unsub =              '              !             ';
      const values = { x, y };

      const result = source.pipe(
        mergeMap((x: string) => of(x)),
        windowTime(timeSpan, interval, testScheduler),
        mergeMap((x: Observable<string>) => of(x))
      );

      expectObservable(result, unsub).toBe(expected, values);
      expectSubscriptionsTo(source).toBe(sourcesubs);
    });
  });
});
