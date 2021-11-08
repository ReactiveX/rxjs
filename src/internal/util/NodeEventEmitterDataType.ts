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

/**
 * Node.js EventEmitter Add/Remove Listener interface
 */
interface L<N, D> {
  (name: N, listener: (data: D, ..._: any[]) => any): any;
}

/**
 *
 * Overload function inferencer
 *
 *  - L: Listener interface with Add/Remove methods
 *  - N: Name of the event
 *  - D: Data of the event
 *
 */
interface L1<N1, D1> extends L<N1, D1> {}
interface L2<N1, N2, D1, D2> extends L<N1, D1>, L<N2, D2> {}
interface L3<N1, N2, N3, D1, D2, D3> extends L<N1, D1>, L<N2, D2>, L<N3, D3> {}
interface L4<N1, N2, N3, N4, D1, D2, D3, D4> extends L<N1, D1>, L<N2, D2>, L<N3, D3>, L<N4, D4> {}

type EventNameDataPair1<AddRemoveListener> = AddRemoveListener extends L1<infer N1, infer D1> ? [N1, D1] : never;
type EventNameDataPair2<AddRemoveListener> = AddRemoveListener extends L2<infer N1, infer N2, infer D1, infer D2>
  ? [N1, D1] | [N2, D2]
  : never;
type EventNameDataPair3<AddRemoveListener> = AddRemoveListener extends L3<infer N1, infer N2, infer N3, infer D1, infer D2, infer D3>
  ? [N1, D1] | [N2, D2] | [N3, D3]
  : never;
type EventNameDataPair4<AddRemoveListener> = AddRemoveListener extends L4<
  infer N1,
  infer N2,
  infer N3,
  infer N4,
  infer D1,
  infer D2,
  infer D3,
  infer D4
>
  ? [N1, D1] | [N2, D2] | [N3, D3] | [N4, D4]
  : never;

// type NodeEventEmitterAddRemoveListener<N = any, D = any> = (name: N, listener: (data: D, ...args: any[]) => any) => any;
interface HasNodeEventEmitterAddRemove<N, D> {
  addListener(name: N, listener: (data: D, ...args: any[]) => void): this;
  removeListener(name: N, listener: (data: D, ...args: any[]) => void): this;
}

/**
 * Get the event name/data pair types from an event emitter
 *
 * @example `['foo', number] | ['bar', string]`
 */
type EventNameDataPair<AddRemoveListener extends HasNodeEventEmitterAddRemove<any, any>['addListener']> =
  | EventNameDataPair4<AddRemoveListener>
  | EventNameDataPair3<AddRemoveListener>
  | EventNameDataPair2<AddRemoveListener>
  | EventNameDataPair1<AddRemoveListener>;

/**
 * Convert the `any` type to `unknown for a better safety
 *
 * @example `AnyToUnknown<any> === unknown`
 *
 *  TODO: huan(202111) need to be tested more and confirm it has no bug in edge cases
 */
type AnyToUnknown<T> = null extends T ? (void extends T ? unknown : T) : T;

// the [eventName, eventData] types array
type NodeEventEmitterNameDataPair<E extends HasNodeEventEmitterAddRemove<any, any>> = EventNameDataPair<E['addListener']>;

// the event names
// type NodeEventEmitterName<T extends HasNodeEventEmitterAddRemove<any, any>> = NodeEventEmitterNameDataPair<T>[0];
// // The types of `args[0]` defined by the listeners
// type NodeEventEmitterData<T extends HasNodeEventEmitterAddRemove<any, any>> = NodeEventEmitterNameDataPair<T>[1];

/**
 * Get event emitter data type by event name
 */
type NodeEventEmitterDataType<E extends HasNodeEventEmitterAddRemove<T, any>, T> = Extract<NodeEventEmitterNameDataPair<E>, [T, any]>[1];

// export interface NodeStyleEventEmitter<T extends HasNodeEventEmitterAddRemove<any, any>> {
interface NodeStyleEventEmitter<N> {
  addListener(name: N, handler: (data: NodeEventEmitterDataType<HasNodeEventEmitterAddRemove<N, any>, N>, ...args: any[]) => any): this;
  removeListener(name: N, handler: (data: NodeEventEmitterDataType<HasNodeEventEmitterAddRemove<N, any>, N>, ...args: any[]) => any): this;
}

export function fromEvent<T extends string | symbol, E extends NodeStyleEventEmitter<T>>(
  target: E | ArrayLike<E>,
  eventName: T
): Observable<NodeEventEmitterDataType<E, T>> {
  return {} as any;
}

export type { NodeEventEmitterDataType, NodeEventEmitterNameDataPair };
