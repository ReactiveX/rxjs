
import { Observable } from 'rxjs';
import { letProto } from '../../operator/let';

(Observable as any).prototype.let = letProto;
(Observable as any).prototype.letBind = letProto;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    let: typeof letProto;
    letBind: typeof letProto;
  }
}
