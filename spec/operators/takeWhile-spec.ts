import {expect} from 'chai';
import * as Rx from '../../dist/cjs/Rx';
import marbleTestingSignature = require('../helpers/marble-testing'); // tslint:disable-line:no-require-imports

declare const { asDiagram };
declare const hot: typeof marbleTestingSignature.hot;
declare const cold: typeof marbleTestingSignature.cold;
declare const expectObservable: typeof marbleTestingSignature.expectObservable;
declare const expectSubscriptions: typeof marbleTestingSignature.expectSubscriptions;

const Observable = Rx.Observable;
/** @test {takeWhile} */
describe('Observable.prototype.takeWhile', () => {
  asDiagram('takeWhile(x => x < 4)')('should take all elements until predicate is false', () => {
    const source = hot('-1-^2--3--4--5--6--|');
    const sourceSubs =    '^      !         ';
    const expected =      '-2--3--|         ';

    const result = source.takeWhile((v: any) => +v < 4);

    expectObservable(result).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should take all elements with predicate returns true', () => {
    const e1 = hot('--a-^-b--c--d--e--|');
    const e1subs =     '^             !';
    const expected =   '--b--c--d--e--|';

    expectObservable(e1.takeWhile(() => true)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should take all elements with truthy predicate', () => {
    const e1 = hot('--a-^-b--c--d--e--|');
    const e1subs =     '^             !';
    const expected =   '--b--c--d--e--|';

    expectObservable(e1.takeWhile(<any>(() => { return {}; }))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should skip all elements with predicate returns false', () => {
    const e1 = hot('--a-^-b--c--d--e--|');
    const e1subs =     '^ !            ';
    const expected =   '--|            ';

    expectObservable(e1.takeWhile(() => false)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should skip all elements with falsy predicate', () => {
    const e1 = hot('--a-^-b--c--d--e--|');
    const e1subs =     '^ !            ';
    const expected =   '--|            ';

    expectObservable(e1.takeWhile(() => null)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should take all elements until predicate return false', () => {
    const e1 = hot('--a-^-b--c--d--e--|');
    const e1subs =     '^       !      ';
    const expected =   '--b--c--|      ';

    function predicate(value) {
      return value !== 'd';
    }

    expectObservable(e1.takeWhile(predicate)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should take elements with predicate when source does not complete', () => {
    const e1 = hot('--a-^-b--c--d--e--');
    const e1subs =     '^             ';
    const expected =   '--b--c--d--e--';

    expectObservable(e1.takeWhile(() => true)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not complete when source never completes', () => {
    const e1 =  cold('-');
    const e1subs =   '^';
    const expected = '-';

    const result = e1.takeWhile(() => true);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should complete when source does not emit', () => {
    const e1 = hot('--a-^------------|');
    const e1subs =     '^            !';
    const expected =   '-------------|';

    expectObservable(e1.takeWhile(() => true)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should complete when source is empty', () => {
    const e1 =  cold('|');
    const e1subs =   '(^!)';
    const expected = '|';

    const result = e1.takeWhile(() => true);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should pass element index to predicate', () => {
    const e1 = hot('--a-^-b--c--d--e--|');
    const e1subs =     '^       !      ';
    const expected =   '--b--c--|      ';

    function predicate(value, index) {
      return index < 2;
    }

    expectObservable(e1.takeWhile(predicate)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should raise error when source raises error', () => {
    const e1 = hot('--a-^-b--c--d--e--#');
    const e1subs =     '^             !';
    const expected =   '--b--c--d--e--#';

    expectObservable(e1.takeWhile(() => true)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should raise error when source throws', () => {
    const source = cold('#');
    const subs =        '(^!)';
    const expected =    '#';

    expectObservable(source.takeWhile(() => true)).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should invoke predicate until return false', () => {
    const e1 = hot('--a-^-b--c--d--e--|');
    const e1subs =     '^       !      ';
    const expected =   '--b--c--|      ';

    let invoked = 0;
    function predicate(value) {
      invoked++;
      return value !== 'd';
    }

    const source = e1.takeWhile(predicate).do(null, null, () => {
      expect(invoked).to.equal(3);
    });
    expectObservable(source).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should raise error if predicate throws', () => {
    const e1 = hot('--a-^-b--c--d--e--|');
    const e1subs =     '^ !            ';
    const expected =   '--#            ';

    function predicate(value) {
      throw 'error';
    }

    expectObservable(e1.takeWhile(<any>predicate)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should take elements until unsubscribed', () => {
    const e1 = hot('--a-^-b--c--d--e--|');
    const unsub =      '-----!         ';
    const e1subs =     '^    !         ';
    const expected =   '--b---         ';

    function predicate(value) {
      return value !== 'd';
    }

    expectObservable(e1.takeWhile(predicate), unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not break unsubscription chain when unsubscribed explicitly', () => {
    const e1 = hot('--a-^-b--c--d--e--|');
    const unsub =      '-----!         ';
    const e1subs =     '^    !         ';
    const expected =   '--b---         ';

    function predicate(value) {
      return value !== 'd';
    }

    const result = e1
      .mergeMap((x: string) => Observable.of(x))
      .takeWhile(predicate)
      .mergeMap((x: string) => Observable.of(x));

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });
});
