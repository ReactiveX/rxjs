import { Immediate } from '../util/Immediate.js';
const { setImmediate, clearImmediate } = Immediate;

type SetImmediateFunction = (handler: () => void, ...args: any[]) => number;
type ClearImmediateFunction = (handle: number) => void;

interface ImmediateProvider {
  setImmediate: SetImmediateFunction;
  clearImmediate: ClearImmediateFunction;
  delegate:
    | {
        setImmediate: SetImmediateFunction;
        clearImmediate: ClearImmediateFunction;
      }
    | undefined;
}

export const immediateProvider: ImmediateProvider = {
  // When accessing the delegate, use the variable rather than `this` so that
  // the functions can be called without being bound to the provider.
  setImmediate(...args) {
    const { delegate } = immediateProvider;
    return (delegate?.setImmediate || setImmediate)(...args);
  },
  clearImmediate(handle) {
    const { delegate } = immediateProvider;
    return (delegate?.clearImmediate || clearImmediate)(handle);
  },
  delegate: undefined,
};
