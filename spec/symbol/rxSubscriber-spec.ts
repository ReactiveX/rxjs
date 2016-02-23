import * as Rx from '../../dist/cjs/Rx';
import * as RxKitchenSink from '../../dist/cjs/Rx.KitchenSink';
import {SymbolShim} from '../../dist/cjs/util/SymbolShim';

describe('rxSubscriber symbol', () => {
  it('should exist on Rx', () => {
    expect(Rx.Symbol.rxSubscriber).toBe(SymbolShim.for('rxSubscriber'));
  });

  it('should exist on Rx.KitchenSink', () => {
    expect(RxKitchenSink.Symbol.rxSubscriber).toBe(SymbolShim.for('rxSubscriber'));
  });
});