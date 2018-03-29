
import { Observable } from 'rxjs';
import { take } from '../../operator/take';

(Observable as any).prototype.take = take;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    take: typeof take;
  }
}
