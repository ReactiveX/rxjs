/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

declare var WorkerGlobalScope: any;
// CommonJS / Node have global context exposed as "global" variable.
// We don't want to include the whole node.d.ts this this compilation unit so we'll just fake
// the global "global" var for now.
declare var global: any;

const __window = typeof window !== 'undefined' && window;
const __self = typeof self !== 'undefined'
  && typeof WorkerGlobalScope !== 'undefined'
  && self instanceof WorkerGlobalScope
  && self;
const __global = typeof global !== 'undefined' && global;
const _root: any = __window || __global || __self;
export { _root as root };