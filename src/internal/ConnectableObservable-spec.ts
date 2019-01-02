import { Subject, Subscription, ConnectableObservable, of } from 'rxjs';
import { expect } from 'chai';

describe('ConnectableObservable', () => {
  it('should connect when connect is called', () => {
    const results1: any[] = [];
    const results2: any[] = [];

    const source = of(1, 2, 3);

    const connectable = new ConnectableObservable(source, new Subject());

    connectable.subscribe({
      next(value) { results1.push(value); },
      complete() { results1.push('done'); },
    });

    connectable.subscribe({
      next(value) { results2.push(value); },
      complete() { results2.push('done'); },
    });

    expect(results1).to.deep.equal([]);
    expect(results2).to.deep.equal([]);

    const subs = connectable.connect();

    expect(subs).to.be.an.instanceof(Subscription);

    expect(results1).to.deep.equal([1, 2, 3, 'done']);
    expect(results2).to.deep.equal([1, 2, 3, 'done']);
  });
});
