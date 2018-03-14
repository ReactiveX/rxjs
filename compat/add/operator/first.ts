
import { Observable } from 'rxjs';
import { first } from 'rxjs/internal-compatibility';

(Observable as any).prototype.first = <any>first;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    first: typeof first;
  }
}
