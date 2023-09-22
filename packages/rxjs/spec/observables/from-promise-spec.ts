import { expect } from 'chai';
import * as sinon from 'sinon';
import { from } from 'rxjs';

/** @test {fromPromise} */
describe('from (fromPromise)', () => {
  it('should emit one value from a resolved promise', (done) => {
    const promise = Promise.resolve(42);
    from(promise)
      .subscribe(
        { next: (x) => { expect(x).to.equal(42); }, error: (x) => {
          done(new Error('should not be called'));
        }, complete: () => {
          done();
        } });
  });

  it('should raise error from a rejected promise', (done) => {
    const promise = Promise.reject('bad');
    from(promise)
      .subscribe({ next: (x) => {
          done(new Error('should not be called'));
        }, error: (e) => {
          expect(e).to.equal('bad');
          done();
        }, complete: () => {
         done(new Error('should not be called'));
       } });
  });

  it('should share the underlying promise with multiple subscribers', (done) => {
    const promise = Promise.resolve(42);
    const observable = from(promise);

    observable
      .subscribe(
        { next: (x) => { expect(x).to.equal(42); }, error: (x) => {
          done(new Error('should not be called'));
        } });
    setTimeout(() => {
      observable
        .subscribe(
          { next: (x) => { expect(x).to.equal(42); }, error: (x) => {
            done(new Error('should not be called'));
          }, complete: () => {
            done();
          } });
    });
  });

  it('should accept already-resolved Promise', (done) => {
    const promise = Promise.resolve(42);
    promise.then((x) => {
      expect(x).to.equal(42);
      from(promise)
        .subscribe(
          { next: (y) => { expect(y).to.equal(42); }, error: (x) => {
            done(new Error('should not be called'));
          }, complete: () => {
            done();
          } });
    }, () => {
      done(new Error('should not be called'));
    });
  });

  it('should accept PromiseLike object for interoperability', (done) => {
    class CustomPromise<T> implements PromiseLike<T> {
      constructor(private promise: PromiseLike<T>) {
      }
      then<TResult1 = T, TResult2 = T>(
        onFulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
        onRejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): PromiseLike<TResult1 | TResult2> {
        return new CustomPromise(this.promise.then(onFulfilled, onRejected));
      }
    }
    const promise = new CustomPromise(Promise.resolve(42));
    from(promise)
      .subscribe(
        { next: (x) => { expect(x).to.equal(42); }, error: () => {
          done(new Error('should not be called'));
        }, complete: () => {
          done();
        } });
  });

  it('should not emit, throw or complete if immediately unsubscribed', (done) => {
    const nextSpy = sinon.spy();
    const throwSpy = sinon.spy();
    const completeSpy = sinon.spy();
    const promise = Promise.resolve(42);
    const subscription = from(promise)
      .subscribe({ next: nextSpy, error: throwSpy, complete: completeSpy });
    subscription.unsubscribe();

    setTimeout(() => {
      expect(nextSpy).not.have.been.called;
      expect(throwSpy).not.have.been.called;
      expect(completeSpy).not.have.been.called;
      done();
    });
  });
});
