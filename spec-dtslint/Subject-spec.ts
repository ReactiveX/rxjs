import { Subject } from 'rxjs';

it('should have the proper types for Subject<number>', () => {
  const subject = new Subject<number>(); // $ExpectType Subject<number>
  const r = subject.next(123); // $ExpectType void
  subject.next('test'); // $ExpectError
  subject.next(); // $ExpectError
});

it('should have the proper types for new Subject<void>()', () => {
  const subject = new Subject<void>(); // $ExpectType Subject<void>
  const r = subject.next(); // $ExpectType void
  const r2 = subject.next(undefined); // $ExpectType void
  subject.next('test'); // $ExpectError
});

it('should have the proper types for new Subject()', () => {
  const subject = new Subject(); // $ExpectType Subject<unknown>
  const r = subject.next(); // $ExpectError
  const r2 = subject.next('test'); // $ExpectType void
});

it('should have the proper subscription types for new Subject<number>()', () => {
  const a = new Subject<number>(); // $ExpectType Subject<number>
  const r = a.next(123); // $ExpectType void
  a.next('test'); // $ExpectError
  const subs = a.subscribe((out) => { // $ExpectType Subscription
    // $ExpectType Subscription
    const x = out; // $ExpectType number
  });
});

it('should have the proper subscription types for new Subject()', () => {
  const a = new Subject(); // $ExpectType Subject<unknown>
  const r = a.next('test'); // $ExpectType void
  const subs = a.subscribe((out) => { // $ExpectType Subscription
    const x = out; // $ExpectType unknown
  });
});
