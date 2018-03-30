import { expect } from 'chai';
import { iif, of } from 'rxjs';
import { expectObservable } from '../helpers/marble-testing';

describe('iif', () => {
  it('should subscribe to thenSource when the conditional returns true', () => {
    const e1 = iif(() => true, of('a'));
    const expected = '(a|)';

    expectObservable(e1).toBe(expected);
  });

  it('should subscribe to elseSource when the conditional returns false', () => {
    const e1 = iif(() => false, of('a'), of('b'));
    const expected = '(b|)';

    expectObservable(e1).toBe(expected);
  });

  it('should complete without an elseSource when the conditional returns false', () => {
    const e1 = iif(() => false, of('a'));
    const expected = '|';

    expectObservable(e1).toBe(expected);
  });

  it('should raise error when conditional throws', () => {
    const e1 = iif(<any>(() => {
      throw 'error';
    }), of('a'));

    const expected = '#';

    expectObservable(e1).toBe(expected);
  });

  it('should accept resolved promise as thenSource', (done: MochaDone) => {
    const expected = 42;
    const e1 = iif(() => true, new Promise((resolve: any) => { resolve(expected); }));

    e1.subscribe(x => {
      expect(x).to.equal(expected);
    }, (x) => {
      done(new Error('should not be called'));
    }, () => {
      done();
    });
  });

  it('should accept resolved promise as elseSource', (done: MochaDone) => {
    const expected = 42;
    const e1 = iif(() => false,
      of('a'),
      new Promise((resolve: any) => { resolve(expected); }));

    e1.subscribe(x => {
      expect(x).to.equal(expected);
    }, (x) => {
      done(new Error('should not be called'));
    }, () => {
      done();
    });
  });

  it('should accept rejected promise as elseSource', (done: MochaDone) => {
    const expected = 42;
    const e1 = iif(() => false,
      of('a'),
      new Promise((resolve: any, reject: any) => { reject(expected); }));

    e1.subscribe(x => {
      done(new Error('should not be called'));
    }, (x) => {
      expect(x).to.equal(expected);
      done();
    }, () => {
      done(new Error('should not be called'));
    });
  });

  it('should accept rejected promise as thenSource', (done: MochaDone) => {
    const expected = 42;
    const e1 = iif(() => true, new Promise((resolve: any, reject: any) => { reject(expected); }));

    e1.subscribe(x => {
      done(new Error('should not be called'));
    }, (x) => {
      expect(x).to.equal(expected);
      done();
    }, () => {
      done(new Error('should not be called'));
    });
  });
});
