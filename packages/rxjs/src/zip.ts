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

    for (let i = 0; i < sourceCount; i++) {
      Observable.from(sources[i]).subscribe(
        {
          next: (value) => {
            const everyOtherSourceHasAValue = state.every(({ buffer }, sourceIndex) => sourceIndex === i || buffer.length > 0);

            const isFillTime = shouldFill && state.every(({ complete }, sourceIndex) => sourceIndex === i || complete);

            if (everyOtherSourceHasAValue || isFillTime) {
              subscriber.next(state.map(({ buffer }, bufferIndex) => (bufferIndex === i ? value : (buffer.shift() ?? fillValue!))) as any);
            } else {
              state[i].buffer.push(value);
            }
          },
          error: (error) => subscriber.error(error),
          complete: () => {
            state[i].complete = true;

            while (shouldFill && state.every(({ complete, buffer }) => complete || buffer.length > 0)) {
              subscriber.next(state.map(({ buffer }) => buffer.shift() ?? fillValue) as any);
            }
            const allComplete = state.every(({ complete }) => complete);

            if (allComplete) {
              subscriber.complete();
            }
          },
        },
        { signal: subscriber.signal }
      );
    }
  });
}
