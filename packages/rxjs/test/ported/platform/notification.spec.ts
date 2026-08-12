// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/Notification-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { Notification } from 'rxjs/notification';
describe('Notification (platform)', () => {
  it('should create observable from a next Notification', async () => {
    await rxTest(({ expectObservable }) => {
      const value = 'a';
      const next = Notification.createNext(value);
      expectObservable(next.toObservable()).toBe('(a|)');
    });
  });
  it('should create observable from a complete Notification', async () => {
    await rxTest(({ expectObservable }) => {
      const complete = Notification.createComplete();
      expectObservable(complete.toObservable()).toBe('|');
    });
  });
  it('should create observable from a error Notification', async () => {
    await rxTest(({ expectObservable }) => {
      const error = Notification.createError('error');
      expectObservable(error.toObservable()).toBe('#');
    });
  });
});
