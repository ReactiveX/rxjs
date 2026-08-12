import { describe, expect, it } from 'vitest';
import { runProcess } from './lib/process.mjs';

describe('official WPT runner process gate', () => {
  it('rejects a nonzero runner exit as a blocking crash', async () => {
    await expect(
      runProcess(process.execPath, ['-e', 'process.stderr.write("runner crashed"); process.exit(7)'], {
        capture: true,
      })
    ).rejects.toThrow('runner crashed');
  });

  it('terminates and rejects a runner that exceeds the wall-clock limit', async () => {
    await expect(
      runProcess(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], {
        capture: true,
        timeoutMs: 50,
      })
    ).rejects.toThrow('timed out after 50 ms');
  });
});
