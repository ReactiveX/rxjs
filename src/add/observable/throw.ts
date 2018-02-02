import { Observable } from '../../internal/Observable';
import { throwError } from '../../internal/observable/throwError';

(Observable as any).throw = throwError;
