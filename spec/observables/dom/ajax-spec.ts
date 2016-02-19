import * as Rx from '../../../dist/cjs/Rx.DOM';
import {root} from '../../../dist/cjs/util/root';
import {MockXMLHttpRequest} from '../../helpers/ajax-helper';
import {it} from '../../helpers/test-helper';

declare const global: any;
//declare const XMLHttpRequest: MockXMLHttpRequest;

describe('Observable.ajax', () => {
  let gXHR: XMLHttpRequest;
  let rXHR: XMLHttpRequest;

  beforeEach(() => {
    gXHR = global.XMLHttpRequest;
    rXHR = root.XMLHttpRequest;
    global.XMLHttpRequest = MockXMLHttpRequest;
    root.XMLHttpRequest = MockXMLHttpRequest;
  });

  afterEach(() => {
    MockXMLHttpRequest.clearRequest();

    global.XMLHttpRequest = gXHR;
    root.XMLHttpRequest = rXHR;
  });

  it('should set headers', () => {
    const obj = {
      url: '/talk-to-me-goose',
      headers: {
        'Content-Type': 'kenny/loggins',
        'Fly-Into-The': 'Dangah Zone!',
        'Take-A-Ride-Into-The': 'Danger ZoooOoone!'
      }
    };

    (<any>Rx.Observable.ajax)(obj).subscribe();

    const request = MockXMLHttpRequest.mostRecent;

    expect(request.url).toBe('/talk-to-me-goose');
    expect(request.requestHeaders).toEqual({
      'Content-Type': 'kenny/loggins',
      'Fly-Into-The': 'Dangah Zone!',
      'Take-A-Ride-Into-The': 'Danger ZoooOoone!',
      'X-Requested-With': 'XMLHttpRequest'
    });
  });

  it('should have an optional resultSelector', () => {
    const expected = 'avast ye swabs!';
    let result;
    let complete = false;

    const obj = {
      url: '/flibbertyJibbet',
      responseType: 'text',
      resultSelector: (res: any) => res.response
    };

    (<any>Rx.Observable.ajax)(obj)
      .subscribe((x: any) => {
        result = x;
      }, null, () => {
        complete = true;
      });

    expect(MockXMLHttpRequest.mostRecent.url).toBe('/flibbertyJibbet');

    MockXMLHttpRequest.mostRecent.respondWith({
      'status': 200,
      'contentType': 'application/json',
      'responseText': expected
    });

    expect(result).toBe(expected);
    expect(complete).toBe(true);
  });

  it('should have error when resultSelector errors', () => {
    const expected = 'avast ye swabs!';
    let error;
    const obj = {
      url: '/flibbertyJibbet',
      responseType: 'text',
      resultSelector: (res: any) => {
        throw new Error('ha! ha! fooled you!');
      }
    };

    (<any>Rx.Observable.ajax)(obj)
      .subscribe((x: any) => {
        throw 'should not next';
      }, (err: any) => {
        error = err;
      }, () => {
        throw 'should not complete';
      });

    expect(MockXMLHttpRequest.mostRecent.url).toBe('/flibbertyJibbet');

    MockXMLHttpRequest.mostRecent.respondWith({
      'status': 200,
      'contentType': 'application/json',
      'responseText': expected
    });

    expect(error).toEqual(new Error('ha! ha! fooled you!'));
  });

  it('should error if createXHR throws', () => {
    let error;
    const obj = {
      url: '/flibbertyJibbet',
      responseType: 'text',
      createXHR: () => {
        throw new Error('wokka wokka');
      }
    };

    (<any>Rx.Observable.ajax)(obj)
      .subscribe((x: any) => {
        throw 'should not next';
      }, (err: any) => {
        error = err;
      }, () => {
        throw 'should not complete';
      });

    expect(error).toEqual(new Error('wokka wokka'));
  });

  it('should succeed on 200', () => {
    const expected = { foo: 'bar' };
    let result;
    let complete = false;
    const obj = {
      url: '/flibbertyJibbet',
      responseType: 'text',
    };

    (<any>Rx.Observable.ajax)(obj)
      .subscribe((x: any) => {
        result = x;
      }, null, () => {
        complete = true;
      });

    expect(MockXMLHttpRequest.mostRecent.url).toBe('/flibbertyJibbet');

    MockXMLHttpRequest.mostRecent.respondWith({
      'status': 200,
      'contentType': 'application/json',
      'responseText': JSON.stringify(expected)
    });

    expect(result.xhr).toBeDefined();
    expect(result.response).toBe(JSON.stringify({ foo: 'bar' }));
    expect(complete).toBe(true);
  });

  it('should fail on 404', () => {
    let error;
    const obj = {
      url: '/flibbertyJibbet',
      normalizeError: (e: any, xhr: any, type: any) => {
        return xhr.response || xhr.responseText;
      },
      responseType: 'text'
    };

    (<any>Rx.Observable.ajax)(obj)
      .subscribe((x: any) => {
        throw 'should not next';
      }, (err: any) => {
        error = err;
      }, () => {
        throw 'should not complete';
      });

    expect(MockXMLHttpRequest.mostRecent.url).toBe('/flibbertyJibbet');

    MockXMLHttpRequest.mostRecent.respondWith({
      'status': 404,
      'contentType': 'text/plain',
      'responseText': 'Wee! I am text!'
    });

    expect(error instanceof Rx.AjaxError).toBe(true);
    expect(error.message).toBe('ajax error 404');
    expect(error.status).toBe(404);
  });

  it('should fail on 404', () => {
    let error;
    const obj = {
      url: '/flibbertyJibbet',
      normalizeError: (e: any, xhr: any, type: any) => {
        return xhr.response || xhr.responseText;
      },
      responseType: 'text'
    };

    (<any>Rx.Observable.ajax)(obj).subscribe((x: any) => {
        throw 'should not next';
      }, (err: any) => {
        error = err;
      }, () => {
        throw 'should not complete';
      });

    expect(MockXMLHttpRequest.mostRecent.url).toBe('/flibbertyJibbet');

    MockXMLHttpRequest.mostRecent.respondWith({
      'status': 300,
      'contentType': 'text/plain',
      'responseText': 'Wee! I am text!'
    });

    expect(error instanceof Rx.AjaxError).toBe(true);
    expect(error.message).toBe('ajax error 300');
    expect(error.status).toBe(300);
  });

  it('should succeed no settings', () => {
    const expected = JSON.stringify({ foo: 'bar' });
    //Type definition need to be updated
    (<any>Rx.Observable.ajax)('/flibbertyJibbet')
        .subscribe((x: any) => {
          expect(x.status).toBe(200);
          expect(x.xhr.method).toBe('GET');
          expect(x.xhr.responseText).toBe(expected);
        }, () => {
          throw 'should not have been called';
        });

    expect(MockXMLHttpRequest.mostRecent.url).toBe('/flibbertyJibbet');
    MockXMLHttpRequest.mostRecent.respondWith({
      'status': 200,
      'contentType': 'text/plain',
      'responseText': expected
    });
  });

  it('should fail no settings', () => {
    const expected = JSON.stringify({ foo: 'bar' });

    (<any>Rx.Observable.ajax)('/flibbertyJibbet')
        .subscribe(() => {
          throw 'should not have been called';
        }, (x: any) => {
          expect(x.status).toBe(500);
          expect(x.xhr.method).toBe('GET');
          expect(x.xhr.responseText).toBe(expected);
        }, () => {
          throw 'should not have been called';
        });

    expect(MockXMLHttpRequest.mostRecent.url).toBe('/flibbertyJibbet');
    MockXMLHttpRequest.mostRecent.respondWith({
      'status': 500,
      'contentType': 'text/plain',
      'responseText': expected
    });
  });

  describe('ajax.get', () => {
    it('should succeed on 200', () => {
      const expected = { foo: 'bar' };
      let result;
      let complete = false;

      Rx.Observable
        .ajax.get('/flibbertyJibbet')
        .subscribe((x: any) => {
          result = x;
        }, null, () => {
          complete = true;
        });

      const request = MockXMLHttpRequest.mostRecent;

      expect(request.url).toBe('/flibbertyJibbet');

      request.respondWith({
        'status': 200,
        'contentType': 'application/json',
        'responseText': JSON.stringify(expected)
      });

      expect(result).toEqual(expected);
      expect(complete).toBe(true);
    });

    it('should succeed on 200 with a resultSelector', () => {
      const expected = { larf: 'hahahahaha' };
      let result;
      let innerResult;
      let complete = false;

      Rx.Observable
        .ajax.get('/flibbertyJibbet', (x: any) => {
          innerResult = x;
          return x.response.larf.toUpperCase();
        })
        .subscribe((x: any) => {
          result = x;
        }, null , () => {
          complete = true;
        });

      expect(MockXMLHttpRequest.mostRecent.url).toBe('/flibbertyJibbet');

      MockXMLHttpRequest.mostRecent.respondWith({
        'status': 200,
        'contentType': 'application/json',
        'responseText': JSON.stringify(expected)
      });

      expect(innerResult.xhr).toBeDefined();
      expect(innerResult.response).toEqual({ larf: 'hahahahaha' });
      expect(result).toBe('HAHAHAHAHA');
      expect(complete).toBe(true);
    });
  });

  describe('ajax.post', () => {
    it('should succeed on 200', () => {
      const expected = { foo: 'bar', hi: 'there you' };
      let result;
      let complete = false;

      Rx.Observable
        .ajax.post('/flibbertyJibbet', expected)
        .subscribe((x: any) => {
          result = x;
        }, null , () => {
          complete = true;
        });

      const request = MockXMLHttpRequest.mostRecent;

      expect(request.method).toBe('POST');
      expect(request.url).toBe('/flibbertyJibbet');
      expect(request.requestHeaders).toEqual({
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
      });

      request.respondWith({
        'status': 200,
        'contentType': 'application/json',
        'responseText': JSON.stringify(expected)
      });

      expect(request.data).toEqual('foo=bar&hi=there%20you');
      expect(result.response).toEqual(expected);
      expect(complete).toBe(true);
    });
  });
});

