
import { Observable } from 'rxjs';
import { smoosh } from '../../operator/smoosh';

(Observable as any).prototype.smoosh = smoosh;

declare module 'rxjs/internal/Observable' {
  interface Observable<T> {
    smoosh: typeof smoosh;
  }
}
