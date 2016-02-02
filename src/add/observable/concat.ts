import {Observable} from '../../Observable';
import {concatStatic} from '../../operator/concat';

Observable.concat = concatStatic;

declare module '../../Observable' {
  namespace Observable {
    export let concat: typeof concatStatic;
  }
}