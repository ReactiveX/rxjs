/** @prettier */
import { expect } from 'chai';
import { Observer, pipe, Subject, Unsubscribable, map, filter, take } from 'rxjs';

/**
 * An observable that does not have lift.
 */
class PrimitiveObservableFixture<T> {
  subscriptionCount = 0;
  unsubscriptionCount = 0;
  private _subject = new Subject<T>();

  next(value: T) {
    this._subject.next(value);
  }

  error(error: any) {
    this._subject.error(error);
  }

  complete() {
    this._subject.complete();
  }

  subscribe(observer: Observer<T>): Unsubscribable {
    this.subscriptionCount++;
    const sub = this._subject.subscribe(observer);
    return {
      unsubscribe: () => {
        sub.unsubscribe();
        this.unsubscriptionCount++;
      },
    };
  }
}

describe('operating on non-lifted observables', () => {
  it('should work in a general sense', () => {
    const source = new PrimitiveObservableFixture<number>();

    const result = pipe(
      filter((x: number) => x > 0),
      map((x) => x + x),
      take(3)
    )(source);

    const results: any[] = [];

    const subs = result.subscribe({
      next: (value) => results.push(value),
      complete: () => {
        results.push('done');
      },
    });

    expect(source.subscriptionCount).to.equal(1);
    expect(source.unsubscriptionCount).to.equal(0);

    source.next(-1);
    source.next(0);
    expect(results).to.deep.equal([]);

    source.next(1);
    expect(results).to.deep.equal([2]);

    source.next(2);
    expect(results).to.deep.equal([2, 4]);

    source.next(3);
    expect(results).to.deep.equal([2, 4, 6, 'done']);
    expect(source.unsubscriptionCount).to.equal(1);
    expect(source.subscriptionCount).to.equal(1);

    source.next(4);
    expect(results).to.deep.equal([2, 4, 6, 'done']);

    subs.unsubscribe();
  });
});
