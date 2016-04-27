import {expect} from 'chai';
import * as Rx from '../../dist/cjs/Rx';
declare const {hot, cold, asDiagram, expectObservable, expectSubscriptions};

const Observable = Rx.Observable;

/** @test {defer} */
describe('Observable.defer', () => {
  asDiagram('defer(() => Observable.of(a, b, c))')
  ('should defer the creation of a simple Observable', () => {
    const expected =    '-a--b--c--|';
    const e1 = Observable.defer(() => cold('-a--b--c--|'));
    expectObservable(e1).toBe(expected);
  });

  it('should create an observable from the provided observable factory', () => {
    const source = hot('--a--b--c--|');
    const sourceSubs = '^          !';
    const expected =   '--a--b--c--|';

    const e1 = Observable.defer(() => source);

    expectObservable(e1).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should create an observable from completed', () => {
    const source = hot('|');
    const sourceSubs = '(^!)';
    const expected =   '|';

    const e1 = Observable.defer(() => source);

    expectObservable(e1).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should accept factory returns promise resolves', (done: MochaDone) => {
    const expected = 42;
    const e1 = Observable.defer(() => {
      return new Promise((resolve: any) => { resolve(expected); });
    });

    e1.subscribe((x: number) => {
      expect(x).to.equal(expected);
      done();
    }, x => {
      done(new Error('should not be called'));
    });
  });

  it('should accept factory returns promise rejects', (done: MochaDone) => {
    const expected = 42;
    const e1 = Observable.defer(() => {
      return new Promise((resolve: any, reject: any) => { reject(expected); });
    });

    e1.subscribe((x: number) => {
      done(new Error('should not be called'));
    }, x => {
      expect(x).to.equal(expected);
      done();
    }, () => {
      done(new Error('should not be called'));
    });
  });

  it('should create an observable from error', () => {
    const source = hot('#');
    const sourceSubs = '(^!)';
    const expected =   '#';

    const e1 = Observable.defer(() => source);

    expectObservable(e1).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should create an observable when factory throws', () => {
    const e1 = Observable.defer(() => {
      throw 'error';
    });
    const expected = '#';

    expectObservable(e1).toBe(expected);
  });

  it('should allow unsubscribing early and explicitly', () => {
    const source = hot('--a--b--c--|');
    const sourceSubs = '^     !     ';
    const expected =   '--a--b-     ';
    const unsub =      '      !     ';

    const e1 = Observable.defer(() => source);

    expectObservable(e1, unsub).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    const source = hot('--a--b--c--|');
    const sourceSubs = '^     !     ';
    const expected =   '--a--b-     ';
    const unsub =      '      !     ';

    const e1 = Observable.defer(() => source.mergeMap((x: string) => Observable.of(x, Rx.Scheduler.none)))
      .mergeMap((x: string) => Observable.of(x, Rx.Scheduler.none));

    expectObservable(e1, unsub).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });
});
