
import { Observable } from 'rxjs';
import { multicast } from '../../operator/multicast';

(Observable as any).prototype.multicast = <any>multicast;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    multicast: typeof multicast;
  }
}
