import { Observable } from '../../internal/Observable';
import { concat as concatStatic } from '../../internal/observable/concat';

Observable.concat = concatStatic;

declare module '../../internal/Observable' {
  namespace Observable {
    export let concat: typeof concatStatic;
  }
}
