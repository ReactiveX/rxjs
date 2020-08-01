/** @prettier */
type SetIntervalFunction = (handler: () => void, timeout?: number, ...args: any[]) => number;
type ClearIntervalFunction = (handle: number) => void;

type SetIntervalProvider = {
  setInterval: SetIntervalFunction;
  clearInterval: ClearIntervalFunction;
  delegate:
    | {
        setInterval: SetIntervalFunction;
        clearInterval: ClearIntervalFunction;
      }
    | undefined;
};

export const setIntervalProvider: SetIntervalProvider = {
  // When accessing the delegate, use the variable rather than `this` so that
  // the function can be called without being bound to the provider.
  setInterval(...args) {
    const { delegate } = setIntervalProvider;
    return (delegate?.setInterval || setInterval)(...args);
  },
  clearInterval(handle) {
    const { delegate } = setIntervalProvider;
    return (delegate?.clearInterval || clearInterval)(handle);
  },
  delegate: undefined,
};
