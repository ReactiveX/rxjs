import { firstValueFrom } from 'rxjs';
import { a$ } from 'helpers';

describe('firstValueFrom', () => {
  it('should infer the element type', () => {
    const r = firstValueFrom(a$); // $ExpectType Promise<A>
  })

  it('should infer the element type from a default value', () => {
    const r = firstValueFrom(a$, { defaultValue: null }); // $ExpectType Promise<A | null>
  });

  it('should require an argument', () => {
    const r = firstValueFrom(); // $ExpectError
  });

  it('should require an observable argument', () => {
    const r = firstValueFrom(Promise.resolve(42)); // $ExpectError
  });
});
