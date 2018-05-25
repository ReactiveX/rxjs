import { isEmpty, mergeMap } from 'rxjs/operators';
import { hot, cold, expectObservable, expectSubscriptions } from '../helpers/marble-testing';
import { of } from 'rxjs';

declare function asDiagram(arg: string): Function;

/** @test {isEmpty} */
describe('isEmpty operator', () => {
  asDiagram('isEmpty')('should return true if source is empty', () => {
    const source = hot('-----|');
    const subs =       '^    !';
    const expected =   '-----(T|)';

    expectObservable((<any>source).pipe(isEmpty())).toBe(expected, { T: true });
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should return false if source emits element', () => {
    const source = hot('--a--^--b--|');
    const subs =            '^  !';
    const expected =        '---(F|)';

    expectObservable((<any>source).pipe(isEmpty())).toBe(expected, { F: false });
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should raise error if source raise error', () => {
    const source = hot('--#');
    const subs =       '^ !';
    const expected =   '--#';

    expectObservable((<any>source).pipe(isEmpty())).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should not completes if source never emits', () => {
    const source = cold('-');
    const subs =        '^';
    const expected =    '-';

    expectObservable((<any>source).pipe(isEmpty())).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should return true if source is Observable.empty()', () => {
    const source = cold('|');
    const subs =        '(^!)';
    const expected =    '(T|)';

    expectObservable((<any>source).pipe(isEmpty())).toBe(expected, { T: true });
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should allow unsubscribing explicitly and early', () => {
    const source = cold('-----------a--b--|');
    const unsub =       '      !           ';
    const subs =        '^     !           ';
    const expected =    '-------           ';

    expectObservable((<any>source).pipe(isEmpty()), unsub).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    const source = cold('-----------a--b--|');
    const subs =        '^     !           ';
    const expected =    '-------           ';
    const unsub =       '      !           ';

    const result = (<any>source).pipe(
      mergeMap((x: string) => of(x)),
      isEmpty(),
      mergeMap((x: string) => of(x))
    );

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });
});
