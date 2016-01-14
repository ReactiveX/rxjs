import {Observable} from '../Observable';
import {map} from './map';

/**
 * Retrieves the value of a specified nested property from all elements in
 * the Observable sequence. If a property can't be resolved, it will return
 * `undefined` for that value.
 *
 * @param {...args} properties the nested properties to pluck
 * @returns {Observable} Returns a new Observable sequence of property values
 */
export function pluck(...properties: string[]): Observable<any> {
  const length = properties.length;
  if (length === 0) {
    throw new Error('List of properties cannot be empty.');
  }
  return map.call(this, plucker(properties, length));
}

function plucker(props: string[], length: number): (x: string) => any {
  const mapper = (x: string) => {
    let currentProp = x;
    for (let i = 0; i < length; i++) {
      const p = currentProp[props[i]];
      if (typeof p !== 'undefined') {
        currentProp = p;
      } else {
        return undefined;
      }
    }
    return currentProp;
  };

  return mapper;
}
