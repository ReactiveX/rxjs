
import { Observable } from 'rxjs';
import { findIndex } from '../../operator/findIndex';

(Observable as any).prototype.findIndex = findIndex;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    findIndex: typeof findIndex;
  }
}
