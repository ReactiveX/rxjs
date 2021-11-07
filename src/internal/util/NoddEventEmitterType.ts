/**
 * Issue #6669 - fix(fromEvent): infer from Node.js EventEmitter with types
 *  @see https://github.com/ReactiveX/rxjs/pull/6669
 *
 *  Author: Huan <https://github.com/huan>
 *  Date: Nov 7, 2021
 *
 * TypeScript has design limitation that prevents us from inferring from the overload functins:
 *  > ReturnType or the use of infer in a function parameter or return position does handle overloads.
 *    the last overload is used for inference as it is assumed to be the most general.
 *    - @mhegazy @link https://github.com/Microsoft/TypeScript/issues/24275#issuecomment-390701982
 *
 * This file is created by @huan and it was inspired from the brilliant work from @Aidin on StackOverflow:
 *  @link https://stackoverflow.com/a/60822641/1123955
 */

/* eslint-disable no-use-before-define */
/* eslint-disable max-len */
import { Observable } from '../Observable';

class NodeEventEmitterTest {
  addListener(eventName: 'foo', listener: (foo: false) => void): this;
  addListener(eventName: 'bar', listener: (bar: boolean) => void): this;
  addListener(eventName: 'foo' | 'bar', listener: ((foo: false) => void) | ((bar: boolean) => void)): this {
    return this;
  }

  removeListener(eventName: 'foo', listener: (foo: false) => void): this;
  removeListener(eventName: 'bar', listener: (bar: boolean) => void): this;
  removeListener(eventName: 'foo' | 'bar', listener: ((foo: false) => void) | ((bar: boolean) => void)): this {
    return this;
  }

  /**
   * JQueryStyle
   */
  // on(eventName: 'foo', listener: (foo: number) => void): void
  // on(eventName: 'bar', listener: (bar: string) => void): void
  // on(eventName: 'foo' | 'bar', listener: ((foo: number) => void) | ((bar: string) => void)): void  {}

  // off(eventName: 'foo', listener: (foo: number) => void ): void
  // off(eventName: 'bar', listener: (bar: string) => void ): void
  // off(eventName: 'foo' | 'bar', listener: ((foo: number) => void) | ((bar: string) => void)): void  {}
}

/**
 * Node.js EventEmitter Add/Remove Listener interface
 */
interface L<T, E> {
  (type: T, listener: (event: E, ..._: any[]) => any): any;
}

/**
 * Overload function support
 *
 *  - L: Add/Remove Listener interface
 *  - T: Event type
 *  - E: Event payload
 */
interface L1<T1, E1> extends L<T1, E1> {}
interface L2<T1, T2, E1, E2> extends L<T1, E1>, L<T2, E2> {}
interface L3<T1, T2, T3, E1, E2, E3> extends L<T1, E1>, L<T2, E2>, L<T3, E3> {}

type TypeEventPair1<AddRemoveListener> = AddRemoveListener extends L1<infer T1, infer E1> ? [T1, E1] : never;
type TypeEventPair2<AddRemoveListener> = AddRemoveListener extends L2<infer T1, infer T2, infer E1, infer E2> ? [T1, E1] | [T2, E2] : never;
type TypeEventPair3<AddRemoveListener> = AddRemoveListener extends L3<infer T1, infer T2, infer T3, infer E1, infer E2, infer E3>
  ? [T1, E1] | [T2, E2] | [T3, E3]
  : never;

type NodeEventEmitterAddRemoveListener<T = any, E = any> = (type: T, listener: (event: E, ...args: any[]) => any) => any;

type TypeEventPair<AddRemoveListener extends NodeEventEmitterAddRemoveListener> =
  | TypeEventPair3<AddRemoveListener>
  | TypeEventPair2<AddRemoveListener>
  | TypeEventPair1<AddRemoveListener>;
// L extends { (t: infer T1, l: (e: infer E1, ..._: any[]) => any): any; (t: infer T2, l: (e: infer E2, ..._: any[]) => any): any; } ? [T1, E1] | [T2, E2] :
// Listener extends L2<infer T1, infer T2, infer E1, infer E2> ? [T1, E1] | [T2, E2] :
// L extends { Y<infer T1, infer E1>, Y<infer T2, infer E2> } [T1, E1] | [T2, E2] :
// L extends { (t: infer T1, l: (e: infer E1, ..._: any[]) => any): any } ? [T1, E1] :
// L extends Y<infer T1, infer E1> ? [T1, E1] :
// L extends L1<infer T1, infer E1> ? [T1, E1] :

/**
 * Convert the `any` type to `unknown for a better safety
 *  TODO: huan(202111) need to be tested more and confirm it has no bug in edge cases
 */
type AnyToUnknown<T> = null extends T ? (void extends T ? unknown : T) : T;

interface HasNodeEventEmitterAddRemove<T, E> {
  addListener(type: T, listener: (evt: E, ...args: any[]) => void): this;
  removeListener(type: T, listener: (evt: E, ...args: any[]) => void): this;
}

type NodeEventEmitterPair<E extends HasNodeEventEmitterAddRemove<any, any>> = TypeEventPair<E['addListener']>;

type NodeEventEmitterName<T extends HasNodeEventEmitterAddRemove<any, any>> = NodeEventEmitterPair<T>[0];

// type EVENT_PAIR = TypeEventPair<NodeEventEmitterTest['addListener']>
type EVENT_PAIR = NodeEventEmitterPair<NodeEventEmitterTest>;
type EVENT_NAME = EVENT_PAIR[0];
type EVENT_TYPE = EVENT_PAIR[1];

type NodeEventEmitterType<E extends HasNodeEventEmitterAddRemove<T, any>, T> = Extract<NodeEventEmitterPair<E>, [T, any]>[1];

type FOO_EVENT = NodeEventEmitterType<NodeEventEmitterTest, 'foo'>;
type BAR_EVENT = NodeEventEmitterType<NodeEventEmitterTest, 'bar'>;

// export interface NodeStyleEventEmitter<T extends HasNodeEventEmitterAddRemove<any, any>> {
export interface NodeStyleEventEmitter<T> {
  addListener(type: T, handler: (event: NodeEventEmitterType<HasNodeEventEmitterAddRemove<T, any>, T>, ...args: any[]) => any): this;
  removeListener(type: T, handler: (event: NodeEventEmitterType<HasNodeEventEmitterAddRemove<T, any>, T>, ...args: any[]) => any): this;
}

export function fromEvent<T extends string, E extends NodeStyleEventEmitter<T>>(
  target: E | ArrayLike<E>,
  eventName: T
): Observable<NodeEventEmitterType<E, T>> {
  return {} as any;
}

// type TARGET<E extends HasNodeEventEmitterAddRemove<any, any>> = NodeStyleEventEmitter<E>
// type TARGET1 = TARGET<typeof ne>
// type TARGET1_NAME = NodeEventEmitterName<TARGET1>
// type T = TypeEventPair<TARGET1['addListener']>
// type TARGET1_TYPE = NodeEventEmitterType<TARGET1, 'foo'>

// const t: T<typeof ne> = <any>0;

const ne = new NodeEventEmitterTest();
const foo$ = fromEvent(ne, 'foo');
const bar$ = fromEvent(ne, 'bar');

export type { NodeEventEmitterType };
