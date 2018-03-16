
import { Observable } from 'rxjs';
import { publish } from 'rxjs/internal-compatibility';

(Observable as any).prototype.publish = <any>publish;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    publish: typeof publish;
  }
}
