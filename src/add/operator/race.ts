
import { Observable } from '../../internal/Observable';
import { race } from '../../internal/patching/operator/race';

Observable.prototype.race = race;

declare module '../../internal/Observable' {
  interface Observable<T> {
    race: typeof race;
  }
}
