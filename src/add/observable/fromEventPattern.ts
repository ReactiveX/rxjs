import {Observable} from '../../Observable';
import {FromEventPatternObservable} from '../../observable/FromEventPatternObservable';

Observable.fromEventPattern = FromEventPatternObservable.create;

declare module '../../Observable' {
  namespace Observable {
    export let fromEventPattern: typeof FromEventPatternObservable.create;
  }
}