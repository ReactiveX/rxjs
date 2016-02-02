import {Observable} from '../../Observable';
import {zipStatic} from '../../operator/zip';

Observable.zip = zipStatic;

declare module '../../Observable' {
  namespace Observable {
    export let zip: typeof zipStatic;
  }
}