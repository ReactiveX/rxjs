import { Observable, of as staticOf } from 'rxjs';

Observable.of = staticOf;

declare module 'rxjs/internal/Observable' {
  namespace Observable {
    export let of: typeof staticOf; //formOf an iceberg!
  }
}
