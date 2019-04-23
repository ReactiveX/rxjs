import { randomBytes } from 'crypto';

/**
 * Generates a unique ID for the decision tree nodes
 *
 * @export
 * @requires crypto:randomByes
 * @returns {string}
 */
export function generateUniqueId(): string {
  return randomBytes(2).toString('hex');
}
