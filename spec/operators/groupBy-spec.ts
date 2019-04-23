import { expect } from 'chai';
import { groupBy, delay, tap, map, take, mergeMap, materialize, skip } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { ReplaySubject, of, GroupedObservable, Observable, Operator, Observer } from 'rxjs';
import { hot, cold, expectObservable, expectSubscriptions } from '../helpers/marble-testing';

declare function asDiagram(arg: string): Function;

declare const rxTestScheduler: TestScheduler;

/** @test {groupBy} */
describe('groupBy operator', () => {
  asDiagram('groupBy(i => i % 2)')('should group numbers by odd/even', () => {
    const e1 =   hot('--1---2---3---4---5---|');
    const expected = '--x---y---------------|';
    const x = cold(    '1-------3-------5---|');
    const y = cold(        '2-------4-------|');
    const expectedValues = { x: x, y: y };

    const source = e1
      .pipe(groupBy((val: string) => parseInt(val) % 2));
    expectObservable(source).toBe(expected, expectedValues);
  });

  function reverseString(str: string) {
    return str.split('').reverse().join('');
  }

  function mapObject(obj: object, fn: Function) {
    const out = {};
    for (const p in obj) {
      if (obj.hasOwnProperty(p)) {
        out[p] = fn(obj[p]);
      }
    }
    return out;
  }

  it('should group values', (done: MochaDone) => {
    const expectedGroups = [
      { key: 1, values: [1, 3] },
      { key: 0, values: [2] }
    ];

    of(1, 2, 3).pipe(
      groupBy((x: number) => x % 2)
    ).subscribe((g: any) => {
        const expectedGroup = expectedGroups.shift();
        expect(g.key).to.equal(expectedGroup.key);

        g.subscribe((x: any) => {
          expect(x).to.deep.equal(expectedGroup.values.shift());
        });
      }, null, done);
  });

  it('should group values with an element selector', (done: MochaDone) => {
    const expectedGroups = [
      { key: 1, values: ['1!', '3!'] },
      { key: 0, values: ['2!'] }
    ];

    of(1, 2, 3).pipe(
      groupBy((x: number) => x % 2, (x: number) => x + '!')
    ).subscribe((g: any) => {
        const expectedGroup = expectedGroups.shift();
        expect(g.key).to.equal(expectedGroup.key);

        g.subscribe((x: any) => {
          expect(x).to.deep.equal(expectedGroup.values.shift());
        });
      }, null, done);
  });

  it('should group values with a duration selector', () => {
    const expectedGroups = [
      { key: 1, values: [1, 3] },
      { key: 0, values: [2, 4] },
      { key: 1, values: [5] },
      { key: 0, values: [6] }
    ];

    const resultingGroups: { key: number, values: number [] }[] = [];

    of(1, 2, 3, 4, 5, 6).pipe(
      groupBy(
        (x: number) => x % 2,
        (x: number) => x,
        (g: any) => g.pipe(skip(1)))
      ).subscribe((g: any) => {
        let group = { key: g.key, values: [] as number[] };

        g.subscribe((x: any) => {
          group.values.push(x);
        });

        resultingGroups.push(group);
      });

      expect(resultingGroups).to.deep.equal(expectedGroups);
  });

  it('should group values with a subject selector', (done: MochaDone) => {
    const expectedGroups = [
      { key: 1, values: [3] },
      { key: 0, values: [2] }
    ];

    of(1, 2, 3).pipe(
      groupBy((x: number) => x % 2, null, null, () => new ReplaySubject(1)),
      // Ensure each inner group reaches the destination after the first event
      // has been next'd to the group
      delay(5)
    ).subscribe((g: any) => {
        const expectedGroup = expectedGroups.shift();
        expect(g.key).to.equal(expectedGroup.key);

        g.subscribe((x: any) => {
          expect(x).to.deep.equal(expectedGroup.values.shift());
        });
      }, null, done);
  });

  it('should handle an empty Observable', () => {
    const e1 =  cold('|');
    const e1subs =   '(^!)';
    const expected = '|';

    const source = e1
      .pipe(groupBy((val: string) => val.toLowerCase().trim()));

    expectObservable(source).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle a never Observable', () => {
    const e1 =  cold('-');
    const e1subs =   '^';
    const expected = '-';

    const source = e1
      .pipe(groupBy((val: string) => val.toLowerCase().trim()));

    expectObservable(source).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle a just-throw Observable', () => {
    const e1 =  cold('#');
    const e1subs =   '(^!)';
    const expected = '#';

    const source = e1
      .pipe(groupBy((val: string) => val.toLowerCase().trim()));

    expectObservable(source).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle an Observable with a single value', () => {
    const values = { a: '  foo' };
    const e1 =   hot('^--a--|', values);
    const e1subs =   '^     !';
    const expected = '---g--|';
    const g = cold(     'a--|', values);
    const expectedValues = { g: g };

    const source = e1
      .pipe(groupBy((val: string) => val.toLowerCase().trim()));

    expectObservable(source).toBe(expected, expectedValues);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should group values with a keySelector', () => {
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
      l: '    fOo    '
    };
    const e1 = hot('-1--2--^-a-b-c-d-e-f-g-h-i-j-k-l-|', values);
    const e1subs =        '^                         !';
    const expected =      '--w---x---y-z-------------|';
    const w = cold(         'a-b---d---------i-----l-|', values);
    const x = cold(             'c-------g-h---------|', values);
    const y = cold(                 'e---------j-k---|', values);
    const z = cold(                   'f-------------|', values);
    const expectedValues = { w: w, x: x, y: y, z: z };

    const source = e1
      .pipe(groupBy((val: string) => val.toLowerCase().trim()));

    expectObservable(source).toBe(expected, expectedValues);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should emit GroupObservables', () => {
    const values = {
      a: '  foo',
      b: ' FoO '
    };
    const e1 = hot('-1--2--^-a-b----|', values);
    const e1subs =        '^        !';
    const expected =      '--g------|';
    const expectedValues = { g: 'foo' };

    const source = e1.pipe(
      groupBy((val: string) => val.toLowerCase().trim()),
      tap((group: any) => {
        expect(group.key).to.equal('foo');
        expect(group instanceof GroupedObservable).to.be.true;
      }),
      map((group: any) => { return group.key; })
    );

    expectObservable(source).toBe(expected, expectedValues);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should group values with a keySelector, assert GroupSubject key', () => {
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
      l: '    fOo    '
    };
    const e1 = hot('-1--2--^-a-b-c-d-e-f-g-h-i-j-k-l-|', values);
    const e1subs =        '^                         !';
    const expected =      '--w---x---y-z-------------|';
    const expectedValues = { w: 'foo', x: 'bar', y: 'baz', z: 'qux' };

    const source = e1.pipe(
      groupBy((val: string) => val.toLowerCase().trim()),
      map((g: any) => g.key)
    );

    expectObservable(source).toBe(expected, expectedValues);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should group values with a keySelector, but outer throws', () => {
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
      l: '    fOo    '
    };
    const e1 = hot('-1--2--^-a-b-c-d-e-f-g-h-i-j-k-l-#', values);
    const e1subs =        '^                         !';
    const expected =      '--w---x---y-z-------------#';
    const expectedValues = { w: 'foo', x: 'bar', y: 'baz', z: 'qux' };

    const source = e1.pipe(
      groupBy((val: string) => val.toLowerCase().trim()),
      map((g: any) => g.key)
    );

    expectObservable(source).toBe(expected, expectedValues);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should group values with a keySelector, inners propagate error from outer', () => {
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
      l: '    fOo    '
    };
    const e1 = hot('-1--2--^-a-b-c-d-e-f-g-h-i-j-k-l-#', values);
    const e1subs =        '^                         !';
    const expected =      '--w---x---y-z-------------#';
    const w = cold(         'a-b---d---------i-----l-#', values);
    const x = cold(             'c-------g-h---------#', values);
    const y = cold(                 'e---------j-k---#', values);
    const z = cold(                   'f-------------#', values);
    const expectedValues = { w: w, x: x, y: y, z: z };

    const source = e1
      .pipe(groupBy((val: string) => val.toLowerCase().trim()));

    expectObservable(source).toBe(expected, expectedValues);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should allow outer to be unsubscribed early', () => {
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
      l: '    fOo    '
    };
    const e1 = hot('-1--2--^-a-b-c-d-e-f-g-h-i-j-k-l-|', values);
    const unsub =         '           !';
    const e1subs =        '^          !';
    const expected =      '--w---x---y-';
    const expectedValues = { w: 'foo', x: 'bar', y: 'baz' };

    const source = e1.pipe(
      groupBy((val: string) => val.toLowerCase().trim()),
      map((group: any) => group.key)
    );

    expectObservable(source, unsub).toBe(expected, expectedValues);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should unsubscribe from the source when the outer and inner subscriptions are disposed', () => {
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
      l: '    fOo    '
    };
    const e1 = hot('-1--2--^-a-b-c-d-e-f-g-h-i-j-k-l-|', values);
    const e1subs =        '^ !';
    const expected =      '--(a|)';

    const source = e1.pipe(
      groupBy(val => val.toLowerCase().trim()),
      take(1),
      mergeMap(group => group.pipe(
        take(1)
      ))
    );

    expectObservable(source).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not break unsubscription chain when unsubscribed explicitly', () => {
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
      l: '    fOo    '
    };
    const e1 = hot('-1--2--^-a-b-c-d-e-f-g-h-i-j-k-l-|', values);
    const e1subs =        '^          !';
    const expected =      '--w---x---y-';
    const unsub =         '           !';
    const expectedValues = { w: 'foo', x: 'bar', y: 'baz' };

    const source = e1.pipe(
      mergeMap((x: string) => of(x)),
      groupBy((x: string) => x.toLowerCase().trim()),
      mergeMap((group: any) => of(group.key))
    );

    expectObservable(source, unsub).toBe(expected, expectedValues);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should group values with a keySelector which eventually throws', () => {
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
      l: '    fOo    '
    };
    const e1 = hot('-1--2--^-a-b-c-d-e-f-g-h-i-j-k-l-|', values);
    const e1subs =        '^                   !';
    const expected =      '--w---x---y-z-------#';
    const w = cold(         'a-b---d---------i-#', values);
    const x = cold(             'c-------g-h---#', values);
    const y = cold(                 'e---------#', values);
    const z = cold(                   'f-------#', values);
    const expectedValues = { w: w, x: x, y: y, z: z };

    let invoked = 0;
    const source = e1
      .pipe(groupBy((val: string) => {
        invoked++;
        if (invoked === 10) {
          throw 'error';
        }
        return val.toLowerCase().trim();
      }));

    expectObservable(source).toBe(expected, expectedValues);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should group values with a keySelector and elementSelector, ' +
  'but elementSelector throws', () => {
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
      l: '    fOo    '
    };
    const reversedValues = mapObject(values, reverseString);
    const e1 = hot('-1--2--^-a-b-c-d-e-f-g-h-i-j-k-l-|', values);
    const e1subs =        '^                   !';
    const expected =      '--w---x---y-z-------#';
    const w = cold(         'a-b---d---------i-#', reversedValues);
    const x = cold(             'c-------g-h---#', reversedValues);
    const y = cold(                 'e---------#', reversedValues);
    const z = cold(                   'f-------#', reversedValues);
    const expectedValues = { w: w, x: x, y: y, z: z };

    let invoked = 0;
    const source = e1
      .pipe(groupBy((val: string) => val.toLowerCase().trim(),
        (val: string) => {
        invoked++;
        if (invoked === 10) {
          throw 'error';
        }
        return reverseString(val);
      }));

    expectObservable(source).toBe(expected, expectedValues);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should allow the outer to be unsubscribed early but inners continue', () => {
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
      l: '    fOo    '
    };
    const e1 = hot('-1--2--^-a-b-c-d-e-f-g-h-i-j-k-l-|', values);
    const unsub =         '         !';
    const expected =      '--w---x---';
    const w = cold(         'a-b---d---------i-----l-|', values);
    const x = cold(             'c-------g-h---------|', values);
    const expectedValues = { w: w, x: x };

    const source = e1
      .pipe(groupBy((val: string) => val.toLowerCase().trim()));

    expectObservable(source, unsub).toBe(expected, expectedValues);
  });

  it('should allow an inner to be unsubscribed early but other inners continue', () => {
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
      l: '    fOo    '
    };
    const e1 = hot('-1--2--^-a-b-c-d-e-f-g-h-i-j-k-l-|', values);
    const expected =      '--w---x---y-z-------------|';
    const w =             '--a-b---d-';
    const unsubw =        '         !';
    const x =             '------c-------g-h---------|';
    const y =             '----------e---------j-k---|';
    const z =             '------------f-------------|';

    const expectedGroups = {
      w: TestScheduler.parseMarbles(w, values),
      x: TestScheduler.parseMarbles(x, values),
      y: TestScheduler.parseMarbles(y, values),
      z: TestScheduler.parseMarbles(z, values)
    };

    const fooUnsubscriptionFrame = TestScheduler
      .parseMarblesAsSubscriptions(unsubw)
      .unsubscribedFrame;

    const source = e1.pipe(
      groupBy((val: string) => val.toLowerCase().trim()),
      map((group: any) => {
        const arr: any[] = [];

        const subscription = group.pipe(
          materialize(),
          map((notification: Notification) => {
            return { frame: rxTestScheduler.frame, notification: notification };
          })
        ).subscribe((value: any) => {
            arr.push(value);
          });

        if (group.key === 'foo') {
          rxTestScheduler.schedule(() => {
            subscription.unsubscribe();
          }, fooUnsubscriptionFrame - rxTestScheduler.frame);
        }
        return arr;
      })
    );

    expectObservable(source).toBe(expected, expectedGroups);
  });

  it('should allow inners to be unsubscribed early at different times', () => {
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
      l: '    fOo    '
    };
    const e1 = hot('-1--2--^-a-b-c-d-e-f-g-h-i-j-k-l-|', values);
    const expected =      '--w---x---y-z-------------|';
    const w =             '--a-b---d-';
    const unsubw =        '         !';
    const x =             '------c------';
    const unsubx =        '            !';
    const y =             '----------e------';
    const unsuby =        '                !';
    const z =             '------------f-------';
    const unsubz =        '                   !';

    const expectedGroups = {
      w: TestScheduler.parseMarbles(w, values),
      x: TestScheduler.parseMarbles(x, values),
      y: TestScheduler.parseMarbles(y, values),
      z: TestScheduler.parseMarbles(z, values)
    };

    const unsubscriptionFrames = {
      foo: TestScheduler.parseMarblesAsSubscriptions(unsubw).unsubscribedFrame,
      bar: TestScheduler.parseMarblesAsSubscriptions(unsubx).unsubscribedFrame,
      baz: TestScheduler.parseMarblesAsSubscriptions(unsuby).unsubscribedFrame,
      qux: TestScheduler.parseMarblesAsSubscriptions(unsubz).unsubscribedFrame
    };

    const source = e1.pipe(
      groupBy((val: string) => val.toLowerCase().trim()),
      map((group: any) => {
        const arr: any[] = [];

        const subscription = group.pipe(
          materialize(),
          map((notification: Notification) => {
            return { frame: rxTestScheduler.frame, notification: notification };
          })
        ).subscribe((value: any) => {
            arr.push(value);
          });

        rxTestScheduler.schedule(() => {
          subscription.unsubscribe();
        }, unsubscriptionFrames[group.key] - rxTestScheduler.frame);
        return arr;
      })
    );

    expectObservable(source).toBe(expected, expectedGroups);
  });

  it('should allow subscribing late to an inner Observable, outer completes', () => {
    const values = {
      a: '  foo',
      b: ' FoO ',
      d: 'foO ',
      i: 'FOO ',
      l: '    fOo    '
    };
    const e1 = hot(  '--a-b---d---------i-----l-|', values);
    const subs =     '^                         !';
    const expected = '----------------------------|';

    e1.pipe(groupBy((val: string) => val.toLowerCase().trim()))
      .subscribe((group: any) => {
        rxTestScheduler.schedule(() => {
          expectObservable(group).toBe(expected);
        }, 260);
      });
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should allow subscribing late to an inner Observable, outer throws', () => {
    const values = {
      a: '  foo',
      b: ' FoO ',
      d: 'foO ',
      i: 'FOO ',
      l: '    fOo    '
    };
    const e1 = hot(  '--a-b---d---------i-----l-#', values);
    const subs =     '^                         !';
    const expected = '----------------------------#';

    e1.pipe(groupBy((val: string) => val.toLowerCase().trim()))
      .subscribe((group: any) => {
        rxTestScheduler.schedule(() => {
          expectObservable(group).toBe(expected);
        }, 260);
      }, () => {
        //noop
      });
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should allow subscribing late to inner, unsubscribe outer early', () => {
    const values = {
      a: '  foo',
      b: ' FoO ',
      d: 'foO ',
      i: 'FOO ',
      l: '    fOo    '
    };
    const e1 = hot(       '--a-b---d---------i-----l-#', values);
    const unsub =         '            !';
    const e1subs =        '^           !';
    const expectedOuter = '--w----------';
    const expectedInner = '-------------';
    const outerValues = { w: 'foo' };

    const source = e1
      .pipe(
        groupBy((val: string) => val.toLowerCase().trim()),
        tap((group: any) => {
          rxTestScheduler.schedule(() => {
            expectObservable(group).toBe(expectedInner);
          }, 260);
        }),
        map((group: any) => { return group.key; })
    );

    expectObservable(source, unsub).toBe(expectedOuter, outerValues);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should allow using a keySelector, elementSelector, and durationSelector', () => {
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
      l: '    fOo    '
    };
    const reversedValues = mapObject(values, reverseString);
    const e1 = hot('-1--2--^-a-b-c-d-e-f-g-h-i-j-k-l-|', values);
    const e1subs =        '^                         !';
    const expected =      '--v---w---x-y-----z-------|';
    const v = cold(         'a-b---(d|)'               , reversedValues);
    const w = cold(             'c-------g-(h|)'       , reversedValues);
    const x = cold(                 'e---------j-(k|)' , reversedValues);
    const y = cold(                   'f-------------|', reversedValues);
    const z = cold(                         'i-----l-|', reversedValues);
    const expectedValues = { v: v, w: w, x: x, y: y, z: z };

    const source = e1
      .pipe(groupBy(
        (val: string) => val.toLowerCase().trim(),
        (val: string) => reverseString(val),
        (group: any) => group.pipe(skip(2))
      ));

    expectObservable(source).toBe(expected, expectedValues);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should allow using a keySelector, elementSelector, and durationSelector that throws', () => {
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
      l: '    fOo    '
    };
    const reversedValues = mapObject(values, reverseString);
    const e1 = hot('-1--2--^-a-b-c-d-e-f-g-h-i-j-k-l-|', values);
    const expected =      '--v---w---x-y-----z-------|';
    const v = cold(         'a-b---(d#)'               , reversedValues);
    const w = cold(             'c-------g-(h#)'       , reversedValues);
    const x = cold(                 'e---------j-(k#)' , reversedValues);
    const y = cold(                   'f-------------|', reversedValues);
    const z = cold(                         'i-----l-|', reversedValues);
    const expectedValues = { v: v, w: w, x: x, y: y, z: z };

    const source = e1
      .pipe(groupBy(
        (val: string) => val.toLowerCase().trim(),
        (val: string) => reverseString(val),
        (group: any) => group.pipe(skip(2), map(() => { throw 'error'; }))
      ));
    expectObservable(source).toBe(expected, expectedValues);
  });

  it('should allow using a keySelector and a durationSelector, outer throws', () => {
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
      l: '    fOo    '
    };
    const e1 = hot('-1--2--^-a-b-c-d-e-f-g-h-i-j-k-l-#', values);
    const e1subs =        '^                         !';
    const expected =      '--v---w---x-y-----z-------#';
    const v = cold(         'a-b---(d|)'               , values);
    const w = cold(             'c-------g-(h|)'       , values);
    const x = cold(                 'e---------j-(k|)' , values);
    const y = cold(                   'f-------------#', values);
    const z = cold(                         'i-----l-#', values);
    const expectedValues = { v: v, w: w, x: x, y: y, z: z };

    const source = e1
      .pipe(groupBy(
        (val: string) => val.toLowerCase().trim(),
        (val: string) => val,
        (group: any) => group.pipe(skip(2))
      ));

    expectObservable(source).toBe(expected, expectedValues);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should allow using a durationSelector, and outer unsubscribed early', () => {
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
      l: '    fOo    '
    };
    const e1 = hot('-1--2--^-a-b-c-d-e-f-g-h-i-j-k-l-|', values);
    const unsub =         '           !';
    const expected =      '--v---w---x-';
    const v = cold(         'a-b---(d|)'               , values);
    const w = cold(             'c-------g-(h|)'       , values);
    const x = cold(                 'e---------j-(k|)' , values);
    const expectedValues = { v: v, w: w, x: x };

    const source = e1
      .pipe(groupBy(
        (val: string) => val.toLowerCase().trim(),
        (val: string) => val,
        (group: any) =>  group.pipe(skip(2))
      ));

    expectObservable(source, unsub).toBe(expected, expectedValues);
  });

  it('should allow using a durationSelector, outer and all inners unsubscribed early',
  () => {
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
      l: '    fOo    '
    };
    const e1 = hot('-1--2--^-a-b-c-d-e-f-g-h-i-j-k-l-|', values);
    const unsub =         '           !';
    const expected =      '--v---w---x-';
    const v =             '--a-b---(d|)';
    const w =             '------c-----';
    const x =             '----------e-';

    const expectedGroups = {
      v: TestScheduler.parseMarbles(v, values),
      w: TestScheduler.parseMarbles(w, values),
      x: TestScheduler.parseMarbles(x, values)
    };

    const unsubscriptionFrame = TestScheduler
      .parseMarblesAsSubscriptions(unsub)
      .unsubscribedFrame;

    const source = e1.pipe(
      groupBy(
        (val: string) => val.toLowerCase().trim(),
        (val: string) => val,
        (group: any) => group.pipe(skip(2))
      ),
      map((group: any) => {
        const arr: any[] = [];

        const subscription = group.pipe(
          materialize(),
          map((notification: Notification) => {
            return { frame: rxTestScheduler.frame, notification: notification };
          })
        ).subscribe((value: any) => {
            arr.push(value);
          });

        rxTestScheduler.schedule(() => {
          subscription.unsubscribe();
        }, unsubscriptionFrame - rxTestScheduler.frame);
        return arr;
      })
    );

    expectObservable(source, unsub).toBe(expected, expectedGroups);
  });

  it('should dispose a durationSelector after closing the group',
  () => {
    const obs = hot('-0-1--------2-|');
    const sub =     '^              !' ;
    let unsubs = [
                    '-^--!',
                    '---^--!',
                    '------------^-!',
    ];
    const dur =     '---s';
    const durations = [
      cold(dur),
      cold(dur),
      cold(dur)
    ];

    const unsubscribedFrame = TestScheduler
      .parseMarblesAsSubscriptions(sub)
      .unsubscribedFrame;

    obs.pipe(groupBy(
      (val: string) => val,
      (val: string) => val,
      (group: any) => durations[group.key]
    )).subscribe();

    rxTestScheduler.schedule(() => {
      durations.forEach((d, i) => {
        expectSubscriptions(d.subscriptions).toBe(unsubs[i]);
      });
    }, unsubscribedFrame);
  });

  it('should allow using a durationSelector, but keySelector throws', () => {
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
      l: '    fOo    '
    };
    const e1 = hot('-1--2--^-a-b-c-d-e-f-g-h-i-j-k-l-|', values);
    const e1subs =        '^                   !';
    const expected =      '--v---w---x-y-----z-#'      ;
    const v = cold(         'a-b---(d|)'               , values);
    const w = cold(             'c-------g-(h|)'       , values);
    const x = cold(                 'e---------#'      , values);
    const y = cold(                   'f-------#'      , values);
    const z = cold(                         'i-#'      , values);
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

  it('should allow using a durationSelector, but elementSelector throws', () => {
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
      l: '    fOo    '
    };
    const e1 = hot('-1--2--^-a-b-c-d-e-f-g-h-i-j-k-l-|', values);
    const e1subs =        '^                   !      ';
    const expected =      '--v---w---x-y-----z-#      ';
    const v = cold(         'a-b---(d|)               ', values);
    const w = cold(             'c-------g-(h|)       ', values);
    const x = cold(                 'e---------#      ', values);
    const y = cold(                   'f-------#      ', values);
    const z = cold(                         'i-#      ', values);
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

  it('should allow using a durationSelector which eventually throws', () => {
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
      l: '    fOo    '
    };
    const e1 = hot('-1--2--^-a-b-c-d-e-f-g-h-i-j-k-l-|', values);
    const e1subs =        '^           !              ';
    const expected =      '--v---w---x-(y#)              ';
    const v = cold(         'a-b---(d|)               ', values);
    const w = cold(             'c-----#              ', values);
    const x = cold(                 'e-#              ', values);
    const y = cold(                   '#              ', values);
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

  it('should allow an inner to be unsubscribed early but other inners continue, ' +
  'with durationSelector', () => {
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
      l: '    fOo    '
    };
    const reversedValues = mapObject(values, reverseString);
    const e1 = hot('-1--2--^-a-b-c-d-e-f-g-h-i-j-k-l-|', values);
    const e1subs =        '^                         !';
    const expected =      '--v---w---x-y-----z-------|';
    const v =             '--a-b---'                   ;
    const unsubv =        '       !';
    const w =             '------c-------g-(h|)'       ;
    const x =             '----------e---------j-(k|)' ;
    const y =             '------------f-------------|';
    const z =             '------------------i-----l-|';

    const expectedGroups = {
      v: TestScheduler.parseMarbles(v, reversedValues),
      w: TestScheduler.parseMarbles(w, reversedValues),
      x: TestScheduler.parseMarbles(x, reversedValues),
      y: TestScheduler.parseMarbles(y, reversedValues),
      z: TestScheduler.parseMarbles(z, reversedValues)
    };

    const fooUnsubscriptionFrame = TestScheduler
      .parseMarblesAsSubscriptions(unsubv)
      .unsubscribedFrame;

    const source = e1.pipe(
      groupBy(
        (val: string) => val.toLowerCase().trim(),
        (val: string) => reverseString(val),
        (group: any) => group.pipe(skip(2))
      ),
      map((group: any, index: number) => {
        const arr: any[] = [];

        const subscription = group.pipe(
          materialize(),
          map((notification: Notification) => {
            return { frame: rxTestScheduler.frame, notification: notification };
          })
        ).subscribe((value: any) => {
            arr.push(value);
          });

        if (group.key === 'foo' && index === 0) {
          rxTestScheduler.schedule(() => {
            subscription.unsubscribe();
          }, fooUnsubscriptionFrame - rxTestScheduler.frame);
        }
        return arr;
      })
    );

    expectObservable(source).toBe(expected, expectedGroups);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should allow inners to be unsubscribed early at different times, with durationSelector',
  () => {
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
      l: '    fOo    '
    };
    const e1 = hot('-1--2--^-a-b-c-d-e-f-g-h-i-j-k-l-|', values);
    const e1subs =        '^                         !';
    const expected =      '--v---w---x-y-----z-------|';
    const v =             '--a-b---'                   ;
    const unsubv =        '       !'                   ;
    const w =             '------c---'                 ;
    const unsubw =        '         !'                 ;
    const x =             '----------e---------j-'     ;
    const unsubx =        '                     !'     ;
    const y =             '------------f----'          ;
    const unsuby =        '                !'          ;
    const z =             '------------------i----'    ;
    const unsubz =        '                      !'    ;

    const expectedGroups = {
      v: TestScheduler.parseMarbles(v, values),
      w: TestScheduler.parseMarbles(w, values),
      x: TestScheduler.parseMarbles(x, values),
      y: TestScheduler.parseMarbles(y, values),
      z: TestScheduler.parseMarbles(z, values)
    };

    const unsubscriptionFrames = {
      foo: TestScheduler.parseMarblesAsSubscriptions(unsubv).unsubscribedFrame,
      bar: TestScheduler.parseMarblesAsSubscriptions(unsubw).unsubscribedFrame,
      baz: TestScheduler.parseMarblesAsSubscriptions(unsubx).unsubscribedFrame,
      qux: TestScheduler.parseMarblesAsSubscriptions(unsuby).unsubscribedFrame,
      foo2: TestScheduler.parseMarblesAsSubscriptions(unsubz).unsubscribedFrame
    };
    const hasUnsubscribed = {};

    const source = e1.pipe(
      groupBy(
        (val: string) => val.toLowerCase().trim(),
        (val: string) => val,
        (group: any) => group.pipe(skip(2))
      ),
      map((group: any) => {
        const arr: any[] = [];

        const subscription = group.pipe(
          materialize(),
          map((notification: Notification) => {
            return { frame: rxTestScheduler.frame, notification: notification };
          })
        ).subscribe((value: any) => {
            arr.push(value);
          });

        const unsubscriptionFrame = hasUnsubscribed[group.key] ?
          unsubscriptionFrames[group.key + '2'] :
          unsubscriptionFrames[group.key];
        rxTestScheduler.schedule(() => {
          subscription.unsubscribe();
          hasUnsubscribed[group.key] = true;
        }, unsubscriptionFrame - rxTestScheduler.frame);
        return arr;
      })
    );

    expectObservable(source).toBe(expected, expectedGroups);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

   it('should return inners that when subscribed late exhibit hot behavior', () => {
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
       l: '    fOo    '
     };
     const e1 = hot('-1--2--^-a-b-c-d-e-f-g-h-i-j-k-l-|    ', values);
     const e1subs =        '^                         !    ';
     const expected =      '--v---w---x-y-------------|    ';
     const subv =          '   ^                           '; // foo
     const v =             '  --b---d---------i-----l-|    '; // foo
     const subw =          '         ^                     '; // bar
     const w =             '      --------g-h---------|    '; // bar
     const subx =          '                   ^           '; // baz
     const x =             '          ----------j-k---|    '; // baz
     const suby =          '                              ^'; // qux
     const y =             '            ------------------|'; // qux

     const expectedGroups = {
       v: TestScheduler.parseMarbles(v, values),
       w: TestScheduler.parseMarbles(w, values),
       x: TestScheduler.parseMarbles(x, values),
       y: TestScheduler.parseMarbles(y, values),
     };

     const subscriptionFrames = {
       foo: TestScheduler.parseMarblesAsSubscriptions(subv).subscribedFrame,
       bar: TestScheduler.parseMarblesAsSubscriptions(subw).subscribedFrame,
       baz: TestScheduler.parseMarblesAsSubscriptions(subx).subscribedFrame,
       qux: TestScheduler.parseMarblesAsSubscriptions(suby).subscribedFrame,
     };

     const result = e1.pipe(
       groupBy(
         (val: string) => val.toLowerCase().trim(),
         (val: string) => val
       ),
       map((group: any) => {
         const innerNotifications: any[] = [];
         const subscriptionFrame = subscriptionFrames[group.key];

         rxTestScheduler.schedule(() => {
           group.pipe(
              materialize(),
              map((notification: Notification) => {
                return { frame: rxTestScheduler.frame, notification: notification };
              })
            ).subscribe((value: any) => {
               innerNotifications.push(value);
             });
         }, subscriptionFrame - rxTestScheduler.frame);

         return innerNotifications;
       })
      );

     expectObservable(result).toBe(expected, expectedGroups);
     expectSubscriptions(e1.subscriptions).toBe(e1subs);
   });

  it('should return inner group that when subscribed late emits complete()', () => {
    const values = {
      a: '  foo',
      b: ' FoO ',
      d: 'foO ',
      i: 'FOO ',
      l: '    fOo    '
    };
    const e1 = hot('-1--2--^-a-b---d---------i-----l-|', values);
    const e1subs =        '^                         !';
    const expected =      '--g-----------------------|';
    const innerSub =      '                                ^';
    const g =             '--------------------------------|';

    const expectedGroups = {
      g: TestScheduler.parseMarbles(g, values)
    };

    const innerSubscriptionFrame = TestScheduler
      .parseMarblesAsSubscriptions(innerSub)
      .subscribedFrame;

    const source = e1.pipe(
      groupBy(
        (val: string) => val.toLowerCase().trim(),
        (val: string) => val,
        (group: any) => group.pipe(skip(7))
      ),
      map((group: any) => {
        const arr: any[] = [];

        rxTestScheduler.schedule(() => {
          group.pipe(
            materialize(),
            map((notification: Notification) => {
              return { frame: rxTestScheduler.frame, notification: notification };
            })
          ).subscribe((value: any) => {
              arr.push(value);
            });
        }, innerSubscriptionFrame - rxTestScheduler.frame);

        return arr;
      })
    );

    expectObservable(source).toBe(expected, expectedGroups);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should return inner group that when subscribed late emits error()', () => {
    const values = {
      a: '  foo',
      b: ' FoO ',
      d: 'foO ',
      i: 'FOO ',
      l: '    fOo    '
    };
    const e1 = hot('-1--2--^-a-b---d---------i-----l-#', values);
    const e1subs =        '^                         !';
    const expected =      '--g-----------------------#';
    const innerSub =      '                                ^';
    const g =             '--------------------------------#';

    const expectedGroups = {
      g: TestScheduler.parseMarbles(g, values)
    };

    const innerSubscriptionFrame = TestScheduler
      .parseMarblesAsSubscriptions(innerSub)
      .subscribedFrame;

    const source = e1.pipe(
      groupBy(
        (val: string) => val.toLowerCase().trim(),
        (val: string) => val,
        (group: any) => group.pipe(skip(7))
      ),
      map((group: any) => {
        const arr: any[] = [];

        rxTestScheduler.schedule(() => {
          group.pipe(
            materialize(),
            map((notification: Notification) => {
              return { frame: rxTestScheduler.frame, notification: notification };
            })
          ).subscribe((value: any) => {
              arr.push(value);
            });
        }, innerSubscriptionFrame - rxTestScheduler.frame);

        return arr;
      })
    );

    expectObservable(source).toBe(expected, expectedGroups);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should return inner that does not throw when faulty outer is unsubscribed early',
  () => {
    const values = {
      a: '  foo',
      b: ' FoO ',
      d: 'foO ',
      i: 'FOO ',
      l: '    fOo    '
    };
    const e1 = hot('-1--2--^-a-b---d---------i-----l-#', values);
    const unsub =         '      !';
    const expectedSubs =  '^     !';
    const expected =      '--g----';
    const innerSub =      '                                ^';
    const g =                                             '-';

    const expectedGroups = {
      g: TestScheduler.parseMarbles(g, values)
    };

    const innerSubscriptionFrame = TestScheduler
      .parseMarblesAsSubscriptions(innerSub)
      .subscribedFrame;

    const source = e1.pipe(
      groupBy(
        (val: string) => val.toLowerCase().trim(),
        (val: string) => val,
        (group: any) => group.pipe(skip(7))
      ),
      map((group: any) => {
        const arr: any[] = [];

        rxTestScheduler.schedule(() => {
          group.pipe(
            materialize(),
            map((notification: Notification) => {
              return { frame: rxTestScheduler.frame, notification: notification };
            })
          ).subscribe((value: any) => {
              arr.push(value);
            });
        }, innerSubscriptionFrame - rxTestScheduler.frame);

        return arr;
      })
    );

    expectObservable(source, unsub).toBe(expected, expectedGroups);
    expectSubscriptions(e1.subscriptions).toBe(expectedSubs);
  });

  it('should not break lift() composability', (done: MochaDone) => {
    class MyCustomObservable<T> extends Observable<T> {
      lift<R>(operator: Operator<T, R>): Observable<R> {
        const observable = new MyCustomObservable<R>();
        (<any>observable).source = this;
        (<any>observable).operator = operator;
        return observable;
      }
    }

    const result = new MyCustomObservable((observer: Observer<number>) => {
      observer.next(1);
      observer.next(2);
      observer.next(3);
      observer.complete();
    }).pipe(groupBy(
      (x: number) => x % 2,
      (x: number) => x + '!'
    ));

    expect(result instanceof MyCustomObservable).to.be.true;

    const expectedGroups = [
      { key: 1, values: ['1!', '3!'] },
      { key: 0, values: ['2!'] }
    ];

    result
      .subscribe((g: any) => {
        const expectedGroup = expectedGroups.shift();
        expect(g.key).to.equal(expectedGroup.key);

        g.subscribe((x: any) => {
          expect(x).to.deep.equal(expectedGroup.values.shift());
        });
      }, (x) => {
        done(new Error('should not be called'));
      }, () => {
        done();
      });
  });
});
