import { of, Observable } from 'rxjs';
import { every } from 'rxjs/operators';

it('should infer correctly', () => {
  const a = of(1, 2, 3).pipe(every(val => val < 3)); // $ExpectType Observable<boolean>
});

it('should support index and its type', () => {
  const a = of(1, 2, 3).pipe(every((val, index: number) => val < 3)); // $ExpectType Observable<boolean>
});

it('should support index and its type', () => {
  const a = of(1, 2, 3).pipe(every((val, index: number) => index < 3)); // $ExpectType Observable<boolean>
});

it('should infer source observable type in parameter', () => {
  const a = of(1, 2, 3).pipe(every((val, index, source: Observable<number>) => val < 3)); // $ExpectType Observable<boolean>
});

it('should support optional thisArg parameter', () => {
  const a = of(1, 2, 3).pipe(every((val, index, source: Observable<number>) => val < 3, 'any object')); // $ExpectType Observable<boolean>
});

it('should not accept empty parameter', () => {
  const a = of(1, 2, 3).pipe(every()); // $ExpectError
});

it('should support source type', () => {
  const a = of(1, 2, 3).pipe(every((val) => val === '2')); // $ExpectError
});

it('should enforce index type of number', () => {
  const a = of(1, 2, 3).pipe(every((val, i) => i === '3')); // $ExpectError
});

it('should expect function parameter', () => {
  const a = of(1, 2, 3).pipe(every(9)); // $ExpectError
});
