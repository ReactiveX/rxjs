import { hot, cold, expectObservable, expectSubscriptions } from '../helpers/marble-testing';
import { toArray, mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';

declare const type: Function;
declare const asDiagram: Function;

/** @test {toArray} */
describe('toArray operator', () => {
  asDiagram('toArray')('should reduce the values of an observable into an array', () => {
    const e1 =   hot('---a--b--|');
    const e1subs =   '^        !';
    const expected = '---------(w|)';

    expectObservable(e1.pipe(toArray())).toBe(expected, { w: ['a', 'b'] });
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should be never when source is never', () => {
    const e1 =  cold('-');
    const e1subs =   '^';
    const expected = '-';

    expectObservable(e1.pipe(toArray())).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should be never when source is empty', () => {
    const e1 =  cold('|');
    const e1subs =   '(^!)';
    const expected = '(w|)';

    expectObservable(e1.pipe(toArray())).toBe(expected, { w: [] });
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should be never when source doesn\'t complete', () => {
    const e1 = hot('--x--^--y--');
    const e1subs =      '^     ';
    const expected =    '------';

    expectObservable(e1.pipe(toArray())).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should reduce observable without values into an array of length zero', () => {
    const e1 = hot('-x-^---|');
    const e1subs =    '^   !';
    const expected =  '----(w|)';

    expectObservable(e1.pipe(toArray())).toBe(expected, { w: [] });
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should reduce the a single value of an observable into an array', () => {
    const e1 = hot('-x-^--y--|');
    const e1subs =    '^     !';
    const expected =  '------(w|)';

    expectObservable(e1.pipe(toArray())).toBe(expected, { w: ['y'] });
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should allow multiple subscriptions', () => {
    const e1 = hot('-x-^--y--|');
    const e1subs =    '^     !';
    const expected =  '------(w|)';

    const result = e1.pipe(toArray());
    expectObservable(result).toBe(expected, { w: ['y'] });
    expectObservable(result).toBe(expected, { w: ['y'] });
    expectSubscriptions(e1.subscriptions).toBe([e1subs, e1subs]);
  });

  it('should allow unsubscribing explicitly and early', () => {
    const e1 =   hot('--a--b----c-----d----e---|');
    const unsub =    '        !                 ';
    const e1subs =   '^       !                 ';
    const expected = '---------                 ';

    expectObservable(e1.pipe(toArray()), unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    const e1 =   hot('--a--b----c-----d----e---|');
    const e1subs =   '^       !                 ';
    const expected = '---------                 ';
    const unsub =    '        !                 ';

    const result = e1.pipe(
      mergeMap((x: string) => of(x)),
      toArray(),
      mergeMap((x: Array<string>) => of(x))
    );

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should work with error', () => {
    const e1 = hot('-x-^--y--z--#', { x: 1, y: 2, z: 3 }, 'too bad');
    const e1subs =    '^        !';
    const expected =  '---------#';

    expectObservable(e1.pipe(toArray())).toBe(expected, null, 'too bad');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should work with throw', () => {
    const e1 =  cold('#');
    const e1subs =   '(^!)';
    const expected = '#';

    expectObservable(e1.pipe(toArray())).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  type('should infer the element type', () => {
    const typeValue = {
      val: 3
    };

    of(typeValue).pipe(toArray()).subscribe(x => { x[0].val.toString(); });
  });
});
