export function queue() {
  const queue: Array<() => void> = [];
  let flushing = false;
  return (fn: () => void) => {
    queue.push(fn);
    if (!flushing) {
      flushing = true;
      while (queue.length > 0) {
        queue.shift()();
      }
      flushing = false;
    }
  };
}