
import { Observable } from 'rxjs';
import { ignoreElements } from 'rxjs/internal-compatibility';

(Observable as any).prototype.ignoreElements = ignoreElements;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    ignoreElements: typeof ignoreElements;
  }
}
