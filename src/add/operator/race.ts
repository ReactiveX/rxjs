
import {Observable} from '../../Observable';
import {race} from '../../operator/race';

Observable.prototype.race = race;

declare module '../../Observable' {
  interface Observable<T> {
    race: (...observables: Array<Observable<T>>) => Observable<T>;
  }
}