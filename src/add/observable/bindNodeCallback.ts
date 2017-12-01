import { Observable } from '../../Observable';
import { bindNodeCallback as staticBindNodeCallback } from '../../internal/observable/bindNodeCallback';

Observable.bindNodeCallback = staticBindNodeCallback;

declare module '../../Observable' {
  namespace Observable {
    export let bindNodeCallback: typeof staticBindNodeCallback;
  }
}
