
import { Observable } from 'rxjs';
import { letProto } from 'rxjs/internal-compatibility';

(Observable as any).prototype.let = letProto;
(Observable as any).prototype.letBind = letProto;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    let: typeof letProto;
    letBind: typeof letProto;
  }
}
