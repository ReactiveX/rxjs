import { groupBy } from './groupBy';
import { expect } from 'chai';
import { of } from '../create/of';
import { mergeMap } from './mergeMap';

describe('groupBy', () => {
  it('should group things', () => {
    const results: any[] = [];
    const groupEvens: any[] = [];
    const groupOdds: any[] = [];

    of(1, 2, 3, 4, 5, 6, 7, 8).pipe(
      groupBy(x => x % 2 === 0),
    )
    .subscribe({
      next(group) {
        results.push(group.key);
        group.subscribe({
          next(value: any) {
            (group.key ? groupEvens : groupOdds).push(value);
          },
          complete() {
            (group.key ? groupEvens : groupOdds).push('done');
          }
        })
      },
      complete() { results.push('done'); },
    });

    expect(results).to.deep.equal([false, true, 'done']);
    expect(groupEvens).to.deep.equal([2, 4, 6, 8, 'done']);
    expect(groupOdds).to.deep.equal([1, 3, 5, 7, 'done']);
  });
});
