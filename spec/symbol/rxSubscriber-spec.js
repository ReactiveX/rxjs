var Rx = require('../../dist/cjs/Rx');
var RxKitchenSink = require('../../dist/cjs/Rx.KitchenSink');
var Symbol = require('../../dist/cjs/util/SymbolShim').SymbolShim;

describe('rxSubscriber symbol', function () {
  it('should exist on Rx', function () {
    expect(Rx.Symbol.rxSubscriber).toBe(Symbol.for('rxSubscriber'));
  });

  it('should exist on Rx.KitchenSink', function () {
    expect(RxKitchenSink.Symbol.rxSubscriber).toBe(Symbol.for('rxSubscriber'));
  });
});