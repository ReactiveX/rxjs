import {Observable} from '../../Observable';
import {combineLatestStatic} from '../../operator/combineLatest';

Observable.combineLatest = combineLatestStatic;

declare module '../../Observable' {
  namespace Observable {
    export let combineLatest: typeof combineLatestStatic;
  }
}