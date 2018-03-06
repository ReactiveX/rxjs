
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/internal/patching/operator/switchMap';

(Observable as any).prototype.switchMap = switchMap;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    switchMap: typeof switchMap;
  }
}
