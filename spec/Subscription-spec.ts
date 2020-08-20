import { expect } from 'chai';
import { Observable, UnsubscriptionError, Subscription, merge } from 'rxjs';

/** @test {Subscription} */
describe('Subscription', () => {
  describe('add()', () => {
    it('should unsubscribe child subscriptions', () => {
      const main = new Subscription();
      
      let isCalled = false;
      const child = new Subscription(() => {
        isCalled = true;
      });
      main.add(child);
      main.unsubscribe();

      expect(isCalled).to.equal(true);
    });

    it('should unsubscribe child subscriptions if it has already been unsubscribed', () => {
      const main = new Subscription();
      main.unsubscribe();

      let isCalled = false;
      const child = new Subscription(() => {
        isCalled = true;
      });
      main.add(child);

      expect(isCalled).to.equal(true);
    });

    it('should unsubscribe a teardown function that was passed', () => {
      let isCalled = false;
      const main = new Subscription();
      main.add(() => {
        isCalled = true;
      });
      main.unsubscribe();
      expect(isCalled).to.be.true;
    });

    it('should unsubscribe a teardown function that was passed immediately if it has been unsubscribed', () => {
      let isCalled = false;
      const main = new Subscription();
      main.unsubscribe();
      main.add(() => {
        isCalled = true;
      });
      expect(isCalled).to.be.true;
    });

    it('should unsubscribe an Unsubscribable when unsubscribed', () => {
      let isCalled = false;
      const main = new Subscription();
      main.add({
        unsubscribe() {
          isCalled = true;
        }
      });
      main.unsubscribe();
      expect(isCalled).to.be.true;
    });

    it('should unsubscribe an Unsubscribable if it is already unsubscribed', () => {
      let isCalled = false;
      const main = new Subscription();
      main.unsubscribe();
      main.add({
        unsubscribe() {
          isCalled = true;
        }
      });
      expect(isCalled).to.be.true;
    });
  });

  describe('remove()', () => {
    it('should remove added Subscriptions', () => {
      let isCalled = false;
      const main = new Subscription();
      const child = new Subscription(() => {
        isCalled = true;
      });
      main.add(child);
      main.remove(child);
      main.unsubscribe();
      expect(isCalled).to.be.false;
    });

    it('should remove added functions', () => {
      let isCalled = false;
      const main = new Subscription();
      const teardown = () => {
        isCalled = true;
      };
      main.add(teardown);
      main.remove(teardown);
      main.unsubscribe();
      expect(isCalled).to.be.false;
    });

    it('should remove added unsubscribables', () => {
      let isCalled = false;
      const main = new Subscription();
      const unsubscribable = {
        unsubscribe() {
          isCalled = true;
        }
      }
      main.add(unsubscribable);
      main.remove(unsubscribable);
      main.unsubscribe();
      expect(isCalled).to.be.false;
    });
  });

  describe('unsubscribe()', () => {
    it('Should unsubscribe from all subscriptions, when some of them throw', done => {
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

    it('Should unsubscribe from all subscriptions, when adding a bad custom subscription to a subscription', done => {
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

    it('Should have idempotent unsubscription', () => {
      let count = 0;
      const subscription = new Subscription(() => ++count);
      expect(count).to.equal(0);

      subscription.unsubscribe();
      expect(count).to.equal(1);

      subscription.unsubscribe();
      expect(count).to.equal(1);
    });
  });
});
