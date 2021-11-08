import { expect } from 'chai';

import {
  NodeEventEmitterNameDataPair,
  NodeEventEmitterDataType,
  NamedNodeEventEmitter,
} from '../../src/internal/util/NodeEventEmitterDataType';

const fooEvent = 'fooEvent';
const barEvent = 'barEvent';

type FOO_DATA = typeof fooEvent;
type BAR_DATA = typeof barEvent;

class NodeEventEmitterFixture {
  addListener(eventName: 'foo', listener: (foo: FOO_DATA) => void): this
  addListener(eventName: 'bar', listener: (bar: BAR_DATA) => void): this
  addListener(eventName: 'foo' | 'bar', listener: ((foo: FOO_DATA) => void) | ((bar: BAR_DATA) => void)): this  { return this; }

  removeListener(eventName: 'foo', listener: (foo: FOO_DATA) => void ): this
  removeListener(eventName: 'bar', listener: (bar: BAR_DATA) => void ): this
  removeListener(eventName: 'foo' | 'bar', listener: ((foo: FOO_DATA) => void) | ((bar: BAR_DATA) => void)): this  { return this; }

  /**
   * TODO: JQueryStyle compatible in the future
   */
  // on(eventName: 'foo', listener: (foo: number) => void): void
  // on(eventName: 'bar', listener: (bar: string) => void): void
  // on(eventName: 'foo' | 'bar', listener: ((foo: number) => void) | ((bar: string) => void)): void  {}

  // off(eventName: 'foo', listener: (foo: number) => void ): void
  // off(eventName: 'bar', listener: (bar: string) => void ): void
  // off(eventName: 'foo' | 'bar', listener: ((foo: number) => void) | ((bar: string) => void)): void  {}
}

describe('NodeEventEmitterDataType smoke testing', () => {
  it('should get emitter name & data types correctly', () => {
    const foo: NodeEventEmitterDataType<NodeEventEmitterFixture, 'foo'> = fooEvent;
    const bar: NodeEventEmitterDataType<NodeEventEmitterFixture, 'bar'> = barEvent;

    expect(foo).to.be.ok;
    expect(bar).to.be.ok;
  });

  it('should extendable', () => {
    const emitterTypeTest: NodeEventEmitterFixture extends NamedNodeEventEmitter<'foo'> ? true : never = true;
    expect(emitterTypeTest).to.be.ok;
  });

  it('should get name & data from NodeEventEmitterNameDataPair', () => {
    // type EVENT_PAIR = TypeEventPair<NodeEventEmitterTest['addListener']>
    type EVENT_PAIR = NodeEventEmitterNameDataPair<NodeEventEmitterFixture>;
    type EVENT_NAME = EVENT_PAIR[0];
    type EVENT_DATA = EVENT_PAIR[1];

    const nameTypeTest: EVENT_NAME extends 'foo' | 'bar'        ? true : never = true;
    const dataTypeTest: EVENT_DATA extends FOO_DATA | BAR_DATA  ? true : never = true;

    expect(nameTypeTest).to.be.ok;
    expect(dataTypeTest).to.be.ok;
  });
});