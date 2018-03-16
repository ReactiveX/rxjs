
import { Observable } from 'rxjs';
import { zipProto } from 'rxjs/internal-compatibility';

(Observable as any).prototype.zip = zipProto;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    zip: typeof zipProto;
  }
}
