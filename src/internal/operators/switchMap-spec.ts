import { switchMap } from 'rxjs/internal/operators/switchMap';
import { expect } from 'chai';
import { Subject } from 'rxjs/internal/Subject';

describe('switchMap', () => {
  it('should switchMap', () => {
    const results: any[] = [];
    const source = new Subject<string>();
    const innerSource1 = new Subject<number>();
    const innerSource2 = new Subject<number>();

    const innerSources = {
      innerSource1,
      innerSource2,
    };

    source.pipe(
      switchMap(v => innerSources[v]),
    )
    .subscribe({
      next(value) { results.push(value); },
      complete() { results.push('done'); },
    });

    source.next('innerSource1');
    expect(results).to.deep.equal([]);

    innerSource1.next(0);
    innerSource1.next(1);
    expect(results).to.deep.equal([0, 1]);


    source.next('innerSource2');
    expect(results).to.deep.equal([0, 1]);
    innerSource1.next(-1); // shouldn't show
    innerSource2.next(2);
    innerSource2.next(3);
    innerSource2.complete();
    expect(results).to.deep.equal([0, 1, 2, 3]);

    source.complete();
    expect(results).to.deep.equal([0, 1, 2, 3, 'done']);
  });
});
