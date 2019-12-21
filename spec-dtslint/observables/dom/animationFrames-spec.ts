import { animationFrames } from 'rxjs';

it('should just be an observable of numbers', () => {
  const o$ = animationFrames(); // $ExpectType Observable<number>
});

it('should allow the passing of a timestampProvider', () => {
  const o$ = animationFrames(performance); // $ExpectType Observable<number>
});

it('should not allow the passing of an invalid timestamp provider', () => {
  const o$ = animationFrames({ now() { return 'wee' } }); // $ExpectError
});