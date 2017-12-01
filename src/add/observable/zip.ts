import { Observable } from '../../Observable';
import { zip as zipStatic } from '../../internal/observable/zip';

Observable.zip = zipStatic;

declare module '../../Observable' {
  namespace Observable {
    export let zip: typeof zipStatic;
  }
}
