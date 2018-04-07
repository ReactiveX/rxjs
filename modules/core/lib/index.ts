import { Observable } from './Observable';
import { FOType, FObs, FOArg, FSub, FSubType } from './types';
import { toObservable, toFObs } from './convert';
import { take } from './operators/take';
import { map } from './operators/map';
import { mergeMap } from './operators/mergeMap';
import { createSubscription } from './createSubscription';
import { fromEvent } from './create/fromEvent';
import { interval } from './create/interval';
import { range } from './create/range';
import { catchError } from './operators/catchError';
import { retry } from './operators/retry';
import { repeat } from './operators/repeat';
import { Subject } from './Subject';
import { expand } from './operators/expand';

const custom = new Observable(subscriber => {
  subscriber.next(1);
  subscriber.next(2);
  subscriber.next(3);
  subscriber.complete();
});

const ticker = interval(10);

ticker.pipe(
  take(40),
).subscribe({
  next(x) { console.log(x); },
  error(err) { console.log(err); },
  complete() { console.log('done'); }
});
