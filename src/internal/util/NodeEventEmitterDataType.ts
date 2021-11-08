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
interface L5<N1, N2, N3, N4, N5, D1, D2, D3, D4, D5> extends L<N1, D1>, L<N2, D2>, L<N3, D3>, L<N4, D4>, L<N5, D5> {}
interface L6<N1, N2, N3, N4, N5, N6, D1, D2, D3, D4, D5, D6> extends L<N1, D1>, L<N2, D2>, L<N3, D3>, L<N4, D4>, L<N5, D5>, L<N6, D6> {}
interface L7<N1, N2, N3, N4, N5, N6, N7, D1, D2, D3, D4, D5, D6, D7>
  extends L<N1, D1>,
    L<N2, D2>,
    L<N3, D3>,
    L<N4, D4>,
    L<N5, D5>,
    L<N6, D6>,
    L<N7, D7> {}
interface L8<N1, N2, N3, N4, N5, N6, N7, N8, D1, D2, D3, D4, D5, D6, D7, D8>
  extends L<N1, D1>,
    L<N2, D2>,
    L<N3, D3>,
    L<N4, D4>,
    L<N5, D5>,
    L<N6, D6>,
    L<N7, D7>,
    L<N8, D8> {}
interface L9<N1, N2, N3, N4, N5, N6, N7, N8, N9, D1, D2, D3, D4, D5, D6, D7, D8, D9>
  extends L<N1, D1>,
    L<N2, D2>,
    L<N3, D3>,
    L<N4, D4>,
    L<N5, D5>,
    L<N6, D6>,
    L<N7, D7>,
    L<N8, D8>,
    L<N9, D9> {}

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
type EventNameDataPair5<AddRemoveListener> = AddRemoveListener extends L5<
  infer N1,
  infer N2,
  infer N3,
  infer N4,
  infer N5,
  infer D1,
  infer D2,
  infer D3,
  infer D4,
  infer D5
>
  ? [N1, D1] | [N2, D2] | [N3, D3] | [N4, D4] | [N5, D5]
  : never;
type EventNameDataPair6<AddRemoveListener> = AddRemoveListener extends L6<
  infer N1,
  infer N2,
  infer N3,
  infer N4,
  infer N5,
  infer N6,
  infer D1,
  infer D2,
  infer D3,
  infer D4,
  infer D5,
  infer D6
>
  ? [N1, D1] | [N2, D2] | [N3, D3] | [N4, D4] | [N5, D5] | [N6, D6]
  : never;
type EventNameDataPair7<AddRemoveListener> = AddRemoveListener extends L7<
  infer N1,
  infer N2,
  infer N3,
  infer N4,
  infer N5,
  infer N6,
  infer N7,
  infer D1,
  infer D2,
  infer D3,
  infer D4,
  infer D5,
  infer D6,
  infer D7
>
  ? [N1, D1] | [N2, D2] | [N3, D3] | [N4, D4] | [N5, D5] | [N6, D6] | [N7, D7]
  : never;
type EventNameDataPair8<AddRemoveListener> = AddRemoveListener extends L8<
  infer N1,
  infer N2,
  infer N3,
  infer N4,
  infer N5,
  infer N6,
  infer N7,
  infer N8,
  infer D1,
  infer D2,
  infer D3,
  infer D4,
  infer D5,
  infer D6,
  infer D7,
  infer D8
>
  ? [N1, D1] | [N2, D2] | [N3, D3] | [N4, D4] | [N5, D5] | [N6, D6] | [N7, D7] | [N8, D8]
  : never;
type EventNameDataPair9<AddRemoveListener> = AddRemoveListener extends L9<
  infer N1,
  infer N2,
  infer N3,
  infer N4,
  infer N5,
  infer N6,
  infer N7,
  infer N8,
  infer N9,
  infer D1,
  infer D2,
  infer D3,
  infer D4,
  infer D5,
  infer D6,
  infer D7,
  infer D8,
  infer D9
>
  ? [N1, D1] | [N2, D2] | [N3, D3] | [N4, D4] | [N5, D5] | [N6, D6] | [N7, D7] | [N8, D8] | [N9, D9]
  : never;

interface HasNodeEventEmitterAddRemove<N, D> {
  addListener(name: N, listener: (data: D, ...args: any[]) => void): this;
  removeListener(name: N, listener: (data: D, ...args: any[]) => void): this;
}

/**
 * Get the event name/data pair types from an event emitter
 *
 * @return `['foo', number] | ['bar', string]`
 */
type EventNameDataPair<AddRemoveListener extends HasNodeEventEmitterAddRemove<any, any>['addListener']> =
  | EventNameDataPair9<AddRemoveListener>
  | EventNameDataPair8<AddRemoveListener>
  | EventNameDataPair7<AddRemoveListener>
  | EventNameDataPair6<AddRemoveListener>
  | EventNameDataPair5<AddRemoveListener>
  | EventNameDataPair4<AddRemoveListener>
  | EventNameDataPair3<AddRemoveListener>
  | EventNameDataPair2<AddRemoveListener>
  | EventNameDataPair1<AddRemoveListener>;

/**
 * Convert the `any` type to `unknown for a better safety
 *
 * @return `AnyToUnknown<any> -> unknown`
 *
 *  TODO: huan(202111) need to be tested more and confirm it has no bug in edge cases
 */
type AnyToUnknown<T> = unknown extends T ? unknown : T;

// the [eventName, eventData] types array
type NodeEventEmitterNameDataPair<E extends HasNodeEventEmitterAddRemove<any, any>> = EventNameDataPair<E['addListener']>;

/**
 *
 * Tada! Get event emitter data type by event name 8-D
 *
 */
type NodeEventEmitterDataType<E extends HasNodeEventEmitterAddRemove<T, any>, T> = Extract<NodeEventEmitterNameDataPair<E>, [T, any]>[1];

// Convert `never` to `unknown`
type NodeEventEmitterDataTypeUnknown<E extends HasNodeEventEmitterAddRemove<T, any>, T> = NodeEventEmitterDataType<E, T> extends never
  ? unknown
  : NodeEventEmitterDataType<E, T>;

interface NamedNodeEventEmitter<N> {
  addListener(name: N, handler: (data: NodeEventEmitterDataType<HasNodeEventEmitterAddRemove<N, any>, N>, ...args: any[]) => any): this;
  removeListener(name: N, handler: (data: NodeEventEmitterDataType<HasNodeEventEmitterAddRemove<N, any>, N>, ...args: any[]) => any): this;
}

export type {
  AnyToUnknown,
  NamedNodeEventEmitter,
  NodeEventEmitterDataType,
  NodeEventEmitterDataTypeUnknown,
  NodeEventEmitterNameDataPair,
};
