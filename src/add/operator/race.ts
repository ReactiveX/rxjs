
import {Observable} from '../../Observable';
import {race, RaceSignature} from '../../operator/race';

Observable.prototype.race = race;

declare module '../../Observable' {
  interface Observable<T> {
    race: RaceSignature<T>;
  }
}