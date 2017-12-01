import { Observable } from '../../internal/Observable';
import { bindNodeCallback as staticBindNodeCallback } from '../../internal/observable/bindNodeCallback';

Observable.bindNodeCallback = staticBindNodeCallback;

declare module '../../internal/Observable' {
  namespace Observable {
    export let bindNodeCallback: typeof staticBindNodeCallback;
  }
}
