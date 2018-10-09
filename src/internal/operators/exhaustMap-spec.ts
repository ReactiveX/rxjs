import { concat, defer, of } from 'rxjs';
import { exhaustMap, mergeMap, map, takeWhile } from 'rxjs/operators';
import { expect } from 'chai';
import { TestScheduler } from 'rxjs/testing';
import { assertDeepEquals } from 'rxjs/internal/test_helpers/assertDeepEquals';

/** @test {exhaustMap} */
describe('exhaustMap', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(assertDeepEquals);
  });

  // asDiagram('exhaustMap(i => 10*i\u2014\u201410*i\u2014\u201410*i\u2014| )')
  it('should map-and-flatten each item to an Observable', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =    hot('--1-----3--5-------|');
      const e1subs =    '^                  !';
      const e2 =   cold('x-x-x|              ', {x: 10});
      const expected =  '--x-x-x-y-y-y------|';
      const values = {x: 10, y: 30, z: 50};

      const result = e1.pipe(exhaustMap(x => e2.pipe(map(i => i * +x))));

      expectObservable(result).toBe(expected, values);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should handle outer throw', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const x =   cold('--a--b--c--|');
      const xsubs: string[] = [];
      const e1 =  cold('#');
      const e1subs =   '(^!)';
      const expected = '#';

      const result = e1.pipe(exhaustMap(() => x));

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(x).toBe(xsubs);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should handle outer empty', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const x =   cold('--a--b--c--|');
      const xsubs: string[] = [];
      const e1 =  cold('|');
      const e1subs =   '(^!)';
      const expected = '|';

      const result = e1.pipe(exhaustMap(() => x));
      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(x).toBe(xsubs);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should handle outer never', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const x =   cold('--a--b--c--|');
      const xsubs: string[] = [];
      const e1 =  cold('-');
      const e1subs =   '^';
      const expected = '-';

      const result = e1.pipe(exhaustMap(() => x));

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(x).toBe(xsubs);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should raise error if project throws', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('---x---------y-----------------z-------------|');
      const e1subs =   '^  !';
      const expected = '---#';

      const result = e1.pipe(exhaustMap(value => {
        throw 'error';
      }));

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should switch with a selector function', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const x = cold(     '--a--b--c--|                              ');
      const xsubs =    '   ^          !                              ';
      const y = cold(               '--d--e--f--|                    ');
      const ysubs: string[] = [];
      const z = cold(                                 '--g--h--i--|  ');
      const zsubs =    '                               ^          !  ';
      const e1 =   hot('---x---------y-----------------z-------------|');
      const e1subs =   '^                                            !';
      const expected = '-----a--b--c---------------------g--h--i-----|';

      const observableLookup = { x: x, y: y, z: z };

      const result = e1.pipe(exhaustMap(value => observableLookup[value]));

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(x).toBe(xsubs);
      expectSubscriptionsTo(y).toBe(ysubs);
      expectSubscriptionsTo(z).toBe(zsubs);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should switch inner cold observables, outer is unsubscribed early', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const x = cold(     '--a--b--c--|                               ');
      const xsubs =    '   ^          !                               ';
      const y = cold(               '--d--e--f--|                     ');
      const ysubs: string[] = [];
      const z = cold(                                 '--g--h--i--|   ');
      const zsubs =    '                               ^  !           ';
      const e1 =   hot('---x---------y-----------------z-------------|');
      const unsub =    '                                  !           ';
      const e1subs =   '^                                 !           ';
      const expected = '-----a--b--c---------------------g-           ';

      const observableLookup = { x: x, y: y, z: z };

      const result = e1.pipe(exhaustMap(value => observableLookup[value]));

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptionsTo(x).toBe(xsubs);
      expectSubscriptionsTo(y).toBe(ysubs);
      expectSubscriptionsTo(z).toBe(zsubs);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const x = cold(     '--a--b--c--|                               ');
      const xsubs =    '   ^          !                               ';
      const y = cold(               '--d--e--f--|                     ');
      const ysubs: string[] = [];
      const z = cold(                                 '--g--h--i--|   ');
      const zsubs =    '                               ^  !           ';
      const e1 =   hot('---x---------y-----------------z-------------|');
      const e1subs =   '^                                 !           ';
      const expected = '-----a--b--c---------------------g-           ';
      const unsub =    '                                  !           ';

      const observableLookup = { x: x, y: y, z: z };

      const result = e1.pipe(
        mergeMap(x => of(x)),
        exhaustMap(value => observableLookup[value]),
        mergeMap(x => of(x))
      );

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptionsTo(x).toBe(xsubs);
      expectSubscriptionsTo(y).toBe(ysubs);
      expectSubscriptionsTo(z).toBe(zsubs);
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
      exhaustMap(() => synchronousObservable),
      takeWhile((x) => x != 2) // unsubscribe at the second side-effect
    ).subscribe(() => { /* noop */ });

    expect(sideEffects).to.deep.equal([1, 2]);
  });

  it('should switch inner cold observables, inner never completes', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const x = cold(     '--a--b--c--|                              ');
      const xsubs =    '   ^          !                              ';
      const y = cold(               '--d--e--f--|                    ');
      const ysubs: string[] = [];
      const z = cold(                                 '--g--h--i-----');
      const zsubs =    '                               ^             ';
      const e1 =   hot('---x---------y-----------------z---------|   ');
      const e1subs =   '^                                        !   ';
      const expected = '-----a--b--c---------------------g--h--i-----';

      const observableLookup = { x: x, y: y, z: z };

      const result = e1.pipe(exhaustMap(value => observableLookup[value]));

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(x).toBe(xsubs);
      expectSubscriptionsTo(y).toBe(ysubs);
      expectSubscriptionsTo(z).toBe(zsubs);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should handle a synchronous switch an stay on the first inner observable', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const x =   cold(         '--a--b--c--d--e--|   ');
      const xsubs =    '         ^                !   ';
      const y =   cold(         '---f---g---h---i--|  ');
      const ysubs: string[] = [];
      const e1 =   hot('---------(xy)----------------|');
      const e1subs =   '^                            !';
      const expected = '-----------a--b--c--d--e-----|';

      const observableLookup = { x: x, y: y };

      const result = e1.pipe(exhaustMap(value => observableLookup[value]));

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(x).toBe(xsubs);
      expectSubscriptionsTo(y).toBe(ysubs);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should switch inner cold observables, one inner throws', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const x =   cold(         '--a--b--c--d--#             ');
      const xsubs =    '         ^             !             ';
      const y =   cold(                   '---f---g---h---i--');
      const ysubs: string[] = [];
      const e1 =   hot('---------x---------y---------|       ');
      const e1subs =   '^                      !             ';
      const expected = '-----------a--b--c--d--#             ';

      const observableLookup = { x: x, y: y };

      const result = e1.pipe(exhaustMap(value => observableLookup[value]));

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(x).toBe(xsubs);
      expectSubscriptionsTo(y).toBe(ysubs);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should switch inner hot observables', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const x =    hot('-----a--b--c--d--e--|                  ');
      const xsubs =    '         ^          !                  ';
      const y =    hot('--p-o-o-p-------f---g---h---i--|       ');
      const ysubs: string[] = [];
      const z =    hot('---z-o-o-m-------------j---k---l---m--|');
      const zsubs =    '                    ^                 !';
      const e1 =   hot('---------x----y-----z--------|         ');
      const e1subs =   '^                            !         ';
      const expected = '-----------c--d--e-----j---k---l---m--|';

      const observableLookup = { x: x, y: y, z: z };

      const result = e1.pipe(exhaustMap(value => observableLookup[value]));

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(x).toBe(xsubs);
      expectSubscriptionsTo(y).toBe(ysubs);
      expectSubscriptionsTo(z).toBe(zsubs);
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

      const result = e1.pipe(exhaustMap(value => observableLookup[value]));

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

      const result = e1.pipe(exhaustMap(value => observableLookup[value]));

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(x).toBe(xsubs);
      expectSubscriptionsTo(y).toBe(ysubs);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should never switch inner never', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const x = cold('-');
      const y = cold('#');
      const xsubs =    '         ^                     ';
      const ysubs: string[] = [];
      const e1 =   hot('---------x---------y----------|');
      const e1subs =   '^                             !';
      const expected = '-------------------------------';

      const observableLookup = { x: x, y: y };

      const result = e1.pipe(exhaustMap(value => observableLookup[value]));

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(x).toBe(xsubs);
      expectSubscriptionsTo(y).toBe(ysubs);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should switch inner empty and throw', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const x = cold('|');
      const y = cold('#');
      const xsubs =    '         (^!)                  ';
      const ysubs =    '                   (^!)        ';
      const e1 =   hot('---------x---------y---------|');
      const e1subs =   '^                  !          ';
      const expected = '-------------------#          ';

      const observableLookup = { x: x, y: y };

      const result = e1.pipe(exhaustMap(value => observableLookup[value]));

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(x).toBe(xsubs);
      expectSubscriptionsTo(y).toBe(ysubs);
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

      const observableLookup = { x: x };

      const result = e1.pipe(exhaustMap(value => observableLookup[value]));

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(x).toBe(xsubs);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  describe('with concurrency=2', () => {
    it ('should exhaust two observables at the same time', () => {
      testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
        const s1 = hot('----^----o--o--x--o--o--x--o--|');
        const ssubs =      '^                         !';
        const i1 = cold(   '     --e-e-e-|');
        const isubs = [    '     ^       !                  ',
                          '        ^       !               ',
                          '              ^       !         ',
                          '                 ^       !      ',
                          '                       ^       !',]
        const expected = '  -------e-eeee-e-e-eeee-e-e-e-e-|';

        const result = s1.pipe(exhaustMap(() => i1, 2));
        expectObservable(result).toBe(expected);
        expectSubscriptionsTo(s1).toBe(ssubs);
        expectSubscriptionsTo(i1).toBe(isubs);
      });
    });
  });
});
