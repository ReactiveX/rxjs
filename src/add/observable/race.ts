import { Observable } from '../../Observable';
import { race as raceStatic } from '../../observable/race';

Observable.race = raceStatic;

declare module '../../Observable' {
  namespace Observable {
    export let race: typeof raceStatic;
  }
}