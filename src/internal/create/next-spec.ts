import { next } from 'rxjs';
import { expect } from 'chai';

describe('next', () => {
  it('should emit values and completions on microtasks', () => {
    const results: any[] = [];

    // timeout should happen after the microtasks.
    const test1 = new Promise(resolve => {
      setTimeout(() => {
        expect(results).to.deep.equal([1, 2, 3, 'done']);
        resolve();
      });
    });

    // This promise is scheduled before the microtask'ed observable
    // is subscribed to, so results should be empty, because they're
    // scheduled later.
    const test2 = Promise.resolve().then(() => {
      expect(results).to.deep.equal([]);
    });

    next(1, 2, 3).subscribe({
      next(value) { results.push(value); },
      complete() { results.push('done'); },
    });

    // Promise scheduled right after should show the first value, but not the next
    const test3 = Promise.resolve().then(() => {
      expect(results).to.deep.equal([1]);
    });

    // No values should be emitted synchronously
    expect(results).to.deep.equal([]);

    return Promise.all(
      [test1, test2, test3]
    );
  });
});
