
import { Observable } from 'rxjs';

import { scan } from 'rxjs/internal-compatibility';

(Observable as any).prototype.scan = scan;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    scan: typeof scan;
  }
}
