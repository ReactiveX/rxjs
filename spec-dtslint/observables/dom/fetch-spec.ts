import { fromFetch } from 'rxjs/fetch';
import { a as a$ } from '../../helpers';

it('should emit the fetch Response by default', () => {
  const a = fromFetch("a"); // $ExpectType Observable<Response>
});

it('should support a selector that returns a Response promise', () => {
  const a = fromFetch("a", { selector: response => response.text() }); // $ExpectType Observable<string>
});

it('should support a selector that returns an arbitrary type', () => {
  const a = fromFetch("a", { selector: response => a$ }); // $ExpectType Observable<A>
});

it('should error for selectors that don\'t return an ObservableInput', () => {
  const a = fromFetch("a", { selector: response => 42 }); // $ExpectError
});
