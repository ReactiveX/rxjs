import { never } from 'rxjs';

it('should not support any parameter', () => {
  const a = never(1); // $ExpectError
});

it('should infer never', () => {
  const a = never(); // $ExpectType Observable<never>
});
