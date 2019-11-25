import { of, Observable, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { scan } from 'rxjs/operators';

it('should enforce parameter', () => {
  expectError(of(1, 2, 3).pipe(scan()));
});

it('should infer correctly ', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(scan((x, y, z) => x + 1)));
});

it('should infer correctly for accumulator of type array', () => {
  expectType<Observable<number[]>>(of(1, 2, 3).pipe(scan((x: number[], y: number, i: number) => x, [])));
});

it('should accept seed parameter of the same type', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(scan((x, y, z) => x + 1, 5)));
  expectError(of(1, 2, 3).pipe(scan((x, y, z) => x + 1, [])));
});

it('should accept seed parameter of the seed array type', () => {
  expectType<Observable<number[]>>(of(1, 2, 3).pipe(scan((x, y, z) => { x.push(y); return x; }, [4])));
  // Array must be typed...
  expectError(of(1, 2, 3).pipe(scan((x, y, z) => { x.push(y); return x; }, [])));
});

it('should accept seed parameter of a different type', () => {
  expectType<Observable<string>>(of(1, 2, 3).pipe(scan((x, y, z) => x + '1', '5')));
  const bv: { [key: string]: string } = {};
  expectType<Observable<{ [key: string]: string; }>>(of(1, 2, 3).pipe(scan((x, y, z) => ({ ...x, [y]: y.toString() }), bv)));
});

it('should act appropriately with no seed', () => {
  // Starting in TS 3.5, the return type is inferred from the accumulator's type if it's provided without a seed.
  expectType<Observable<any>>(of(1, 2, 3).pipe(scan((a: any, v) => '' + v)));
  expectType<Observable<number>>(of(1, 2, 3).pipe(scan((a, v) => v)));
  expectType<Observable<number | void>>(of(1, 2, 3).pipe(scan(() => {})));
});

it('should act appropriately with a seed', () => {
  expectType<Observable<string>>(of(1, 2, 3).pipe(scan((a, v) => a + v, '')));
  expectType<Observable<number>>(of(1, 2, 3).pipe(scan((a, v) => a + v, 0)));
  expectError(of(1, 2, 3).pipe(scan((a, v) => a + 1, [])));
});

it('should infer types properly from arguments', () => {
  function toArrayReducer(arr: number[], item: number, index: number): number[] {
    if (index === 0) {
      return [item];
    }
    arr.push(item);
    return arr;
  }

  expectType<OperatorFunction<number, number[]>>(scan(toArrayReducer, [] as number[]));
});
