
import { Observable } from 'rxjs';
import { race } from '../../operator/race';

(Observable as any).prototype.race = race;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    race: typeof race;
  }
}
