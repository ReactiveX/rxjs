import { expect } from 'chai';
import { map, Observable, pipe, rx } from 'rxjs';

describe('pipe', () => {
  it('should exist', () => {
    expect(pipe).to.be.a('function');
  });

  it('should pipe two functions together', () => {
    const a = (x: number) => x + x;
    const b = (x: number) => x - 1;

    const c = pipe(a, b);
    expect(c).to.be.a('function');
    expect(c(1)).to.equal(1);
    expect(c(10)).to.equal(19);
  });

  it('should return the same function if only one is passed', () => {
    const a = <T>(x: T) => x;
    const c = pipe(a);

    expect(c).to.equal(a);
  });

  it('should return the identity if not passed any functions', () => {
    const c = pipe();

    expect(c('whatever')).to.equal('whatever');
    const someObj = {};
    expect(c(someObj)).to.equal(someObj);
  });
});

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
