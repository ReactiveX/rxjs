import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import './index.js';

type Action =
  | { kind: 'subscribe' }
  | { kind: 'abort'; observer: number }
  | { kind: 'next'; value: number }
  | { kind: 'complete' }
  | { kind: 'error' };

describe('Observable lifecycle state machine', () => {
  it('preserves sharing, ref-count, restart, terminal, abort, and teardown invariants', () => {
    const action = fc.oneof(
      fc.constant<Action>({ kind: 'subscribe' }),
      fc.nat({ max: 30 }).map<Action>((observer) => ({ kind: 'abort', observer })),
      fc.integer().map<Action>((value) => ({ kind: 'next', value })),
      fc.constant<Action>({ kind: 'complete' }),
      fc.constant<Action>({ kind: 'error' })
    );
    fc.assert(
      fc.property(fc.array(action, { minLength: 1, maxLength: 200 }), (actions) => {
        let activations = 0;
        let teardowns = 0;
        let subscriber: Subscriber<number> | undefined;
        const controllers: AbortController[] = [];
        const received: number[][] = [];
        const active = new Set<number>();
        const source = new Observable<number>((current) => {
          activations++;
          subscriber = current;
          current.addTeardown(() => teardowns++);
        });

        for (const current of actions) {
          if (current.kind === 'subscribe') {
            const index = controllers.length;
            const controller = new AbortController();
            controllers.push(controller);
            received.push([]);
            source.subscribe(
              {
                next: (value) => received[index]!.push(value),
                complete: () => active.delete(index),
                error: () => active.delete(index),
              },
              { signal: controller.signal }
            );
            active.add(index);
          } else if (current.kind === 'abort') {
            const index = controllers.length === 0 ? -1 : current.observer % controllers.length;
            controllers[index]?.abort();
            active.delete(index);
          } else if (current.kind === 'next') {
            const before = received.map(({ length }) => length);
            subscriber?.next(current.value);
            received.forEach((values, index) => {
              expect(values.length - before[index]!).toBe(active.has(index) ? 1 : 0);
            });
          } else if (current.kind === 'complete') {
            subscriber?.complete();
            active.clear();
          } else {
            if (subscriber?.active) subscriber.error(new Error('property error'));
            active.clear();
          }
          expect(activations - teardowns).toBe(active.size > 0 ? 1 : 0);
          expect(teardowns).toBeLessThanOrEqual(activations);
        }

        for (const controller of controllers) controller.abort();
        expect(activations).toBe(teardowns);
      }),
      { numRuns: Number(process.env.RXJS_FUZZ_RUNS ?? 200) }
    );
  });
});
