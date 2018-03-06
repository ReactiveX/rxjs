
import { Observable } from 'rxjs';
import { mergeScan } from 'rxjs/internal/patching/operator/mergeScan';

(Observable as any).prototype.mergeScan = mergeScan;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    mergeScan: typeof mergeScan;
  }
}
