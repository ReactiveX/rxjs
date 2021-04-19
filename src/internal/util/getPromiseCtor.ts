import { config } from '../config';

/**
 * Decides between a passed promise constructor from consuming code,
 * a promise constructor defined at global {@link config} or the native
 * promise constructor and returns it.
 * @param promiseCtor The optional promise constructor passed by consuming code
 */
export function getPromiseCtor(promiseCtor?: PromiseConstructorLike): PromiseConstructorLike {
  return promiseCtor ?? config.Promise ?? Promise;
}
