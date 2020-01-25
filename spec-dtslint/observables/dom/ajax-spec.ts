import { ajax } from 'rxjs/ajax';

it('should enforce function parameter', () => {
  const o = ajax(); // $ExpectError
});

it('should accept string param', () => {
  const o = ajax('/a'); // $ExpectType Observable<AjaxResponse>
});

it('should accept AjaxRequest params', () => {
  const ajaxRequest = {
    method: 'GET',
    url: '/a',
    body: {a: 'a', b: 'b'},
  };
  const o = ajax(ajaxRequest); // $ExpectType Observable<AjaxResponse>
});

describe('.getJson', () => {
  it('should accept string param', () => {
    const o = ajax.getJSON('/a'); // $ExpectType Observable<unknown>
  });

  it('should return generic type', () => {
    const o = ajax.getJSON<number>('/a'); // $ExpectType Observable<number>
  });
});
