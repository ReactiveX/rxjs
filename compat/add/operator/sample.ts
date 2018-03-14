
import { Observable } from 'rxjs';
import { sample } from 'rxjs/internal-compatibility';

(Observable as any).prototype.sample = sample;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    sample: typeof sample;
  }
}
