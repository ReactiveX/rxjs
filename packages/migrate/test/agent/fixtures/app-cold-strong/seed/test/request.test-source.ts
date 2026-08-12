import { describe, expect, it } from 'vitest';
import { request } from '../src/request.js';

describe('cold request lifecycle', () => {
  it('PT-COLD-INDEPENDENT starts one producer per direct subscription', () => {
    const log: string[] = [];
    const first = request(log).subscribe();
    const second = request(log).subscribe();
    expect(log).toEqual(['start', 'start']);
    first.unsubscribe();
    second.unsubscribe();
  });

  it('PT-COLD-CANCELLATION closes the producer on unsubscribe', () => {
    const log: string[] = [];
    const subscription = request(log).subscribe();
    subscription.unsubscribe();
    expect(log).toEqual(['start', 'stop']);
  });

  it('PT-COLD-TEARDOWN keeps teardown ordering observable', () => {
    const log: string[] = [];
    const subscription = request(log).subscribe();
    subscription.add(() => log.push('outer-stop'));
    subscription.unsubscribe();
    expect(log).toEqual(['start', 'stop', 'outer-stop']);
  });
});
