import * as Rx from '../../dist/cjs/Rx';
import marbleTestingSignature = require('../helpers/marble-testing'); // tslint:disable-line:no-require-imports

declare const { asDiagram };
declare const hot: typeof marbleTestingSignature.hot;
declare const cold: typeof marbleTestingSignature.cold;
declare const expectObservable: typeof marbleTestingSignature.expectObservable;
declare const expectSubscriptions: typeof marbleTestingSignature.expectSubscriptions;

const Observable = Rx.Observable;

/** @test {skipUntil} */
describe('Observable.prototype.skipUntil', () => {
  asDiagram('skipUntil')('should skip values until another observable notifies', () => {
    const e1 =     hot('--a--b--c--d--e----|');
    const e1subs =     '^                  !';
    const skip =   hot('---------x------|   ');
    const skipSubs =   '^               !   ';
    const expected =  ('-----------d--e----|');

    expectObservable(e1.skipUntil(skip)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(skip.subscriptions).toBe(skipSubs);
  });

  it('should emit element only after another observable emits', () => {
    const e1 =     hot('--a--b--c--d--e--|');
    const e1subs =     '^                !';
    const skip =   hot('-----------x----| ');
    const skipSubs =   '^               ! ';
    const expected =  ('--------------e--|');

    expectObservable(e1.skipUntil(skip)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(skip.subscriptions).toBe(skipSubs);
  });

  it('should skip value and raises error until another observable raises error', () => {
    const e1 =   hot('--a--b--c--d--e--|');
    const e1subs =   '^            !    ';
    const skip = hot('-------------#    ');
    const skipSubs = '^            !    ';
    const expected = '-------------#    ';

    expectObservable(e1.skipUntil(skip)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(skip.subscriptions).toBe(skipSubs);
  });

  it('should skip all element when another observable does not emit and completes early', () => {
    const e1 =   hot('--a--b--c--d--e--|');
    const e1subs =   '^                !';
    const skip = hot('------------|     ');
    const skipSubs = '^           !     ';
    const expected = '-----------------|';

    expectObservable(e1.skipUntil(skip)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(skip.subscriptions).toBe(skipSubs);
  });

  it('should allow unsubscribing explicitly and early', () => {
    const e1 =     hot('--a--b--c--d--e----|');
    const unsub =      '         !          ';
    const e1subs =     '^        !          ';
    const skip =   hot('-------------x--|   ');
    const skipSubs =   '^        !          ';
    const expected =  ('----------          ');

    expectObservable(e1.skipUntil(skip), unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(skip.subscriptions).toBe(skipSubs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    const e1 =     hot('--a--b--c--d--e----|');
    const e1subs =     '^        !          ';
    const skip =   hot('-------------x--|   ');
    const skipSubs =   '^        !          ';
    const expected =  ('----------          ');
    const unsub =      '         !          ';

    const result = e1
      .mergeMap((x: string) => Observable.of(x))
      .skipUntil(skip)
      .mergeMap((x: string) => Observable.of(x));

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(skip.subscriptions).toBe(skipSubs);
  });

  it('should skip all element when another observable is empty', () => {
    const e1 =   hot('--a--b--c--d--e--|');
    const e1subs =   '^                !';
    const skip = cold('|');
    const skipSubs = '(^!)';
    const expected = '-----------------|';

    expectObservable(e1.skipUntil(skip)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(skip.subscriptions).toBe(skipSubs);
  });

  it('should keep subscription to source, to wait for its eventual complete', () => {
    const e1 =   hot('------------------------------|');
    const e1subs =   '^                             !';
    const skip = hot('-------|                       ');
    const skipSubs = '^      !                       ';
    const expected = '------------------------------|';

    expectObservable(e1.skipUntil(skip)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(skip.subscriptions).toBe(skipSubs);
  });

  it('should not complete if source observable does not complete', () => {
    const e1 =   hot('-');
    const e1subs =   '^';
    const skip = hot('-------------x--|');
    const skipSubs = '^               !';
    const expected = '-';

    expectObservable(e1.skipUntil(skip)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(skip.subscriptions).toBe(skipSubs);
  });

  it('should not complete if source observable never completes', () => {
    const e1 = cold( '-');
    const e1subs =   '^';
    const skip = hot('-------------x--|');
    const skipSubs = '^               !';
    const expected = '-';

    expectObservable(e1.skipUntil(skip)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(skip.subscriptions).toBe(skipSubs);
  });

  it('should raise error if source does not completes when another observable raises error', () => {
    const e1 =   hot('-');
    const e1subs =   '^            !';
    const skip = hot('-------------#');
    const skipSubs = '^            !';
    const expected = '-------------#';

    expectObservable(e1.skipUntil(skip)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(skip.subscriptions).toBe(skipSubs);
  });

  it('should raise error if source never completes when another observable raises error', () => {
    const e1 = cold( '-');
    const e1subs =   '^            !';
    const skip = hot('-------------#');
    const skipSubs = '^            !';
    const expected = '-------------#';

    expectObservable(e1.skipUntil(skip)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(skip.subscriptions).toBe(skipSubs);
  });

  it('should skip all element and does not complete when another observable never completes', () => {
    const e1 =   hot( '--a--b--c--d--e--|');
    const e1subs =    '^                !';
    const skip = cold('-');
    const skipSubs =  '^                !';
    const expected =  '-';

    expectObservable(e1.skipUntil(skip)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(skip.subscriptions).toBe(skipSubs);
  });

  it('should skip all element and does not complete when another observable does not completes', () => {
    const e1 =   hot('--a--b--c--d--e--|');
    const e1subs =   '^                !';
    const skip = hot('-');
    const skipSubs = '^                !';
    const expected = '-';

    expectObservable(e1.skipUntil(skip)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(skip.subscriptions).toBe(skipSubs);
  });

  it('should skip all element and does not complete when another observable completes after source', () => {
    const e1 =   hot('--a--b--c--d--e--|');
    const e1subs =   '^                !';
    const skip = hot('------------------------|');
    const skipSubs = '^                !';
    const expected = '------------------';

    expectObservable(e1.skipUntil(skip)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(skip.subscriptions).toBe(skipSubs);
  });

  it('should not completes if source does not completes when another observable does not emit', () => {
    const e1 =   hot('-');
    const e1subs =   '^';
    const skip = hot('--------------|');
    const skipSubs = '^             !';
    const expected = '-';

    expectObservable(e1.skipUntil(skip)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(skip.subscriptions).toBe(skipSubs);
  });

  it('should not completes if source and another observable both does not complete', () => {
    const e1 =   hot('-');
    const e1subs =   '^';
    const skip = hot('-');
    const skipSubs = '^';
    const expected = '-';

    expectObservable(e1.skipUntil(skip)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(skip.subscriptions).toBe(skipSubs);
  });

  it('should skip all element when another observable unsubscribed early before emit', () => {
    const e1 =   hot( '--a--b--c--d--e--|');
    const e1subs =   ['^                !',
                    '^                !']; // for the explicit subscribe some lines below
    const skip = new Rx.Subject();
    const expected =  '-';

    e1.subscribe((x: string) => {
      if (x === 'd' && !skip.closed) {
        skip.next('x');
      }

      skip.unsubscribe();
    });

    expectObservable(e1.skipUntil(skip)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });
});