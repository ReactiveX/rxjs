import assert from 'node:assert/strict';
import { liveFeed, status } from '../src/live-feed.js';

describe('shared application state', () => {
  it('PT-PLATFORM-SHARING shares one active producer and restarts after final unsubscribe', () => {
    const log: string[] = [];
    const feed = liveFeed(log);
    const first = feed.subscribe();
    const second = feed.subscribe();
    first.unsubscribe();
    second.unsubscribe();
    feed.subscribe().unsubscribe();
    assert.deepEqual(log, ['start', 'stop', 'start', 'stop']);
  });

  it('PT-PLATFORM-SUBJECT preserves current and late-observer state', () => {
    status.next('ready');
    let observed = '';
    status.subscribe((value) => (observed = value)).unsubscribe();
    assert.equal(observed, 'ready');
  });

  it('PT-PLATFORM-REPEAT keeps refresh activation explicit', () => {
    const log: string[] = [];
    const feed = liveFeed(log);
    feed.subscribe().unsubscribe();
    feed.subscribe().unsubscribe();
    assert.deepEqual(log, ['start', 'stop', 'start', 'stop']);
  });
});
