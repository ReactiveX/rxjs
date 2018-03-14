
import { Observable } from 'rxjs';
import { debounceTime } from 'rxjs/internal-compatibility';

(Observable as any).prototype.debounceTime = debounceTime;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    debounceTime: typeof debounceTime;
  }
}
