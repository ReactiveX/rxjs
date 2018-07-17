import { expect } from 'chai';
import { Observable } from 'rxjs';
import { shareReplay, take } from 'rxjs/operators';

describe('shareReplay', () => {
  it('should shareReplay emitted values', (done: MochaDone) => {
    const results1: any[] = [];
    const results2: any[] = [];
    let subscriptions = 0;
    let assert: () => void;

    const source = new Observable<number>(subscriber => {
      subscriptions++;
      let i = 0;
      const id = setInterval(() => subscriber.next(i++));
      return () => {
        clearInterval(id);
        assert();
      };
    });

    const shared = source.pipe(
      take(3),
      shareReplay(),
    );

    expect(subscriptions).to.equal(0);

    shared.subscribe({
      next(value) { results1.push(value); },
      complete() { results1.push('done'); },
    });
    expect(subscriptions).to.equal(1);


    shared.subscribe({
      next(value) { results2.push(value); },
      complete() { results2.push('done'); },
    });
    expect(subscriptions).to.equal(1);

    assert = () => {
      expect(results1).to.deep.equal([0, 1, 2, 'done']);
      expect(results2).to.deep.equal([0, 1, 2, 'done']);
      expect(subscriptions).to.equal(1);
      done();
    };
  });
});
