import { ApiListNode, FlattenedApiList } from './interfaces';
import { isStable } from './helpers';

/**
 * Flattens API List from the docs generation into a map with relavant properties.
 * Makes navigation easier.
 *
 * @export
 * @param {ApiListNode[]} [apiList=[]]
 * @requires isStable
 * @returns {FlattenedApiList}
 * @todo create better type lenses - inference is not working well here
 */
export function flattenApiList(apiList: ApiListNode[]): FlattenedApiList {
  return apiList.reduce((acc, curr): FlattenedApiList => {
    return {
      ...acc,
      ...curr.items.reduce((acc, curr): FlattenedApiList => {
        if (isStable(curr.stability)) {
          return {
            ...acc,
            [curr.title]: {
              path: curr.path,
              docType: curr.docType,
            }
          };
        }

        return {
          ...acc,
        };
      }, {} as FlattenedApiList),
    };
  }, {} as FlattenedApiList);
}
