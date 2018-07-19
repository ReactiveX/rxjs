import { Subscription, SubsCmd } from 'rxjs/internal/Subscription';
import { expect } from 'chai';

describe('Subscription', () => {
  it('should be an instanceof Subscription', () => {
    const s = new Subscription();
    expect(s).to.be.an.instanceof(Subscription);
  });

  it('should take a teardown function', () => {
    let fired = false;
    const s = new Subscription(() => fired = true);
    expect(fired).to.be.false;
    s.unsubscribe();
    expect(fired).to.be.true;
  });

  it('should add children, and unsub in order', () => {
    const results: number[] = [];
    const s = new Subscription(() => results.push(0));
    s.add(() => results.push(1));
    s.add(() => results.push(2));
    s.add(new Subscription(() => results.push(3)));
    s.add(() => results.push(4));

    expect(results).to.deep.equal([]);
    s.unsubscribe();
    expect(results).to.deep.equal([0, 1, 2, 3, 4]);
  });

  it('should set up children to remove themselves', () => {
    const results: number[] = [];

    const parent = new Subscription();

    const child1 = new Subscription(() => results.push(1));
    const child2 = new Subscription(() => results.push(2));
    const child3 = new Subscription(() => results.push(3));

    parent.add(child1, child2, child3);

    expect(results).to.deep.equal([]);

    child2.unsubscribe();
    expect(results).to.deep.equal([2]);

    parent.unsubscribe();
    expect(results).to.deep.equal([2, 1, 3]);
  });
});
