import {expect} from 'chai';
import * as Rx from '../../dist/cjs/Rx';

const Observable = Rx.Observable;

/** @test {finally} */
describe('Observable.prototype.finally', () => {
  it('should call finally after complete', (done: MochaDone) => {
    let completed = false;
    Observable.of(1, 2, 3, Rx.Scheduler.none)
      .finally(() => {
        expect(completed).to.be.true;
        done();
      })
      .subscribe(null, null, () => {
        completed = true;
      });
  });

  it('should call finally after error', (done: MochaDone) => {
    let thrown = false;
    Observable.of(1, 2, 3, Rx.Scheduler.none)
      .map(function (x) {
        if (x === 3) {
          throw x;
        }
        return x;
      })
      .finally(() => {
        expect(thrown).to.be.true;
        done();
      })
      .subscribe(null, () => {
        thrown = true;
      });
  });

  it('should call finally upon disposal', (done: MochaDone) => {
    let disposed = false;
    const subscription = Observable
      .timer(100)
      .finally(() => {
        expect(disposed).to.be.true;
        done();
      }).subscribe();
    disposed = true;
    subscription.unsubscribe();
  });

  it('should call finally when synchronously subscribing to and unsubscribing ' +
  'from a shared Observable', (done: MochaDone) => {
    Observable.interval(50)
      .finally(done)
      .share()
      .subscribe()
      .unsubscribe();
  });

  it('should call two finally instances in succession on a shared Observable', (done: MochaDone) => {
    let invoked = 0;
    function checkFinally() {
      invoked += 1;
      if (invoked === 2) {
        done();
      }
    }

    Observable.of(1, 2, 3, Rx.Scheduler.none)
      .finally(checkFinally)
      .finally(checkFinally)
      .share()
      .subscribe();
  });
});