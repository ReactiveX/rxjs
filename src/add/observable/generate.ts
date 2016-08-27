import { Observable } from '../../Observable';
import { GenerateObservable } from '../../observable/GenerateObservable';

Observable.generate = GenerateObservable.create;

declare module '../../Observable' {
  namespace Observable {
    export let generate: typeof GenerateObservable.create;
  }
}