import { expect } from 'chai';
import { switchMap, mergeMap, map, takeWhile } from 'rxjs/operators';
import { concat, defer, of, Observable } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { assertDeepEquals } from 'rxjs/internal/test_helpers/assertDeepEquals';

declare function asDiagram(arg: string): Function;

/** @test {switchMap} */
describe('switchMap', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(assertDeepEquals);
  });
  //asDiagram('switchMap(i => 10*i\u2014\u201410*i\u2014\u201410*i\u2014| )')
  it('should map-and-flatten each item to an Observable', () => {
      testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =    hot('--1-----3--5-------|');
      const e1subs =    '^                  !';
      const e2 =   cold('x-x-x|              ', {x: 10});
      const expected =  '--x-x-x-y-yz-z-z---|';
      const values = {x: 10, y: 30, z: 50};

      const result = e1.pipe(switchMap(x => e2.pipe(map(i => i * +x))));

      expectObservable(result).toBe(expected, values);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should unsub inner observables', () => {
    const unsubbed: string[] = [];

    of('a', 'b').pipe(
      switchMap(x =>
        new Observable<string>((subscriber) => {
          subscriber.complete();
          return () => {
            unsubbed.push(x);
          };
        })
      )
    ).subscribe();

    expect(unsubbed).to.deep.equal(['a', 'b']);
  });

  it('should switch inner cold observables', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const x =   cold(         '--a--b--c--d--e--|           ');
      const xsubs =    '         ^         !                  ';
      const y =   cold(                   '---f---g---h---i--|');
      const ysubs =    '                   ^                 !';
      const e1 =   hot('---------x---------y---------|        ');
      const e1subs =   '^                            !        ';
      const expected = '-----------a--b--c----f---g---h---i--|';

      const observableLookup = { x: x, y: y };

      const result = e1.pipe(switchMap(value => observableLookup[value]));

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(x).toBe(xsubs);
      expectSubscriptionsTo(y).toBe(ysubs);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should raise error when projection throws', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('-------x-----y---|');
      const e1subs =   '^      !          ';
      const expected = '-------#          ';
      function project(): any[] {
        throw 'error';
      }

      expectObservable(e1.pipe(switchMap(project))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should switch inner cold observables, outer is unsubscribed early', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const x =   cold(         '--a--b--c--d--e--|           ');
      const xsubs =    '         ^         !                  ';
      const y =   cold(                   '---f---g---h---i--|');
      const ysubs =    '                   ^ !                ';
      const e1 =   hot('---------x---------y---------|        ');
      const e1subs =   '^                    !                ';
      const unsub =    '                     !                ';
      const expected = '-----------a--b--c----                ';

      const observableLookup = { x: x, y: y };

      const result = e1.pipe(switchMap(value => observableLookup[value]));

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptionsTo(x).toBe(xsubs);
      expectSubscriptionsTo(y).toBe(ysubs);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const x =   cold(         '--a--b--c--d--e--|           ');
      const xsubs =    '         ^         !                  ';
      const y =   cold(                   '---f---g---h---i--|');
      const ysubs =    '                   ^ !                ';
      const e1 =   hot('---------x---------y---------|        ');
      const e1subs =   '^                    !                ';
      const expected = '-----------a--b--c----                ';
      const unsub =    '                     !                ';

      const observableLookup = { x: x, y: y };

      const result = e1.pipe(
        mergeMap(x => of(x)),
        switchMap(value => observableLookup[value]),
        mergeMap(x => of(x)),
      );

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptionsTo(x).toBe(xsubs);
      expectSubscriptionsTo(y).toBe(ysubs);
      expectSubscriptionsTo(e1).toBe(e1subs);
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

    of(null).pipe(
      switchMap(() => synchronousObservable),
      takeWhile((x) => x != 2) // unsubscribe at the second side-effect
    ).subscribe(() => { /* noop */ });

    expect(sideEffects).to.deep.equal([1, 2]);
  });

  it('should switch inner cold observables, inner never completes', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const x =   cold(         '--a--b--c--d--e--|          ');
      const xsubs =    '         ^         !                 ';
      const y =   cold(                   '---f---g---h---i--');
      const ysubs =    '                   ^                 ';
      const e1 =   hot('---------x---------y---------|       ');
      const e1subs =   '^                            !       ';
      const expected = '-----------a--b--c----f---g---h---i--';

      const observableLookup = { x: x, y: y };

      const result = e1.pipe(switchMap(value => observableLookup[value]));

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(x).toBe(xsubs);
      expectSubscriptionsTo(y).toBe(ysubs);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should handle a synchronous switch to the second inner observable', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const x =   cold(         '--a--b--c--d--e--|   ');
      const xsubs =    '         (^!)                 ';
      const y =   cold(         '---f---g---h---i--|  ');
      const ysubs =    '         ^                 !  ';
      const e1 =   hot('---------(xy)----------------|');
      const e1subs =   '^                            !';
      const expected = '------------f---g---h---i----|';

      const observableLookup = { x: x, y: y };

      const result = e1.pipe(switchMap(value => observableLookup[value]));

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(x).toBe(xsubs);
      expectSubscriptionsTo(y).toBe(ysubs);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should switch inner cold observables, one inner throws', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const x =   cold(         '--a--b--#--d--e--|          ');
      const xsubs =    '         ^       !                   ';
      const y =   cold(                   '---f---g---h---i--');
      const ysubs: string[] = [];
      const e1 =   hot('---------x---------y---------|       ');
      const e1subs =   '^                !                   ';
      const expected = '-----------a--b--#                   ';

      const observableLookup = { x, y };

      const result = e1.pipe(switchMap(value => observableLookup[value]));

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(x).toBe(xsubs);
      expectSubscriptionsTo(y).toBe(ysubs);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should switch inner hot observables', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const x =    hot('-----a--b--c--d--e--|                 ');
      const xsubs =    '         ^         !                  ';
      const y =    hot('--p-o-o-p-------------f---g---h---i--|');
      const ysubs =    '                   ^                 !';
      const e1 =   hot('---------x---------y---------|        ');
      const e1subs =   '^                            !        ';
      const expected = '-----------c--d--e----f---g---h---i--|';

      const observableLookup = { x: x, y: y };

      const result = e1.pipe(switchMap(value => observableLookup[value]));

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(x).toBe(xsubs);
      expectSubscriptionsTo(y).toBe(ysubs);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should switch inner empty and empty', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const x = cold('|');
      const y = cold('|');
      const xsubs =    '         (^!)                 ';
      const ysubs =    '                   (^!)       ';
      const e1 =   hot('---------x---------y---------|');
      const e1subs =   '^                            !';
      const expected = '-----------------------------|';

      const observableLookup = { x: x, y: y };

      const result = e1.pipe(switchMap(value => observableLookup[value]));

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(x).toBe(xsubs);
      expectSubscriptionsTo(y).toBe(ysubs);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should switch inner empty and never', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const x = cold('|');
      const y = cold('-');
      const xsubs =    '         (^!)                 ';
      const ysubs =    '                   ^          ';
      const e1 =   hot('---------x---------y---------|');
      const e1subs =   '^                            !';
      const expected = '------------------------------';

      const observableLookup = { x: x, y: y };

      const result = e1.pipe(switchMap(value => observableLookup[value]));

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(x).toBe(xsubs);
      expectSubscriptionsTo(y).toBe(ysubs);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should switch inner never and empty', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const x = cold('-');
      const y = cold('|');
      const xsubs =    '         ^         !          ';
      const ysubs =    '                   (^!)       ';
      const e1 =   hot('---------x---------y---------|');
      const e1subs =   '^                            !';
      const expected = '-----------------------------|';

      const observableLookup = { x: x, y: y };

      const result = e1.pipe(switchMap(value => observableLookup[value]));

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(x).toBe(xsubs);
      expectSubscriptionsTo(y).toBe(ysubs);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should switch inner never and throw', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const x = cold('-');
      const y = cold('#', null, 'sad');
      const xsubs =    '         ^         !          ';
      const ysubs =    '                   (^!)       ';
      const e1 =   hot('---------x---------y---------|');
      const e1subs =   '^                  !          ';
      const expected = '-------------------#          ';

      const observableLookup = { x: x, y: y };

      const result = e1.pipe(switchMap(value => observableLookup[value]));

      expectObservable(result).toBe(expected, undefined, 'sad');
      expectSubscriptionsTo(x).toBe(xsubs);
      expectSubscriptionsTo(y).toBe(ysubs);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should switch inner empty and throw', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const x = cold('|');
      const y = cold('#', null, 'sad');
      const xsubs =    '         (^!)                 ';
      const ysubs =    '                   (^!)       ';
      const e1 =   hot('---------x---------y---------|');
      const e1subs =   '^                  !          ';
      const expected = '-------------------#          ';

      const observableLookup = { x: x, y: y };

      const result = e1.pipe(switchMap(value => observableLookup[value]));

      expectObservable(result).toBe(expected, undefined, 'sad');
      expectSubscriptionsTo(x).toBe(xsubs);
      expectSubscriptionsTo(y).toBe(ysubs);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should handle outer empty', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =  cold('|');
      const e1subs =   '(^!)';
      const expected = '|';

      const result = e1.pipe(switchMap(value => of(value)));

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should handle outer never', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =  cold('-');
      const e1subs =   '^';
      const expected = '-';

      const result = e1.pipe(switchMap(value => of(value)));

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should handle outer throw', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =  cold('#');
      const e1subs =   '(^!)';
      const expected = '#';

      const result = e1.pipe(switchMap(value => of(value)));

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should handle outer error', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const x =   cold(         '--a--b--c--d--e--|');
      const xsubs =    '         ^         !       ';
      const e1 =   hot('---------x---------#       ');
      const e1subs =   '^                  !       ';
      const expected = '-----------a--b--c-#       ';

      const observableLookup = { x };

      const result = e1.pipe(switchMap(value => observableLookup[value]));

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(x).toBe(xsubs);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });
});
