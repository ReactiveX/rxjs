import { Observable } from '../../internal/Observable';
import { iif } from '../../internal/observable/iif';

//tslint:disable-next-line:no-any TypeScript doesn't like `if`
(Observable as any).if = iif;
