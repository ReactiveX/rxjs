import { Observable, smoosh as smooshStatic } from 'rxjs';

Observable.smoosh = smooshStatic;

declare module 'rxjs/internal/Observable' {
  namespace Observable {
    export let smoosh: typeof smooshStatic;
  }
}
