/** Platform max delay for `setTimeout` / `setInterval` in milliseconds (2^31 - 1, ~24.8 days). */
export const MAX_TIMER_DELAY = 2147483647;

export function assertMaxTimerDelay(delay: number): void {
  if (delay > MAX_TIMER_DELAY) {
    throw new RangeError(`Cannot schedule a delay longer than ${MAX_TIMER_DELAY}ms (2^31 - 1). Received ${delay}ms.`);
  }
}
