import { Observable } from '../../internal/Observable';
import { zip as zipStatic } from '../../internal/observable/zip';

Observable.zip = zipStatic;

declare module '../../internal/Observable' {
  namespace Observable {
    export let zip: typeof zipStatic;
  }
}
