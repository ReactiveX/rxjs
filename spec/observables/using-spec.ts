import { expect } from 'chai';
import { using, range, Subscription } from 'rxjs';

describe('using', () => {
  it('should dispose of the resource when the subscription is disposed', (done) => {
    let disposed = false;
    const source = using(
      () => new Subscription(() => disposed = true),
      (resource) => range(0, 3),
      (resource) => resource && resource.unsubscribe()
    )
    .take(2);

    source.subscribe();

    if (disposed) {
      done();
    } else {
      done(new Error('disposed should be true but was false'));
    }
  });

  it('should dispose of a non-observable resource when the subscription is disposed', (done) => {
    let disposed = false;

    class DisposableThing {
      dispose() {
        disposed = true;
      }
    }

    const source = using(
      () => new DisposableThing(),
      (resource) => range(0, 3),
      (resource) => resource && resource.dispose()
    )
    .take(2);

    source.subscribe();

    if (disposed) {
      done();
    } else {
      done(new Error('disposed should be true but was false'));
    }
  });

  it('should accept factory returns promise resolves', (done: MochaDone) => {
    const expected = 42;

    let disposed = false;
    const e1 = using(
      () => new Subscription(() => disposed = true),
      (resource) => new Promise((resolve: any) => { resolve(expected); }),
      (resource) => resource && resource.unsubscribe());

    e1.subscribe(x => {
      expect(x).to.equal(expected);
    }, (x) => {
      done(new Error('should not be called'));
    }, () => {
      done();
    });
  });

  it('should accept factory returns promise rejects', (done: MochaDone) => {
    const expected = 42;

    let disposed = false;
    const e1 = using(
      () => new Subscription(() => disposed = true),
      (resource) => new Promise((resolve: any, reject: any) => { reject(expected); }),
      (resource) => resource && resource.unsubscribe()
    );

    e1.subscribe(x => {
      done(new Error('should not be called'));
    }, (x) => {
      expect(x).to.equal(expected);
      done();
    }, () => {
      done(new Error('should not be called'));
    });
  });

  it('should raise error when resource factory throws', (done: MochaDone) => {
    const expectedError = 'expected';
    const error = 'error';

    const source = using(
      () => {
        throw expectedError;
      },
      (resource) => {
        throw error;
      },
      () => {
        throw error;
      }
    );

    source.subscribe((x) => {
      done(new Error('should not be called'));
    }, (x) => {
      expect(x).to.equal(expectedError);
      done();
    }, () => {
      done(new Error('should not be called'));
    });
  });

  it('should raise error when observable factory throws', (done: MochaDone) => {
    const expected = 'expected';
    const error = 'error';
    let disposed = false;

    const source = using(
      () => new Subscription(() => disposed = true),
      (resource) => {
        throw error;
      },
      (resource) => resource && resource.unsubscribe()
    );

    source.subscribe((x) => {
      done(new Error('should not be called'));
    }, (x) => {
      expect(x).to.equal(expected);
      done();
    }, () => {
      done(new Error('should not be called'));
    });
  });
});
