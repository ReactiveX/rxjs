
import { Observable } from 'rxjs';
import { smooshAll } from '../../operator/smooshAll';

(Observable as any).prototype.smooshAll = smooshAll;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    smooshAll: typeof smooshAll;
  }
}
