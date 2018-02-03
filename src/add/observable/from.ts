import { Observable } from '../../internal/Observable';
import { from as staticFrom } from '../../internal/observable/from';

Observable.from = staticFrom;

declare module '../../internal/Observable' {
  namespace Observable {
    export let from: typeof staticFrom;
  }
}
