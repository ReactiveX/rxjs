
import { Observable } from '../../Observable';
import { race } from '../../internal/patching/operator/race';

Observable.prototype.race = race;

declare module '../../Observable' {
  interface Observable<T> {
    race: typeof race;
  }
}
