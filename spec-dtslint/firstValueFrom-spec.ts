import { firstValueFrom } from 'rxjs';
import { a$ } from 'helpers';

describe('firstValueFrom', () => {
  const r0 = firstValueFrom(a$); // $ExpectType Promise<A>
  const r1 = firstValueFrom(); // $ExpectError
  const r2 = firstValueFrom(Promise.resolve(42)); // $ExpectError
});
