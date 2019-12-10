export function comparePropertyFactory<T, U>(
  orderAsc = true,
  getProp: (i: T) => U,
  formatter: (v: U) => string | number | boolean = (i) => i + ''
) {
  return (a, b) => {
    const propA = getProp(a);
    const propB = getProp(b);
    if (propA === undefined || propB === undefined) {
      // property doesn't exist on either object
      return 0;
    }

    const varA = formatter(propA);
    const varB = formatter(propB);

    let comparison = 0;
    if (varA > varB) {
      comparison = 1;
    } else if (varA < varB) {
      comparison = -1;
    }
    return (
      (orderAsc === false) ? (comparison * -1) : comparison
    );
  };
}
