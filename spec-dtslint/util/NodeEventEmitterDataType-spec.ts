import {
  NodeEventEmitterNameDataPair,
  NodeEventEmitterDataType,
  NodeEventEmitterDataTypeUnknown,
  AnyToUnknown,
} from '../../src/internal/util/NodeEventEmitterDataType';

it('NodeEventEmitterDataType smoke testing', () => {
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

  it('should get emitter name & data types correctly', () => {
    // $ExpectType "fooEvent"
    type Foo = NodeEventEmitterDataType<NodeEventEmitterFixture, 'foo'>;
    // $ExpectType "barEvent"
    type Bar = NodeEventEmitterDataType<NodeEventEmitterFixture, 'bar'>;
  });

  it('should get name & data from NodeEventEmitterNameDataPair', () => {
    // type EVENT_PAIR = TypeEventPair<NodeEventEmitterTest['addListener']>
    type EVENT_PAIR = NodeEventEmitterNameDataPair<NodeEventEmitterFixture>;

    // $ExpectType "foo" | "bar"
    type EVENT_NAME = EVENT_PAIR[0];
    // $ExpecTType  FOO_DATA | BAR_DATA
    type EVENT_DATA = EVENT_PAIR[1];
  });

  it('should get `unknown` for `process` events by NodeEventEmitterDataTypeUnknown', () => {
    // $ExpectType unknown
    type Exit = NodeEventEmitterDataTypeUnknown<
      Pick<
        typeof process,
        'addListener' | 'removeListener'
      >,
      'exit'
    >;
  });

  it('should get `never` for `process` events by NodeEventEmitterDataType', () => {
    // $ExpectType never
    type Exit = NodeEventEmitterDataType<
      Pick<
        typeof process,
        'addListener' | 'removeListener'
      >,
      'exit'
    >
  });
});

it('AnyToUnknown smoke testing', () => {
  it('should only convert any to unknown', () => {
    type T_ANY       = AnyToUnknown<any>
    type T_UNKNOWN   = AnyToUnknown<unknown>

    type T_BOOLEAN   = AnyToUnknown<boolean>
    type T_NULL      = AnyToUnknown<null>
    type T_OBJ       = AnyToUnknown<object>
    type T_STRING    = AnyToUnknown<string>
    type T_UNDEFINED = AnyToUnknown<undefined>
    type T_VOID      = AnyToUnknown<void>
    type T_NEVER     = AnyToUnknown<never>

    // $ExpectType unknown
    type UNKNOWN_TYPE = T_ANY & T_UNKNOWN

    type KNOWN_TYPE = T_VOID | T_BOOLEAN | T_STRING | T_UNDEFINED | T_NULL | T_OBJ | T_NEVER
    // $ExpectType true
    type T = unknown extends KNOWN_TYPE ? never : true
  });
});
