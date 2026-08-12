import { getObservablePolyfillInfo, observablePolyfillInfo, type ObservablePolyfillInfo } from '@rxjs/observable-polyfill';

const source = new Observable<number>((subscriber) => {
  // @ts-expect-error non-void Subscribers require a value
  subscriber.next();
  subscriber.next(1);
  subscriber.complete();
});
const voidSource = new Observable<void>((subscriber) => {
  // @ts-expect-error void Subscribers still require an explicit value argument
  subscriber.next();
  subscriber.next(undefined);
  // @ts-expect-error void Subscribers reject non-void values
  subscriber.next(1);
  subscriber.complete();
});
const info: ObservablePolyfillInfo | undefined = getObservablePolyfillInfo();
const marker: symbol = observablePolyfillInfo;

void source;
void voidSource;
void info;
void marker;
