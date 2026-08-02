import assert from 'node:assert/strict';
import test from 'node:test';
import { selectIosSimulator } from './boot-ios-simulator.mjs';

test('selects a booted iPhone from the newest available iOS runtime', () => {
  const selected = selectIosSimulator({
    'com.apple.CoreSimulator.SimRuntime.iOS-18-4': [{ name: 'iPhone 16 Pro', udid: 'old', state: 'Shutdown', isAvailable: true }],
    'com.apple.CoreSimulator.SimRuntime.iOS-18-5': [
      { name: 'iPad Pro', udid: 'ipad', state: 'Booted', isAvailable: true },
      { name: 'iPhone 16', udid: 'new-shutdown', state: 'Shutdown', isAvailable: true },
      { name: 'iPhone 16 Pro', udid: 'new-booted', state: 'Booted', isAvailable: true },
    ],
  });

  assert.equal(selected.udid, 'new-booted');
  assert.equal(selected.runtime, 'com.apple.CoreSimulator.SimRuntime.iOS-18-5');
});

test('rejects a simulator inventory without an available iPhone', () => {
  assert.throws(
    () =>
      selectIosSimulator({
        'com.apple.CoreSimulator.SimRuntime.iOS-18-5': [{ name: 'iPad Pro', udid: 'ipad', state: 'Shutdown', isAvailable: true }],
      }),
    /No available iPhone simulator/
  );
});
