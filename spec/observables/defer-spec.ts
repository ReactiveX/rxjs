import * as Rx from '../../dist/cjs/Rx';
import {DoneSignature} from '../helpers/test-helper';
declare const {hot, expectObservable, expectSubscriptions, type};

const Observable = Rx.Observable;

/** @test {defer} */
describe('Observable.defer', () => {
  it('should create an observable from the provided observbale factory', () => {
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

  it('should accept factory returns promise resolves', (done: DoneSignature) => {
    const expected = 42;
    const e1 = Observable.defer(() => {
      return new Promise((resolve: any) => { resolve(expected); });
    });

    e1.subscribe((x: number) => {
      expect(x).toBe(expected);
      done();
    }, x => {
      done.fail();
    });
  });

  it('should accept factory returns promise rejects', (done: DoneSignature) => {
    const expected = 42;
    const e1 = Observable.defer(() => {
      return new Promise((resolve: any, reject: any) => { reject(expected); });
    });

    e1.subscribe((x: number) => {
      done.fail();
    }, x => {
      expect(x).toBe(expected);
      done();
    }, () => {
      done.fail();
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

    const e1 = Observable.defer(() => source.mergeMap((x: string) => Observable.of(x)))
      .mergeMap((x: string) => Observable.of(x));

    expectObservable(e1, unsub).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });
});
