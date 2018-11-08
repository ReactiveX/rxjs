import { of } from 'rxjs';
import { pluck } from 'rxjs/operators';

it('should infer correctly', () => {
  const a = of({ name: 'abc', id: 123 }).pipe(pluck('name')); // $ExpectType Observable<string>
});

it('should support nested object of 2 layer depth', () => {
  const a = of({ name: 'def', id: 256, address: { postcode: 2 } }).pipe(pluck('address', 'postcode')); // $ExpectType Observable<number>
});

it('should support nested object of 3 layer depth', () => {
  const a = of({
    name: 'def',
    id: 256,
    address: {
      postcode: {
        x: 1
      }
    }
  }).pipe(pluck('address', 'postcode', 'x')); // $ExpectType Observable<number>
});

it('should support nested object of 4 layer depth', () => {
  const a = of({
    name: 'def',
    id: 256,
    address: {
      postcode: {
        x: {
          y: 1
        }
      }
    }
  }).pipe(pluck('address', 'postcode', 'x', 'y')); // $ExpectType Observable<number>
});

it('should support nested object of 5 layer depth', () => {
  const a = of({
    name: 'def',
    id: 256,
    address: {
      postcode: {
        x: {
          y: {
            z: 1
          }
        }
      }
    }
  }).pipe(pluck('address', 'postcode', 'x', 'y', 'z')); // $ExpectType Observable<number>
});

it('should support nested object of 6 layer depth', () => {
  const a = of({
    name: 'def',
    id: 256,
    address: {
      postcode: {
        x: {
          y: {
            z: {
              aa: 1
            }
          }
        }
      }
    }
  }).pipe(pluck('address', 'postcode', 'x', 'y', 'z', 'aa')); // $ExpectType Observable<number>
});

it('should infer empty interface for more than 6 layer depth', () => {
  const a = of({
    name: 'def',
    id: 256,
    address: {
      postcode: {
        x: {
          y: {
            z: {
              aa: {
                ab: 1
              }
            }
          }
        }
      }
    }
  }).pipe(pluck('address', 'postcode', 'x', 'y', 'z', 'aa', 'ab')); // $ExpectType Observable<{}>
});

it('should infer empty interface for non-existance key', () => {
  const a = of({ name: 'abc', id: 123 }).pipe(pluck('xyz')); // $ExpectType Observable<{}>
});

it('should infer empty interface for empty parameter', () => {
  const a = of({ name: 'abc', id: 123 }).pipe(pluck()); // $ExpectType Observable<{}>
});

it('should accept string only', () => {
  const a = of({ name: 'abc', id: 123}).pipe(pluck(1)); // $ExpectError
});
