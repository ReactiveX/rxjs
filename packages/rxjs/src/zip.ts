import { map } from './map.js';
import { subscribeToSource } from './util/observable-helpers.js';

type ObservedValuesOfWithFill<Sources extends readonly ObservableValue<any>[], Fill> = {
  [K in keyof Sources]: Sources[K] extends ObservableValue<infer T> ? T | Fill : never;
};

type ObservedValues<Sources extends readonly ObservableValue<any>[]> = {
  [K in keyof Sources]: Sources[K] extends ObservableValue<infer T> ? T : never;
};

interface ZipState {
  buffer: any[];
  complete: boolean;
}

export function zip<Sources extends readonly ObservableValue<any>[], Result>(
  sources: Sources,
  project: (...values: ObservedValues<Sources>) => Result
): Observable<Result>;
export function zip<Sources extends readonly ObservableValue<any>[], Fill = never>(
  sources: Sources,
  config?: {
    fillAfterComplete?: Fill;
  }
): Observable<ObservedValuesOfWithFill<Sources, Fill>>;
export function zip<Sources extends readonly ObservableValue<any>[], Fill = never, Result = never>(
  sources: Sources,
  configOrProject?:
    | {
        fillAfterComplete?: Fill;
      }
    | ((...values: ObservedValues<Sources>) => Result)
): Observable<ObservedValuesOfWithFill<Sources, Fill> | Result> {
  const project = typeof configOrProject === 'function' ? configOrProject : undefined;
  const config = typeof configOrProject === 'object' && configOrProject !== null ? configOrProject : {};
  const zipped = new Observable<ObservedValuesOfWithFill<Sources, Fill>>((subscriber) => {
    const state: ZipState[] = sources.map(() => ({
      buffer: [],
      complete: false,
    }));
    const shouldFill = 'fillAfterComplete' in config;
    const sourceCount = sources.length;
    const fillValue = config.fillAfterComplete;

    const drainBuffers = () => {
      const canEmitTuple = () => state.every(({ buffer, complete }) => buffer.length > 0 || (shouldFill && complete));
      const hasBufferedValue = () => state.some(({ buffer }) => buffer.length > 0);

      while (subscriber.active && canEmitTuple() && (!shouldFill || hasBufferedValue())) {
        subscriber.next(state.map(({ buffer }) => (buffer.length > 0 ? buffer.shift() : fillValue)) as any);
      }

      if (shouldFill) {
        if (state.every(({ buffer, complete }) => complete && buffer.length === 0)) {
          subscriber.complete();
        }
      } else if (state.some(({ buffer, complete }) => complete && buffer.length === 0)) {
        subscriber.complete();
      }
    };

    if (sourceCount === 0) {
      subscriber.complete();
      return;
    }

    for (let i = 0; i < sourceCount; i++) {
      if (!subscriber.active) {
        break;
      }

      const sourceState = state[i]!;
      subscribeToSource(Observable.from(sources[i]!), subscriber, {
        next: (value) => {
          sourceState.buffer.push(value);
          drainBuffers();
        },
        complete: () => {
          sourceState.complete = true;
          drainBuffers();
        },
      });
    }
  });

  return (project === undefined ? zipped : zipped[map]((values) => project(...(values as ObservedValues<Sources>)))) as any;
}
