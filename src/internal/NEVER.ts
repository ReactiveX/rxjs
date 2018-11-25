import { Observable } from 'rxjs/internal/Observable';
import { noop } from 'rxjs/internal/util/noop';

export const NEVER: Observable<never> = new Observable(noop);
