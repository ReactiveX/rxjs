import {expect} from 'chai';
import * as Rx from '../dist/cjs/Rx';

const Observable = Rx.Observable;
const Subscription = Rx.Subscription;

/** @test {Subscription} */
describe('Subscription', () => {
  it('should not leak', (done: MochaDone) => {
    const tearDowns = [];

    const source1 = Observable.create((observer: Rx.Observer<any>) => {
      return () => {
        tearDowns.push(1);
      };
    });

    const source2 = Observable.create((observer: Rx.Observer<any>) => {
      return () => {
        tearDowns.push(2);
        throw new Error('oops, I am a bad unsubscribe!');
      };
    });

    const source3 = Observable.create((observer: Rx.Observer<any>) => {
      return () => {
        tearDowns.push(3);
      };
    });

    const subscription = Observable.merge(source1, source2, source3).subscribe();

    setTimeout(() => {
      expect(() => {
        subscription.unsubscribe();
      }).to.throw(Rx.UnsubscriptionError);
      expect(tearDowns).to.deep.equal([1, 2, 3]);
      done();
    });
  });

  it('should not leak when adding a bad custom subscription to a subscription', (done: MochaDone) => {
    const tearDowns = [];

    const sub = new Subscription();

    const source1 = Observable.create((observer: Rx.Observer<any>) => {
      return () => {
        tearDowns.push(1);
      };
    });

    const source2 = Observable.create((observer: Rx.Observer<any>) => {
      return () => {
        tearDowns.push(2);
        sub.add(<any>({
          unsubscribe: () => {
            expect(sub.isUnsubscribed).to.be.true;
            throw new Error('Who is your daddy, and what does he do?');
          }
        }));
      };
    });

    const source3 = Observable.create((observer: Rx.Observer<any>) => {
      return () => {
        tearDowns.push(3);
      };
    });

    sub.add(Observable.merge(source1, source2, source3).subscribe());

    setTimeout(() => {
      expect(() => {
        sub.unsubscribe();
      }).to.throw(Rx.UnsubscriptionError);
      expect(tearDowns).to.deep.equal([1, 2, 3]);
      done();
    });
  });
});