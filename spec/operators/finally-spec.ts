import * as Rx from '../../dist/cjs/Rx';
import {DoneSignature} from '../helpers/test-helper';

const Observable = Rx.Observable;

/** @test {finally} */
describe('Observable.prototype.finally', () => {
  it('should call finally after complete', (done: DoneSignature) => {
    let completed = false;
    Observable.of(1, 2, 3)
      .finally(() => {
        expect(completed).toBe(true);
        done();
      })
      .subscribe(null, null, () => {
        completed = true;
      });
  });

  it('should call finally after error', (done: DoneSignature) => {
    let thrown = false;
    Observable.of(1, 2, 3)
      .map(function (x) {
        if (x === 3) {
          throw x;
        }
        return x;
      })
      .finally(() => {
        expect(thrown).toBe(true);
        done();
      })
      .subscribe(null, () => {
        thrown = true;
      });
  });

  it('should call finally upon disposal', (done: DoneSignature) => {
    let disposed = false;
    const subscription = Observable
      .timer(100)
      .finally(() => {
        expect(disposed).toBe(true);
        done();
      }).subscribe();
    disposed = true;
    subscription.unsubscribe();
  });

  it('should call finally when synchronously subscribing to and unsubscribing ' +
  'from a shared Observable', (done: DoneSignature) => {
    Observable.interval(50)
      .finally(done)
      .share()
      .subscribe()
      .unsubscribe();
  });

  it('should call two finally instances in succession on a shared Observable', (done: DoneSignature) => {
    let invoked = 0;
    function checkFinally() {
      invoked += 1;
      if (invoked === 2) {
        done();
      }
    }

    Observable.of(1, 2, 3)
      .finally(checkFinally)
      .finally(checkFinally)
      .share()
      .subscribe();
  });
});