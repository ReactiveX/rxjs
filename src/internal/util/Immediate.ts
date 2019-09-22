let nextHandle = 1;

const tasksByHandle: { [handle: string]: () => void } = {};

function runIfPresent(handle: number) {
  const cb = tasksByHandle[handle];
  if (cb) {
    cb();
  }
  Immediate.clearImmediate(handle);
}

export const Immediate = {
  setImmediate(cb: () => void): number {
    const handle = nextHandle++;
    tasksByHandle[handle] = cb;
    Promise.resolve().then(() => runIfPresent(handle));
    return handle;
  },

  clearImmediate(handle: number): void {
    delete tasksByHandle[handle];
  },
};

export const TestTools = {
  pending() {
    return Object.keys(tasksByHandle).length;
  }
};
