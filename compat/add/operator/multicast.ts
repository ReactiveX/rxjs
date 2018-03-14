
import { Observable } from 'rxjs';
import { multicast } from 'rxjs/internal-compatibility';

(Observable as any).prototype.multicast = <any>multicast;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    multicast: typeof multicast;
  }
}
