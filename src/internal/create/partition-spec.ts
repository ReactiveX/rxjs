import { partition, of } from 'rxjs';
import { expect } from 'chai';

describe('partition', () => {
  it('should split an observable in two', () => {
    const source = of(1, 2, 3, 4, 5, 6);
    const passed: any[] = [];
    const results1: any[] = [];
    const results2: any[] = [];

    const [part1, part2] = partition(source, (value, index) => {
      passed.push(value, index);
      return value % 2 === 0;
    });

    part1.subscribe({
      next(value) { results1.push(value); },
      complete() { results1.push('done'); },
    });

    part2.subscribe({
      next(value) { results2.push(value); },
      complete() { results2.push('done'); },
    });

    // The source is subscribed to twice
    expect(passed).to.deep.equal([1, 0, 2, 1, 3, 2, 4, 3, 5, 4, 6, 5, 1, 0, 2, 1, 3, 2, 4, 3, 5, 4, 6, 5]);
    expect(results1).to.deep.equal([2, 4, 6, 'done']);
    expect(results2).to.deep.equal([1, 3, 5, 'done']);
  });
});
