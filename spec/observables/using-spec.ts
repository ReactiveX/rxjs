import * as Rx from '../../dist/cjs/Rx.KitchenSink';
import {DoneSignature} from '../helpers/test-helper';

const Observable = Rx.Observable;
const Subscription = Rx.Subscription;

describe('Observable.using', () => {
  it('should dispose of the resource when the subscription is disposed', (done: DoneSignature) => {
    let disposed = false;
    const source = Observable.using(
      () => new Subscription(() => disposed = true),
      (resource) => Observable.range(0, 3)
    )
    .take(2);

    source.subscribe();

    if (disposed) {
      done();
    } else {
      done.fail('disposed should be true but was false');
    }
  });

  it('should accept factory returns promise resolves', (done: DoneSignature) => {
    const expected = 42;

    let disposed = false;
    const e1 = Observable.using(
      () => new Subscription(() => disposed = true),
      (resource) => new Promise((resolve: any) => { resolve(expected); }));

    e1.subscribe(x => {
      expect(x).toBe(expected);
    }, (x) => {
      done.fail('should not be called');
    }, () => {
      done();
    });
  });

  it('should accept factory returns promise rejects', (done: DoneSignature) => {
    const expected = 42;

    let disposed = false;
    const e1 = Observable.using(
      () => new Subscription(() => disposed = true),
      (resource) => new Promise((resolve: any, reject: any) => { reject(expected); }));

    e1.subscribe(x => {
      done.fail('should not be called');
    }, (x) => {
      expect(x).toBe(expected);
      done();
    }, () => {
      done.fail('should not be called');
    });
  });

  it('should raise error when resource factory throws', (done: DoneSignature) => {
    const expectedError = 'expected';
    const error = 'error';

    const source = Observable.using(
      () => {
        throw expectedError;
      },
      (resource) => {
        throw error;
      }
    );

    source.subscribe((x) => {
      done.fail('should not be called');
    }, (x) => {
      expect(x).toBe(expectedError);
      done();
    }, () => {
      done.fail();
    });
  });

  it('should raise error when observable factory throws', (done: DoneSignature) => {
    const error = 'error';
    let disposed = false;

    const source = Observable.using(
      () => new Subscription(() => disposed = true),
      (resource) => {
        throw error;
      }
    );

    source.subscribe((x) => {
      done.fail('should not be called');
    }, (x) => {
      expect(x).toBe(error);
      done();
    }, () => {
      done.fail();
    });
  });
});
