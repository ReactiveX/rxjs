import { Observable } from '../../internal/Observable';
import { using as staticUsing } from '../../internal/observable/using';

Observable.using = staticUsing;

declare module '../../internal/Observable' {
  namespace Observable {
    export let using: typeof staticUsing;
  }
}
