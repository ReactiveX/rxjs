import { AjaxError } from 'rxjs/ajax';
import {
  ArgumentOutOfRangeError,
  EmptyError,
  NotFoundError,
  ObjectUnsubscribedError,
  SequenceError,
  TimeoutError,
  UnsubscriptionError
} from 'rxjs';

it('should deprecate error construction', () => {
  let error: Error;
  error = new AjaxError('message', null!, null!); // $ExpectDeprecation
  error = new ArgumentOutOfRangeError(); // $ExpectDeprecation
  error = new EmptyError(); // $ExpectDeprecation
  error = new NotFoundError('message'); // $ExpectDeprecation
  error = new ObjectUnsubscribedError(); // $ExpectDeprecation
  error = new SequenceError('message'); // $ExpectDeprecation
  error = new TimeoutError(); // $ExpectDeprecation
  error = new UnsubscriptionError([]); // $ExpectDeprecation
});

it('should not deprecate instanceof use', () => {
  const error = new Error('message');
  let b: boolean;
  b = error instanceof AjaxError; // $ExpectNoDeprecation
  b = error instanceof ArgumentOutOfRangeError; // $ExpectNoDeprecation
  b = error instanceof EmptyError; // $ExpectNoDeprecation
  b = error instanceof NotFoundError; // $ExpectNoDeprecation
  b = error instanceof ObjectUnsubscribedError; // $ExpectNoDeprecation
  b = error instanceof SequenceError; // $ExpectNoDeprecation
  b = error instanceof TimeoutError; // $ExpectNoDeprecation
  b = error instanceof UnsubscriptionError; // $ExpectNoDeprecation
});