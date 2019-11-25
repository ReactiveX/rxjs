import { animationFrames, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';

it('should just be an observable of numbers', () => {
  expectType<Observable<number>>(animationFrames());
});

it('should allow the passing of a timestampProvider', () => {
  expectType<Observable<number>>(animationFrames(performance));
});

it('should not allow the passing of an invalid timestamp provider', () => {
  expectError(animationFrames({ now() { return 'wee' } }));
});