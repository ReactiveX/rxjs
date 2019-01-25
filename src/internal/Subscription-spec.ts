import { Subscription, Observable, merge, UnsubscriptionError } from 'rxjs';
import { expect } from 'chai';

/** @test {Subscription} */
describe('Subscription', () => {
  it('should be an instanceof Subscription', () => {
    const s = new Subscription();
    expect(s).to.be.an.instanceof(Subscription);
  });

  it('should add children, and unsub in order', () => {
    const results: number[] = [];
    const s = new Subscription();
    s.add(() => results.push(0));
    s.add(() => results.push(1));
    s.add(() => results.push(2));
    const child = new Subscription();
    child.add(() => results.push(3));
    s.add(child);
    s.add(() => results.push(4));

    expect(results).to.deep.equal([]);
    s.unsubscribe();
    expect(results).to.deep.equal([0, 1, 2, 3, 4]);
  });

  it('should set up children to remove themselves', () => {
    const results: number[] = [];

    const parent = new Subscription();

    const child1 = new Subscription();
    child1.add(() => results.push(1));
    const child2 = new Subscription();
    child2.add(() => results.push(2));
    const child3 = new Subscription();
    child3.add(() => results.push(3));

    parent.add(child1);
    parent.add(child2);
    parent.add(child3);

    expect(results).to.deep.equal([]);

    child2.unsubscribe();
    expect(results).to.deep.equal([2]);

    parent.unsubscribe();
    expect(results).to.deep.equal([2, 1, 3]);
  });

  it('should not leak', done => {
    const tearDowns: number[] = [];

    const source1 = new Observable(subscriber => {
      return () => {
        tearDowns.push(1);
      };
    });

    const source2 = new Observable(subscriber => {
      return () => {
        tearDowns.push(2);
        throw new Error('oops, I am a bad unsubscribe!');
      };
    });

    const source3 = new Observable(subscriber => {
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

    const source1 = new Observable(subscriber => {
      return () => {
        tearDowns.push(1);
      };
    });

    const source2 = new Observable(subscriber => {
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

    const source3 = new Observable(subscriber => {
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
    it('should unsubscribe the passed one if the self has been unsubscribed', () => {
      const main = new Subscription();
      main.unsubscribe();

      let isCalled = false;
      const child = new Subscription();
      child.add(() => {
        isCalled = true;
      });
      main.add(child);

      expect(isCalled).to.equal(true);
    });
  });
});
