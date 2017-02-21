import * as Rx from '../../dist/cjs/Rx';
import marbleTestingSignature = require('../helpers/marble-testing'); // tslint:disable-line:no-require-imports

declare const { asDiagram };
declare const hot: typeof marbleTestingSignature.hot;
declare const cold: typeof marbleTestingSignature.cold;
declare const expectObservable: typeof marbleTestingSignature.expectObservable;
declare const expectSubscriptions: typeof marbleTestingSignature.expectSubscriptions;

/** @test {isEmpty} */
describe('Observable.prototype.isEmpty', () => {
  asDiagram('isEmpty')('should return true if source is empty', () => {
    const source = hot('-----|');
    const subs =       '^    !';
    const expected =   '-----(T|)';

    expectObservable((<any>source).isEmpty()).toBe(expected, { T: true });
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should return false if source emits element', () => {
    const source = hot('--a--^--b--|');
    const subs =            '^  !';
    const expected =        '---(F|)';

    expectObservable((<any>source).isEmpty()).toBe(expected, { F: false });
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should raise error if source raise error', () => {
    const source = hot('--#');
    const subs =       '^ !';
    const expected =   '--#';

    expectObservable((<any>source).isEmpty()).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should not completes if source never emits', () => {
    const source = cold('-');
    const subs =        '^';
    const expected =    '-';

    expectObservable((<any>source).isEmpty()).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should return true if source is Observable.empty()', () => {
    const source = cold('|');
    const subs =        '(^!)';
    const expected =    '(T|)';

    expectObservable((<any>source).isEmpty()).toBe(expected, { T: true });
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should allow unsubscribing explicitly and early', () => {
    const source = cold('-----------a--b--|');
    const unsub =       '      !           ';
    const subs =        '^     !           ';
    const expected =    '-------           ';

    expectObservable((<any>source).isEmpty(), unsub).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    const source = cold('-----------a--b--|');
    const subs =        '^     !           ';
    const expected =    '-------           ';
    const unsub =       '      !           ';

    const result = (<any>source)
      .mergeMap((x: string) => Rx.Observable.of(x))
      .isEmpty()
      .mergeMap((x: string) => Rx.Observable.of(x));

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });
});