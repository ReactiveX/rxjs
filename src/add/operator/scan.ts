
import { Observable } from '../../internal/Observable';

import { scan } from '../../internal/patching/operator/scan';

Observable.prototype.scan = scan;

declare module '../../internal/Observable' {
  interface Observable<T> {
    scan: typeof scan;
  }
}
