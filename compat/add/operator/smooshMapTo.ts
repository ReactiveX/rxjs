
import { Observable } from 'rxjs';
import { smooshMapTo } from '../../operator/smooshMapTo';

(Observable as any).prototype.flatMapTo = <any>smooshMapTo;
(Observable as any).prototype.smooshMapTo = <any>smooshMapTo;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    flatMapTo: typeof smooshMapTo;
    smooshMapTo: typeof smooshMapTo;
  }
}
