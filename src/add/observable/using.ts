import { Observable } from '../../Observable';
import { using as staticUsing } from '../../internal/observable/using';

Observable.using = staticUsing;

declare module '../../Observable' {
  namespace Observable {
    export let using: typeof staticUsing;
  }
}
