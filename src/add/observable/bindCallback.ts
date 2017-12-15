import { Observable } from '../../internal/Observable';
import { bindCallback as staticBindCallback } from '../../internal/observable/bindCallback';

Observable.bindCallback = staticBindCallback;

declare module '../../internal/Observable' {
  namespace Observable {
    export let bindCallback: typeof staticBindCallback;
  }
}
