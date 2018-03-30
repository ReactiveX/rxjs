import { Observable, using as staticUsing } from 'rxjs';

Observable.using = staticUsing;

declare module 'rxjs/internal/Observable' {
  namespace Observable {
    export let using: typeof staticUsing;
  }
}
