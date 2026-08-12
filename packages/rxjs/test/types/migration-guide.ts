import { ColdObservable } from 'rxjs/cold-observable';
import { filter } from 'rxjs/filter';
import { map } from 'rxjs/map';
import { pipe } from 'rxjs/pipe';

declare const users: Observable<{ active: boolean; name: string }>;
declare function consume(value: string): void;
declare function report(error: unknown): void;

const names: Observable<string> = users[filter]((user) => user.active)[map]((user) => user.name);

const composed: Observable<string> = users[pipe]((source) => source[map]((user) => user.name));

const controller = new AbortController();
names.subscribe(
  {
    next: (value) => consume(value),
    error: (error) => report(error),
  },
  { signal: controller.signal }
);
controller.abort('view disposed');

const ticks = new Observable<number>((subscriber) => {
  let value = 0;
  const handle = setInterval(() => subscriber.next(value++), 1000);
  subscriber.addTeardown(() => clearInterval(handle));
});

const coldTicks = new ColdObservable<number>((subscriber) => {
  subscriber.next(1);
});

void composed;
void ticks;
void coldTicks;
