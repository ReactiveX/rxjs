import { NEVER } from 'rxjs';

it('should be of type Observable<never>', () => {
  const a = NEVER; // $ExpectType Observable<never>
});
