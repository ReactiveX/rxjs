
import { Observable } from 'rxjs';

import { scan } from '../../operator/scan';

(Observable as any).prototype.scan = scan;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    scan: typeof scan;
  }
}
