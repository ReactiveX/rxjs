import { of, OperatorFunction } from 'rxjs';
import { reduce } from 'rxjs/operators';

it('should enforce parameter', () => {
  const a = of(1, 2, 3).pipe(reduce()); // $ExpectError
});

it('should infer correctly ', () => {
  const a = of(1, 2, 3).pipe(reduce((x, y, z) => x + 1)); // $ExpectType Observable<number>
});

it('should infer correctly for accumulator of type array', () => {
  const a = of(1, 2, 3).pipe(reduce((x: number[], y: number, i: number) => x, [])); // $ExpectType Observable<number[]>
});

it('should accept seed parameter of the same type', () => {
  const a = of(1, 2, 3).pipe(reduce((x, y, z) => x + 1, 5)); // $ExpectType Observable<number>
  const b = of(1, 2, 3).pipe(reduce((x, y, z) => x + 1, [])); // $ExpectError
});

it('should accept seed parameter of the seed array type', () => {
  const a = of(1, 2, 3).pipe(reduce((x, y, z) => { x.push(y); return x; }, [4])); // $ExpectType Observable<number[]>
  // Array must be typed...
  const b = of(1, 2, 3).pipe(reduce((x, y, z) => { x.push(y); return x; }, [])); // $ExpectError
});

it('should accept seed parameter of a different type', () => {
  const a = of(1, 2, 3).pipe(reduce((x, y, z) => x + '1', '5')); // $ExpectType Observable<string>
  const bv: { [key: string]: string } = {};
  const b = of(1, 2, 3).pipe(reduce((x, y, z) => ({ ...x, [y]: y.toString() }), bv)); // $ExpectType Observable<{ [key: string]: string; }>
});

it('should act appropriately with no seed', () => {
  // Starting in TS 3.5, the return type is inferred from the accumulator's type if it's provided without a seed.
  const a = of(1, 2, 3).pipe(reduce((a: any, v) => '' + v)); // $ExpectType Observable<any>
  const b = of(1, 2, 3).pipe(reduce((a, v) => v)); // $ExpectType Observable<number>
  const c = of(1, 2, 3).pipe(reduce(() => {})); // $ExpectType Observable<number | void>
});

it('should act appropriately with a seed', () => {
  const a = of(1, 2, 3).pipe(reduce((a, v) => a + v, '')); // $ExpectType Observable<string>
  const b = of(1, 2, 3).pipe(reduce((a, v) => a + v, 0)); // $ExpectType Observable<number>
  const c = of(1, 2, 3).pipe(reduce((a, v) => a + 1, [])); // $ExpectError
});

it('should infer types properly from arguments', () => {
  function toArrayReducer(arr: number[], item: number, index: number): number[] {
    if (index === 0) {
      return [item];
    }
    arr.push(item);
    return arr;
  }

  const a = reduce(toArrayReducer, [] as number[]); // $ExpectType OperatorFunction<number, number[]>
});
