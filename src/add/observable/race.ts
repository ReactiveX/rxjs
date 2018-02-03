import { Observable } from '../../internal/Observable';
import { race as staticRace } from '../../internal/observable/race';

Observable.race = staticRace;

declare module '../../internal/Observable' {
  namespace Observable {
    export let race: typeof staticRace;
  }
}
