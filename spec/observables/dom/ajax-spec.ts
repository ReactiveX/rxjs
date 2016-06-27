import {expect} from 'chai';
import * as sinon from 'sinon';
import * as Rx from '../../../dist/cjs/Rx';
import {root} from '../../../dist/cjs/util/root';
import {MockXMLHttpRequest} from '../../helpers/ajax-helper';

declare const global: any;

/** @test {ajax} */
describe('Observable.ajax', () => {
  let gXHR: XMLHttpRequest;
  let rXHR: XMLHttpRequest;

  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    gXHR = global.XMLHttpRequest;
    rXHR = root.XMLHttpRequest;

    global.XMLHttpRequest = MockXMLHttpRequest;
    root.XMLHttpRequest = MockXMLHttpRequest;
  });

  afterEach(() => {
    sandbox.restore();
    MockXMLHttpRequest.clearRequest();

    global.XMLHttpRequest = gXHR;
    root.XMLHttpRequest = rXHR;

    root.XDomainRequest = null;
    root.ActiveXObject = null;
  });

  it('should create default XMLHttpRequest for non CORS', () => {
    const obj: Rx.AjaxRequest = {
      url: '/',
      method: ''
    };

    Rx.Observable.ajax(obj).subscribe();
    expect(MockXMLHttpRequest.mostRecent.withCredentials).to.be.false;
  });

  it('should try to create AXObject for XHR in old version of IE', () => {
    const axObjectStub = sandbox.stub();
    axObjectStub.returns(sinon.stub(new MockXMLHttpRequest()));
    root.ActiveXObject = axObjectStub;
    root.XMLHttpRequest = null;

    const obj: Rx.AjaxRequest = {
      url: '/',
      method: ''
    };

    Rx.Observable.ajax(obj).subscribe();
    expect(axObjectStub).to.have.been.called;
  });

  it('should throw if not able to create XMLHttpRequest', () => {
    root.XMLHttpRequest = null;
    root.ActiveXObject = null;

    const obj: Rx.AjaxRequest = {
      url: '/',
      method: ''
    };

    expect(() => {
      Rx.Observable.ajax(obj).subscribe();
    }).to.throw();
  });

  it('should create XMLHttpRequest for CORS', () => {
    const obj: Rx.AjaxRequest = {
      url: '/',
      method: '',
      crossDomain: true,
      withCredentials: true
    };

    Rx.Observable.ajax(obj).subscribe();
    expect(MockXMLHttpRequest.mostRecent.withCredentials).to.be.true;
  });

  it('should try to create XDomainRequest for CORS if XMLHttpRequest is not available', () => {
    const xDomainStub = sandbox.stub();
    xDomainStub.returns(sinon.stub(new MockXMLHttpRequest()));
    root.XDomainRequest = xDomainStub;
    root.XMLHttpRequest = null;

    const obj: Rx.AjaxRequest = {
      url: '/',
      method: '',
      crossDomain: true,
      withCredentials: true
    };

    Rx.Observable.ajax(obj).subscribe();
    expect(xDomainStub).to.have.been.called;
  });

  it('should throw if not able to create CORS request', () => {
    root.XMLHttpRequest = null;
    root.XDomainRequest = null;

    const obj: Rx.AjaxRequest = {
      url: '/',
      method: '',
      crossDomain: true,
      withCredentials: true
    };

    expect(() => {
      Rx.Observable.ajax(obj).subscribe();
    }).to.throw();
  });

  it('should set headers', () => {
    const obj: Rx.AjaxRequest = {
      url: '/talk-to-me-goose',
      headers: {
        'Content-Type': 'kenny/loggins',
        'Fly-Into-The': 'Dangah Zone!',
        'Take-A-Ride-Into-The': 'Danger ZoooOoone!'
      },
      method: ''
    };

    Rx.Observable.ajax(obj).subscribe();

    const request = MockXMLHttpRequest.mostRecent;

    expect(request.url).to.equal('/talk-to-me-goose');
    expect(request.requestHeaders).to.deep.equal({
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

    expect(MockXMLHttpRequest.mostRecent.url).to.equal('/flibbertyJibbet');

    MockXMLHttpRequest.mostRecent.respondWith({
      'status': 200,
      'contentType': 'application/json',
      'responseText': expected
    });

    expect(result).to.equal(expected);
    expect(complete).to.be.true;
  });

  it('should have error when resultSelector errors', () => {
    const expected = 'avast ye swabs!';
    let error;
    const obj = {
      url: '/flibbertyJibbet',
      responseType: 'text',
      resultSelector: (res: any) => {
        throw new Error('ha! ha! fooled you!');
      },
      method: ''
    };

    Rx.Observable.ajax(obj)
      .subscribe((x: any) => {
        throw 'should not next';
      }, (err: any) => {
        error = err;
      }, () => {
        throw 'should not complete';
      });

    expect(MockXMLHttpRequest.mostRecent.url).to.equal('/flibbertyJibbet');

    MockXMLHttpRequest.mostRecent.respondWith({
      'status': 200,
      'contentType': 'application/json',
      'responseText': expected
    });

    expect(error).to.be.an('error', 'ha! ha! fooled you!');
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

    expect(error).to.be.an('error', 'wokka wokka');
  });

  it('should succeed on 200', () => {
    const expected = { foo: 'bar' };
    let result;
    let complete = false;
    const obj = {
      url: '/flibbertyJibbet',
      responseType: 'text',
      method: ''
    };

    Rx.Observable.ajax(obj)
      .subscribe((x: any) => {
        result = x;
      }, null, () => {
        complete = true;
      });

    expect(MockXMLHttpRequest.mostRecent.url).to.equal('/flibbertyJibbet');

    MockXMLHttpRequest.mostRecent.respondWith({
      'status': 200,
      'contentType': 'application/json',
      'responseText': JSON.stringify(expected)
    });

    expect(result.xhr).exist;
    expect(result.response).to.deep.equal(JSON.stringify({ foo: 'bar' }));
    expect(complete).to.be.true;
  });

  it('should fail on 404', () => {
    let error;
    const obj = {
      url: '/flibbertyJibbet',
      normalizeError: (e: any, xhr: any, type: any) => {
        return xhr.response || xhr.responseText;
      },
      responseType: 'text',
      method: ''
    };

    Rx.Observable.ajax(obj)
      .subscribe((x: any) => {
        throw 'should not next';
      }, (err: any) => {
        error = err;
      }, () => {
        throw 'should not complete';
      });

    expect(MockXMLHttpRequest.mostRecent.url).to.equal('/flibbertyJibbet');

    MockXMLHttpRequest.mostRecent.respondWith({
      'status': 404,
      'contentType': 'text/plain',
      'responseText': 'Wee! I am text!'
    });

    expect(error instanceof Rx.AjaxError).to.be.true;
    expect(error.message).to.equal('ajax error 404');
    expect(error.status).to.equal(404);
  });

  it('should fail on 404', () => {
    let error;
    const obj = {
      url: '/flibbertyJibbet',
      normalizeError: (e: any, xhr: any, type: any) => {
        return xhr.response || xhr.responseText;
      },
      responseType: 'text',
      method: ''
    };

    Rx.Observable.ajax(obj).subscribe((x: any) => {
        throw 'should not next';
      }, (err: any) => {
        error = err;
      }, () => {
        throw 'should not complete';
      });

    expect(MockXMLHttpRequest.mostRecent.url).to.equal('/flibbertyJibbet');

    MockXMLHttpRequest.mostRecent.respondWith({
      'status': 300,
      'contentType': 'text/plain',
      'responseText': 'Wee! I am text!'
    });

    expect(error instanceof Rx.AjaxError).to.be.true;
    expect(error.message).to.equal('ajax error 300');
    expect(error.status).to.equal(300);
  });

  it('should succeed no settings', () => {
    const expected = JSON.stringify({ foo: 'bar' });

    Rx.Observable.ajax('/flibbertyJibbet')
        .subscribe((x: any) => {
          expect(x.status).to.equal(200);
          expect(x.xhr.method).to.equal('GET');
          expect(x.xhr.responseText).to.equal(expected);
        }, () => {
          throw 'should not have been called';
        });

    expect(MockXMLHttpRequest.mostRecent.url).to.equal('/flibbertyJibbet');
    MockXMLHttpRequest.mostRecent.respondWith({
      'status': 200,
      'contentType': 'text/plain',
      'responseText': expected
    });
  });

  it('should fail no settings', () => {
    const expected = JSON.stringify({ foo: 'bar' });

    Rx.Observable.ajax('/flibbertyJibbet')
        .subscribe(() => {
          throw 'should not have been called';
        }, (x: any) => {
          expect(x.status).to.equal(500);
          expect(x.xhr.method).to.equal('GET');
          expect(x.xhr.responseText).to.equal(expected);
        }, () => {
          throw 'should not have been called';
        });

    expect(MockXMLHttpRequest.mostRecent.url).to.equal('/flibbertyJibbet');
    MockXMLHttpRequest.mostRecent.respondWith({
      'status': 500,
      'contentType': 'text/plain',
      'responseText': expected
    });
  });

  describe('ajax request body', () => {
    let rFormData: FormData;

    beforeEach(() => {
      rFormData = root.FormData;
      root.FormData = root.FormData || class {};
    });

    afterEach(() => {
      root.FormData = rFormData;
    });

    it('can take string body', () => {
      const obj = {
        url: '/flibbertyJibbet',
        method: '',
        body: 'foobar'
      };

      Rx.Observable.ajax(obj).subscribe();

      expect(MockXMLHttpRequest.mostRecent.url).to.equal('/flibbertyJibbet');
      expect(MockXMLHttpRequest.mostRecent.data).to.equal('foobar');
    });

    it('can take FormData body', () => {
      const body = new root.FormData();
      const obj = {
        url: '/flibbertyJibbet',
        method: '',
        body: body
      };

      Rx.Observable.ajax(obj).subscribe();

      expect(MockXMLHttpRequest.mostRecent.url).to.equal('/flibbertyJibbet');
      expect(MockXMLHttpRequest.mostRecent.data).to.deep.equal(body);
      expect(MockXMLHttpRequest.mostRecent.requestHeaders).to.deep.equal({
        'X-Requested-With': 'XMLHttpRequest',
      });
    });

    it('should not fail when FormData is undefined', () => {
      root.FormData = void 0;

      const obj = {
        url: '/flibbertyJibbet',
        method: '',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: { '🌟': '🚀' }
      };

      Rx.Observable.ajax(obj).subscribe();

      expect(MockXMLHttpRequest.mostRecent.url).to.equal('/flibbertyJibbet');
    });

    it('should send by form-urlencoded format', () => {
      const body = {
        '🌟': '🚀'
      };
      const obj = {
        url: '/flibbertyJibbet',
        method: '',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body
      };

      Rx.Observable.ajax(obj).subscribe();

      expect(MockXMLHttpRequest.mostRecent.url).to.equal('/flibbertyJibbet');
      expect(MockXMLHttpRequest.mostRecent.data).to.equal('%F0%9F%8C%9F=%F0%9F%9A%80');
    });

    it('should send by JSON', () => {
      const body = {
        '🌟': '🚀'
      };
      const obj = {
        url: '/flibbertyJibbet',
        method: '',
        headers: {
          'Content-Type': 'application/json'
        },
        body: body
      };

      Rx.Observable.ajax(obj).subscribe();

      expect(MockXMLHttpRequest.mostRecent.url).to.equal('/flibbertyJibbet');
      expect(MockXMLHttpRequest.mostRecent.data).to.equal('{"🌟":"🚀"}');
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

      expect(request.url).to.equal('/flibbertyJibbet');

      request.respondWith({
        'status': 200,
        'contentType': 'application/json',
        'responseText': JSON.stringify(expected)
      });

      expect(result).to.deep.equal(expected);
      expect(complete).to.be.true;
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

      expect(MockXMLHttpRequest.mostRecent.url).to.equal('/flibbertyJibbet');

      MockXMLHttpRequest.mostRecent.respondWith({
        'status': 200,
        'contentType': 'application/json',
        'responseText': JSON.stringify(expected)
      });

      expect(innerResult.xhr).exist;
      expect(innerResult.response).to.deep.equal({ larf: 'hahahahaha' });
      expect(result).to.equal('HAHAHAHAHA');
      expect(complete).to.be.true;
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

      expect(request.method).to.equal('POST');
      expect(request.url).to.equal('/flibbertyJibbet');
      expect(request.requestHeaders).to.deep.equal({
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
      });

      request.respondWith({
        'status': 200,
        'contentType': 'application/json',
        'responseText': JSON.stringify(expected)
      });

      expect(request.data).to.equal('foo=bar&hi=there%20you');
      expect(result.response).to.deep.equal(expected);
      expect(complete).to.be.true;
    });
  });
});
