
import { Observable } from 'rxjs';
import { every } from 'rxjs/internal/patching/operator/every';

(Observable as any).prototype.every = every;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    every: typeof every;
  }
}
