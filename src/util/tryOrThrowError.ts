export function tryOrThrowError(target: Function): (x?: any) => any {
  function tryCatcher() {
    try {
      (<any> tryCatcher).target.apply(this, arguments);
    } catch (e) {
      throw e;
    }
  }
  (<any> tryCatcher).target = target;
  return tryCatcher;
}
