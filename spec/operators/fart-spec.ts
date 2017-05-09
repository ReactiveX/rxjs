import {expect} from 'chai';
import * as Rx from '../../dist/cjs/Rx';
declare const {hot, cold, asDiagram, expectObservable, expectSubscriptions};

const Observable = Rx.Observable;

// function shortcuts
const throwError = function () { throw new Error(); };

/** @test {fart} */
describe('Observable.prototype.fart', () => {
  asDiagram('fart()')('should map multiple values', () => {
    const a =   cold('--11--22--33--|');
    const asubs =    '^          !';
    const expected = '--💩💨--💩💨--💩💨--|';

    expectObservable(a.fart()).toBe(expected);
    expectSubscriptions(a.subscriptions).toBe(asubs);
  });

  it('should map one value', () => {
    const a =   cold('--77--|');
    const asubs =    '^    !';
    const expected = '--💩💨--|';

    expectObservable(a.fart()).toBe(expected);
    expectSubscriptions(a.subscriptions).toBe(asubs);
  });

  it('should allow unsubscribing explicitly and early', () => {
    const a =   cold('--11--22--33--|');
    const unsub =    '      !     ';
    const asubs =    '^     !     ';
    const expected = '--💩💨--💩💨-     ';

    expectObservable(a.fart(), unsub).toBe(expected);
    expectSubscriptions(a.subscriptions).toBe(asubs);
  });

  it('should propagate errors from observable that emits only errors', () => {
    const a =   cold('--#', null, 'too bad');
    const asubs =    '^ !';
    const expected = '--#';

    expectObservable(a.fart()).toBe(expected, null, 'too bad');
    expectSubscriptions(a.subscriptions).toBe(asubs);
  });

  it('should propagate errors from observable that emit values', () => {
    const a =   cold('--11--22--#', undefined, 'too bad');
    const asubs =    '^       !';
    const expected = '--💩💨--💩💨--#';

    expectObservable(a.fart()).toBe(expected, undefined, 'too bad');
    expectSubscriptions(a.subscriptions).toBe(asubs);
  });

  it('should propagate errors from subscribe', () => {
    const r = () => {
      Observable.of(1)
        .fart()
        .subscribe(throwError);
    };

    expect(r).to.throw();
  });

  it('should not map an empty observable', () => {
    const a =   cold('|');
    const asubs =    '(^!)';
    const expected = '|';

    expectObservable(a.fart()).toBe(expected);
    expectSubscriptions(a.subscriptions).toBe(asubs);
  });

  it('should map twice', () => {
    const a = hot('-00----11-^-22---33--44-55--66--77-88-|');
    const asubs =         '^                    !';
    const expected =      '--💩💨---💩💨--💩💨-💩💨--💩💨--💩💨-💩💨-|';

    const r = a.fart().fart();

    expectObservable(r).toBe(expected);
    expectSubscriptions(a.subscriptions).toBe(asubs);
  });

  it('should not break unsubscription chain when unsubscribed explicitly', () => {
    const a =   cold('--11--22--33--|');
    const unsub =    '      !     ';
    const asubs =    '^     !     ';
    const expected = '--💩💨--💩💨-     ';

    const r = a
      .mergeMap((x: string) => Observable.of(x))
      .fart()
      .mergeMap((x: string) => Observable.of(x));

    expectObservable(r, unsub).toBe(expected);
    expectSubscriptions(a.subscriptions).toBe(asubs);
  });
});
