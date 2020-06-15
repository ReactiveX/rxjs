import { Notification } from 'rxjs';

describe('Notification', () => {
  // Basic method tests
  const nextNotification = Notification.createNext('a'); // $ExpectType Notification<string> & NextNotification<string>
  nextNotification.do((value: number) => {}); // $ExpectError
  const r = nextNotification.do((value: string) => {}); // $ExpectType void
  const r1 = nextNotification.observe({ next: value => { } }); // $ExpectType void
  const r2 = nextNotification.observe({ next: (value: number) => { } }); // $ExpectError
  const r3 = nextNotification.toObservable(); // $ExpectType Observable<string>
  const k1 = nextNotification.kind; // $ExpectType "N"

  const completeNotification = Notification.createComplete(); // $ExpectType Notification<never> & CompleteNotification
  const r4 = completeNotification.do((value: string) => {}); // $ExpectType void
  const r5 = completeNotification.observe({ next: value => { } }); // $ExpectType void
  const r6 = completeNotification.observe({ next: (value: number) => { } }); // $ExpectType void
  const r7 = completeNotification.toObservable(); // $ExpectType Observable<never>
  const k2 = completeNotification.kind; // $ExpectType "C"

  const errorNotification = Notification.createError(); // $ExpectType Notification<never> & ErrorNotification
  const r8 = errorNotification.do((value: string) => {}); // $ExpectType void
  const r9 = errorNotification.observe({ next: value => { } }); // $ExpectType void
  const r10 = errorNotification.observe({ next: (value: number) => { } }); // $ExpectType void
  const r11 = errorNotification.toObservable(); // $ExpectType Observable<never>
  const k3 = errorNotification.kind; // $ExpectType "E"
});