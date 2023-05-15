import { expect } from "chai";
import { map, Observable, rx } from "rxjs";

describe('rx', () => {
  it('should work like pipe, convert the first argument to an observable', () => {
    const a = [1, 2, 3];
    const results: any[] = [];
    
    rx(a, map(x => x + 1)).subscribe({
      next: value => results.push(value),
      complete: () => {
        results.push('done');
      }
    })
    expect(results).to.deep.equal([2, 3, 4, 'done'])
  });

  it('should simply convert the first argument to an observable if it is the only thing provided', () => {
    const a = [1, 2, 3];
    const results: any[] = [];
    
    rx(a).subscribe({
      next: value => results.push(value),
      complete: () => {
        results.push('done');
      }
    })
    expect(results).to.deep.equal([1, 2, 3, 'done'])
  });

  it('should allow any kind of custom piping', () => {
    const a = [1, 2, 3];
    const result = rx(a, map(x => x + 1), source => source instanceof Observable)
    expect(result).to.be.true;
  });
});
