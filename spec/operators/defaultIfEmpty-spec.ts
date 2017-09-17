import * as Rx from '../../dist/package/Rx';
import marbleTestingSignature = require('../helpers/marble-testing'); // tslint:disable-line:no-require-imports

declare const { asDiagram };
declare const hot: typeof marbleTestingSignature.hot;
declare const cold: typeof marbleTestingSignature.cold;
declare const expectObservable: typeof marbleTestingSignature.expectObservable;
declare const expectSubscriptions: typeof marbleTestingSignature.expectSubscriptions;
const Observable = Rx.Observable;

/** @test {defaultIfEmpty} */
describe('Observable.prototype.defaultIfEmpty', () => {
  asDiagram('defaultIfEmpty(42)')('should return the Observable if not empty with a default value', () => {
    const e1 =   hot('--------|');
    const expected = '--------(x|)';

    expectObservable(e1.defaultIfEmpty(42)).toBe(expected, { x: 42 });
  });

  it('should return the argument if Observable is empty', () => {
    const e1 =  cold('|');
    const e1subs =   '(^!)';
    const expected = '(x|)';

    expectObservable(e1.defaultIfEmpty('x')).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should return null if the Observable is empty and no arguments', () => {
    const e1 =  cold('|');
    const e1subs =   '(^!)';
    const expected = '(x|)';

    expectObservable(e1.defaultIfEmpty()).toBe(expected, { x: null });
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should return the Observable if not empty with a default value', () => {
    const e1 =   hot('--a--b--|');
    const e1subs =   '^       !';
    const expected = '--a--b--|';

    expectObservable(e1.defaultIfEmpty('x')).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should return the Observable if not empty with no default value', () => {
    const e1 =   hot('--a--b--|');
    const e1subs =   '^       !';
    const expected = '--a--b--|';

    expectObservable(e1.defaultIfEmpty()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should allow unsubscribing early and explicitly', () => {
    const e1 =   hot('--a--b--|');
    const e1subs =   '^   !    ';
    const expected = '--a--    ';
    const unsub =    '    !    ';

    const result = e1.defaultIfEmpty('x');

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not break unsubscription chains when unsubscribed explicitly', () => {
    const e1 =   hot('--a--b--|');
    const e1subs =   '^   !    ';
    const expected = '--a--    ';
    const unsub =    '    !    ';

    const result = e1
      .mergeMap((x: any) => Observable.of(x))
      .defaultIfEmpty('x')
      .mergeMap((x: any) => Observable.of(x));

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should error if the Observable errors', () => {
    const e1 =  cold('#');
    const e1subs =   '(^!)';
    const expected = '#';

    expectObservable(e1.defaultIfEmpty('x')).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });
});
