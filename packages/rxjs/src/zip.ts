type ObservedValuesOfWithFill<Sources extends readonly ObservableValue<any>[], Fill> = {
  [K in keyof Sources]: Sources[K] extends ObservableValue<infer T> ? T | Fill : never;
};

interface ZipState {
  buffer: any[];
  complete: boolean;
}

export function zip<Sources extends readonly ObservableValue<any>[], Fill = never>(
  sources: Sources,
  config?: {
    fillAfterComplete?: Fill;
  }
): Observable<ObservedValuesOfWithFill<Sources, Fill>> {
  return new Observable((subscriber) => {
    const state: ZipState[] = sources.map(() => ({
      buffer: [],
      complete: false,
    }));
    config ??= {};
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

      Observable.from(sources[i]).subscribe(
        {
          next: (value) => {
            state[i].buffer.push(value);
            drainBuffers();
          },
          error: (error) => subscriber.error(error),
          complete: () => {
            state[i].complete = true;
            drainBuffers();
          },
        },
        { signal: subscriber.signal }
      );
    }
  });
}
