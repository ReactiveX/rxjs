
import { mapTo, mergeMap } from 'rxjs/operators';
import { hot, cold, expectObservable, expectSubscriptions } from '../helpers/marble-testing';
import { of } from 'rxjs';

declare function asDiagram(arg: string): Function;

/** @test {mapTo} */
describe('mapTo operator', () => {
  asDiagram('mapTo(\'a\')')('should map multiple values', () => {
    const a =   cold('--1--2--3--|');
    const asubs =    '^          !';
    const expected = '--a--a--a--|';

    expectObservable(a.pipe(mapTo('a'))).toBe(expected);
    expectSubscriptions(a.subscriptions).toBe(asubs);
  });

  it('should map one value', () => {
    const a =   cold('--7--|');
    const asubs =    '^    !';
    const expected = '--y--|';

    expectObservable(a.pipe(mapTo('y'))).toBe(expected);
    expectSubscriptions(a.subscriptions).toBe(asubs);
  });

  it('should allow unsubscribing explicitly and early', () => {
    const a =   cold('--1--2--3--|');
    const unsub =    '      !     ';
    const asubs =    '^     !     ';
    const expected = '--x--x-     ';

    expectObservable(a.pipe(mapTo('x')), unsub).toBe(expected);
    expectSubscriptions(a.subscriptions).toBe(asubs);
  });

  it('should propagate errors from observable that emits only errors', () => {
    const a =   cold('--#', null, 'too bad');
    const asubs =    '^ !';
    const expected = '--#';

    expectObservable(a.pipe(mapTo(1))).toBe(expected, null, 'too bad');
    expectSubscriptions(a.subscriptions).toBe(asubs);
  });

  it('should propagate errors from observable that emit values', () => {
    const a =   cold('--1--2--#', undefined, 'too bad');
    const asubs =    '^       !';
    const expected = '--x--x--#';

    expectObservable(a.pipe(mapTo('x'))).toBe(expected, undefined, 'too bad');
    expectSubscriptions(a.subscriptions).toBe(asubs);
  });

  it('should not map an empty observable', () => {
    const a =   cold('|');
    const asubs =    '(^!)';
    const expected = '|';

    expectObservable(a.pipe(mapTo(-1))).toBe(expected);
    expectSubscriptions(a.subscriptions).toBe(asubs);
  });

  it('should map twice', () => {
    const a = hot('-0----1-^-2---3--4-5--6--7-8-|');
    const asubs =         '^                    !';
    const expected =      '--h---h--h-h--h--h-h-|';

    const r = a.pipe(
      mapTo(-1),
      mapTo('h')
    );

    expectObservable(r).toBe(expected);
    expectSubscriptions(a.subscriptions).toBe(asubs);
  });

  it('should not break unsubscription chain when unsubscribed explicitly', () => {
    const a =   cold('--1--2--3--|');
    const unsub =    '      !     ';
    const asubs =    '^     !     ';
    const expected = '--x--x-     ';

    const r = a.pipe(
      mergeMap((x: string) => of(x)),
      mapTo('x'),
      mergeMap((x: string) => of(x))
    );

    expectObservable(r, unsub).toBe(expected);
    expectSubscriptions(a.subscriptions).toBe(asubs);
  });
});
