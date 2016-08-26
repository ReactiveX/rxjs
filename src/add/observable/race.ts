import { Observable } from '../../Observable';
import { raceStatic } from '../../operator/race';

Observable.race = raceStatic;

declare module '../../Observable' {
  namespace Observable {
    export let race: typeof raceStatic;
  }
}