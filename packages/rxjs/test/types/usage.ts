import { ColdObservable, Subject, TimeoutError } from 'rxjs';
import { every } from 'rxjs/every';
import { filter } from 'rxjs/filter';
import { find } from 'rxjs/find';
import { findIndex } from 'rxjs/find-index';
import { map } from 'rxjs/map';
import { partition } from 'rxjs/partition';
import { pipe } from 'rxjs/pipe';
import { scan } from 'rxjs/scan';
import { switchMap } from 'rxjs/switch-map';
import { timeout } from 'rxjs/timeout';
import { timer } from 'rxjs/timer';

const source = new Observable<number>((subscriber) => {
  subscriber.next(1);
  subscriber.complete();
});
const mapped: Observable<string> = source[map]((value, index) => `${index}:${value}`);
const scanned: Observable<number> = source[scan]((total, value) => total + value, 0);
const switched: Observable<string> = source[switchMap]((value) => [`value:${value}`]);
const timed: Observable<number | string> = source[timeout]<undefined, string>({ first: 10, with: () => ['fallback'] });
const timerResult: Observable<number> = Observable[timer](10);
const piped: Observable<string> = source[pipe]((value) => value[map]((item) => String(item)));
const staticPiped: Observable<string> = Observable[pipe]([1, 2], (value) => value[map]((item) => String(item)));

const callbackContext = {};
// @ts-expect-error RxJS 9 callback APIs do not accept a thisArg.
source[every](() => true, callbackContext);
// @ts-expect-error RxJS 9 callback APIs do not accept a thisArg.
source[filter](() => true, callbackContext);
// @ts-expect-error RxJS 9 callback APIs do not accept a thisArg.
source[find](() => true, callbackContext);
// @ts-expect-error RxJS 9 callback APIs do not accept a thisArg.
source[findIndex](() => true, callbackContext);
// @ts-expect-error RxJS 9 callback APIs do not accept a thisArg.
source[map]((value) => value, callbackContext);
// @ts-expect-error RxJS 9 callback APIs do not accept a thisArg.
Observable[partition](source, () => true, callbackContext);

const cold = new ColdObservable<number>((subscriber) => subscriber.next(1));
const subject = new Subject<number>();
const timeoutError = new TimeoutError<number>({ lastValue: 1, meta: undefined, seen: 1 });

void mapped;
void scanned;
void switched;
void timed;
void timerResult;
void piped;
void staticPiped;
void cold;
void subject;
void timeoutError;
