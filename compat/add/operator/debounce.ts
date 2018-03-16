
import { Observable } from 'rxjs';
import { debounce } from 'rxjs/internal-compatibility';

(Observable as any).prototype.debounce = debounce;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    debounce: typeof debounce;
  }
}
