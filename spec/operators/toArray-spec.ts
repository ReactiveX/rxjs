import * as Rx from '../../dist/package/Rx';
import marbleTestingSignature = require('../helpers/marble-testing'); // tslint:disable-line:no-require-imports

declare const { asDiagram, type };
declare const hot: typeof marbleTestingSignature.hot;
declare const cold: typeof marbleTestingSignature.cold;
declare const expectObservable: typeof marbleTestingSignature.expectObservable;
declare const expectSubscriptions: typeof marbleTestingSignature.expectSubscriptions;

const Observable = Rx.Observable;

/** @test {toArray} */
describe('Observable.prototype.toArray', () => {
  asDiagram('toArray')('should reduce the values of an observable into an array', () => {
    const e1 =   hot('---a--b--|');
    const e1subs =   '^        !';
    const expected = '---------(w|)';

    expectObservable(e1.toArray()).toBe(expected, { w: ['a', 'b'] });
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should be never when source is never', () => {
    const e1 =  cold('-');
    const e1subs =   '^';
    const expected = '-';

    expectObservable(e1.toArray()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should be never when source is empty', () => {
    const e1 =  cold('|');
    const e1subs =   '(^!)';
    const expected = '(w|)';

    expectObservable(e1.toArray()).toBe(expected, { w: [] });
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should be never when source doesn\'t complete', () => {
    const e1 = hot('--x--^--y--');
    const e1subs =      '^     ';
    const expected =    '------';

    expectObservable(e1.toArray()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should reduce observable without values into an array of length zero', () => {
    const e1 = hot('-x-^---|');
    const e1subs =    '^   !';
    const expected =  '----(w|)';

    expectObservable(e1.toArray()).toBe(expected, { w: [] });
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should reduce the a single value of an observable into an array', () => {
    const e1 = hot('-x-^--y--|');
    const e1subs =    '^     !';
    const expected =  '------(w|)';

    expectObservable(e1.toArray()).toBe(expected, { w: ['y'] });
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should allow unsubscribing explicitly and early', () => {
    const e1 =   hot('--a--b----c-----d----e---|');
    const unsub =    '        !                 ';
    const e1subs =   '^       !                 ';
    const expected = '---------                 ';

    expectObservable(e1.toArray(), unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    const e1 =   hot('--a--b----c-----d----e---|');
    const e1subs =   '^       !                 ';
    const expected = '---------                 ';
    const unsub =    '        !                 ';

    const result = e1
      .mergeMap((x: string) => Observable.of(x))
      .toArray()
      .mergeMap((x: Array<string>) => Observable.of(x));

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should work with error', () => {
    const e1 = hot('-x-^--y--z--#', { x: 1, y: 2, z: 3 }, 'too bad');
    const e1subs =    '^        !';
    const expected =  '---------#';

    expectObservable(e1.toArray()).toBe(expected, null, 'too bad');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should work with throw', () => {
    const e1 =  cold('#');
    const e1subs =   '(^!)';
    const expected = '#';

    expectObservable(e1.toArray()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  type(() => {
    const typeValue = {
      val: 3
    };

    Observable.of(typeValue).toArray().subscribe(x => { x[0].val.toString(); });
  });
});
