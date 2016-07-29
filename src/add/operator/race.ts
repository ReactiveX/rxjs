
import {Observable} from '../../Observable';
import {race, RaceSignature} from '../../operator/race';

Observable.prototype.race = race;

declare module '../../Observable' {
  interface IObservable<T> {
    race: RaceSignature<T>;
  }
}