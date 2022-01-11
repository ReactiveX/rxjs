import { EMPTY } from 'rxjs';

it('should always infer empty observable', () => {
  // Empty Observable that replace empty static function 
  const a = EMPTY; // $ExpectType Observable<never>
});
