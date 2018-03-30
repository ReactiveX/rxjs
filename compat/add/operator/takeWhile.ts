
import { Observable } from 'rxjs';
import { takeWhile } from '../../operator/takeWhile';

(Observable as any).prototype.takeWhile = takeWhile;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    takeWhile: typeof takeWhile;
  }
}
