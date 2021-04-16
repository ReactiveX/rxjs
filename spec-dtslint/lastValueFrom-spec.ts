import { lastValueFrom } from 'rxjs';
import { a$ } from 'helpers';

describe('lastValueFrom', () => {
  it('should infer the element type', () => {
    const r = lastValueFrom(a$); // $ExpectType Promise<A>
  });

  it('should infer the element type from a default value', () => {
    const r = lastValueFrom(a$, { defaultValue: null }); // $ExpectType Promise<A | null>
  });

  it('should require an argument', () => {
    const r = lastValueFrom(); // $ExpectError
  });

  it('should require an observable argument', () => {
    const r = lastValueFrom(Promise.resolve(42)); // $ExpectError
  });
});
