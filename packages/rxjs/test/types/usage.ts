import { ColdObservable, Subject, TimeoutError } from 'rxjs';
import { map } from 'rxjs/map';
import { switchMap } from 'rxjs/switch-map';

const source = new Observable<number>((subscriber) => {
  subscriber.next(1);
  subscriber.complete();
});
const mapped: Observable<string> = source[map]((value, index) => `${index}:${value}`);
const switched: Observable<string> = source[switchMap]((value) => [`value:${value}`]);

const cold = new ColdObservable<number>((subscriber) => subscriber.next(1));
const subject = new Subject<number>();
const timeoutError = new TimeoutError<number>({ lastValue: 1, meta: undefined, seen: 1 });

void mapped;
void switched;
void cold;
void subject;
void timeoutError;
