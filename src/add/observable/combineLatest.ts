import { Observable } from '../../internal/Observable';
import { combineLatest as combineLatestStatic } from '../../internal/observable/combineLatest';

Observable.combineLatest = combineLatestStatic;

declare module '../../internal/Observable' {
  namespace Observable {
    export let combineLatest: typeof combineLatestStatic;
  }
}
