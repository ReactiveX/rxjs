
import { Observable } from 'rxjs';
import { smooshMap } from '../../operator/smooshMap';

(Observable as any).prototype.smooshMap = <any>smooshMap;
(Observable as any).prototype.flatMap = <any>smooshMap;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    flatMap: typeof smooshMap;
    smooshMap: typeof smooshMap;
  }
}
