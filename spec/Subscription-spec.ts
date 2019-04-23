import { expect } from 'chai';
import { Observable, UnsubscriptionError, Subscription, merge } from 'rxjs';

/** @test {Subscription} */
describe('Subscription', () => {
  it('should not leak', done => {
    const tearDowns: number[] = [];

    const source1 = new Observable(() => {
      return () => {
        tearDowns.push(1);
      };
    });

    const source2 = new Observable(() => {
      return () => {
        tearDowns.push(2);
        throw new Error('oops, I am a bad unsubscribe!');
      };
    });

    const source3 = new Observable(() => {
      return () => {
        tearDowns.push(3);
      };
    });

    const subscription = merge(source1, source2, source3).subscribe();

    setTimeout(() => {
      expect(() => {
        subscription.unsubscribe();
      }).to.throw(UnsubscriptionError);
      expect(tearDowns).to.deep.equal([1, 2, 3]);
      done();
    });
  });

  it('should not leak when adding a bad custom subscription to a subscription', done => {
    const tearDowns: number[] = [];

    const sub = new Subscription();

    const source1 = new Observable(() => {
      return () => {
        tearDowns.push(1);
      };
    });

    const source2 = new Observable(() => {
      return () => {
        tearDowns.push(2);
        sub.add(<any>({
          unsubscribe: () => {
            expect(sub.closed).to.be.true;
            throw new Error('Who is your daddy, and what does he do?');
          }
        }));
      };
    });

    const source3 = new Observable(() => {
      return () => {
        tearDowns.push(3);
      };
    });

    sub.add(merge(source1, source2, source3).subscribe());

    setTimeout(() => {
      expect(() => {
        sub.unsubscribe();
      }).to.throw(UnsubscriptionError);
      expect(tearDowns).to.deep.equal([1, 2, 3]);
      done();
    });
  });

  describe('Subscription.add()', () => {
    it('Should returns the self if the self is passed', () => {
      const sub = new Subscription();
      const ret = sub.add(sub);

      expect(ret).to.equal(sub);
    });

    it('Should returns Subscription.EMPTY if it is passed', () => {
      const sub = new Subscription();
      const ret = sub.add(Subscription.EMPTY);

      expect(ret).to.equal(Subscription.EMPTY);
    });

    it('Should returns Subscription.EMPTY if it is called with `void` value', () => {
      const sub = new Subscription();
      const ret = sub.add(undefined);
      expect(ret).to.equal(Subscription.EMPTY);
    });

    it('Should returns a new Subscription created with teardown function if it is passed a function', () => {
      const sub = new Subscription();

      let isCalled = false;
      const ret = sub.add(function() {
        isCalled = true;
      });
      ret.unsubscribe();

      expect(isCalled).to.equal(true);
    });

    it('Should wrap the AnonymousSubscription and return a subscription that unsubscribes and removes it when unsubbed', () => {
      const sub: any = new Subscription();
      let called = false;
      const arg = {
        unsubscribe: () => called = true,
      };
      const ret = sub.add(arg);

      expect(called).to.equal(false);
      expect(sub._subscriptions.length).to.equal(1);
      ret.unsubscribe();
      expect(called).to.equal(true);
      expect(sub._subscriptions.length).to.equal(0);
    });

    it('Should returns the passed one if passed a AnonymousSubscription having not function `unsubscribe` member', () => {
      const sub = new Subscription();
      const arg = {
        isUnsubscribed: false,
        unsubscribe: undefined as any,
      };
      const ret = sub.add(arg as any);

      expect(ret).to.equal(arg);
    });

    it('Should returns the passed one if the self has been unsubscribed', () => {
      const main = new Subscription();
      main.unsubscribe();

      const child = new Subscription();
      const ret = main.add(child);

      expect(ret).to.equal(child);
    });

    it('Should unsubscribe the passed one if the self has been unsubscribed', () => {
      const main = new Subscription();
      main.unsubscribe();

      let isCalled = false;
      const child = new Subscription(() => {
        isCalled = true;
      });
      main.add(child);

      expect(isCalled).to.equal(true);
    });
  });
});
