import { expect } from 'chai';
import { defer } from '../../src/';
import { Observable } from '../../src';
import { hot, cold, expectObservable, expectSubscriptions } from '../helpers/marble-testing';

declare function asDiagram(arg: any): Function;

/** @test {defer} */
describe('defer', () => {
  asDiagram('defer(() => Observable.of(a, b, c))')
  ('should defer the creation of a simple Observable', () => {
    const expected =    '-a--b--c--|';
    const e1 = defer(() => cold('-a--b--c--|'));
    expectObservable(e1).toBe(expected);
  });

  it('should create an observable from the provided observable factory', () => {
    const source = hot('--a--b--c--|');
    const sourceSubs = '^          !';
    const expected =   '--a--b--c--|';

    const e1 = defer(() => source);

    expectObservable(e1).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should create an observable from completed', () => {
    const source = hot('|');
    const sourceSubs = '(^!)';
    const expected =   '|';

    const e1 = defer(() => source);

    expectObservable(e1).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should accept factory returns promise resolves', (done) => {
    const expected = 42;
    const e1 = defer(() => {
      return new Promise<number>((resolve) => { resolve(expected); });
    });

    e1.subscribe((x) => {
      expect(x).to.equal(expected);
      done();
    }, x => {
      done(new Error('should not be called'));
    });
  });

  it('should accept factory returns promise rejects', (done) => {
    const expected = 42;
    const e1 = defer(() => {
      return new Promise<number>((resolve, reject) => { reject(expected); });
    });

    e1.subscribe((x) => {
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

    const e1 = defer(() => source);

    expectObservable(e1).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should create an observable when factory throws', () => {
    const e1 = defer(() => {
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

    const e1 = defer(() => source);

    expectObservable(e1, unsub).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    const source = hot('--a--b--c--|');
    const sourceSubs = '^     !     ';
    const expected =   '--a--b-     ';
    const unsub =      '      !     ';

    const e1 = defer(() => source.mergeMap((x) => Observable.of(x)))
      .mergeMap((x) => Observable.of(x));

    expectObservable(e1, unsub).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });
});
