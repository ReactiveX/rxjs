import * as Rx from '../../dist/cjs/Rx.KitchenSink';
import {hot, cold, expectObservable, expectSubscriptions} from '../helpers/marble-testing';
import {it, asDiagram} from '../helpers/test-helper';

const Observable = Rx.Observable;

describe('Observable.prototype.elementAt', () => {
  asDiagram('elementAt(2)')('should return last element by zero-based index', () => {
    const source = hot('--a--b--c-d---|');
    const subs =       '^       !      ';
    const expected =   '--------(c|)   ';

    expectObservable((<any>source).elementAt(2)).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should return first element by zero-based index', () => {
    const source = hot('--a--b--c--|');
    const subs =       '^ !';
    const expected =   '--(a|)';

    expectObservable((<any>source).elementAt(0)).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should return non-first element by zero-based index', () => {
    const source = hot('--a--b--c--d--e--f--|');
    const subs =       '^          !';
    const expected =   '-----------(d|)';

    expectObservable((<any>source).elementAt(3)).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should return last element by zero-based index', () => {
    const source = hot('--a--b--c--|');
    const subs =       '^       !';
    const expected =   '--------(c|)';

    expectObservable((<any>source).elementAt(2)).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should raise error if source is Empty Observable', () => {
    const source = cold('|');
    const subs =        '(^!)';
    const expected =    '#';

    expectObservable((<any>source).elementAt(0)).toBe(expected, undefined, new Rx.ArgumentOutOfRangeError());
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should propagate error if source is Throw Observable', () => {
    const source = cold('#');
    const subs =        '(^!)';
    const expected =    '#';

    expectObservable((<any>source).elementAt(0)).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should return Never if source is Never Observable', () => {
    const source = cold('-');
    const subs =        '^';
    const expected =    '-';

    expectObservable((<any>source).elementAt(0)).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should allow unsubscribing early and explicitly', () => {
    const source = hot('--a--b--c--|');
    const subs =       '^     !     ';
    const expected =   '-------     ';
    const unsub =      '      !     ';

    const result = (<any>source).elementAt(2);

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should not break unsubscription chains when result Observable is unsubscribed', () => {
    const source = hot('--a--b--c--|');
    const subs =       '^     !     ';
    const expected =   '-------     ';
    const unsub =      '      !     ';

    const result = (<any>source)
      .mergeMap((x: any) => Observable.of(x))
      .elementAt(2)
      .mergeMap((x: any) => Observable.of(x));

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should throw if index is smaller than zero', () => {
    expect(() => { (<any>Observable.range(0, 10)).elementAt(-1); })
      .toThrow(new Rx.ArgumentOutOfRangeError());
  });

  it('should raise error if index is out of range but does not have default value', () => {
    const source = hot('--a--|');
    const subs =       '^    !';
    const expected =   '-----#';

    expectObservable((<any>source).elementAt(3))
      .toBe(expected, null, new Rx.ArgumentOutOfRangeError());
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should return default value if index is out of range', () => {
    const source = hot('--a--|');
    const subs =       '^    !';
    const expected =   '-----(x|)';
    const defaultValue = '42';

    expectObservable((<any>source).elementAt(3, defaultValue)).toBe(expected, { x: defaultValue });
    expectSubscriptions(source.subscriptions).toBe(subs);
  });
});
