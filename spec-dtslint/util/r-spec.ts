import { r, map, of, toArray, filter } from 'rxjs';


it('should infer conversions from ObservableInputs', () => {
  const o1 = r([1, 2, 3]); // $ExpectType Observable<number>
  const o2 = r(new Set<number>()); // $ExpectType Observable<number>
  const o3 = r(new Map<string, number>()); // $ExpectType Observable<[string, number]>
  const o4 = r(of(1, 2, 3)); // $ExpectType Observable<number>
  const o5 = r(Promise.resolve(1)); // $ExpectType Observable<number>
  const o6 = r(Promise.resolve([1, 2, 3])); // $ExpectType Observable<number[]>

  function* test() {
    yield 1;
    yield 2;
    yield 3;
  }

  const o7 = r(test()); // $ExpectType Observable<1 | 2 | 3>
  
  async function* test2() {
    yield 1;
    yield 2;
    yield 3;
  }

  const o8 = r(test2()); // $ExpectType Observable<1 | 2 | 3>
  const o9 = r({}); // $ExpectError
});

it('should compose with pipeable functions, passing an Observable to the first of those functions', () => {
  const o1 = r([1, 2, 3], map(n => n + 1)); // $ExpectType Observable<number>
  const o2 = r([1, 2, 3], map(n => n + 1), filter(n => n < 3)); // $ExpectType Observable<number>
  const o3 = r([1, 2, 3], map(n => n + 1), filter(n => n < 3), toArray()); // $ExpectType Observable<number[]>
  const o4 = r([1, 2, 3], map(n => n + 1), filter(n => n < 3), toArray(), map(n => n.length)); // $ExpectType Observable<number>

  // Even with unary functions that are not RxJS operators
  const o5 = r([1, 2, 3], map(n => n + 1), toArray(), source => Object.keys(source), keys => keys.length); // $ExpectType number
  
  // Maybe as a means of subscription
  const o6 = r([1, 2, 3], map(n => n + 1), toArray(), source => source.subscribe()); // $ExpectType Subscription
})
