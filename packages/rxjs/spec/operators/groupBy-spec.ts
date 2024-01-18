import { expect } from 'chai';
import { groupBy, delay, tap, map, take, mergeMap, materialize, skip, ignoreElements } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import type { NextNotification, ErrorNotification } from 'rxjs';
import { ReplaySubject, of, Observable, Subject } from 'rxjs';
import { createNotification } from '@rxjs/observable';
import { observableMatcher } from '../helpers/observableMatcher';

/** @test {groupBy} */
describe('groupBy operator', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(observableMatcher);
  });

  it('should group numbers by odd/even', () => {
    testScheduler.run(({ cold, hot, expectObservable }) => {
      const e1 = hot('  --1---2---3---4---5---|');
      const expected = '--x---y---------------|';
      const x = cold('  1-------3-------5---|');
      const y = cold('  2-------4-------|');
      const expectedValues = { x: x, y: y };

      const source = e1.pipe(groupBy((val: string) => parseInt(val) % 2));
      expectObservable(source).toBe(expected, expectedValues);
    });
  });

  function reverseString(str: string) {
    return str.split('').reverse().join('');
  }

  function mapObject<T>(obj: Record<string, T>, fn: (val: T) => unknown) {
    const out: Record<string, any> = {};
    for (const p in obj) {
      if (obj.hasOwnProperty(p)) {
        out[p] = fn(obj[p]);
      }
    }
    return out;
  }

  it('should group values', (done) => {
    const expectedGroups = [
      { key: 1, values: [1, 3] },
      { key: 0, values: [2] },
    ];

    of(1, 2, 3)
      .pipe(groupBy((x) => x % 2))
      .subscribe({
        next: (g: any) => {
          const expectedGroup = expectedGroups.shift()!;
          expect(g.key).to.equal(expectedGroup.key);

          g.subscribe((x: any) => {
            expect(x).to.deep.equal(expectedGroup.values.shift());
          });
        },
        complete: done,
      });
  });

  it('should group values with an element selector', (done) => {
    const expectedGroups = [
      { key: 1, values: ['1!', '3!'] },
      { key: 0, values: ['2!'] },
    ];

    of(1, 2, 3)
      .pipe(
        groupBy(
          (x) => x % 2,
          (x) => x + '!'
        )
      )
      .subscribe({
        next: (g: any) => {
          const expectedGroup = expectedGroups.shift()!;
          expect(g.key).to.equal(expectedGroup.key);

          g.subscribe((x: any) => {
            expect(x).to.deep.equal(expectedGroup.values.shift());
          });
        },
        complete: done,
      });
  });

  it('should group values with a duration selector', () => {
    const expectedGroups = [
      { key: 1, values: [1, 3] },
      { key: 0, values: [2, 4] },
      { key: 1, values: [5] },
      { key: 0, values: [6] },
    ];

    const resultingGroups: { key: number; values: number[] }[] = [];

    of(1, 2, 3, 4, 5, 6)
      .pipe(
        groupBy((x) => x % 2, {
          duration: (g) => g.pipe(skip(1)),
        })
      )
      .subscribe((g: any) => {
        const group = { key: g.key, values: [] as number[] };

        g.subscribe((x: any) => {
          group.values.push(x);
        });

        resultingGroups.push(group);
      });

    expect(resultingGroups).to.deep.equal(expectedGroups);
  });

  it('should group values with a subject selector', (done) => {
    const expectedGroups = [
      { key: 1, values: [3] },
      { key: 0, values: [2] },
    ];

    of(1, 2, 3)
      .pipe(
        groupBy((x) => x % 2, {
          connector: () => new ReplaySubject(1),
        }),
        // Ensure each inner group reaches the destination after the first event
        // has been next'd to the group
        delay(5)
      )
      .subscribe({
        next: (g: any) => {
          const expectedGroup = expectedGroups.shift()!;
          expect(g.key).to.equal(expectedGroup.key);

          g.subscribe((x: any) => {
            expect(x).to.deep.equal(expectedGroup.values.shift());
          });
        },
        complete: done,
      });
  });

  it('should handle an empty Observable', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' |   ');
      const e1subs = '  (^!)';
      const expected = '|   ';

      const source = e1.pipe(groupBy((val: string) => val.toLowerCase().trim()));

      expectObservable(source).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should handle a never Observable', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' -');
      const e1subs = '  ^';
      const expected = '-';

      const source = e1.pipe(groupBy((val: string) => val.toLowerCase().trim()));

      expectObservable(source).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should handle a just-throw Observable', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('  #  ');
      const e1subs = '  (^!)';
      const expected = '#   ';

      const source = e1.pipe(groupBy((val: string) => val.toLowerCase().trim()));

      expectObservable(source).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should handle an Observable with a single value', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const values = { a: '  foo' };
      const e1 = hot('  ^--a--|', values);
      const e1subs = '  ^-----!';
      const expected = '---g--|';
      const g = cold('     a--|', values);
      const expectedValues = { g: g };

      const source = e1.pipe(groupBy((val: string) => val.toLowerCase().trim()));

      expectObservable(source).toBe(expected, expectedValues);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should group values with a keySelector', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const values = {
        a: '  foo',
        b: ' FoO ',
        c: 'baR  ',
        d: 'foO ',
        e: ' Baz   ',
        f: '  qux ',
        g: '   bar',
        h: ' BAR  ',
        i: 'FOO ',
        j: 'baz  ',
        k: ' bAZ ',
        l: '    fOo    ',
      };
      const e1 = hot('-1--2--^-a-b-c-d-e-f-g-h-i-j-k-l-|', values);
      const e1subs = '       ^-------------------------!';
      const expected = '     --w---x---y-z-------------|';
      const w = cold('         a-b---d---------i-----l-|', values);
      const x = cold('             c-------g-h---------|', values);
      const y = cold('                 e---------j-k---|', values);
      const z = cold('                   f-------------|', values);
      const expectedValues = { w: w, x: x, y: y, z: z };

      const source = e1.pipe(groupBy((val: string) => val.toLowerCase().trim()));

      expectObservable(source).toBe(expected, expectedValues);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should emit GroupObservables', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const values = {
        a: '  foo',
        b: ' FoO ',
      };
      const e1 = hot('-1--2--^-a-b----|', values);
      const e1subs = '       ^--------!';
      const expected = '     --g------|';
      const expectedValues = { g: 'foo' };

      const source = e1.pipe(
        groupBy((val: string) => val.toLowerCase().trim()),
        tap((group: any) => {
          expect(group.key).to.equal('foo');
          expect(group instanceof Observable).to.be.true;
        }),
        map((group: any) => {
          return group.key;
        })
      );

      expectObservable(source).toBe(expected, expectedValues);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should group values with a keySelector, assert GroupSubject key', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const values = {
        a: '  foo',
        b: ' FoO ',
        c: 'baR  ',
        d: 'foO ',
        e: ' Baz   ',
        f: '  qux ',
        g: '   bar',
        h: ' BAR  ',
        i: 'FOO ',
        j: 'baz  ',
        k: ' bAZ ',
        l: '    fOo    ',
      };
      const e1 = hot('-1--2--^-a-b-c-d-e-f-g-h-i-j-k-l-|', values);
      const e1subs = '       ^-------------------------!';
      const expected = '     --w---x---y-z-------------|';
      const expectedValues = { w: 'foo', x: 'bar', y: 'baz', z: 'qux' };

      const source = e1.pipe(
        groupBy((val: string) => val.toLowerCase().trim()),
        map((g: any) => g.key)
      );

      expectObservable(source).toBe(expected, expectedValues);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should group values with a keySelector, but outer throws', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const values = {
        a: '  foo',
        b: ' FoO ',
        c: 'baR  ',
        d: 'foO ',
        e: ' Baz   ',
        f: '  qux ',
        g: '   bar',
        h: ' BAR  ',
        i: 'FOO ',
        j: 'baz  ',
        k: ' bAZ ',
        l: '    fOo    ',
      };
      const e1 = hot('-1--2--^-a-b-c-d-e-f-g-h-i-j-k-l-#', values);
      const e1subs = '       ^-------------------------!';
      const expected = '     --w---x---y-z-------------#';
      const expectedValues = { w: 'foo', x: 'bar', y: 'baz', z: 'qux' };

      const source = e1.pipe(
        groupBy((val: string) => val.toLowerCase().trim()),
        map((g: any) => g.key)
      );

      expectObservable(source).toBe(expected, expectedValues);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should group values with a keySelector, inners propagate error from outer', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const values = {
        a: '  foo',
        b: ' FoO ',
        c: 'baR  ',
        d: 'foO ',
        e: ' Baz   ',
        f: '  qux ',
        g: '   bar',
        h: ' BAR  ',
        i: 'FOO ',
        j: 'baz  ',
        k: ' bAZ ',
        l: '    fOo    ',
      };
      const e1 = hot('-1--2--^-a-b-c-d-e-f-g-h-i-j-k-l-#', values);
      const e1subs = '       ^-------------------------!';
      const expected = '     --w---x---y-z-------------#';
      const w = cold('         a-b---d---------i-----l-#', values);
      const x = cold('             c-------g-h---------#', values);
      const y = cold('                 e---------j-k---#', values);
      const z = cold('                   f-------------#', values);
      const expectedValues = { w: w, x: x, y: y, z: z };

      const source = e1.pipe(groupBy((val: string) => val.toLowerCase().trim()));

      expectObservable(source).toBe(expected, expectedValues);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should allow outer to be unsubscribed early', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const values = {
        a: '  foo',
        b: ' FoO ',
        c: 'baR  ',
        d: 'foO ',
        e: ' Baz   ',
        f: '  qux ',
        g: '   bar',
        h: ' BAR  ',
        i: 'FOO ',
        j: 'baz  ',
        k: ' bAZ ',
        l: '    fOo    ',
      };
      const e1 = hot('-1--2--^-a-b-c-d-e-f-g-h-i-j-k-l-|', values);
      const unsub = '        -----------!               ';
      const e1subs = '       ^----------!               ';
      const expected = '     --w---x---y-               ';
      const expectedValues = { w: 'foo', x: 'bar', y: 'baz' };

      const source = e1.pipe(
        groupBy((val: string) => val.toLowerCase().trim()),
        map((group: any) => group.key)
      );

      expectObservable(source, unsub).toBe(expected, expectedValues);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should unsubscribe from the source when the outer and inner subscriptions are disposed', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const values = {
        a: '  foo',
        b: ' FoO ',
        c: 'baR  ',
        d: 'foO ',
        e: ' Baz   ',
        f: '  qux ',
        g: '   bar',
        h: ' BAR  ',
        i: 'FOO ',
        j: 'baz  ',
        k: ' bAZ ',
        l: '    fOo    ',
      };
      const e1 = hot('-1--2--^-a-b-c-d-e-f-g-h-i-j-k-l-|', values);
      const e1subs = '       ^-!                        ';
      const expected = '     --(a|)                     ';

      const source = e1.pipe(
        groupBy((val) => val.toLowerCase().trim()),
        take(1),
        mergeMap((group) => group.pipe(take(1)))
      );

      expectObservable(source).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not break unsubscription chain when unsubscribed explicitly', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const values = {
        a: '  foo',
        b: ' FoO ',
        c: 'baR  ',
        d: 'foO ',
        e: ' Baz   ',
        f: '  qux ',
        g: '   bar',
        h: ' BAR  ',
        i: 'FOO ',
        j: 'baz  ',
        k: ' bAZ ',
        l: '    fOo    ',
      };
      const e1 = hot('-1--2--^-a-b-c-d-e-f-g-h-i-j-k-l-|', values);
      const e1subs = '       ^----------!               ';
      const expected = '     --w---x---y-               ';
      const unsub = '        -----------!               ';
      const expectedValues = { w: 'foo', x: 'bar', y: 'baz' };

      const source = e1.pipe(
        mergeMap((x: string) => of(x)),
        groupBy((x: string) => x.toLowerCase().trim()),
        mergeMap((group: any) => of(group.key))
      );

      expectObservable(source, unsub).toBe(expected, expectedValues);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should group values with a keySelector which eventually throws', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const values = {
        a: '  foo',
        b: ' FoO ',
        c: 'baR  ',
        d: 'foO ',
        e: ' Baz   ',
        f: '  qux ',
        g: '   bar',
        h: ' BAR  ',
        i: 'FOO ',
        j: 'baz  ',
        k: ' bAZ ',
        l: '    fOo    ',
      };
      const e1 = hot('-1--2--^-a-b-c-d-e-f-g-h-i-j-k-l-|', values);
      const e1subs = '       ^-------------------!';
      const expected = '     --w---x---y-z-------#';
      const w = cold('         a-b---d---------i-#', values);
      const x = cold('             c-------g-h---#', values);
      const y = cold('                 e---------#', values);
      const z = cold('                   f-------#', values);
      const expectedValues = { w: w, x: x, y: y, z: z };

      let invoked = 0;
      const source = e1.pipe(
        groupBy((val: string) => {
          invoked++;
          if (invoked === 10) {
            throw 'error';
          }
          return val.toLowerCase().trim();
        })
      );

      expectObservable(source).toBe(expected, expectedValues);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should group values with a keySelector and elementSelector, but elementSelector throws', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const values = {
        a: '  foo',
        b: ' FoO ',
        c: 'baR  ',
        d: 'foO ',
        e: ' Baz   ',
        f: '  qux ',
        g: '   bar',
        h: ' BAR  ',
        i: 'FOO ',
        j: 'baz  ',
        k: ' bAZ ',
        l: '    fOo    ',
      };
      const reversedValues = mapObject(values, reverseString);
      const e1 = hot('-1--2--^-a-b-c-d-e-f-g-h-i-j-k-l-|', values);
      const e1subs = '       ^-------------------!';
      const expected = '     --w---x---y-z-------#';
      const w = cold('         a-b---d---------i-#', reversedValues);
      const x = cold('             c-------g-h---#', reversedValues);
      const y = cold('                 e---------#', reversedValues);
      const z = cold('                   f-------#', reversedValues);
      const expectedValues = { w: w, x: x, y: y, z: z };

      let invoked = 0;
      const source = e1.pipe(
        groupBy(
          (val: string) => val.toLowerCase().trim(),
          (val: string) => {
            invoked++;
            if (invoked === 10) {
              throw 'error';
            }
            return reverseString(val);
          }
        )
      );

      expectObservable(source).toBe(expected, expectedValues);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should unsubscribe inner subscriptions when the result unsubscribes', () => {
    testScheduler.run(({ cold, hot, expectObservable }) => {
      const values = {
        a: '  foo',
        b: ' FoO ',
        c: 'baR  ',
        d: 'foO ',
        e: ' Baz   ',
        f: '  qux ',
        g: '   bar',
        h: ' BAR  ',
        i: 'FOO ',
        j: 'baz  ',
        k: ' bAZ ',
        l: '    fOo    ',
      };
      const e1 = hot('-1--2--^-a-b-c-d-e-f-g-h-i-j-k-l-|', values);
      const unsub = '        ----------!                ';
      const expected = '     --w---x----                ';
      const w = cold('         a-b---d--                ', values);
      const x = cold('             c----                ', values);
      const expectedValues = { w: w, x: x };

      const source = e1.pipe(groupBy((val: string) => val.toLowerCase().trim()));

      expectObservable(source, unsub).toBe(expected, expectedValues);
    });
  });

  it('should allow an inner to be unsubscribed early but other inners continue', () => {
    testScheduler.run(({ hot, expectObservable }) => {
      const values = {
        a: '  foo',
        b: ' FoO ',
        c: 'baR  ',
        d: 'foO ',
        e: ' Baz   ',
        f: '  qux ',
        g: '   bar',
        h: ' BAR  ',
        i: 'FOO ',
        j: 'baz  ',
        k: ' bAZ ',
        l: '    fOo    ',
      };
      const e1 = hot('-1--2--^-a-b-c-d-e-f-g-h-i-j-k-l-|', values);
      const expected = '     --w---x---y-z-------------|';
      const w = '            --a-b---d-                 ';
      const unsubw = '       ---------!                 ';
      const x = '            ------c-------g-h---------|';
      const y = '            ----------e---------j-k---|';
      const z = '            ------------f-------------|';

      const expectedGroups = {
        w: TestScheduler.parseMarbles(w, values, undefined, undefined, true),
        x: TestScheduler.parseMarbles(x, values, undefined, undefined, true),
        y: TestScheduler.parseMarbles(y, values, undefined, undefined, true),
        z: TestScheduler.parseMarbles(z, values, undefined, undefined, true),
      };

      const fooUnsubscriptionFrame = TestScheduler.parseMarblesAsSubscriptions(unsubw, true).unsubscribedFrame;

      const source = e1.pipe(
        groupBy((val) => val.toLowerCase().trim()),
        map((group) => {
          const arr: any[] = [];

          const subscription = group.pipe(phonyMarbelize(testScheduler)).subscribe((value) => {
            arr.push(value);
          });

          if (group.key === 'foo') {
            testScheduler.schedule(() => {
              subscription.unsubscribe();
            }, fooUnsubscriptionFrame - testScheduler.frame);
          }
          return arr;
        })
      );

      expectObservable(source).toBe(expected, expectedGroups);
    });
  });

  it('should allow inners to be unsubscribed early at different times', () => {
    testScheduler.run(({ hot, expectObservable }) => {
      const values = {
        a: '  foo',
        b: ' FoO ',
        c: 'baR  ',
        d: 'foO ',
        e: ' Baz   ',
        f: '  qux ',
        g: '   bar',
        h: ' BAR  ',
        i: 'FOO ',
        j: 'baz  ',
        k: ' bAZ ',
        l: '    fOo    ',
      };
      const e1 = hot('-1--2--^-a-b-c-d-e-f-g-h-i-j-k-l-|', values);
      const expected = '     --w---x---y-z-------------|';
      const w = '            --a-b---d-                 ';
      const unsubw = '       ---------!                 ';
      const x = '            ------c------              ';
      const unsubx = '       ------------!              ';
      const y = '            ----------e------          ';
      const unsuby = '       ----------------!          ';
      const z = '            ------------f-------       ';
      const unsubz = '       -------------------!       ';

      const expectedGroups = {
        w: TestScheduler.parseMarbles(w, values, undefined, undefined, true),
        x: TestScheduler.parseMarbles(x, values, undefined, undefined, true),
        y: TestScheduler.parseMarbles(y, values, undefined, undefined, true),
        z: TestScheduler.parseMarbles(z, values, undefined, undefined, true),
      };

      const unsubscriptionFrames: Record<string, number> = {
        foo: TestScheduler.parseMarblesAsSubscriptions(unsubw, true).unsubscribedFrame,
        bar: TestScheduler.parseMarblesAsSubscriptions(unsubx, true).unsubscribedFrame,
        baz: TestScheduler.parseMarblesAsSubscriptions(unsuby, true).unsubscribedFrame,
        qux: TestScheduler.parseMarblesAsSubscriptions(unsubz, true).unsubscribedFrame,
      };

      const source = e1.pipe(
        groupBy((val: string) => val.toLowerCase().trim()),
        map((group: any) => {
          const arr: any[] = [];

          const subscription = group.pipe(phonyMarbelize(testScheduler)).subscribe((value: any) => {
            arr.push(value);
          });

          testScheduler.schedule(() => {
            subscription.unsubscribe();
          }, unsubscriptionFrames[group.key] - testScheduler.frame);
          return arr;
        })
      );

      expectObservable(source).toBe(expected, expectedGroups);
    });
  });

  it('should allow subscribing late to an inner Observable, outer completes', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions, time }) => {
      const values = {
        a: '  foo',
        b: ' FoO ',
        d: 'foO ',
        i: 'FOO ',
        l: '    fOo    ',
      };
      const e1 = hot('          --a-b---d---------i-----l-|  ', values);
      const subs = '            ^-------------------------!  ';
      const subDuration = time('--------------------------|  ');
      const expected = '        ----------------------------|';

      e1.pipe(groupBy((val: string) => val.toLowerCase().trim())).subscribe((group: any) => {
        testScheduler.schedule(() => {
          expectObservable(group).toBe(expected);
        }, subDuration);
      });
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });

  it('should allow subscribing late to an inner Observable, outer throws', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions, time }) => {
      const values = {
        a: '  foo',
        b: ' FoO ',
        d: 'foO ',
        i: 'FOO ',
        l: '    fOo    ',
      };
      const e1 = hot('           --a-b---d---------i-----l-#', values);
      const subs = '             ^-------------------------! ';
      const subsDuration = time('--------------------------| ');
      const expected = '         ----------------------------#';

      e1.pipe(groupBy((val: string) => val.toLowerCase().trim())).subscribe({
        next: (group: any) => {
          testScheduler.schedule(() => {
            expectObservable(group).toBe(expected);
          }, subsDuration);
        },
        error: () => {
          //noop
        },
      });
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });

  it('should allow subscribing late to inner, unsubscribe outer early', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions, time }) => {
      const values = {
        a: '  foo',
        b: ' FoO ',
        d: 'foO ',
        i: 'FOO ',
        l: '    fOo    ',
      };
      const e1 = hot('           --a-b---d---------i-----l-#', values);
      const unsub = '            ------------!              ';
      const e1subs = '           ^-----------!              ';
      const subsDuration = time('------------|              ');
      const expectedOuter = '    --w----------              ';
      const expectedInner = '    -------------              ';
      const outerValues = { w: 'foo' };

      const source = e1.pipe(
        groupBy((val: string) => val.toLowerCase().trim()),
        tap((group: any) => {
          testScheduler.schedule(() => {
            expectObservable(group).toBe(expectedInner);
          }, subsDuration);
        }),
        map((group: any) => {
          return group.key;
        })
      );

      expectObservable(source, unsub).toBe(expectedOuter, outerValues);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should allow using a keySelector, elementSelector, and durationSelector', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const values = {
        a: '  foo',
        b: ' FoO ',
        c: 'baR  ',
        d: 'foO ',
        e: ' Baz   ',
        f: '  qux ',
        g: '   bar',
        h: ' BAR  ',
        i: 'FOO ',
        j: 'baz  ',
        k: ' bAZ ',
        l: '    fOo    ',
      };
      const reversedValues = mapObject(values, reverseString);
      const e1 = hot('-1--2--^-a-b-c-d-e-f-g-h-i-j-k-l-|', values);
      const e1subs = '       ^-------------------------!';
      const expected = '     --v---w---x-y-----z-------|';
      const v = cold('       a-b---(d|)                 ', reversedValues);
      const w = cold('             c-------g-(h|)       ', reversedValues);
      const x = cold('                  e---------j-(k|)', reversedValues);
      const y = cold('                   f-------------|', reversedValues);
      const z = cold('                         i-----l-|', reversedValues);
      const expectedValues = { v: v, w: w, x: x, y: y, z: z };

      const source = e1.pipe(
        groupBy(
          (val: string) => val.toLowerCase().trim(),
          (val: string) => reverseString(val),
          (group: any) => group.pipe(skip(2))
        )
      );

      expectObservable(source).toBe(expected, expectedValues);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should allow using a keySelector, elementSelector, and durationSelector that throws', () => {
    testScheduler.run(({ cold, hot, expectObservable }) => {
      const values = {
        a: '  foo',
        b: ' FoO ',
        c: 'baR  ',
        d: 'foO ',
        e: ' Baz   ',
        f: '  qux ',
        g: '   bar',
        h: ' BAR  ',
        i: 'FOO ',
        j: 'baz  ',
        k: ' bAZ ',
        l: '    fOo    ',
      };
      const reversedValues = mapObject(values, reverseString);
      const e1 = hot('-1--2--^-a-b-c-d-e-f-g-h-i-j-k-l-|', values);
      const expected = '     --v---w---x-y-----z-------|';
      const v = cold('         a-b---(d#)               ', reversedValues);
      const w = cold('             c-------g-(h#)       ', reversedValues);
      const x = cold('                 e---------j-(k#) ', reversedValues);
      const y = cold('                   f-------------|', reversedValues);
      const z = cold('                         i-----l-|', reversedValues);
      const expectedValues = { v: v, w: w, x: x, y: y, z: z };

      const source = e1.pipe(
        groupBy(
          (val: string) => val.toLowerCase().trim(),
          (val: string) => reverseString(val),
          (group: any) =>
            group.pipe(
              skip(2),
              map(() => {
                throw 'error';
              })
            )
        )
      );
      expectObservable(source).toBe(expected, expectedValues);
    });
  });

  it('should allow using a keySelector and a durationSelector, outer throws', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const values = {
        a: '  foo',
        b: ' FoO ',
        c: 'baR  ',
        d: 'foO ',
        e: ' Baz   ',
        f: '  qux ',
        g: '   bar',
        h: ' BAR  ',
        i: 'FOO ',
        j: 'baz  ',
        k: ' bAZ ',
        l: '    fOo    ',
      };
      const e1 = hot('-1--2--^-a-b-c-d-e-f-g-h-i-j-k-l-#', values);
      const e1subs = '       ^-------------------------!';
      const expected = '     --v---w---x-y-----z-------#';
      const v = cold('         a-b---(d|)               ', values);
      const w = cold('             c-------g-(h|)       ', values);
      const x = cold('                 e---------j-(k|) ', values);
      const y = cold('                   f-------------#', values);
      const z = cold('                         i-----l-#', values);
      const expectedValues = { v: v, w: w, x: x, y: y, z: z };

      const source = e1.pipe(
        groupBy((val) => val.toLowerCase().trim(), {
          duration: (group) => group.pipe(skip(2)),
        })
      );

      expectObservable(source).toBe(expected, expectedValues);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should allow using a durationSelector, and unsub from outer and inner at the same time', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const values = {
        a: '  foo',
        b: ' FoO ',
        c: 'baR  ',
        d: 'foO ',
        e: ' Baz   ',
        f: '  qux ',
        g: '   bar',
        h: ' BAR  ',
        i: 'FOO ',
        j: 'baz  ',
        k: ' bAZ ',
        l: '    fOo    ',
      };
      const e1 = hot('-1--2--^-a-b-c-d-e-f-g-h-i-j-k-l-|', values);
      const unsub = '        -----------!               ';
      const expected = '     --v---w---x-               ';
      const v = cold('         a-b---(d|)               ', values);
      const w = cold('             c-----               ', values);
      const x = cold('                 e-               ', values);
      const expectedValues = { v: v, w: w, x: x };

      const source = e1.pipe(
        groupBy((val) => val.toLowerCase().trim(), {
          duration: (group) => group.pipe(skip(2)),
        })
      );

      expectObservable(source, unsub).toBe(expected, expectedValues);
    });
  });

  it('should allow using a durationSelector, outer and all inners unsubscribed early', () => {
    testScheduler.run(({ hot, expectObservable }) => {
      const values = {
        a: '  foo',
        b: ' FoO ',
        c: 'baR  ',
        d: 'foO ',
        e: ' Baz   ',
        f: '  qux ',
        g: '   bar',
        h: ' BAR  ',
        i: 'FOO ',
        j: 'baz  ',
        k: ' bAZ ',
        l: '    fOo    ',
      };
      const e1 = hot('-1--2--^-a-b-c-d-e-f-g-h-i-j-k-l-|', values);
      const unsub = '        -----------!';
      const expected = '     --v---w---x-';
      const v = '            --a-b---(d|)';
      const w = '            ------c-----';
      const x = '            ----------e-';

      const expectedGroups = {
        v: TestScheduler.parseMarbles(v, values, undefined, undefined, true),
        w: TestScheduler.parseMarbles(w, values, undefined, undefined, true),
        x: TestScheduler.parseMarbles(x, values, undefined, undefined, true),
      };

      const unsubscriptionFrame = TestScheduler.parseMarblesAsSubscriptions(unsub, true).unsubscribedFrame;

      const source = e1.pipe(
        groupBy((val) => val.toLowerCase().trim(), {
          duration: (group) => group.pipe(skip(2)),
        }),
        map((group) => {
          const arr: any[] = [];

          const subscription = group.pipe(phonyMarbelize(testScheduler)).subscribe((value) => {
            arr.push(value);
          });

          testScheduler.schedule(() => {
            subscription.unsubscribe();
          }, unsubscriptionFrame - testScheduler.frame);
          return arr;
        })
      );

      expectObservable(source, unsub).toBe(expected, expectedGroups);
    });
  });

  it('should dispose a durationSelector after closing the group', () => {
    testScheduler.run(({ cold, hot, expectSubscriptions }) => {
      const obs = hot(' -0-1--------2-| ');
      const sub = '     ^--------------!';
      // prettier-ignore
      const unsubs = [
        '              -^--!',
        '              ---^--!',
        '              ------------^-!',
      ];
      const dur = '     ---s';
      const durations = [cold(dur), cold(dur), cold(dur)];

      const unsubscribedFrame = TestScheduler.parseMarblesAsSubscriptions(sub, true).unsubscribedFrame;

      obs
        .pipe(
          groupBy((val) => val, {
            duration: (group) => durations[Number(group.key)],
          })
        )
        .subscribe();

      testScheduler.schedule(() => {
        durations.forEach((d, i) => {
          expectSubscriptions(d.subscriptions).toBe(unsubs[i]);
        });
      }, unsubscribedFrame);
    });
  });

  it('should allow using a durationSelector, but keySelector throws', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const values = {
        a: '  foo',
        b: ' FoO ',
        c: 'baR  ',
        d: 'foO ',
        e: ' Baz   ',
        f: '  qux ',
        g: '   bar',
        h: ' BAR  ',
        i: 'FOO ',
        j: 'baz  ',
        k: ' bAZ ',
        l: '    fOo    ',
      };
      const e1 = hot('-1--2--^-a-b-c-d-e-f-g-h-i-j-k-l-|', values);
      const e1subs = '       ^-------------------!      ';
      const expected = '     --v---w---x-y-----z-#      ';
      const v = cold('         a-b---(d|)               ', values);
      const w = cold('             c-------g-(h|)       ', values);
      const x = cold('                 e---------#      ', values);
      const y = cold('                   f-------#      ', values);
      const z = cold('                         i-#      ', values);
      const expectedValues = { v: v, w: w, x: x, y: y, z: z };

      let invoked = 0;
      const source = e1.pipe(
        groupBy(
          (val: any) => {
            invoked++;
            if (invoked === 10) {
              throw 'error';
            }
            return val.toLowerCase().trim();
          },
          (val: string) => val,
          (group: any) => group.pipe(skip(2))
        )
      );

      expectObservable(source).toBe(expected, expectedValues);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should allow using a durationSelector, but elementSelector throws', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const values = {
        a: '  foo',
        b: ' FoO ',
        c: 'baR  ',
        d: 'foO ',
        e: ' Baz   ',
        f: '  qux ',
        g: '   bar',
        h: ' BAR  ',
        i: 'FOO ',
        j: 'baz  ',
        k: ' bAZ ',
        l: '    fOo    ',
      };
      const e1 = hot('-1--2--^-a-b-c-d-e-f-g-h-i-j-k-l-|', values);
      const e1subs = '       ^-------------------!      ';
      const expected = '     --v---w---x-y-----z-#      ';
      const v = cold('         a-b---(d|)               ', values);
      const w = cold('             c-------g-(h|)       ', values);
      const x = cold('                 e---------#      ', values);
      const y = cold('                   f-------#      ', values);
      const z = cold('                         i-#      ', values);
      const expectedValues = { v: v, w: w, x: x, y: y, z: z };

      let invoked = 0;
      const source = e1.pipe(
        groupBy(
          (val: string) => val.toLowerCase().trim(),
          (val: string) => {
            invoked++;
            if (invoked === 10) {
              throw 'error';
            }
            return val;
          },
          (group: any) => group.pipe(skip(2))
        )
      );

      expectObservable(source).toBe(expected, expectedValues);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should allow using a durationSelector which eventually throws', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const values = {
        a: '  foo',
        b: ' FoO ',
        c: 'baR  ',
        d: 'foO ',
        e: ' Baz   ',
        f: '  qux ',
        g: '   bar',
        h: ' BAR  ',
        i: 'FOO ',
        j: 'baz  ',
        k: ' bAZ ',
        l: '    fOo    ',
      };
      const e1 = hot('-1--2--^-a-b-c-d-e-f-g-h-i-j-k-l-|', values);
      const e1subs = '       ^-----------!              ';
      const expected = '  --v---w---x-(y#)              ';
      const v = cold('         a-b---(d|)               ', values);
      const w = cold('             c-----#              ', values);
      const x = cold('                 e-#              ', values);
      const y = cold('                   #              ', values);
      const expectedValues = { v: v, w: w, x: x, y: y };

      let invoked = 0;
      const source = e1.pipe(
        groupBy(
          (val: string) => val.toLowerCase().trim(),
          (val: string) => val,
          (group: any) => {
            invoked++;
            if (invoked === 4) {
              throw 'error';
            }
            return group.pipe(skip(2));
          }
        )
      );

      expectObservable(source).toBe(expected, expectedValues);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should allow an inner to be unsubscribed early but other inners continue, with durationSelector', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const values = {
        a: '  foo',
        b: ' FoO ',
        c: 'baR  ',
        d: 'foO ',
        e: ' Baz   ',
        f: '  qux ',
        g: '   bar',
        h: ' BAR  ',
        i: 'FOO ',
        j: 'baz  ',
        k: ' bAZ ',
        l: '    fOo    ',
      };
      const reversedValues = mapObject(values, reverseString);
      const e1 = hot('-1--2--^-a-b-c-d-e-f-g-h-i-j-k-l-|', values);
      const e1subs = '       ^-------------------------!';
      const expected = '     --v---w---x-y-----z-------|';
      const v = '            --a-b---                   ';
      const unsubv = '       -------!                   ';
      const w = '            ------c-------g-(h|)       ';
      const x = '             ----------e---------j-(k|)';
      const y = '            ------------f-------------|';
      const z = '            ------------------i-----l-|';

      const expectedGroups = {
        v: TestScheduler.parseMarbles(v, reversedValues, undefined, undefined, true),
        w: TestScheduler.parseMarbles(w, reversedValues, undefined, undefined, true),
        x: TestScheduler.parseMarbles(x, reversedValues, undefined, undefined, true),
        y: TestScheduler.parseMarbles(y, reversedValues, undefined, undefined, true),
        z: TestScheduler.parseMarbles(z, reversedValues, undefined, undefined, true),
      };

      const fooUnsubscriptionFrame = TestScheduler.parseMarblesAsSubscriptions(unsubv, true).unsubscribedFrame;

      const source = e1.pipe(
        groupBy(
          (val: string) => val.toLowerCase().trim(),
          (val: string) => reverseString(val),
          (group: any) => group.pipe(skip(2))
        ),
        map((group: any, index: number) => {
          const arr: any[] = [];

          const subscription = group.pipe(phonyMarbelize(testScheduler)).subscribe((value: any) => {
            arr.push(value);
          });

          if (group.key === 'foo' && index === 0) {
            testScheduler.schedule(() => {
              subscription.unsubscribe();
            }, fooUnsubscriptionFrame - testScheduler.frame);
          }
          return arr;
        })
      );

      expectObservable(source).toBe(expected, expectedGroups);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should allow inners to be unsubscribed early at different times, with durationSelector', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const values = {
        a: '  foo',
        b: ' FoO ',
        c: 'baR  ',
        d: 'foO ',
        e: ' Baz   ',
        f: '  qux ',
        g: '   bar',
        h: ' BAR  ',
        i: 'FOO ',
        j: 'baz  ',
        k: ' bAZ ',
        l: '    fOo    ',
      };
      const e1 = hot('-1--2--^-a-b-c-d-e-f-g-h-i-j-k-l-|', values);
      const e1subs = '       ^-------------------------!';
      const expected = '     --v---w---x-y-----z-------|';
      const v = '            --a-b---                   ';
      const unsubv = '       -------!                   ';
      const w = '            ------c---                 ';
      const unsubw = '       ---------!                 ';
      const x = '            ----------e---------j-     ';
      const unsubx = '       ---------------------!     ';
      const y = '            ------------f----          ';
      const unsuby = '       ----------------!          ';
      const z = '            ------------------i----    ';
      const unsubz = '       ----------------------!    ';

      const expectedGroups = {
        v: TestScheduler.parseMarbles(v, values, undefined, undefined, true),
        w: TestScheduler.parseMarbles(w, values, undefined, undefined, true),
        x: TestScheduler.parseMarbles(x, values, undefined, undefined, true),
        y: TestScheduler.parseMarbles(y, values, undefined, undefined, true),
        z: TestScheduler.parseMarbles(z, values, undefined, undefined, true),
      };

      const unsubscriptionFrames: Record<string, number> = {
        foo: TestScheduler.parseMarblesAsSubscriptions(unsubv, true).unsubscribedFrame,
        bar: TestScheduler.parseMarblesAsSubscriptions(unsubw, true).unsubscribedFrame,
        baz: TestScheduler.parseMarblesAsSubscriptions(unsubx, true).unsubscribedFrame,
        qux: TestScheduler.parseMarblesAsSubscriptions(unsuby, true).unsubscribedFrame,
        foo2: TestScheduler.parseMarblesAsSubscriptions(unsubz, true).unsubscribedFrame,
      };
      const hasUnsubscribed: Record<string, boolean> = {};

      const source = e1.pipe(
        groupBy(
          (val: string) => val.toLowerCase().trim(),
          (val: string) => val,
          (group: any) => group.pipe(skip(2))
        ),
        map((group: any) => {
          const arr: any[] = [];

          const subscription = group.pipe(phonyMarbelize(testScheduler)).subscribe((value: any) => {
            arr.push(value);
          });

          const unsubscriptionFrame = hasUnsubscribed[group.key] ? unsubscriptionFrames[group.key + '2'] : unsubscriptionFrames[group.key];
          testScheduler.schedule(() => {
            subscription.unsubscribe();
            hasUnsubscribed[group.key] = true;
          }, unsubscriptionFrame - testScheduler.frame);
          return arr;
        })
      );

      expectObservable(source).toBe(expected, expectedGroups);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should return inners that when subscribed late exhibit hot behavior', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const values = {
        a: '  foo',
        b: ' FoO ',
        c: 'baR  ',
        d: 'foO ',
        e: ' Baz   ',
        f: '  qux ',
        g: '   bar',
        h: ' BAR  ',
        i: 'FOO ',
        j: 'baz  ',
        k: ' bAZ ',
        l: '    fOo    ',
      };
      const e1 = hot('-1--2--^-a-b-c-d-e-f-g-h-i-j-k-l-|    ', values);
      const e1subs = '       ^-------------------------!    ';
      const expected = '     --v---w---x-y-------------|    ';
      const subv = '         ---^                           '; // foo
      const v = '            ----b---d---------i-----l-|    '; // foo
      const subw = '         ---------^                     '; // bar
      const w = '            --------------g-h---------|    '; // bar
      const subx = '         -------------------^           '; // baz
      const x = '            --------------------j-k---|    '; // baz
      const suby = '         ------------------------------^'; // qux
      const y = '            ------------------------------|'; // qux

      const expectedGroups = {
        v: TestScheduler.parseMarbles(v, values, undefined, undefined, true),
        w: TestScheduler.parseMarbles(w, values, undefined, undefined, true),
        x: TestScheduler.parseMarbles(x, values, undefined, undefined, true),
        y: TestScheduler.parseMarbles(y, values, undefined, undefined, true),
      };

      const subscriptionFrames: Record<string, number> = {
        foo: TestScheduler.parseMarblesAsSubscriptions(subv, true).subscribedFrame,
        bar: TestScheduler.parseMarblesAsSubscriptions(subw, true).subscribedFrame,
        baz: TestScheduler.parseMarblesAsSubscriptions(subx, true).subscribedFrame,
        qux: TestScheduler.parseMarblesAsSubscriptions(suby, true).subscribedFrame,
      };

      const result = e1.pipe(
        groupBy(
          (val: string) => val.toLowerCase().trim(),
          (val: string) => val
        ),
        map((group: any) => {
          const innerNotifications: any[] = [];
          const subscriptionFrame = subscriptionFrames[group.key];

          testScheduler.schedule(() => {
            group.pipe(phonyMarbelize(testScheduler)).subscribe((value: any) => {
              innerNotifications.push(value);
            });
          }, subscriptionFrame - testScheduler.frame);

          return innerNotifications;
        })
      );

      expectObservable(result).toBe(expected, expectedGroups);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should return inner group that when subscribed late emits complete()', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const values = {
        a: '  foo',
        b: ' FoO ',
        d: 'foO ',
        i: 'FOO ',
        l: '    fOo    ',
      };
      const e1 = hot('-1--2--^-a-b---d---------i-----l-|      ', values);
      const e1subs = '       ^-------------------------!      ';
      const expected = '     --g-----------------------|      ';
      const innerSub = '     --------------------------------^';
      const g = '            --------------------------------|';

      const expectedGroups = {
        g: TestScheduler.parseMarbles(g, values, undefined, undefined, true),
      };

      const innerSubscriptionFrame = TestScheduler.parseMarblesAsSubscriptions(innerSub, true).subscribedFrame;

      const source = e1.pipe(
        groupBy(
          (val: string) => val.toLowerCase().trim(),
          (val: string) => val,
          (group: any) => group.pipe(skip(7))
        ),
        map((group: any) => {
          const arr: any[] = [];

          testScheduler.schedule(() => {
            group.pipe(phonyMarbelize(testScheduler)).subscribe((value: any) => {
              arr.push(value);
            });
          }, innerSubscriptionFrame - testScheduler.frame);

          return arr;
        })
      );

      expectObservable(source).toBe(expected, expectedGroups);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it.skip('should return inner group that when subscribed late emits error()', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const values = {
        a: '  foo',
        b: ' FoO ',
        d: 'foO ',
        i: 'FOO ',
        l: '    fOo    ',
      };
      const e1 = hot('-1--2--^-a-b---d---------i-----l-#      ', values);
      const e1subs = '       ^-------------------------!      ';
      const expected = '     --g-----------------------#      ';
      const innerSub = '     --------------------------------^';
      const g = '            --------------------------------#';

      const expectedGroups = {
        g: TestScheduler.parseMarbles(g, values, undefined, undefined, true),
      };

      const innerSubscriptionFrame = TestScheduler.parseMarblesAsSubscriptions(innerSub, true).subscribedFrame;

      const source = e1.pipe(
        groupBy(
          (val: string) => val.toLowerCase().trim(),
          (val: string) => val,
          (group: any) => group.pipe(skip(7))
        ),
        map((group: any) => {
          const arr: any[] = [];

          testScheduler.schedule(() => {
            group.pipe(phonyMarbelize(testScheduler)).subscribe((value: any) => {
              arr.push(value);
            });
          }, innerSubscriptionFrame - testScheduler.frame);

          return arr;
        })
      );

      expectObservable(source).toBe(expected, expectedGroups);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not error for late subscribed inners if outer is unsubscribed before inners are subscribed', () => {
    testScheduler.run(({ hot, expectObservable }) => {
      const source = hot('-----^----a----b-----a------b----a----b---#');
      // Unsubscribe before the error happens.
      const unsub = '          -------------------!                  ';
      // Used to hold two subjects we're going to use to subscribe to our groups
      const subjects: Record<string, Subject<string>> = {
        a: new Subject(),
        b: new Subject(),
      };
      const result = source.pipe(
        groupBy((char) => char),
        tap({
          // The real test is here, schedule each group to be subscribed to
          // long after the source errors and long after the unsubscription happens.
          next: (group) => {
            testScheduler.schedule(() => group.subscribe(subjects[group.key]), 1000);
          },
        }),
        // We don't are about what the outer is emitting
        ignoreElements()
      );
      // Just to get the test going.
      expectObservable(result, unsub).toBe('-');
      // Our two groups should error immediately upon subscription.
      expectObservable(subjects.a).toBe('-');
      expectObservable(subjects.b).toBe('-');
    });
  });

  it('should stop listening to a synchronous observable when unsubscribed', () => {
    const sideEffects: number[] = [];
    const synchronousObservable = new Observable<number>((subscriber) => {
      // This will check to see if the subscriber was closed on each loop
      // when the unsubscribe hits (from the `take`), it should be closed
      for (let i = 0; !subscriber.closed && i < 10; i++) {
        sideEffects.push(i);
        subscriber.next(i);
      }
    });

    synchronousObservable
      .pipe(
        groupBy((value) => value),
        take(3)
      )
      .subscribe(() => {
        /* noop */
      });

    expect(sideEffects).to.deep.equal([0, 1, 2]);
  });
});

/**
 * TODO: A helper operator to deal with legacy tests above that could probably be written a different way
 */
function phonyMarbelize<T>(testScheduler: TestScheduler) {
  return (source: Observable<T>) =>
    source.pipe(
      materialize(),
      map((notification) => {
        // Because we're hacking some weird inner-observable marbles here, we need
        // to make sure this is all the same shape as it would be from the TestScheduler
        // assertions
        return {
          frame: testScheduler.frame,
          notification: createNotification(
            notification.kind,
            (notification as NextNotification<T>).value,
            (notification as ErrorNotification).error
          ),
        };
      })
    );
}
