import { Observable, zip as zipStatic } from 'rxjs';

Observable.zip = zipStatic;

declare module 'rxjs/internal/Observable' {
  namespace Observable {
    export let zip: typeof zipStatic;
  }
}
