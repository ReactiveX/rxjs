import { of } from 'rxjs';
import { window } from 'rxjs/operators';

it('should infer correctly', () => {
  of(1).pipe(window(of('1'))); // $ExpectType Observable<Observable<number>>
});

it('should enforce types', () => {
  of(1).pipe(window('')); // $ExpectError
});
