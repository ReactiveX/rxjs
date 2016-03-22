import * as Rx from '../../dist/cjs/Rx.KitchenSink';
import {expectObservable} from '../helpers/marble-testing';
import {DoneSignature} from '../helpers/test-helper';

const Observable = Rx.Observable;

describe('Observable.if', () => {
  it('should subscribe to thenSource when the conditional returns true', () => {
    const e1 = Observable.if(() => true, Observable.of('a'));
    const expected = '(a|)';

    expectObservable(e1).toBe(expected);
  });

  it('should subscribe to elseSource when the conditional returns false', () => {
    const e1 = Observable.if(() => false, Observable.of('a'), Observable.of('b'));
    const expected = '(b|)';

    expectObservable(e1).toBe(expected);
  });

  it('should complete without an elseSource when the conditional returns false', () => {
    const e1 = Observable.if(() => false, Observable.of('a'));
    const expected = '|';

    expectObservable(e1).toBe(expected);
  });

  it('should raise error when conditional throws', () => {
    const e1 = Observable.if(() => {
      throw 'error';
    }, Observable.of('a'));

    const expected = '#';

    expectObservable(e1).toBe(expected);
  });

  it('should accept resolved promise as thenSource', (done: DoneSignature) => {
    const expected = 42;
    const e1 = Observable.if(() => true, new Promise((resolve: any) => { resolve(expected); }));

    e1.subscribe(x => {
      expect(x).toBe(expected);
    }, (x) => {
      done.fail('should not be called');
    }, () => {
      done();
    });
  });

  it('should accept resolved promise as elseSource', (done: DoneSignature) => {
    const expected = 42;
    const e1 = Observable.if(() => false,
      Observable.of('a'),
      new Promise((resolve: any) => { resolve(expected); }));

    e1.subscribe(x => {
      expect(x).toBe(expected);
      done();
    }, (x) => {
      done.fail('should not be called');
    }, () => {
      done();
    });
  });

  it('should accept rejected promise as elseSource', (done: DoneSignature) => {
    const expected = 42;
    const e1 = Observable.if(() => false,
      Observable.of('a'),
      new Promise((resolve: any, reject: any) => { reject(expected); }));

    e1.subscribe(x => {
      done.fail('should not be called');
    }, (x) => {
      expect(x).toBe(expected);
      done();
    }, () => {
      done.fail();
    });
  });

  it('should accept rejected promise as thenSource', (done: DoneSignature) => {
    const expected = 42;
    const e1 = Observable.if(() => true, new Promise((resolve: any, reject: any) => { reject(expected); }));

    e1.subscribe(x => {
      done.fail('should not be called');
    }, (x) => {
      expect(x).toBe(expected);
      done();
    }, () => {
      done.fail();
    });
  });
});
