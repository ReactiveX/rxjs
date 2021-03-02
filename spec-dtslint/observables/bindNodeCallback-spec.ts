import { bindNodeCallback } from 'rxjs';
import { a,  b,  c,  d,  e,  f,  g, A, B, C, D, E, F, G } from '../helpers';

import * as fs from 'fs';

describe('works with overloads' , () => {
  const o = bindNodeCallback(fs.readFile);
  o('foo').subscribe(v => {
    v // $ExpectType Buffer
  });
  o('foo', {encoding: 'ascii', flag: ''}).subscribe(v => {
    v // $ExpectType Buffer
  });
  o('foo', {}).subscribe(v => {
    v // $ExpectType Buffer
  });
  o('foo', {encoding: 'foo'}); // $ExpectError
  o(true); // $ExpectError
});
