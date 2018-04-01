
import { Observable } from 'rxjs';
import { smooshScan } from '../../operator/smooshScan';

(Observable as any).prototype.smooshScan = smooshScan;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    smooshScan: typeof smooshScan;
  }
}
