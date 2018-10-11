import { expect } from 'chai';
import { throttle, mergeMap, mapTo } from 'rxjs/operators';
import { of, concat, timer, Observable, EMPTY } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { assertDeepEquals } from 'rxjs/internal/test_helpers/assertDeepEquals';

/** @test {throttle} */
describe('throttle operator', () =>  {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(assertDeepEquals);
  });

  //asDiagram('throttle')
  it('should immediately emit the first value in each time window', () =>  {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo })  => {
      const e1 =   hot('-a-xy-----b--x--cxxx-|');
      const e1subs =   '^                    !';
      const e2 =  cold( '----|                ');
      const e2subs =  [' ^   !                ',
                    '          ^   !       ',
                    '                ^   ! '];
      const expected = '-a--------b-----c----|';

      const result = e1.pipe(throttle(() =>  e2));

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
    });
  });

  it('should pass an index to the duration selector', () => {
    const results: any[] = [];

    of('a', 'b', 'c').pipe(
      throttle((value, index) => {
        results.push(value, index);
        return EMPTY;
      })
    ).subscribe();

    expect(results).to.deep.equal(['a', 0, 'b', 1, 'c', 2]);
  });

  it('should simply mirror the source if values are not emitted often enough', () =>  {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo })  => {
      const e1 =   hot('-a--------b-----c----|');
      const e1subs =   '^                    !';
      const e2 =  cold( '----|                ');
      const e2subs =  [' ^   !                ',
                    '          ^   !       ',
                    '                ^   ! '];
      const expected = '-a--------b-----c----|';

      const result = e1.pipe(throttle(() =>  e2));

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
    });
  });

  it('should throttle with duration Observable using next to close the duration', () =>  {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo })  => {
      const e1 =   hot('-a-xy-----b--x--cxxx-|');
      const e1subs =   '^                    !';
      const e2 =  cold( '----x-y-z            ');
      const e2subs =  [' ^   !                ',
                    '          ^   !       ',
                    '                ^   ! '];
      const expected = '-a--------b-----c----|';

      const result = e1.pipe(throttle(() =>  e2));

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
    });
  });

  it('should interrupt source and duration when result is unsubscribed early', () =>  {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo })  => {
      const e1 =   hot('-a-x-y-z-xyz-x-y-z----b--x-x-|');
      const unsub =    '              !               ';
      const e1subs =   '^             !               ';
      const e2 =  cold( '------------------|          ');
      const e2subs =   ' ^            !               ';
      const expected = '-a-------------               ';

      const result = e1.pipe(throttle(() =>  e2));

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
    });
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () =>  {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo })  => {
      const e1 =   hot('-a-x-y-z-xyz-x-y-z----b--x-x-|');
      const e1subs =   '^             !               ';
      const e2 =  cold( '------------------|          ');
      const e2subs =   ' ^            !               ';
      const expected = '-a-------------               ';
      const unsub =    '              !               ';

      const result = e1.pipe(
        mergeMap((x: string) => of(x)),
        throttle(() =>  e2),
        mergeMap((x: string) => of(x))
      );

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
    });
  });

  it('should handle a busy producer emitting a regular repeating sequence', () =>  {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo })  => {
      const e1 =   hot('abcdefabcdefabcdefabcdefa|');
      const e1subs =   '^                        !';
      const e2 =  cold('-----|                    ');
      const e2subs =  ['^    !                    ',
                    '      ^    !              ',
                    '            ^    !        ',
                    '                  ^    !  ',
                    '                        ^!'];
      const expected = 'a-----a-----a-----a-----a|';

      const result = e1.pipe(throttle(() =>  e2));

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
    });
  });

  it('should mirror source if durations are always empty', () =>  {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo })  => {
      const e1 =   hot('abcdefabcdefabcdefabcdefa|');
      const e1subs =   '^                        !';
      const e2 =  cold('|');
      const expected = 'abcdefabcdefabcdefabcdefa|';

      const result = e1.pipe(throttle(() =>  e2));

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should take only the first value emitted if duration is a never', () =>  {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo })  => {
      const e1 =   hot('----abcdefabcdefabcdefabcdefa|');
      const e1subs =   '^                            !';
      const e2 =  cold('-');
      const e2subs =   '    ^                        !';
      const expected = '----a------------------------|';

      const result = e1.pipe(throttle(() =>  e2));

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
    });
  });

  it('should unsubscribe duration Observable when source raise error', () =>  {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo })  => {
      const e1 =   hot('----abcdefabcdefabcdefabcdefa#');
      const e1subs =   '^                            !';
      const e2 =  cold('-');
      const e2subs =   '    ^                        !';
      const expected = '----a------------------------#';

      const result = e1.pipe(throttle(() =>  e2));

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
    });
  });

  it('should raise error as soon as just-throw duration is used', () =>  {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo })  => {
      const e1 =   hot('----abcdefabcdefabcdefabcdefa|');
      const e1subs =   '^   !                         ';
      const e2 =  cold('#');
      const e2subs =   '    (^!)                      ';
      const expected = '----(a#)                      ';

      const result = e1.pipe(throttle(() =>  e2));

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
    });
  });

  it('should throttle using durations of constying lengths', () =>  {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo })  => {
      const e1 =   hot('abcdefabcdabcdefghabca|   ');
      const e1subs =   '^                     !   ';
      const e2 = [cold('-----|                    '),
                cold(      '---|                '),
                cold(          '-------|        '),
                cold(                  '--|     '),
                cold(                     '----|')];
      const e2subs =  ['^    !                    ',
                    '      ^  !                ',
                    '          ^      !        ',
                    '                  ^ !     ',
                    '                     ^!   '];
      const expected = 'a-----a---a-------a--a|   ';

      let i = 0;
      const result = e1.pipe(throttle(() =>  e2[i++]));

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
      for (let j = 0; j < e2.length; j++) {
        expectSubscriptionsTo(e2[j]).toBe(e2subs[j]);
      }
    });
  });

  it('should propagate error from duration Observable', () =>  {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo })  => {
      const e1 =   hot('abcdefabcdabcdefghabca|   ');
      const e1subs =   '^                !        ';
      const e2 = [cold('-----|                    '),
                cold(      '---|                '),
                cold(          '-------#        ')];
      const e2subs =  ['^    !                    ',
                    '      ^  !                ',
                    '          ^      !        '];
      const expected = 'a-----a---a------#        ';

      let i = 0;
      const result = e1.pipe(throttle(() =>  e2[i++]));

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
      for (let j = 0; j < e2.length; j++) {
        expectSubscriptionsTo(e2[j]).toBe(e2subs[j]);
      }
    });
  });

  it('should propagate error thrown from durationSelector function', () =>  {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo })  => {
      const s1 = hot('--^--x--x--x--x--x--x--e--x--x--x--|');
      const s1Subs =   '^                    !';
      const n1 = cold( '----|');
      const n1Subs =  ['   ^   !                          ',
                      '         ^   !                    ',
                      '               ^   !              '];
      const exp =      '---x-----x-----x-----(e#)';

      let i = 0;
      const result = s1.pipe(throttle(() => {
        if (i++ === 3) {
          throw 'lol';
        }
        return n1;
      }));
      expectObservable(result).toBe(exp, undefined, 'lol');
      expectSubscriptionsTo(s1).toBe(s1Subs);
      expectSubscriptionsTo(n1).toBe(n1Subs);
    });
  });

  it('should complete when source does not emit', () =>  {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo })  => {
      const e1 =   hot('-----|');
      const subs =     '^    !';
      const expected = '-----|';
      function durationSelector() { return cold('-----|'); }

      expectObservable(e1.pipe(throttle(durationSelector))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(subs);
    });
  });

  it('should raise error when source does not emit and raises error', () =>  {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo })  => {
      const e1 =   hot('-----#');
      const subs =     '^    !';
      const expected = '-----#';
      function durationSelector() { return cold('-----|'); }

      expectObservable(e1.pipe(throttle(durationSelector))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(subs);
    });
  });

  it('should handle an empty source', () =>  {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo })  => {
      const e1 =  cold('|');
      const subs =     '(^!)';
      const expected = '|';
      function durationSelector() { return cold('-----|'); }

      expectObservable(e1.pipe(throttle(durationSelector))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(subs);
    });
  });

  it('should handle a never source', () =>  {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo })  => {
      const e1 =  cold('-');
      const subs =     '^';
      const expected = '-';
      function durationSelector() { return cold('-----|'); }

      expectObservable(e1.pipe(throttle(durationSelector))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(subs);
    });
  });

  it('should handle a throw source', () =>  {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo })  => {
      const e1 =  cold('#');
      const subs =     '(^!)';
      const expected = '#';
      function durationSelector() { return cold('-----|'); }

      expectObservable(e1.pipe(throttle(durationSelector))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(subs);
    });
  });

  it('should throttle by promise resolves', (done) => {
    const e1 = concat(of(1),
      timer(10).pipe(mapTo(2)),
      timer(10).pipe(mapTo(3)),
      timer(50).pipe(mapTo(4))
    );
    const expected = [1, 2, 3, 4];

    e1.pipe(throttle(() =>  {
      return new Promise((resolve: any) => { resolve(42); });
    })).subscribe(
      (x: number) => {
        expect(x).to.equal(expected.shift()); },
      () =>  {
        done(new Error('should not be called'));
      },
      () =>  {
        expect(expected.length).to.equal(0);
        done();
      }
    );
  });

  it('should raise error when promise rejects', (done) => {
    const e1 = concat(of(1),
      timer(10).pipe(mapTo(2)),
      timer(10).pipe(mapTo(3)),
      timer(50).pipe(mapTo(4))
    );
    const expected = [1, 2, 3];
    const error = new Error('error');

    e1.pipe(throttle((x: number) => {
      if (x === 3) {
        return new Promise((resolve: any, reject: any) => { reject(error); });
      } else {
        return new Promise((resolve: any) => { resolve(42); });
      }
    })).subscribe(
      (x: number) => {
        expect(x).to.equal(expected.shift()); },
      (err: any) => {
        expect(err).to.be.an('error', 'error');
        expect(expected.length).to.equal(0);
        done();
      },
      () =>  {
        done(new Error('should not be called'));
      }
    );
  });

  describe('throttle(fn, { leading: true, trailing: true })', () => {
    // asDiagram('throttle(fn, { leading: true, trailing: true })')
    it('should immediately emit the first value in each time window', () =>  {
      testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo })  => {
        const e1 =   hot('-a-xy-----b--x--cxxx------|');
        const e1subs =   '^                         !';
        const e2 =  cold( '----|                     ');
        const e2subs =  [' ^   !                     ',
                        '     ^   !                 ',
                        '          ^   !            ',
                        '              ^   !        ',
                        '                  ^   !    ',
                        '                      ^   !'];
        const expected = '-a---y----b---x---x---x---|';

        const result = e1.pipe(throttle(() =>  e2, { leading: true, trailing: true }));

        expectObservable(result).toBe(expected);
        expectSubscriptionsTo(e1).toBe(e1subs);
        expectSubscriptionsTo(e2).toBe(e2subs);
      });
    });

    it('should work for individual values', () => {
      testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo })  => {
        const s1 = hot('-^-x------------------|');
        const s1Subs =  '^                    !';
        const n1 = cold(  '------------------------|');
        const n1Subs = ['  ^                  !'];
        const exp =     '--x------------------|';

        const result = s1.pipe(throttle(() => n1, { leading: true, trailing: true }));
        expectObservable(result).toBe(exp);
        expectSubscriptionsTo(s1).toBe(s1Subs);
        expectSubscriptionsTo(n1).toBe(n1Subs);
      });
    });
  });

  describe('throttle(fn, { leading: false, trailing: true })', () => {
    // asDiagram('throttle(fn, { leading: false, trailing: true })')
    it('should immediately emit the first value in each time window', () =>  {
      testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo })  => {
        const e1 =   hot('-a-xy-----b--x--cxxx------|');
        const e1subs =   '^                         !';
        const e2 =  cold( '----|                     ');
        const e2subs =  [' ^   !                     ',
                        '     ^   !                 ',
                        '          ^   !            ',
                        '              ^   !        ',
                        '                  ^   !    ',
                        '                      ^   !'];
        const expected = '-a---y----b---x---x---x---|';

        const result = e1.pipe(throttle(() =>  e2, { leading: true, trailing: true }));

        expectObservable(result).toBe(expected);
        expectSubscriptionsTo(e1).toBe(e1subs);
        expectSubscriptionsTo(e2).toBe(e2subs);
      });
    });

    it('should work for individual values', () => {
      testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo })  => {
        const s1 = hot('-^-x------------------|');
        const s1Subs =  '^                    !';
        const n1 = cold(  '------------------------|');
        const n1Subs = ['  ^                  !'];
        const exp =     '--x------------------|';

        const result = s1.pipe(throttle(() => n1, { leading: true, trailing: true }));
        expectObservable(result).toBe(exp);
        expectSubscriptionsTo(s1).toBe(s1Subs);
        expectSubscriptionsTo(n1).toBe(n1Subs);
      });
    });
  });
});
