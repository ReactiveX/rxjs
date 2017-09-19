import { expect } from 'chai';
import * as Rx from '../../dist/package/Rx';
import marbleTestingSignature = require('../helpers/marble-testing'); // tslint:disable-line:no-require-imports

declare const { asDiagram };
declare const hot: typeof marbleTestingSignature.hot;
declare const cold: typeof marbleTestingSignature.cold;
declare const expectObservable: typeof marbleTestingSignature.expectObservable;
declare const expectSubscriptions: typeof marbleTestingSignature.expectSubscriptions;

const Observable = Rx.Observable;

// function shortcuts
const throwError = function () { throw new Error(); };

/** @test {mapTo} */
describe('Observable.prototype.mapTo', () => {
  asDiagram('mapTo(\'a\')')('should map multiple values', () => {
    const a =   cold('--1--2--3--|');
    const asubs =    '^          !';
    const expected = '--a--a--a--|';

    expectObservable(a.mapTo('a')).toBe(expected);
    expectSubscriptions(a.subscriptions).toBe(asubs);
  });

  it('should map one value', () => {
    const a =   cold('--7--|');
    const asubs =    '^    !';
    const expected = '--y--|';

    expectObservable(a.mapTo('y')).toBe(expected);
    expectSubscriptions(a.subscriptions).toBe(asubs);
  });

  it('should allow unsubscribing explicitly and early', () => {
    const a =   cold('--1--2--3--|');
    const unsub =    '      !     ';
    const asubs =    '^     !     ';
    const expected = '--x--x-     ';

    expectObservable(a.mapTo('x'), unsub).toBe(expected);
    expectSubscriptions(a.subscriptions).toBe(asubs);
  });

  it('should propagate errors from observable that emits only errors', () => {
    const a =   cold('--#', null, 'too bad');
    const asubs =    '^ !';
    const expected = '--#';

    expectObservable(a.mapTo(1)).toBe(expected, null, 'too bad');
    expectSubscriptions(a.subscriptions).toBe(asubs);
  });

  it('should propagate errors from observable that emit values', () => {
    const a =   cold('--1--2--#', undefined, 'too bad');
    const asubs =    '^       !';
    const expected = '--x--x--#';

    expectObservable(a.mapTo('x')).toBe(expected, undefined, 'too bad');
    expectSubscriptions(a.subscriptions).toBe(asubs);
  });

  it('should propagate errors from subscribe', () => {
    const r = () => {
      Observable.of(1)
        .mapTo(-1)
        .subscribe(throwError);
    };

    expect(r).to.throw();
  });

  it('should not map an empty observable', () => {
    const a =   cold('|');
    const asubs =    '(^!)';
    const expected = '|';

    expectObservable(a.mapTo(-1)).toBe(expected);
    expectSubscriptions(a.subscriptions).toBe(asubs);
  });

  it('should map twice', () => {
    const a = hot('-0----1-^-2---3--4-5--6--7-8-|');
    const asubs =         '^                    !';
    const expected =      '--h---h--h-h--h--h-h-|';

    const r = a.mapTo(-1).mapTo('h');

    expectObservable(r).toBe(expected);
    expectSubscriptions(a.subscriptions).toBe(asubs);
  });

  it('should not break unsubscription chain when unsubscribed explicitly', () => {
    const a =   cold('--1--2--3--|');
    const unsub =    '      !     ';
    const asubs =    '^     !     ';
    const expected = '--x--x-     ';

    const r = a
      .mergeMap((x: string) => Observable.of(x))
      .mapTo('x')
      .mergeMap((x: string) => Observable.of(x));

    expectObservable(r, unsub).toBe(expected);
    expectSubscriptions(a.subscriptions).toBe(asubs);
  });
});
