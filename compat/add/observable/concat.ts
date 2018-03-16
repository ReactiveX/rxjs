import { Observable, concat as concatStatic } from 'rxjs';

Observable.concat = concatStatic;

declare module 'rxjs/internal/Observable' {
  namespace Observable {
    export let concat: typeof concatStatic;
  }
}
