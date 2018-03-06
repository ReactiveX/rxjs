import { Observable, iif } from 'rxjs';

//tslint:disable-next-line:no-any TypeScript doesn't like `if`
(Observable as any).if = iif;
