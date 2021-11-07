import { expect } from 'chai';

import { NodeEmitterEvent } from './inference-overload-function';

class NodeEventeEmitterFixture {
  addListener(eventName: 'foo', listener: (foo: false) => void): this
  addListener(eventName: 'bar', listener: (bar: boolean) => void): this
  addListener(eventName: 'foo' | 'bar', listener: ((foo: false) => void) | ((bar: boolean) => void)): this  { return this; }

  removeListener(eventName: 'foo', listener: (foo: false) => void ): this
  removeListener(eventName: 'bar', listener: (bar: boolean) => void ): this
  removeListener(eventName: 'foo' | 'bar', listener: ((foo: false) => void) | ((bar: boolean) => void)): this  { return this; }

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

describe('overload function inference types helper', () => {
  it('should get emitter type & event as correctly', () => {
    const foo: NodeEmitterEvent<NodeEventeEmitterFixture, 'foo'> = false;
    const bar: NodeEmitterEvent<NodeEventeEmitterFixture, 'bar'> = true;

    expect(foo).to.be.false;
    expect(bar).to.be.true;
  });
});