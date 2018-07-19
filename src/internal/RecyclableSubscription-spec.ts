import { RecyclableSubscription } from "rxjs/internal/RecyclableSubscription";
import { expect } from 'chai';

describe('RecyclableSubscription', () => {
  it('should recycle teardowns, but not close the subscription', () => {
    const sub = new RecyclableSubscription();
    let teardowns = 0;
    sub.add(() => teardowns++);
    sub.add(() => teardowns++);
    sub.add(() => teardowns++);

    expect(teardowns).to.equal(0);

    sub.recycle();
    expect(teardowns).to.equal(3);

    sub.recycle();
    expect(teardowns).to.equal(3);

    sub.add(() => teardowns++);
    sub.add(() => teardowns++);
    sub.add(() => teardowns++);
    sub.recycle();
    expect(teardowns).to.equal(6);
  });
});
