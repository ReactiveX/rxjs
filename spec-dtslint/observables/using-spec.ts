import { using, Subscription, of} from 'rxjs';
import { a$, b$ } from '../helpers';

it('should infer with a simple factory', () => {
  const o = using(() => {}, () => a$); // $ExpectType Observable<A>
});

it('should infer with a factory that returns a union', () => {
  const o = using(() => {}, () => Math.random() < 0.5 ? a$ : b$); // $ExpectType Observable<A | B>
});

it('should infer resource types', () => {
  const o = using(() => new Subscription(), (sub) => of(sub)); // $ExpectType Observable<Subscription>
});
