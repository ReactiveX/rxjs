import assert from 'node:assert/strict';
import test from 'node:test';
import { retrySafariSession, safariCapabilities, waitForDriver } from './safari-driver.mjs';

test('desktop Safari capabilities request the native desktop browser', () => {
  assert.deepEqual(safariCapabilities('desktop'), { alwaysMatch: { browserName: 'Safari' } });
});

test('Mobile Safari capabilities require an actual iOS simulator session', () => {
  assert.deepEqual(safariCapabilities('ios'), {
    alwaysMatch: {
      browserName: 'Safari',
      platformName: 'iOS',
      'safari:useSimulator': true,
    },
  });
});

test('unknown Safari targets are rejected', () => {
  assert.throws(() => safariCapabilities('webkit'), /Unknown Safari target/);
});

test('Mobile Safari can target the simulator selected by the runner', () => {
  assert.equal(safariCapabilities('ios', { deviceUdid: 'SIMULATOR-UDID' }).alwaysMatch['safari:deviceUDID'], 'SIMULATOR-UDID');
});

test('Mobile Safari session creation retries one transient launch timeout', async () => {
  let attempts = 0;
  const result = await retrySafariSession(
    async () => {
      if (++attempts === 1) throw new Error('session timed out');
      return 'connected';
    },
    { attempts: 2, wait: async () => undefined }
  );
  assert.equal(result, 'connected');
  assert.equal(attempts, 2);
});

test('SafariDriver readiness tolerates a bounded slow startup', async () => {
  let attempts = 0;
  await waitForDriver('http://127.0.0.1:4444', {
    attempts: 3,
    requestStatus: async () => ({ ok: ++attempts === 3 }),
    wait: async () => undefined,
  });
  assert.equal(attempts, 3);
});

test('SafariDriver readiness reports diagnostics collected during startup', async () => {
  let diagnostics = '';
  await assert.rejects(
    waitForDriver('http://127.0.0.1:4444', {
      attempts: 2,
      requestStatus: async () => {
        diagnostics = 'late safaridriver startup failure';
        throw new Error('not ready');
      },
      wait: async () => undefined,
      getDiagnostics: () => diagnostics,
    }),
    /late safaridriver startup failure/
  );
});
