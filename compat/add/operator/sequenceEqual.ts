
import { Observable } from 'rxjs';
import { sequenceEqual } from 'rxjs/internal-compatibility';

(Observable as any).prototype.sequenceEqual = sequenceEqual;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    sequenceEqual: typeof sequenceEqual;
  }
}
