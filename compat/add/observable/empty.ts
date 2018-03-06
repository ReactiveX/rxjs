import { Observable, empty as staticEmpty } from 'rxjs';

Observable.empty = staticEmpty;

declare module 'rxjs/internal/Observable' {
  namespace Observable {
    export let empty: typeof staticEmpty;
  }
}
