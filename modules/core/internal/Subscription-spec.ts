import { Subscription } from './Subscription';
import { expect } from 'chai';
import { FOType } from './types';

describe('Subscription', () => {
  it('should be an instanceof Subscription and a function', () => {
    const s = new Subscription();
    expect(s).to.be.an.instanceof(Subscription);
    expect(s).to.be.a('function');
  });

  it('should take a teardown function', () => {
    let fired = false;
    const s = new Subscription(() => fired = true);
    expect(fired).to.be.false;
    s.unsubscribe();
    expect(fired).to.be.true;
  });

  it('should execute as a FObs', () => {
    let fired = false;
    const s = new Subscription(() => fired = true);
    expect(fired).to.be.false;
    s(FOType.COMPLETE, undefined);
    expect(fired).to.be.true;
  });

  it('should add children, and unsub in order', () => {
    const results: number[] = [];
    let i = 0;
    const s = new Subscription(() => results.push(i++));
    s.add(() => results.push(i++));
    s.add(() => results.push(i++));
    s.add(new Subscription(() => results.push(i++)));
    s.add(() => results.push(i++));

    expect(results).to.deep.equal([]);
    s.unsubscribe();
    expect(results).to.deep.equal([0, 1, 2, 3, 4])
  });
});
