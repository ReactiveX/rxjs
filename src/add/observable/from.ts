import { Observable } from '../../Observable';
import { from as staticFrom } from '../../internal/observable/from';

Observable.from = staticFrom;

declare module '../../Observable' {
  namespace Observable {
    export let from: typeof staticFrom;
  }
}
