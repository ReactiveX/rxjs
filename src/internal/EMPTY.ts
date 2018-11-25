import { Observable } from 'rxjs/internal/Observable';

export const EMPTY: Observable<never> = new Observable(subscriber => subscriber.complete());
