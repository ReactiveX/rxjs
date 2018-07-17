import { concatMap, take, map, tap, } from 'rxjs/operators';
import { interval, of } from 'rxjs';
import { expect } from 'chai';

describe('concatMap', () => {
  it('should do a basic concat map', (done: MochaDone) => {
    const results: any[] = [];

    const source = of('a', 'b');
    source.pipe(
      concatMap(n => interval(10).pipe(
        take(3),
        map(m => `${n}-${m}`),
      )),
    )
    .subscribe({
      next(value) { results.push(value); },
      complete() {
        results.push('done');
        expect(results).to.deep.equal(['a-0', 'a-1', 'a-2', 'b-0', 'b-1', 'b-2', 'done']);
        done();
      },
    });
  });
});
