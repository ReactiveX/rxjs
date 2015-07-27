export default function tryOrOnError(target: Function): (x?: any) => any {
  function tryCatcher() {
    try {
      (<any> tryCatcher).target.apply(this, arguments);
    } catch (e) {
      this.error(e);
    }
  }
  (<any> tryCatcher).target = target;
  return tryCatcher;
}
