import * as Rx from '../../dist/cjs/Rx';
import { expect } from 'chai';
import marbleTestingSignature = require('../helpers/marble-testing'); // tslint:disable-line:no-require-imports

declare const { asDiagram };
declare const hot: typeof marbleTestingSignature.hot;
declare const expectObservable: typeof marbleTestingSignature.expectObservable;
declare const expectSubscriptions: typeof marbleTestingSignature.expectSubscriptions;

const Observable = Rx.Observable;

/** @test {bufferCount} */
describe('Observable.prototype.bufferCount', () => {
  asDiagram('bufferCount(3,2)')('should emit buffers at intervals', () => {
    const values = {
      v: ['a', 'b', 'c'],
      w: ['c', 'd', 'e'],
      x: ['e', 'f', 'g'],
      y: ['g', 'h', 'i'],
      z: ['i']
    };
    const e1 =   hot('--a--b--c--d--e--f--g--h--i--|');
    const expected = '--------v-----w-----x-----y--(z|)';

    expectObservable(e1.bufferCount(3, 2)).toBe(expected, values);
  });

  it('should emit buffers at buffersize of intervals if not specified', () => {
    const values = {
      x: ['a', 'b'],
      y: ['c', 'd'],
      z: ['e', 'f']
    };
    const e1 =   hot('--a--b--c--d--e--f--|');
    const expected = '-----x-----y-----z--|';

    expectObservable(e1.bufferCount(2)).toBe(expected, values);
  });

  it('should buffer properly (issue #2062)', () => {
    const item$ = new Rx.Subject();
    const results = [];
    item$
      .bufferCount(3, 1)
      .subscribe(value => {
        results.push(value);

        if (value.join() === '1,2,3') {
          item$.next(4);
        }
      });

    item$.next(1);
    item$.next(2);
    item$.next(3);

    expect(results).to.deep.equal([[1, 2, 3], [2, 3, 4]]);
  });

  it('should emit partial buffers if source completes before reaching specified buffer count', () => {
    const e1 =   hot('--a--b--c--d--|');
    const expected = '--------------(x|)';

    expectObservable(e1.bufferCount(5)).toBe(expected, {x: ['a', 'b', 'c', 'd']});
  });

  it('should emit full buffer then last partial buffer if source completes', () => {
    const e1 =   hot('--a^-b--c--d--e--|');
    const e1subs =      '^             !';
    const expected =    '--------y-----(z|)';

    expectObservable(e1.bufferCount(3)).toBe(expected, {y: ['b', 'c', 'd'], z: ['e']});
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should emit buffers at intervals, but stop when result is unsubscribed early', () => {
    const values = {
      v: ['a', 'b', 'c'],
      w: ['c', 'd', 'e']
    };
    const e1 =   hot('--a--b--c--d--e--f--g--h--i--|');
    const unsub =    '                  !           ';
    const subs =     '^                 !           ';
    const expected = '--------v-----w----           ';

    expectObservable(e1.bufferCount(3, 2), unsub).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    const values = {
      v: ['a', 'b', 'c'],
      w: ['c', 'd', 'e']
    };
    const e1 =   hot('--a--b--c--d--e--f--g--h--i--|');
    const subs =     '^                 !           ';
    const expected = '--------v-----w----           ';
    const unsub =    '                  !           ';

    const result = e1
      .mergeMap((x: any) => Observable.of(x))
      .bufferCount(3, 2)
      .mergeMap((x: any) => Observable.of(x));

    expectObservable(result, unsub).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should raise error if source raise error before reaching specified buffer count', () => {
    const e1 =   hot('--a--b--c--d--#');
    const e1subs =   '^             !';
    const expected = '--------------#';

    expectObservable(e1.bufferCount(5)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should emit buffers with specified skip count when skip count is less than window count', () => {
    const values = {
      v: ['a', 'b', 'c'],
      w: ['b', 'c', 'd'],
      x: ['c', 'd', 'e'],
      y: ['d', 'e'],
      z: ['e']
    };
    const e1 =   hot('--a--b--c--d--e--|');
    const e1subs =   '^                !';
    const expected = '--------v--w--x--(yz|)';

    expectObservable(e1.bufferCount(3, 1)).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should emit buffers with specified skip count when skip count is more than window count', () => {
    const e1 =   hot('--a--b--c--d--e--|');
    const e1subs =   '^                !';
    const expected = '-----y--------z--|';
    const values = {
      y: ['a', 'b'],
      z: ['d', 'e']
    };

    expectObservable(e1.bufferCount(2, 3)).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });
});