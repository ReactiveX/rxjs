
import { Observable } from 'rxjs';
import { take } from 'rxjs/internal-compatibility';

(Observable as any).prototype.take = take;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    take: typeof take;
  }
}
