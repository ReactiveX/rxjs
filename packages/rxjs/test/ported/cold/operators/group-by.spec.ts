// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/groupBy-spec.ts
import { describe, expect, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { ColdObservable } from 'rxjs/cold-observable';
import { groupBy } from 'rxjs/group-by';
import { map } from 'rxjs/map';
import { mergeMap } from 'rxjs/merge-map';
import { skip } from 'rxjs/skip';
import { Subject } from 'rxjs/subject';
import { take } from 'rxjs/take';
import { tap } from 'rxjs/tap';
describe('groupBy (cold)', () => {
  it('should group numbers by odd/even', async () => {
    function reverseString(str) {
      return str.split('').reverse().join('');
    }
    function mapObject(obj, fn) {
      const out = {};
      for (const p in obj) {
        if (obj.hasOwnProperty(p)) {
          out[p] = fn(obj[p]);
        }
      }
      return out;
    }
    await rxTest(({ cold, hot, expectObservable }) => {
      const e1 = hot('  --1---2---3---4---5---|');
      const expected = '--x---y---------------|';
      const x = cold('  1-------3-------5---|');
      const y = cold('  2-------4-------|');
      const expectedValues = { x: x, y: y };
      const source = e1[groupBy]((val) => parseInt(val) % 2);
      expectObservable(source).toBe(expected, expectedValues);
    });
  });
  it('should handle an empty Observable', async () => {
    function reverseString(str) {
      return str.split('').reverse().join('');
    }
    function mapObject(obj, fn) {
      const out = {};
      for (const p in obj) {
        if (obj.hasOwnProperty(p)) {
          out[p] = fn(obj[p]);
        }
      }
      return out;
    }
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' |   ');
      const e1subs = '  (^!)';
      const expected = '|   ';
      const source = e1[groupBy]((val) => val.toLowerCase().trim());
      expectObservable(source).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should handle a never Observable', async () => {
    function reverseString(str) {
      return str.split('').reverse().join('');
    }
    function mapObject(obj, fn) {
      const out = {};
      for (const p in obj) {
        if (obj.hasOwnProperty(p)) {
          out[p] = fn(obj[p]);
        }
      }
      return out;
    }
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' -');
      const e1subs = '^!';
      const expected = '-';
      const source = e1[groupBy]((val) => val.toLowerCase().trim());
      expectObservable(source, '^!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should handle a just-throw Observable', async () => {
    function reverseString(str) {
      return str.split('').reverse().join('');
    }
    function mapObject(obj, fn) {
      const out = {};
      for (const p in obj) {
        if (obj.hasOwnProperty(p)) {
          out[p] = fn(obj[p]);
        }
      }
      return out;
    }
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('  #  ');
      const e1subs = '  (^!)';
      const expected = '#   ';
      const source = e1[groupBy]((val) => val.toLowerCase().trim());
      expectObservable(source).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should handle an Observable with a single value', async () => {
    function reverseString(str) {
      return str.split('').reverse().join('');
    }
    function mapObject(obj, fn) {
      const out = {};
      for (const p in obj) {
        if (obj.hasOwnProperty(p)) {
          out[p] = fn(obj[p]);
        }
      }
      return out;
    }
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const values = { a: '  foo' };
      const e1 = hot('  ^--a--|', values);
      const e1subs = '  ^-----!';
      const expected = '---g--|';
      const g = cold('     a--|', values);
      const expectedValues = { g: g };
      const source = e1[groupBy]((val) => val.toLowerCase().trim());
      expectObservable(source).toBe(expected, expectedValues);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should group values with a keySelector', async () => {
    function reverseString(str) {
      return str.split('').reverse().join('');
    }
    function mapObject(obj, fn) {
      const out = {};
      for (const p in obj) {
        if (obj.hasOwnProperty(p)) {
          out[p] = fn(obj[p]);
        }
      }
      return out;
    }
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
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
      const source = e1[groupBy]((val) => val.toLowerCase().trim());
      expectObservable(source).toBe(expected, expectedValues);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should emit GroupObservables', async () => {
    function reverseString(str) {
      return str.split('').reverse().join('');
    }
    function mapObject(obj, fn) {
      const out = {};
      for (const p in obj) {
        if (obj.hasOwnProperty(p)) {
          out[p] = fn(obj[p]);
        }
      }
      return out;
    }
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const values = {
        a: '  foo',
        b: ' FoO ',
      };
      const e1 = hot('-1--2--^-a-b----|', values);
      const e1subs = '       ^--------!';
      const expected = '     --g------|';
      const expectedValues = { g: 'foo' };
      const source = e1[groupBy]((val) => val.toLowerCase().trim())
        [tap]((group) => {
          expect(group.key).toBe('foo');
          expect(group instanceof Observable).toBe(true);
        })
        [map]((group) => {
          return group.key;
        });
      expectObservable(source).toBe(expected, expectedValues);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should group values with a keySelector, assert GroupSubject key', async () => {
    function reverseString(str) {
      return str.split('').reverse().join('');
    }
    function mapObject(obj, fn) {
      const out = {};
      for (const p in obj) {
        if (obj.hasOwnProperty(p)) {
          out[p] = fn(obj[p]);
        }
      }
      return out;
    }
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
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
      const source = e1[groupBy]((val) => val.toLowerCase().trim())[map]((g) => g.key);
      expectObservable(source).toBe(expected, expectedValues);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should group values with a keySelector, but outer throws', async () => {
    function reverseString(str) {
      return str.split('').reverse().join('');
    }
    function mapObject(obj, fn) {
      const out = {};
      for (const p in obj) {
        if (obj.hasOwnProperty(p)) {
          out[p] = fn(obj[p]);
        }
      }
      return out;
    }
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
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
      const source = e1[groupBy]((val) => val.toLowerCase().trim())[map]((g) => g.key);
      expectObservable(source).toBe(expected, expectedValues);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should group values with a keySelector, inners propagate error from outer', async () => {
    function reverseString(str) {
      return str.split('').reverse().join('');
    }
    function mapObject(obj, fn) {
      const out = {};
      for (const p in obj) {
        if (obj.hasOwnProperty(p)) {
          out[p] = fn(obj[p]);
        }
      }
      return out;
    }
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
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
      const source = e1[groupBy]((val) => val.toLowerCase().trim());
      expectObservable(source).toBe(expected, expectedValues);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should allow outer to be unsubscribed early', async () => {
    function reverseString(str) {
      return str.split('').reverse().join('');
    }
    function mapObject(obj, fn) {
      const out = {};
      for (const p in obj) {
        if (obj.hasOwnProperty(p)) {
          out[p] = fn(obj[p]);
        }
      }
      return out;
    }
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
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
      const source = e1[groupBy]((val) => val.toLowerCase().trim())[map]((group) => group.key);
      expectObservable(source, unsub).toBe(expected, expectedValues);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should unsubscribe from the source when the outer and inner subscriptions are disposed', async () => {
    function reverseString(str) {
      return str.split('').reverse().join('');
    }
    function mapObject(obj, fn) {
      const out = {};
      for (const p in obj) {
        if (obj.hasOwnProperty(p)) {
          out[p] = fn(obj[p]);
        }
      }
      return out;
    }
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
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
      const source = e1[groupBy]((val) => val.toLowerCase().trim())
        [take](1)
        [mergeMap]((group) => group[take](1));
      expectObservable(source).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not break unsubscription chain when unsubscribed explicitly', async () => {
    function reverseString(str) {
      return str.split('').reverse().join('');
    }
    function mapObject(obj, fn) {
      const out = {};
      for (const p in obj) {
        if (obj.hasOwnProperty(p)) {
          out[p] = fn(obj[p]);
        }
      }
      return out;
    }
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
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
      const source = e1[mergeMap]((x) => ColdObservable.from([x]))
        [groupBy]((x) => x.toLowerCase().trim())
        [mergeMap]((group) => ColdObservable.from([group.key]));
      expectObservable(source, unsub).toBe(expected, expectedValues);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should group values with a keySelector which eventually throws', async () => {
    function reverseString(str) {
      return str.split('').reverse().join('');
    }
    function mapObject(obj, fn) {
      const out = {};
      for (const p in obj) {
        if (obj.hasOwnProperty(p)) {
          out[p] = fn(obj[p]);
        }
      }
      return out;
    }
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
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
      const source = e1[groupBy]((val) => {
        invoked++;
        if (invoked === 10) {
          throw 'error';
        }
        return val.toLowerCase().trim();
      });
      expectObservable(source).toBe(expected, expectedValues);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should group values with a keySelector and elementSelector, but elementSelector throws', async () => {
    function reverseString(str) {
      return str.split('').reverse().join('');
    }
    function mapObject(obj, fn) {
      const out = {};
      for (const p in obj) {
        if (obj.hasOwnProperty(p)) {
          out[p] = fn(obj[p]);
        }
      }
      return out;
    }
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
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
      const source = e1[groupBy](
        (val) => val.toLowerCase().trim(),
        (val) => {
          invoked++;
          if (invoked === 10) {
            throw 'error';
          }
          return reverseString(val);
        }
      );
      expectObservable(source).toBe(expected, expectedValues);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should allow the outer to be unsubscribed early but inners continue', async () => {
    function reverseString(str) {
      return str.split('').reverse().join('');
    }
    function mapObject(obj, fn) {
      const out = {};
      for (const p in obj) {
        if (obj.hasOwnProperty(p)) {
          out[p] = fn(obj[p]);
        }
      }
      return out;
    }
    await rxTest(({ cold, hot, expectObservable }) => {
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
      const unsub = '         ---------!                ';
      const expected = '      --w---x---                ';
      const w = cold('        a-b---d---------i-----l-| ', values);
      const x = cold('            c-------g-h---------| ', values);
      const expectedValues = { w: w, x: x };
      const source = e1[groupBy]((val) => val.toLowerCase().trim());
      expectObservable(source, unsub).toBe(expected, expectedValues);
    });
  });
  it('should allow an inner to be unsubscribed early but other inners continue', async () => {
    const config = {
      durationSkip: null,
      element: null,
      legacy: false,
      outerAbortFrame: null,
      sourceMarbles: '--a-b-c-d-e-f-g-h-i-j-k-l-|',
      sourceSubscription: '^-------------------------!',
      values: {
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
      },
      outer: [
        [2, 'N', 'foo'],
        [6, 'N', 'bar'],
        [10, 'N', 'baz'],
        [12, 'N', 'qux'],
        [26, 'C'],
      ],
      groups: [
        {
          key: 'foo',
          occurrence: 0,
          subscribeFrame: 2,
          abortFrame: 9,
          events: [
            [2, 'N', 'a'],
            [4, 'N', 'b'],
            [8, 'N', 'd'],
          ],
        },
        {
          key: 'bar',
          occurrence: 0,
          subscribeFrame: 6,
          events: [
            [6, 'N', 'c'],
            [14, 'N', 'g'],
            [16, 'N', 'h'],
            [26, 'C'],
          ],
        },
        {
          key: 'baz',
          occurrence: 0,
          subscribeFrame: 10,
          events: [
            [10, 'N', 'e'],
            [20, 'N', 'j'],
            [22, 'N', 'k'],
            [26, 'C'],
          ],
        },
        {
          key: 'qux',
          occurrence: 0,
          subscribeFrame: 12,
          events: [
            [12, 'N', 'f'],
            [26, 'C'],
          ],
        },
      ],
    };
    await rxTest(async ({ expectSubscriptions, flush, hot, now, schedule }) => {
      const source = hot(config.sourceMarbles, config.values);
      const outerController = new AbortController();
      const groupControllers = [];
      const occurrences = new Map();
      const actualOuter = [];
      const actualGroups = [];
      const keySelector = (value) => value.toLowerCase().trim();
      const element = config.element === 'reverse' ? (value) => value.split('').reverse().join('') : (value) => value;
      const outputTokens = new Map(Object.entries(config.values).map(([token, value]) => [element(value), token]));
      const duration = config.durationSkip === null ? undefined : (group) => group[skip](config.durationSkip);
      (config.legacy
        ? config.durationSkip === null
          ? source[groupBy](keySelector, element)
          : source[groupBy](keySelector, element, duration)
        : config.durationSkip === null
        ? source[groupBy](keySelector)
        : source[groupBy](keySelector, { duration })
      ).subscribe(
        {
          next: (group) => {
            const occurrence = occurrences.get(group.key) ?? 0;
            occurrences.set(group.key, occurrence + 1);
            actualOuter.push([now(), 'N', group.key]);
            const expectedGroup = config.groups.find((candidate) => candidate.key === group.key && candidate.occurrence === occurrence);
            if (!expectedGroup) {
              throw new Error(`Unexpected group ${group.key} occurrence ${occurrence}`);
            }
            const actualGroup = {
              key: group.key,
              occurrence,
              subscribeFrame: expectedGroup.subscribeFrame,
              ...(expectedGroup.abortFrame === undefined ? {} : { abortFrame: expectedGroup.abortFrame }),
              events: [],
            };
            actualGroups.push(actualGroup);
            const subscribe = () => {
              const controller = new AbortController();
              groupControllers.push(controller);
              group.subscribe(
                {
                  next: (value) => actualGroup.events.push([now(), 'N', outputTokens.get(value)]),
                  error: () => actualGroup.events.push([now(), 'E']),
                  complete: () => actualGroup.events.push([now(), 'C']),
                },
                { signal: controller.signal }
              );
              if (expectedGroup.abortFrame !== undefined) {
                schedule(() => controller.abort(), expectedGroup.abortFrame - now());
              }
            };
            const delay = expectedGroup.subscribeFrame - now();
            if (delay === 0) {
              subscribe();
            } else {
              schedule(subscribe, delay);
            }
          },
          error: () => actualOuter.push([now(), 'E']),
          complete: () => actualOuter.push([now(), 'C']),
        },
        { signal: outerController.signal }
      );
      if (config.outerAbortFrame !== null) {
        schedule(() => outerController.abort(), config.outerAbortFrame);
      }
      expectSubscriptions(source.subscriptions).toBe(config.sourceSubscription);
      await flush();
      expect(actualOuter).toEqual(config.outer);
      expect(actualGroups).toEqual(config.groups);
    });
  });
  it('should allow inners to be unsubscribed early at different times', async () => {
    const config = {
      durationSkip: null,
      element: null,
      legacy: false,
      outerAbortFrame: null,
      sourceMarbles: '--a-b-c-d-e-f-g-h-i-j-k-l-|',
      sourceSubscription: '^-------------------------!',
      values: {
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
      },
      outer: [
        [2, 'N', 'foo'],
        [6, 'N', 'bar'],
        [10, 'N', 'baz'],
        [12, 'N', 'qux'],
        [26, 'C'],
      ],
      groups: [
        {
          key: 'foo',
          occurrence: 0,
          subscribeFrame: 2,
          abortFrame: 9,
          events: [
            [2, 'N', 'a'],
            [4, 'N', 'b'],
            [8, 'N', 'd'],
          ],
        },
        { key: 'bar', occurrence: 0, subscribeFrame: 6, abortFrame: 12, events: [[6, 'N', 'c']] },
        { key: 'baz', occurrence: 0, subscribeFrame: 10, abortFrame: 16, events: [[10, 'N', 'e']] },
        { key: 'qux', occurrence: 0, subscribeFrame: 12, abortFrame: 19, events: [[12, 'N', 'f']] },
      ],
    };
    await rxTest(async ({ expectSubscriptions, flush, hot, now, schedule }) => {
      const source = hot(config.sourceMarbles, config.values);
      const outerController = new AbortController();
      const groupControllers = [];
      const occurrences = new Map();
      const actualOuter = [];
      const actualGroups = [];
      const keySelector = (value) => value.toLowerCase().trim();
      const element = config.element === 'reverse' ? (value) => value.split('').reverse().join('') : (value) => value;
      const outputTokens = new Map(Object.entries(config.values).map(([token, value]) => [element(value), token]));
      const duration = config.durationSkip === null ? undefined : (group) => group[skip](config.durationSkip);
      (config.legacy
        ? config.durationSkip === null
          ? source[groupBy](keySelector, element)
          : source[groupBy](keySelector, element, duration)
        : config.durationSkip === null
        ? source[groupBy](keySelector)
        : source[groupBy](keySelector, { duration })
      ).subscribe(
        {
          next: (group) => {
            const occurrence = occurrences.get(group.key) ?? 0;
            occurrences.set(group.key, occurrence + 1);
            actualOuter.push([now(), 'N', group.key]);
            const expectedGroup = config.groups.find((candidate) => candidate.key === group.key && candidate.occurrence === occurrence);
            if (!expectedGroup) {
              throw new Error(`Unexpected group ${group.key} occurrence ${occurrence}`);
            }
            const actualGroup = {
              key: group.key,
              occurrence,
              subscribeFrame: expectedGroup.subscribeFrame,
              ...(expectedGroup.abortFrame === undefined ? {} : { abortFrame: expectedGroup.abortFrame }),
              events: [],
            };
            actualGroups.push(actualGroup);
            const subscribe = () => {
              const controller = new AbortController();
              groupControllers.push(controller);
              group.subscribe(
                {
                  next: (value) => actualGroup.events.push([now(), 'N', outputTokens.get(value)]),
                  error: () => actualGroup.events.push([now(), 'E']),
                  complete: () => actualGroup.events.push([now(), 'C']),
                },
                { signal: controller.signal }
              );
              if (expectedGroup.abortFrame !== undefined) {
                schedule(() => controller.abort(), expectedGroup.abortFrame - now());
              }
            };
            const delay = expectedGroup.subscribeFrame - now();
            if (delay === 0) {
              subscribe();
            } else {
              schedule(subscribe, delay);
            }
          },
          error: () => actualOuter.push([now(), 'E']),
          complete: () => actualOuter.push([now(), 'C']),
        },
        { signal: outerController.signal }
      );
      if (config.outerAbortFrame !== null) {
        schedule(() => outerController.abort(), config.outerAbortFrame);
      }
      expectSubscriptions(source.subscriptions).toBe(config.sourceSubscription);
      await flush();
      expect(actualOuter).toEqual(config.outer);
      expect(actualGroups).toEqual(config.groups);
    });
  });
  it('should allow subscribing late to an inner Observable, outer completes', async () => {
    await rxTest(async ({ expectSubscriptions, flush, hot, now, schedule }) => {
      const values = {
        a: '  foo',
        b: ' FoO ',
        d: 'foO ',
        i: 'FOO ',
        l: '    fOo    ',
      };
      const source = hot('--a-b---d---------i-----l-|', values);
      const lateEvents = [];
      source[groupBy]((value) => value.toLowerCase().trim()).subscribe({
        next: (group) => {
          // The group opens at frame 2. Preserve the original relative delay of
          // 26 frames, then subscribe after the source has already terminated.
          schedule(() => {
            group.subscribe({
              complete: () =>
                lateEvents.push({
                  frame: now(),
                  notification: { kind: 'C' },
                }),
            });
          }, 26);
        },
      });
      expectSubscriptions(source.subscriptions).toBe('^-------------------------!');
      await flush();
      expect(lateEvents).toEqual([
        {
          frame: 28,
          notification: { kind: 'C' },
        },
      ]);
    });
  });
  it('should allow subscribing late to an inner Observable, outer throws', async () => {
    await rxTest(async ({ expectSubscriptions, flush, hot, now, schedule }) => {
      const values = {
        a: '  foo',
        b: ' FoO ',
        d: 'foO ',
        i: 'FOO ',
        l: '    fOo    ',
      };
      const source = hot('--a-b---d---------i-----l-#', values);
      const lateEvents = [];
      source[groupBy]((value) => value.toLowerCase().trim()).subscribe({
        next: (group) => {
          // The group opens at frame 2. Preserve the original relative delay of
          // 26 frames, then subscribe after the source has already terminated.
          schedule(() => {
            group.subscribe({
              error: (error) =>
                lateEvents.push({
                  frame: now(),
                  notification: { kind: 'E', error },
                }),
            });
          }, 26);
        },
        error: () => {},
      });
      expectSubscriptions(source.subscriptions).toBe('^-------------------------!');
      await flush();
      expect(lateEvents).toEqual([
        {
          frame: 28,
          notification: { kind: 'E', error: 'error' },
        },
      ]);
    });
  });
  it('should allow subscribing late to inner, unsubscribe outer early', async () => {
    await rxTest(async ({ expectSubscriptions, flush, hot, now, schedule }) => {
      const values = {
        a: '  foo',
        b: ' FoO ',
        d: 'foO ',
        i: 'FOO ',
        l: '    fOo    ',
      };
      const source = hot('--a-b---d---------i-----l-#', values);
      const outerController = new AbortController();
      const innerController = new AbortController();
      const outerEvents = [];
      const innerEvents = [];
      let innerSnapshot;
      source[groupBy]((value) => value.toLowerCase().trim()).subscribe(
        {
          next: (group) => {
            outerEvents.push({
              frame: now(),
              notification: { kind: 'N', value: group.key },
            });
            // The group opens at frame 2. The original scheduler delay is 12
            // frames, so this observation begins at frame 14, after outer
            // cancellation has released the source at frame 12.
            schedule(() => {
              group.subscribe(
                {
                  next: (value) =>
                    innerEvents.push({
                      frame: now(),
                      notification: { kind: 'N', value },
                    }),
                  error: (error) =>
                    innerEvents.push({
                      frame: now(),
                      notification: { kind: 'E', error },
                    }),
                  complete: () =>
                    innerEvents.push({
                      frame: now(),
                      notification: { kind: 'C' },
                    }),
                },
                { signal: innerController.signal }
              );
            }, 12);
          },
          error: (error) =>
            outerEvents.push({
              frame: now(),
              notification: { kind: 'E', error },
            }),
          complete: () =>
            outerEvents.push({
              frame: now(),
              notification: { kind: 'C' },
            }),
        },
        { signal: outerController.signal }
      );
      schedule(() => outerController.abort(), 12);
      schedule(() => {
        innerSnapshot = [...innerEvents];
        innerController.abort();
      }, 27);
      expectSubscriptions(source.subscriptions).toBe('^-----------!');
      await flush();
      expect(outerEvents).toEqual([
        {
          frame: 2,
          notification: { kind: 'N', value: 'foo' },
        },
      ]);
      expect(innerSnapshot).toEqual([]);
      expect(innerEvents).toEqual([]);
    });
  });
  it('should allow using a keySelector, elementSelector, and durationSelector', async () => {
    function reverseString(str) {
      return str.split('').reverse().join('');
    }
    function mapObject(obj, fn) {
      const out = {};
      for (const p in obj) {
        if (obj.hasOwnProperty(p)) {
          out[p] = fn(obj[p]);
        }
      }
      return out;
    }
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
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
      const source = e1[groupBy](
        (val) => val.toLowerCase().trim(),
        (val) => reverseString(val),
        (group) => group[skip](2)
      );
      expectObservable(source).toBe(expected, expectedValues);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should allow using a keySelector, elementSelector, and durationSelector that throws', async () => {
    function reverseString(str) {
      return str.split('').reverse().join('');
    }
    function mapObject(obj, fn) {
      const out = {};
      for (const p in obj) {
        if (obj.hasOwnProperty(p)) {
          out[p] = fn(obj[p]);
        }
      }
      return out;
    }
    await rxTest(({ cold, hot, expectObservable }) => {
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
      const source = e1[groupBy](
        (val) => val.toLowerCase().trim(),
        (val) => reverseString(val),
        (group) =>
          group[skip](2)[map](() => {
            throw 'error';
          })
      );
      expectObservable(source).toBe(expected, expectedValues);
    });
  });
  it('should allow using a keySelector and a durationSelector, outer throws', async () => {
    function reverseString(str) {
      return str.split('').reverse().join('');
    }
    function mapObject(obj, fn) {
      const out = {};
      for (const p in obj) {
        if (obj.hasOwnProperty(p)) {
          out[p] = fn(obj[p]);
        }
      }
      return out;
    }
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
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
      const source = e1[groupBy]((val) => val.toLowerCase().trim(), {
        duration: (group) => group[skip](2),
      });
      expectObservable(source).toBe(expected, expectedValues);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should allow using a durationSelector, and outer unsubscribed early', async () => {
    function reverseString(str) {
      return str.split('').reverse().join('');
    }
    function mapObject(obj, fn) {
      const out = {};
      for (const p in obj) {
        if (obj.hasOwnProperty(p)) {
          out[p] = fn(obj[p]);
        }
      }
      return out;
    }
    await rxTest(({ cold, hot, expectObservable }) => {
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
      const w = cold('             c-------g-(h|)       ', values);
      const x = cold('                 e---------j-(k|) ', values);
      const expectedValues = { v: v, w: w, x: x };
      const source = e1[groupBy]((val) => val.toLowerCase().trim(), {
        duration: (group) => group[skip](2),
      });
      expectObservable(source, unsub).toBe(expected, expectedValues);
    });
  });
  it('should allow using a durationSelector, outer and all inners unsubscribed early', async () => {
    const config = {
      durationSkip: 2,
      element: null,
      legacy: false,
      outerAbortFrame: 11,
      sourceMarbles: '--a-b-c-d-e-f-g-h-i-j-k-l-|',
      sourceSubscription: '^----------!',
      values: {
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
      },
      outer: [
        [2, 'N', 'foo'],
        [6, 'N', 'bar'],
        [10, 'N', 'baz'],
      ],
      groups: [
        {
          key: 'foo',
          occurrence: 0,
          subscribeFrame: 2,
          abortFrame: 11,
          events: [
            [2, 'N', 'a'],
            [4, 'N', 'b'],
            [8, 'N', 'd'],
            [8, 'C'],
          ],
        },
        { key: 'bar', occurrence: 0, subscribeFrame: 6, abortFrame: 11, events: [[6, 'N', 'c']] },
        { key: 'baz', occurrence: 0, subscribeFrame: 10, abortFrame: 11, events: [[10, 'N', 'e']] },
      ],
    };
    await rxTest(async ({ expectSubscriptions, flush, hot, now, schedule }) => {
      const source = hot(config.sourceMarbles, config.values);
      const outerController = new AbortController();
      const groupControllers = [];
      const occurrences = new Map();
      const actualOuter = [];
      const actualGroups = [];
      const keySelector = (value) => value.toLowerCase().trim();
      const element = config.element === 'reverse' ? (value) => value.split('').reverse().join('') : (value) => value;
      const outputTokens = new Map(Object.entries(config.values).map(([token, value]) => [element(value), token]));
      const duration = config.durationSkip === null ? undefined : (group) => group[skip](config.durationSkip);
      (config.legacy
        ? config.durationSkip === null
          ? source[groupBy](keySelector, element)
          : source[groupBy](keySelector, element, duration)
        : config.durationSkip === null
        ? source[groupBy](keySelector)
        : source[groupBy](keySelector, { duration })
      ).subscribe(
        {
          next: (group) => {
            const occurrence = occurrences.get(group.key) ?? 0;
            occurrences.set(group.key, occurrence + 1);
            actualOuter.push([now(), 'N', group.key]);
            const expectedGroup = config.groups.find((candidate) => candidate.key === group.key && candidate.occurrence === occurrence);
            if (!expectedGroup) {
              throw new Error(`Unexpected group ${group.key} occurrence ${occurrence}`);
            }
            const actualGroup = {
              key: group.key,
              occurrence,
              subscribeFrame: expectedGroup.subscribeFrame,
              ...(expectedGroup.abortFrame === undefined ? {} : { abortFrame: expectedGroup.abortFrame }),
              events: [],
            };
            actualGroups.push(actualGroup);
            const subscribe = () => {
              const controller = new AbortController();
              groupControllers.push(controller);
              group.subscribe(
                {
                  next: (value) => actualGroup.events.push([now(), 'N', outputTokens.get(value)]),
                  error: () => actualGroup.events.push([now(), 'E']),
                  complete: () => actualGroup.events.push([now(), 'C']),
                },
                { signal: controller.signal }
              );
              if (expectedGroup.abortFrame !== undefined) {
                schedule(() => controller.abort(), expectedGroup.abortFrame - now());
              }
            };
            const delay = expectedGroup.subscribeFrame - now();
            if (delay === 0) {
              subscribe();
            } else {
              schedule(subscribe, delay);
            }
          },
          error: () => actualOuter.push([now(), 'E']),
          complete: () => actualOuter.push([now(), 'C']),
        },
        { signal: outerController.signal }
      );
      if (config.outerAbortFrame !== null) {
        schedule(() => outerController.abort(), config.outerAbortFrame);
      }
      expectSubscriptions(source.subscriptions).toBe(config.sourceSubscription);
      await flush();
      expect(actualOuter).toEqual(config.outer);
      expect(actualGroups).toEqual(config.groups);
    });
  });
  it('should dispose a durationSelector after closing the group', async () => {
    const __subscriptionFrame = (marbles, marker, parseTime) => {
      const markerIndex = marbles.indexOf(marker);
      if (markerIndex < 0) return Infinity;
      const prefix = marbles.slice(0, markerIndex).replace(/[!^]/g, '-');
      return parseTime(prefix + '|');
    };
    function reverseString(str) {
      return str.split('').reverse().join('');
    }
    function mapObject(obj, fn) {
      const out = {};
      for (const p in obj) {
        if (obj.hasOwnProperty(p)) {
          out[p] = fn(obj[p]);
        }
      }
      return out;
    }
    await rxTest(({ cold, hot, expectSubscriptions, time: parseTime, schedule: scheduleAt }) => {
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
      const unsubscribedFrame = {
        subscribedFrame: __subscriptionFrame(sub, '^', parseTime),
        unsubscribedFrame: __subscriptionFrame(sub, '!', parseTime),
      }.unsubscribedFrame;
      obs[groupBy]((val) => val, {
        duration: (group) => durations[Number(group.key)],
      }).subscribe();
      scheduleAt(() => {
        durations.forEach((d, i) => {
          expectSubscriptions(d.subscriptions).toBe(unsubs[i]);
        });
      }, unsubscribedFrame);
    });
  });
  it('should allow using a durationSelector, but keySelector throws', async () => {
    function reverseString(str) {
      return str.split('').reverse().join('');
    }
    function mapObject(obj, fn) {
      const out = {};
      for (const p in obj) {
        if (obj.hasOwnProperty(p)) {
          out[p] = fn(obj[p]);
        }
      }
      return out;
    }
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
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
      const source = e1[groupBy](
        (val) => {
          invoked++;
          if (invoked === 10) {
            throw 'error';
          }
          return val.toLowerCase().trim();
        },
        (val) => val,
        (group) => group[skip](2)
      );
      expectObservable(source).toBe(expected, expectedValues);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should allow using a durationSelector, but elementSelector throws', async () => {
    function reverseString(str) {
      return str.split('').reverse().join('');
    }
    function mapObject(obj, fn) {
      const out = {};
      for (const p in obj) {
        if (obj.hasOwnProperty(p)) {
          out[p] = fn(obj[p]);
        }
      }
      return out;
    }
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
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
      const source = e1[groupBy](
        (val) => val.toLowerCase().trim(),
        (val) => {
          invoked++;
          if (invoked === 10) {
            throw 'error';
          }
          return val;
        },
        (group) => group[skip](2)
      );
      expectObservable(source).toBe(expected, expectedValues);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should allow using a durationSelector which eventually throws', async () => {
    function reverseString(str) {
      return str.split('').reverse().join('');
    }
    function mapObject(obj, fn) {
      const out = {};
      for (const p in obj) {
        if (obj.hasOwnProperty(p)) {
          out[p] = fn(obj[p]);
        }
      }
      return out;
    }
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
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
      const source = e1[groupBy](
        (val) => val.toLowerCase().trim(),
        (val) => val,
        (group) => {
          invoked++;
          if (invoked === 4) {
            throw 'error';
          }
          return group[skip](2);
        }
      );
      expectObservable(source).toBe(expected, expectedValues);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should allow an inner to be unsubscribed early but other inners continue, with durationSelector', async () => {
    const config = {
      durationSkip: 2,
      element: 'reverse',
      legacy: true,
      outerAbortFrame: null,
      sourceMarbles: '--a-b-c-d-e-f-g-h-i-j-k-l-|',
      sourceSubscription: '^-------------------------!',
      values: {
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
      },
      outer: [
        [2, 'N', 'foo'],
        [6, 'N', 'bar'],
        [10, 'N', 'baz'],
        [12, 'N', 'qux'],
        [18, 'N', 'foo'],
        [26, 'C'],
      ],
      groups: [
        {
          key: 'foo',
          occurrence: 0,
          subscribeFrame: 2,
          abortFrame: 7,
          events: [
            [2, 'N', 'a'],
            [4, 'N', 'b'],
          ],
        },
        {
          key: 'bar',
          occurrence: 0,
          subscribeFrame: 6,
          events: [
            [6, 'N', 'c'],
            [14, 'N', 'g'],
            [16, 'N', 'h'],
            [16, 'C'],
          ],
        },
        {
          key: 'baz',
          occurrence: 0,
          subscribeFrame: 10,
          events: [
            [10, 'N', 'e'],
            [20, 'N', 'j'],
            [22, 'N', 'k'],
            [22, 'C'],
          ],
        },
        {
          key: 'qux',
          occurrence: 0,
          subscribeFrame: 12,
          events: [
            [12, 'N', 'f'],
            [26, 'C'],
          ],
        },
        {
          key: 'foo',
          occurrence: 1,
          subscribeFrame: 18,
          events: [
            [18, 'N', 'i'],
            [24, 'N', 'l'],
            [26, 'C'],
          ],
        },
      ],
    };
    await rxTest(async ({ expectSubscriptions, flush, hot, now, schedule }) => {
      const source = hot(config.sourceMarbles, config.values);
      const outerController = new AbortController();
      const groupControllers = [];
      const occurrences = new Map();
      const actualOuter = [];
      const actualGroups = [];
      const keySelector = (value) => value.toLowerCase().trim();
      const element = config.element === 'reverse' ? (value) => value.split('').reverse().join('') : (value) => value;
      const outputTokens = new Map(Object.entries(config.values).map(([token, value]) => [element(value), token]));
      const duration = config.durationSkip === null ? undefined : (group) => group[skip](config.durationSkip);
      (config.legacy
        ? config.durationSkip === null
          ? source[groupBy](keySelector, element)
          : source[groupBy](keySelector, element, duration)
        : config.durationSkip === null
        ? source[groupBy](keySelector)
        : source[groupBy](keySelector, { duration })
      ).subscribe(
        {
          next: (group) => {
            const occurrence = occurrences.get(group.key) ?? 0;
            occurrences.set(group.key, occurrence + 1);
            actualOuter.push([now(), 'N', group.key]);
            const expectedGroup = config.groups.find((candidate) => candidate.key === group.key && candidate.occurrence === occurrence);
            if (!expectedGroup) {
              throw new Error(`Unexpected group ${group.key} occurrence ${occurrence}`);
            }
            const actualGroup = {
              key: group.key,
              occurrence,
              subscribeFrame: expectedGroup.subscribeFrame,
              ...(expectedGroup.abortFrame === undefined ? {} : { abortFrame: expectedGroup.abortFrame }),
              events: [],
            };
            actualGroups.push(actualGroup);
            const subscribe = () => {
              const controller = new AbortController();
              groupControllers.push(controller);
              group.subscribe(
                {
                  next: (value) => actualGroup.events.push([now(), 'N', outputTokens.get(value)]),
                  error: () => actualGroup.events.push([now(), 'E']),
                  complete: () => actualGroup.events.push([now(), 'C']),
                },
                { signal: controller.signal }
              );
              if (expectedGroup.abortFrame !== undefined) {
                schedule(() => controller.abort(), expectedGroup.abortFrame - now());
              }
            };
            const delay = expectedGroup.subscribeFrame - now();
            if (delay === 0) {
              subscribe();
            } else {
              schedule(subscribe, delay);
            }
          },
          error: () => actualOuter.push([now(), 'E']),
          complete: () => actualOuter.push([now(), 'C']),
        },
        { signal: outerController.signal }
      );
      if (config.outerAbortFrame !== null) {
        schedule(() => outerController.abort(), config.outerAbortFrame);
      }
      expectSubscriptions(source.subscriptions).toBe(config.sourceSubscription);
      await flush();
      expect(actualOuter).toEqual(config.outer);
      expect(actualGroups).toEqual(config.groups);
    });
  });
  it('should allow inners to be unsubscribed early at different times, with durationSelector', async () => {
    const config = {
      durationSkip: 2,
      element: 'identity',
      legacy: true,
      outerAbortFrame: null,
      sourceMarbles: '--a-b-c-d-e-f-g-h-i-j-k-l-|',
      sourceSubscription: '^-------------------------!',
      values: {
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
      },
      outer: [
        [2, 'N', 'foo'],
        [6, 'N', 'bar'],
        [10, 'N', 'baz'],
        [12, 'N', 'qux'],
        [18, 'N', 'foo'],
        [26, 'C'],
      ],
      groups: [
        {
          key: 'foo',
          occurrence: 0,
          subscribeFrame: 2,
          abortFrame: 7,
          events: [
            [2, 'N', 'a'],
            [4, 'N', 'b'],
          ],
        },
        { key: 'bar', occurrence: 0, subscribeFrame: 6, abortFrame: 9, events: [[6, 'N', 'c']] },
        {
          key: 'baz',
          occurrence: 0,
          subscribeFrame: 10,
          abortFrame: 21,
          events: [
            [10, 'N', 'e'],
            [20, 'N', 'j'],
          ],
        },
        { key: 'qux', occurrence: 0, subscribeFrame: 12, abortFrame: 16, events: [[12, 'N', 'f']] },
        { key: 'foo', occurrence: 1, subscribeFrame: 18, abortFrame: 22, events: [[18, 'N', 'i']] },
      ],
    };
    await rxTest(async ({ expectSubscriptions, flush, hot, now, schedule }) => {
      const source = hot(config.sourceMarbles, config.values);
      const outerController = new AbortController();
      const groupControllers = [];
      const occurrences = new Map();
      const actualOuter = [];
      const actualGroups = [];
      const keySelector = (value) => value.toLowerCase().trim();
      const element = config.element === 'reverse' ? (value) => value.split('').reverse().join('') : (value) => value;
      const outputTokens = new Map(Object.entries(config.values).map(([token, value]) => [element(value), token]));
      const duration = config.durationSkip === null ? undefined : (group) => group[skip](config.durationSkip);
      (config.legacy
        ? config.durationSkip === null
          ? source[groupBy](keySelector, element)
          : source[groupBy](keySelector, element, duration)
        : config.durationSkip === null
        ? source[groupBy](keySelector)
        : source[groupBy](keySelector, { duration })
      ).subscribe(
        {
          next: (group) => {
            const occurrence = occurrences.get(group.key) ?? 0;
            occurrences.set(group.key, occurrence + 1);
            actualOuter.push([now(), 'N', group.key]);
            const expectedGroup = config.groups.find((candidate) => candidate.key === group.key && candidate.occurrence === occurrence);
            if (!expectedGroup) {
              throw new Error(`Unexpected group ${group.key} occurrence ${occurrence}`);
            }
            const actualGroup = {
              key: group.key,
              occurrence,
              subscribeFrame: expectedGroup.subscribeFrame,
              ...(expectedGroup.abortFrame === undefined ? {} : { abortFrame: expectedGroup.abortFrame }),
              events: [],
            };
            actualGroups.push(actualGroup);
            const subscribe = () => {
              const controller = new AbortController();
              groupControllers.push(controller);
              group.subscribe(
                {
                  next: (value) => actualGroup.events.push([now(), 'N', outputTokens.get(value)]),
                  error: () => actualGroup.events.push([now(), 'E']),
                  complete: () => actualGroup.events.push([now(), 'C']),
                },
                { signal: controller.signal }
              );
              if (expectedGroup.abortFrame !== undefined) {
                schedule(() => controller.abort(), expectedGroup.abortFrame - now());
              }
            };
            const delay = expectedGroup.subscribeFrame - now();
            if (delay === 0) {
              subscribe();
            } else {
              schedule(subscribe, delay);
            }
          },
          error: () => actualOuter.push([now(), 'E']),
          complete: () => actualOuter.push([now(), 'C']),
        },
        { signal: outerController.signal }
      );
      if (config.outerAbortFrame !== null) {
        schedule(() => outerController.abort(), config.outerAbortFrame);
      }
      expectSubscriptions(source.subscriptions).toBe(config.sourceSubscription);
      await flush();
      expect(actualOuter).toEqual(config.outer);
      expect(actualGroups).toEqual(config.groups);
    });
  });
  it('should return inners that when subscribed late exhibit hot behavior', async () => {
    const config = {
      durationSkip: null,
      element: 'identity',
      legacy: true,
      outerAbortFrame: null,
      sourceMarbles: '--a-b-c-d-e-f-g-h-i-j-k-l-|',
      sourceSubscription: '^-------------------------!',
      values: {
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
      },
      outer: [
        [2, 'N', 'foo'],
        [6, 'N', 'bar'],
        [10, 'N', 'baz'],
        [12, 'N', 'qux'],
        [26, 'C'],
      ],
      groups: [
        {
          key: 'foo',
          occurrence: 0,
          subscribeFrame: 3,
          events: [
            [4, 'N', 'b'],
            [8, 'N', 'd'],
            [18, 'N', 'i'],
            [24, 'N', 'l'],
            [26, 'C'],
          ],
        },
        {
          key: 'bar',
          occurrence: 0,
          subscribeFrame: 9,
          events: [
            [14, 'N', 'g'],
            [16, 'N', 'h'],
            [26, 'C'],
          ],
        },
        {
          key: 'baz',
          occurrence: 0,
          subscribeFrame: 19,
          events: [
            [20, 'N', 'j'],
            [22, 'N', 'k'],
            [26, 'C'],
          ],
        },
        { key: 'qux', occurrence: 0, subscribeFrame: 30, events: [[30, 'C']] },
      ],
    };
    await rxTest(async ({ expectSubscriptions, flush, hot, now, schedule }) => {
      const source = hot(config.sourceMarbles, config.values);
      const outerController = new AbortController();
      const groupControllers = [];
      const occurrences = new Map();
      const actualOuter = [];
      const actualGroups = [];
      const keySelector = (value) => value.toLowerCase().trim();
      const element = config.element === 'reverse' ? (value) => value.split('').reverse().join('') : (value) => value;
      const outputTokens = new Map(Object.entries(config.values).map(([token, value]) => [element(value), token]));
      const duration = config.durationSkip === null ? undefined : (group) => group[skip](config.durationSkip);
      (config.legacy
        ? config.durationSkip === null
          ? source[groupBy](keySelector, element)
          : source[groupBy](keySelector, element, duration)
        : config.durationSkip === null
        ? source[groupBy](keySelector)
        : source[groupBy](keySelector, { duration })
      ).subscribe(
        {
          next: (group) => {
            const occurrence = occurrences.get(group.key) ?? 0;
            occurrences.set(group.key, occurrence + 1);
            actualOuter.push([now(), 'N', group.key]);
            const expectedGroup = config.groups.find((candidate) => candidate.key === group.key && candidate.occurrence === occurrence);
            if (!expectedGroup) {
              throw new Error(`Unexpected group ${group.key} occurrence ${occurrence}`);
            }
            const actualGroup = {
              key: group.key,
              occurrence,
              subscribeFrame: expectedGroup.subscribeFrame,
              ...(expectedGroup.abortFrame === undefined ? {} : { abortFrame: expectedGroup.abortFrame }),
              events: [],
            };
            actualGroups.push(actualGroup);
            const subscribe = () => {
              const controller = new AbortController();
              groupControllers.push(controller);
              group.subscribe(
                {
                  next: (value) => actualGroup.events.push([now(), 'N', outputTokens.get(value)]),
                  error: () => actualGroup.events.push([now(), 'E']),
                  complete: () => actualGroup.events.push([now(), 'C']),
                },
                { signal: controller.signal }
              );
              if (expectedGroup.abortFrame !== undefined) {
                schedule(() => controller.abort(), expectedGroup.abortFrame - now());
              }
            };
            const delay = expectedGroup.subscribeFrame - now();
            if (delay === 0) {
              subscribe();
            } else {
              schedule(subscribe, delay);
            }
          },
          error: () => actualOuter.push([now(), 'E']),
          complete: () => actualOuter.push([now(), 'C']),
        },
        { signal: outerController.signal }
      );
      if (config.outerAbortFrame !== null) {
        schedule(() => outerController.abort(), config.outerAbortFrame);
      }
      expectSubscriptions(source.subscriptions).toBe(config.sourceSubscription);
      await flush();
      expect(actualOuter).toEqual(config.outer);
      expect(actualGroups).toEqual(config.groups);
    });
  });
  it('should return inner group that when subscribed late emits complete()', async () => {
    const config = {
      durationSkip: 7,
      element: 'identity',
      legacy: true,
      outerAbortFrame: null,
      sourceMarbles: '--a-b---d---------i-----l-|',
      sourceSubscription: '^-------------------------!',
      values: { a: '  foo', b: ' FoO ', d: 'foO ', i: 'FOO ', l: '    fOo    ' },
      outer: [
        [2, 'N', 'foo'],
        [26, 'C'],
      ],
      groups: [{ key: 'foo', occurrence: 0, subscribeFrame: 32, events: [[32, 'C']] }],
    };
    await rxTest(async ({ expectSubscriptions, flush, hot, now, schedule }) => {
      const source = hot(config.sourceMarbles, config.values);
      const outerController = new AbortController();
      const groupControllers = [];
      const occurrences = new Map();
      const actualOuter = [];
      const actualGroups = [];
      const keySelector = (value) => value.toLowerCase().trim();
      const element = config.element === 'reverse' ? (value) => value.split('').reverse().join('') : (value) => value;
      const outputTokens = new Map(Object.entries(config.values).map(([token, value]) => [element(value), token]));
      const duration = config.durationSkip === null ? undefined : (group) => group[skip](config.durationSkip);
      (config.legacy
        ? config.durationSkip === null
          ? source[groupBy](keySelector, element)
          : source[groupBy](keySelector, element, duration)
        : config.durationSkip === null
        ? source[groupBy](keySelector)
        : source[groupBy](keySelector, { duration })
      ).subscribe(
        {
          next: (group) => {
            const occurrence = occurrences.get(group.key) ?? 0;
            occurrences.set(group.key, occurrence + 1);
            actualOuter.push([now(), 'N', group.key]);
            const expectedGroup = config.groups.find((candidate) => candidate.key === group.key && candidate.occurrence === occurrence);
            if (!expectedGroup) {
              throw new Error(`Unexpected group ${group.key} occurrence ${occurrence}`);
            }
            const actualGroup = {
              key: group.key,
              occurrence,
              subscribeFrame: expectedGroup.subscribeFrame,
              ...(expectedGroup.abortFrame === undefined ? {} : { abortFrame: expectedGroup.abortFrame }),
              events: [],
            };
            actualGroups.push(actualGroup);
            const subscribe = () => {
              const controller = new AbortController();
              groupControllers.push(controller);
              group.subscribe(
                {
                  next: (value) => actualGroup.events.push([now(), 'N', outputTokens.get(value)]),
                  error: () => actualGroup.events.push([now(), 'E']),
                  complete: () => actualGroup.events.push([now(), 'C']),
                },
                { signal: controller.signal }
              );
              if (expectedGroup.abortFrame !== undefined) {
                schedule(() => controller.abort(), expectedGroup.abortFrame - now());
              }
            };
            const delay = expectedGroup.subscribeFrame - now();
            if (delay === 0) {
              subscribe();
            } else {
              schedule(subscribe, delay);
            }
          },
          error: () => actualOuter.push([now(), 'E']),
          complete: () => actualOuter.push([now(), 'C']),
        },
        { signal: outerController.signal }
      );
      if (config.outerAbortFrame !== null) {
        schedule(() => outerController.abort(), config.outerAbortFrame);
      }
      expectSubscriptions(source.subscriptions).toBe(config.sourceSubscription);
      await flush();
      expect(actualOuter).toEqual(config.outer);
      expect(actualGroups).toEqual(config.groups);
    });
  });
  it('should return inner group that when subscribed late emits error()', async () => {
    const config = {
      durationSkip: 7,
      element: 'identity',
      legacy: true,
      outerAbortFrame: null,
      sourceMarbles: '--a-b---d---------i-----l-#',
      sourceSubscription: '^-------------------------!',
      values: { a: '  foo', b: ' FoO ', d: 'foO ', i: 'FOO ', l: '    fOo    ' },
      outer: [
        [2, 'N', 'foo'],
        [26, 'E'],
      ],
      groups: [{ key: 'foo', occurrence: 0, subscribeFrame: 32, events: [[32, 'E']] }],
    };
    await rxTest(async ({ expectSubscriptions, flush, hot, now, schedule }) => {
      const source = hot(config.sourceMarbles, config.values);
      const outerController = new AbortController();
      const groupControllers = [];
      const occurrences = new Map();
      const actualOuter = [];
      const actualGroups = [];
      const keySelector = (value) => value.toLowerCase().trim();
      const element = config.element === 'reverse' ? (value) => value.split('').reverse().join('') : (value) => value;
      const outputTokens = new Map(Object.entries(config.values).map(([token, value]) => [element(value), token]));
      const duration = config.durationSkip === null ? undefined : (group) => group[skip](config.durationSkip);
      (config.legacy
        ? config.durationSkip === null
          ? source[groupBy](keySelector, element)
          : source[groupBy](keySelector, element, duration)
        : config.durationSkip === null
        ? source[groupBy](keySelector)
        : source[groupBy](keySelector, { duration })
      ).subscribe(
        {
          next: (group) => {
            const occurrence = occurrences.get(group.key) ?? 0;
            occurrences.set(group.key, occurrence + 1);
            actualOuter.push([now(), 'N', group.key]);
            const expectedGroup = config.groups.find((candidate) => candidate.key === group.key && candidate.occurrence === occurrence);
            if (!expectedGroup) {
              throw new Error(`Unexpected group ${group.key} occurrence ${occurrence}`);
            }
            const actualGroup = {
              key: group.key,
              occurrence,
              subscribeFrame: expectedGroup.subscribeFrame,
              ...(expectedGroup.abortFrame === undefined ? {} : { abortFrame: expectedGroup.abortFrame }),
              events: [],
            };
            actualGroups.push(actualGroup);
            const subscribe = () => {
              const controller = new AbortController();
              groupControllers.push(controller);
              group.subscribe(
                {
                  next: (value) => actualGroup.events.push([now(), 'N', outputTokens.get(value)]),
                  error: () => actualGroup.events.push([now(), 'E']),
                  complete: () => actualGroup.events.push([now(), 'C']),
                },
                { signal: controller.signal }
              );
              if (expectedGroup.abortFrame !== undefined) {
                schedule(() => controller.abort(), expectedGroup.abortFrame - now());
              }
            };
            const delay = expectedGroup.subscribeFrame - now();
            if (delay === 0) {
              subscribe();
            } else {
              schedule(subscribe, delay);
            }
          },
          error: () => actualOuter.push([now(), 'E']),
          complete: () => actualOuter.push([now(), 'C']),
        },
        { signal: outerController.signal }
      );
      if (config.outerAbortFrame !== null) {
        schedule(() => outerController.abort(), config.outerAbortFrame);
      }
      expectSubscriptions(source.subscriptions).toBe(config.sourceSubscription);
      await flush();
      expect(actualOuter).toEqual(config.outer);
      expect(actualGroups).toEqual(config.groups);
    });
  });
  it('should not error for late subscribed inners if outer is unsubscribed before inners are subscribed', async () => {
    await rxTest(async ({ flush, hot, now, schedule }) => {
      const source = hot('-----^----a----b-----a------b----a----b---#');
      const outerController = new AbortController();
      const subjectControllers = {
        a: new AbortController(),
        b: new AbortController(),
      };
      const groupControllers = [];
      const subjects = {
        a: new Subject(),
        b: new Subject(),
      };
      const groupKeys = [];
      const subjectEvents = {
        a: [],
        b: [],
      };
      let snapshot;
      for (const key of ['a', 'b']) {
        subjects[key].subscribe(
          {
            next: (value) =>
              subjectEvents[key].push({
                frame: now(),
                notification: { kind: 'N', value },
              }),
            error: (error) =>
              subjectEvents[key].push({
                frame: now(),
                notification: { kind: 'E', error },
              }),
            complete: () =>
              subjectEvents[key].push({
                frame: now(),
                notification: { kind: 'C' },
              }),
          },
          { signal: subjectControllers[key].signal }
        );
      }
      source[groupBy]((value) => value).subscribe(
        {
          next: (group) => {
            groupKeys.push(group.key);
            // Preserve the original 1,000-frame relative delay. Both group
            // observations start long after outer cancellation at frame 19.
            schedule(() => {
              const controller = new AbortController();
              groupControllers.push(controller);
              group.subscribe(subjects[group.key], { signal: controller.signal });
            }, 1000);
          },
        },
        { signal: outerController.signal }
      );
      schedule(() => outerController.abort(), 19);
      schedule(() => {
        snapshot = {
          a: [...subjectEvents.a],
          b: [...subjectEvents.b],
        };
        for (const controller of groupControllers) {
          controller.abort();
        }
        subjectControllers.a.abort();
        subjectControllers.b.abort();
      }, 1020);
      await flush();
      expect(groupKeys).toEqual(['a', 'b']);
      expect(snapshot).toEqual({ a: [], b: [] });
      expect(subjectEvents).toEqual({ a: [], b: [] });
    });
  });
});
