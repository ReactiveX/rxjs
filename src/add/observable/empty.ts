import { Observable } from '../../internal/Observable';
import { empty as staticEmpty } from '../../internal/observable/empty';

Observable.empty = staticEmpty;

declare module '../../internal/Observable' {
  namespace Observable {
    export let empty: typeof staticEmpty;
  }
}
