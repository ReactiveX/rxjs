import { of } from 'rxjs';
import { connect } from 'rxjs/operators';
import { a$, b$ } from '../helpers';

it('should infer from a union', () => {
    const o = of(null).pipe(connect(() => Math.random() > 0.5 ? a$ : b$)); // $ExpectType Observable<A | B>
});