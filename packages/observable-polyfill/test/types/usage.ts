import { getObservablePolyfillInfo, observablePolyfillInfo, type ObservablePolyfillInfo } from '@rxjs/observable-polyfill';

const source = new Observable<number>((subscriber) => {
  subscriber.next(1);
  subscriber.complete();
});
const info: ObservablePolyfillInfo | undefined = getObservablePolyfillInfo();
const marker: symbol = observablePolyfillInfo;

void source;
void info;
void marker;
