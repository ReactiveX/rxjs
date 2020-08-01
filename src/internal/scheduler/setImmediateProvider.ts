/** @prettier */
import { Immediate } from '../util/Immediate';
const { setImmediate, clearImmediate } = Immediate;

type SetImmediateFunction = (handler: () => void, ...args: any[]) => number;
type ClearImmediateFunction = (handle: number) => void;

type SetImmediateProvider = {
  setImmediate: SetImmediateFunction;
  clearImmediate: ClearImmediateFunction;
  delegate:
    | {
        setImmediate: SetImmediateFunction;
        clearImmediate: ClearImmediateFunction;
      }
    | undefined;
};

export const setImmediateProvider: SetImmediateProvider = {
  // When accessing the delegate, use the variable rather than `this` so that
  // the function can be called without being bound to the provider.
  setImmediate(...args) {
    const { delegate } = setImmediateProvider;
    return (delegate?.setImmediate || setImmediate)(...args);
  },
  clearImmediate(handle) {
    const { delegate } = setImmediateProvider;
    return (delegate?.clearImmediate || clearImmediate)(handle);
  },
  delegate: undefined,
};
