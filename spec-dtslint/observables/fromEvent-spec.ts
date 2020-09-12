import { fromEvent } from 'rxjs';
import { B } from "../helpers";

declare const eventTargetSource: HTMLDocument;

interface NodeStyleSource {
  addListener: (eventName: string | symbol, handler: (...args: any[]) => void) => this;
  removeListener: (eventName: string | symbol, handler: (...args: any[]) => void) => this;
};
declare const nodeStyleSource : NodeStyleSource;

declare const nodeCompatibleSource: {
  addListener: (eventName: string, handler: (...args: any[]) => void) => void;
  removeListener: (eventName: string, handler: (...args: any[]) => void) => void;
};

// Use handler types like those in @types/jquery. See:
// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/847731ba1d7fa6db6b911c0e43aa0afe596e7723/types/jquery/misc.d.ts#L6395
interface JQueryStyleSource<TContext, T> {
  on: (eventName: string, handler: (this: TContext, t: T, ...args: any[]) => any) => void;
  off: (eventName: string, handler: (this: TContext, t: T, ...args: any[]) => any) => void;
};
declare const jQueryStyleSource: JQueryStyleSource<any, any>;

it('should support an event target source', () => {
  const a = fromEvent(eventTargetSource, "click"); // $ExpectType Observable<Event>
});

it('should support a node-style source', () => {
  const a = fromEvent(nodeStyleSource, "something"); // $ExpectType Observable<unknown>
  const b = fromEvent<B>(nodeStyleSource, "something"); // $ExpectType Observable<B>
});

it('should support a node-compatible source', () => {
  const a = fromEvent(nodeCompatibleSource, "something"); // $ExpectType Observable<unknown>
  const b = fromEvent<B>(nodeCompatibleSource, "something"); // $ExpectType Observable<B>
});

// TODO: uncomment when the fromEvent jQuery types are fixed
// it('should support a jQuery-style source', () => {
//   const a = fromEvent(jQueryStyleSource, "something"); // $ExpectType Observable<unknown>
//   const b = fromEvent<B>(jQueryStyleSource, "something"); // $ExpectType Observable<B>
// });
