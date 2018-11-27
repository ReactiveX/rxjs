import * as Rx from 'rxjs/Rx';

const Observable = Rx.Observable;

it('should infer correctly', () => {
  const o = Observable.of('a', 'b', 'c').partition((value, index) => true); // $ExpectType [Observable<string>, Observable<string>]
  const p = Observable.of('a', 'b', 'c').partition(() => true); // $ExpectType [Observable<string>, Observable<string>]
});

it('should accept a thisArg parameter', () => {
  const o = Observable.of('a', 'b', 'c').partition(() => true, 5); // $ExpectType [Observable<string>, Observable<string>]
});

it('should enforce types', () => {
  const o = Observable.of('a', 'b', 'c').partition(); // $ExpectError
});

it('should enforce predicate types', () => {
  const o = Observable.of('a', 'b', 'c').partition('nope'); // $ExpectError
  const p = Observable.of('a', 'b', 'c').partition((value: number) => true); // $ExpectError
  const q = Observable.of('a', 'b', 'c').partition((value, index: string) => true); // $ExpectError
});
