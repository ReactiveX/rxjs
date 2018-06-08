import { expect } from 'chai';
import { lowerCaseO } from '../helpers/test-helper';
import { hot, cold, expectObservable, expectSubscriptions } from '../helpers/marble-testing';
import { withLatestFrom, mergeMap, delay } from 'rxjs/operators';
import { of } from 'rxjs';

declare function asDiagram(arg: string): Function;

/** @test {withLatestFrom} */
describe('withLatestFrom operator', () => {
  asDiagram('withLatestFrom')('should combine events from cold observables', () => {
    const e1 =  cold('-a--b-----c-d-e-|');
    const e2 =  cold('--1--2-3-4---|   ');
    const expected = '----B-----C-D-E-|';

    const result = e1.pipe(withLatestFrom(e2, (a: string, b: string) => String(a) + String(b)));

    expectObservable(result).toBe(expected, { B: 'b1', C: 'c4', D: 'd4', E: 'e4' });
  });

  it('should merge the value with the latest values from the other observables into arrays', () => {
    const e1 =   hot('--a--^---b---c---d-|');
    const e1subs =        '^             !';
    const e2 =   hot('--e--^-f---g---h------|');
    const e2subs =        '^             !';
    const e3 =   hot('--i--^-j---k---l------|');
    const e3subs =        '^             !';
    const expected =      '----x---y---z-|';
    const values = {
      x: ['b', 'f', 'j'],
      y: ['c', 'g', 'k'],
      z: ['d', 'h', 'l']
    };

    const result = e1.pipe(withLatestFrom(e2, e3));

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
    expectSubscriptions(e3.subscriptions).toBe(e3subs);
  });

  it('should merge the value with the latest values from the other observables into ' +
  'arrays and a project argument', () => {
    const e1 =   hot('--a--^---b---c---d-|');
    const e1subs =        '^             !';
    const e2 =   hot('--e--^-f---g---h------|');
    const e2subs =        '^             !';
    const e3 =   hot('--i--^-j---k---l------|');
    const e3subs =        '^             !';
    const expected =      '----x---y---z-|';
    const values = {
      x: 'bfj',
      y: 'cgk',
      z: 'dhl'
    };
    const project = function (a: string, b: string, c: string) { return a + b + c; };

    const result = e1.pipe(withLatestFrom(e2, e3, project));

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
    expectSubscriptions(e3.subscriptions).toBe(e3subs);
  });

  it('should allow unsubscribing early and explicitly', () => {
    const e1 =   hot('--a--^---b---c---d-|');
    const e1subs =        '^          !   ';
    const e2 =   hot('--e--^-f---g---h------|');
    const e2subs =        '^          !   ';
    const e3 =   hot('--i--^-j---k---l------|');
    const e3subs =        '^          !   ';
    const expected =      '----x---y---   ';
    const unsub =         '           !   ';
    const values = {
      x: 'bfj',
      y: 'cgk',
      z: 'dhl'
    };
    const project = function (a: string, b: string, c: string) { return a + b + c; };

    const result = e1.pipe(withLatestFrom(e2, e3, project));

    expectObservable(result, unsub).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
    expectSubscriptions(e3.subscriptions).toBe(e3subs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    const e1 =   hot('--a--^---b---c---d-|');
    const e1subs =        '^          !   ';
    const e2 =   hot('--e--^-f---g---h------|');
    const e2subs =        '^          !   ';
    const e3 =   hot('--i--^-j---k---l------|');
    const e3subs =        '^          !   ';
    const expected =      '----x---y---   ';
    const unsub =         '           !   ';
    const values = {
      x: 'bfj',
      y: 'cgk',
      z: 'dhl'
    };
    const project = function (a: string, b: string, c: string) { return a + b + c; };

    const result = e1.pipe(
      mergeMap((x: string) => of(x)),
      withLatestFrom(e2, e3, project),
      mergeMap((x: string) => of(x))
    );

    expectObservable(result, unsub).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
    expectSubscriptions(e3.subscriptions).toBe(e3subs);
  });

  it('should handle empty', () => {
    const e1 =   cold(    '|');
    const e1subs =        '(^!)';
    const e2 =   hot('--e--^-f---g---h----|');
    const e2subs =        '(^!)';
    const e3 =   hot('--i--^-j---k---l----|');
    const e3subs =        '(^!)';
    const expected =      '|'; // empty

    const result = e1.pipe(withLatestFrom(e2, e3));

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
    expectSubscriptions(e3.subscriptions).toBe(e3subs);
  });

  it('should handle never', () => {
    const e1 =   cold('-');
    const e1subs =        '^               ';
    const e2 =   hot('--e--^-f---g---h----|');
    const e2subs =        '^              !';
    const e3 =   hot('--i--^-j---k---l----|');
    const e3subs =        '^              !';
    const expected =      '--------------------'; // never

    const result = e1.pipe(withLatestFrom(e2, e3));

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
    expectSubscriptions(e3.subscriptions).toBe(e3subs);
  });

  it('should handle throw', () => {
    const e1 =   cold('#');
    const e1subs =        '(^!)';
    const e2 =   hot('--e--^-f---g---h----|');
    const e2subs =        '(^!)';
    const e3 =   hot('--i--^-j---k---l----|');
    const e3subs =        '(^!)';
    const expected =      '#'; // throw

    const result = e1.pipe(withLatestFrom(e2, e3));

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
    expectSubscriptions(e3.subscriptions).toBe(e3subs);
  });

  it('should handle error', () => {
    const e1 =   hot('--a--^---b---#', undefined, new Error('boo-hoo'));
    const e1subs =        '^       !';
    const e2 =   hot('--e--^-f---g---h----|');
    const e2subs =        '^       !';
    const e3 =   hot('--i--^-j---k---l----|');
    const e3subs =        '^       !';
    const expected =      '----x---#'; // throw
    const values = {
      x: ['b', 'f', 'j']
    };

    const result = e1.pipe(withLatestFrom(e2, e3));

    expectObservable(result).toBe(expected, values, new Error('boo-hoo'));
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
    expectSubscriptions(e3.subscriptions).toBe(e3subs);
  });

  it('should handle error with project argument', () => {
    const e1 =   hot('--a--^---b---#', undefined, new Error('boo-hoo'));
    const e1subs =        '^       !';
    const e2 =   hot('--e--^-f---g---h----|');
    const e2subs =        '^       !';
    const e3 =   hot('--i--^-j---k---l----|');
    const e3subs =        '^       !';
    const expected =      '----x---#'; // throw
    const values = {
      x: 'bfj'
    };
    const project = function (a: string, b: string, c: string) { return a + b + c; };

    const result = e1.pipe(withLatestFrom(e2, e3, project));

    expectObservable(result).toBe(expected, values, new Error('boo-hoo'));
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
    expectSubscriptions(e3.subscriptions).toBe(e3subs);
  });

  it('should handle merging with empty', () => {
    const e1 =   hot('--a--^---b---c---d-|   ');
    const e1subs =        '^             !   ';
    const e2 =   cold(    '|'                 );
    const e2subs =        '(^!)';
    const e3 =   hot('--i--^-j---k---l------|');
    const e3subs =        '^             !   ';
    const expected =      '--------------|   ';

    const result = e1.pipe(withLatestFrom(e2, e3));

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
    expectSubscriptions(e3.subscriptions).toBe(e3subs);
  });

  it('should handle merging with never', () => {
    const e1 =   hot('--a--^---b---c---d-|   ');
    const e1subs =        '^             !   ';
    const e2 =   cold(    '-'                 );
    const e2subs =        '^             !   ';
    const e3 =   hot('--i--^-j---k---l------|');
    const e3subs =        '^             !   ';
    const expected =      '--------------|   ';

    const result = e1.pipe(withLatestFrom(e2, e3));

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
    expectSubscriptions(e3.subscriptions).toBe(e3subs);
  });

  it('should handle promises', (done: MochaDone) => {
    of(1).pipe(delay(1), withLatestFrom(Promise.resolve(2), Promise.resolve(3)))
      .subscribe((x: any) => {
        expect(x).to.deep.equal([1, 2, 3]);
      }, null, done);
  });

  it('should handle arrays', () => {
    of(1).pipe(delay(1), withLatestFrom([2, 3, 4], [4, 5, 6]))
      .subscribe((x: any) => {
        expect(x).to.deep.equal([1, 4, 6]);
      });
  });

  it('should handle lowercase-o observables', () => {
    of(1).pipe(delay(1), withLatestFrom(lowerCaseO(2, 3, 4), lowerCaseO(4, 5, 6)))
      .subscribe((x: any) => {
        expect(x).to.deep.equal([1, 4, 6]);
      });
  });
});
