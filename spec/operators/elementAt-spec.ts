import { expect } from 'chai';
import { elementAt, mergeMap } from 'rxjs/operators';
import { hot, cold, expectObservable, expectSubscriptions } from '../helpers/marble-testing';
import { of, range, isOutOfRangeError } from 'rxjs';
import { createOutOfRangeError } from 'rxjs/internal/util/ArgumentOutOfRangeError';

declare function asDiagram(arg: string): Function;

/** @test {elementAt} */
describe('elementAt operator', () => {
  asDiagram('elementAt(2)')('should return last element by zero-based index', () => {
    const source = hot('--a--b--c-d---|');
    const subs =       '^       !      ';
    const expected =   '--------(c|)   ';

    expectObservable(source.pipe(elementAt(2))).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should return first element by zero-based index', () => {
    const source = hot('--a--b--c--|');
    const subs =       '^ !';
    const expected =   '--(a|)';

    expectObservable(source.pipe(elementAt(0))).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should return non-first element by zero-based index', () => {
    const source = hot('--a--b--c--d--e--f--|');
    const subs =       '^          !';
    const expected =   '-----------(d|)';

    expectObservable(source.pipe(elementAt(3))).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should return last element by zero-based index', () => {
    const source = hot('--a--b--c--|');
    const subs =       '^       !';
    const expected =   '--------(c|)';

    expectObservable(source.pipe(elementAt(2))).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should raise error if source is Empty Observable', () => {
    const source = cold('|');
    const subs =        '(^!)';
    const expected =    '#';

    expectObservable(source.pipe(elementAt(0))).toBe(expected, undefined, createOutOfRangeError());
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should propagate error if source is Throw Observable', () => {
    const source = cold('#');
    const subs =        '(^!)';
    const expected =    '#';

    expectObservable(source.pipe(elementAt(0))).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should return Never if source is Never Observable', () => {
    const source = cold('-');
    const subs =        '^';
    const expected =    '-';

    expectObservable(source.pipe(elementAt(0))).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should allow unsubscribing early and explicitly', () => {
    const source = hot('--a--b--c--|');
    const subs =       '^     !     ';
    const expected =   '-------     ';
    const unsub =      '      !     ';

    const result = source.pipe(elementAt(2));

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should not break unsubscription chains when result Observable is unsubscribed', () => {
    const source = hot('--a--b--c--|');
    const subs =       '^     !     ';
    const expected =   '-------     ';
    const unsub =      '      !     ';

    const result = source.pipe(
      mergeMap((x: any) => of(x)),
      elementAt(2),
      mergeMap((x: any) => of(x))
    );

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should throw if index is smaller than zero', () => {
    try {
      range(0, 10).pipe(elementAt(-1));
    } catch (err) {
      expect(isOutOfRangeError(err)).to.be.true;
      return;
    }
    expect('').to.equal('it should not get here');
  });

  it('should raise error if index is out of range but does not have default value', () => {
    const source = hot('--a--|');
    const subs =       '^    !';
    const expected =   '-----#';

    expectObservable(source.pipe(elementAt(3)))
      .toBe(expected, null, createOutOfRangeError());
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should raise an out of range error if the index if out of range and there is no default value', () => {
    of(0, 1, 2).pipe(
      elementAt(3),
    )
    .subscribe({
      error: err => {
        expect(isOutOfRangeError(err)).to.be.true;
      }
    });
  });

  it('should return default value if index is out of range', () => {
    const source = hot('--a--|');
    const subs =       '^    !';
    const expected =   '-----(x|)';
    const defaultValue = '42';

    expectObservable(source.pipe(elementAt(3, defaultValue))).toBe(expected, { x: defaultValue });
    expectSubscriptions(source.subscriptions).toBe(subs);
  });
});
