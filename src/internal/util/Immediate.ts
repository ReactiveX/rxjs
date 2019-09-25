let nextHandle = 1;
const RESOLVED = Promise.resolve();
const activeHandles: number[] = [];

/**
 * Finds the handle in the list of active handles, and removes it.
 * Returns `true` if found, `false` otherwise. Used both to clear
 * Immediate scheduled tasks, and to identify if a task should be scheduled.
 */
function findAndClearHandle(handle: number): boolean {
  const i = activeHandles.indexOf(handle);
  if (i >= 0) {
    activeHandles.splice(i, 1);
    return true;
  }
  return false;
}

/**
 * Helper functions to schedule and unschedule microtasks.
 */
export const Immediate = {
  setImmediate(cb: () => void): number {
    const handle = nextHandle++;
    activeHandles.push(handle);
    RESOLVED.then(() => findAndClearHandle(handle) && cb());
    return handle;
  },

  clearImmediate(handle: number): void {
    findAndClearHandle(handle);
  },
};

/**
 * Used for internal testing purposes only. Do not export from library.
 */
export const TestTools = {
  pending() {
    return activeHandles.length;
  }
};
