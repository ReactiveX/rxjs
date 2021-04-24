/** @prettier */
import { expect } from 'chai';
import * as sinon from 'sinon';
import { ajax, AjaxConfig, AjaxResponse, AjaxError, AjaxTimeoutError } from 'rxjs/ajax';
import { TestScheduler } from 'rxjs/testing';
import { noop } from 'rxjs';
import * as nodeFormData from 'form-data';

const root: any = (typeof globalThis !== 'undefined' && globalThis) || (typeof self !== 'undefined' && self) || global;

if (typeof root.FormData === 'undefined') {
  root.FormData = nodeFormData as any;
}

/** @test {ajax} */
describe('ajax', () => {
  let rXHR: XMLHttpRequest;

  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    rXHR = root.XMLHttpRequest;
    root.XMLHttpRequest = MockXMLHttpRequest;
  });

  afterEach(() => {
    sandbox.restore();
    MockXMLHttpRequest.clearRequest();

    root.XMLHttpRequest = rXHR;
    root.XDomainRequest = null;
    root.ActiveXObject = null;
  });

  it('should create default XMLHttpRequest for non CORS', () => {
    const obj: AjaxConfig = {
      url: '/',
      method: '',
    };

    ajax(obj).subscribe();
    expect(MockXMLHttpRequest.mostRecent.withCredentials).to.be.false;
  });

  it('should raise an error if not able to create XMLHttpRequest', () => {
    root.XMLHttpRequest = null;
    root.ActiveXObject = null;

    const obj: AjaxConfig = {
      url: '/',
      method: '',
    };

    ajax(obj).subscribe(null, (err) => expect(err).to.exist);
  });

  it('should create XMLHttpRequest for CORS', () => {
    const obj: AjaxConfig = {
      url: '/',
      method: '',
      crossDomain: true,
      withCredentials: true,
    };

    ajax(obj).subscribe();
    expect(MockXMLHttpRequest.mostRecent.withCredentials).to.be.true;
  });

  it('should raise an error if not able to create CORS request', () => {
    root.XMLHttpRequest = null;
    root.XDomainRequest = null;

    const obj: AjaxConfig = {
      url: '/',
      method: '',
      crossDomain: true,
      withCredentials: true,
    };

    ajax(obj).subscribe({
      error: (err) => expect(err).to.exist,
    });
  });

  it('should set headers', () => {
    const obj: AjaxConfig = {
      url: '/talk-to-me-goose',
      headers: {
        'Content-Type': 'kenny/loggins',
        'Fly-Into-The': 'Dangah Zone!',
        'Take-A-Ride-Into-The': 'Danger ZoooOoone!',
      },
      method: '',
    };

    ajax(obj).subscribe();

    const request = MockXMLHttpRequest.mostRecent;

    expect(request.url).to.equal('/talk-to-me-goose');
    expect(request.requestHeaders).to.deep.equal({
      'content-type': 'kenny/loggins',
      'fly-into-the': 'Dangah Zone!',
      'take-a-ride-into-the': 'Danger ZoooOoone!',
      'x-requested-with': 'XMLHttpRequest',
    });
    // Did not mutate the headers passed
    expect(obj.headers).to.deep.equal({
      'Content-Type': 'kenny/loggins',
      'Fly-Into-The': 'Dangah Zone!',
      'Take-A-Ride-Into-The': 'Danger ZoooOoone!',
    });
  });

  describe('ajax XSRF cookie in custom header', () => {
    beforeEach(() => {
      (global as any).document = {
        cookie: 'foo=bar',
      } as Document;
    });

    afterEach(() => {
      delete (global as any).document;
    });

    it('should send the cookie with a custom header to the same domain', () => {
      const obj: AjaxConfig = {
        url: '/some/path',
        xsrfCookieName: 'foo',
        xsrfHeaderName: 'Custom-Header-Name',
      };

      ajax(obj).subscribe();

      const request = MockXMLHttpRequest.mostRecent;

      expect(request.url).to.equal('/some/path');
      expect(request.requestHeaders).to.deep.equal({
        'Custom-Header-Name': 'bar',
        'x-requested-with': 'XMLHttpRequest',
      });
    });

    it('should send the cookie cross-domain with a custom header when withCredentials is set', () => {
      const obj: AjaxConfig = {
        url: 'https://some.subresouce.net/some/page',
        xsrfCookieName: 'foo',
        xsrfHeaderName: 'Custom-Header-Name',
        crossDomain: true,
        withCredentials: true,
      };

      ajax(obj).subscribe();

      const request = MockXMLHttpRequest.mostRecent;

      expect(request.url).to.equal('https://some.subresouce.net/some/page');
      expect(request.requestHeaders).to.deep.equal({
        'Custom-Header-Name': 'bar',
      });
    });

    it('should not send the cookie cross-domain with a custom header when withCredentials is not set', () => {
      const obj: AjaxConfig = {
        url: 'https://some.subresouce.net/some/page',
        xsrfCookieName: 'foo',
        xsrfHeaderName: 'Custom-Header-Name',
        crossDomain: true,
      };

      ajax(obj).subscribe();

      const request = MockXMLHttpRequest.mostRecent;

      expect(request.url).to.equal('https://some.subresouce.net/some/page');
      expect(request.requestHeaders).to.deep.equal({});
    });

    it('should not send the cookie if there is no xsrfHeaderName option', () => {
      const obj: AjaxConfig = {
        url: '/some/page',
        xsrfCookieName: 'foo',
      };

      ajax(obj).subscribe();

      const request = MockXMLHttpRequest.mostRecent;

      expect(request.url).to.equal('/some/page');
      expect(request.requestHeaders).to.deep.equal({
        'x-requested-with': 'XMLHttpRequest',
      });
    });
  });

  it('should set the X-Requested-With if crossDomain is false', () => {
    ajax({
      url: '/test/monkey',
      method: 'GET',
      crossDomain: false,
    }).subscribe();

    const request = MockXMLHttpRequest.mostRecent;

    expect(request.requestHeaders).to.deep.equal({
      'x-requested-with': 'XMLHttpRequest',
    });
  });

  it('should not set default Content-Type header when no body is sent', () => {
    const obj: AjaxConfig = {
      url: '/talk-to-me-goose',
      method: 'GET',
    };

    ajax(obj).subscribe();

    const request = MockXMLHttpRequest.mostRecent;

    expect(request.url).to.equal('/talk-to-me-goose');
    expect(request.requestHeaders).to.not.have.keys('Content-Type');
  });

  it('should error if createXHR throws', () => {
    let error;

    ajax({
      url: '/flibbertyJibbet',
      responseType: 'text',
      createXHR: () => {
        throw new Error('wokka wokka');
      },
    }).subscribe(
      () => {
        throw new Error('should not next');
      },
      (err: any) => {
        error = err;
      },
      () => {
        throw new Error('should not complete');
      }
    );

    expect(error).to.be.an('error', 'wokka wokka');
  });

  it('should error if send request throws', (done) => {
    const expected = new Error('xhr send failure');

    ajax({
      url: '/flibbertyJibbet',
      responseType: 'text',
      method: '',
      createXHR: () => {
        const ret = new MockXMLHttpRequest();
        ret.send = () => {
          throw expected;
        };
        return ret as any;
      },
    }).subscribe(
      () => {
        done(new Error('should not be called'));
      },
      (e: Error) => {
        expect(e).to.be.equal(expected);
        done();
      },
      () => {
        done(new Error('should not be called'));
      }
    );
  });

  it('should succeed on 200', () => {
    const expected = { foo: 'bar' };
    let result: AjaxResponse<any>;
    let complete = false;

    ajax({
      url: '/flibbertyJibbet',
      method: '',
    }).subscribe(
      (x: any) => {
        result = x;
      },
      null,
      () => {
        complete = true;
      }
    );

    expect(MockXMLHttpRequest.mostRecent.url).to.equal('/flibbertyJibbet');

    MockXMLHttpRequest.mostRecent.respondWith({
      status: 200,
      responseText: JSON.stringify(expected),
    });

    expect(result!.xhr).exist;
    expect(result!.response).to.deep.equal({ foo: 'bar' });
    expect(complete).to.be.true;
  });

  it('should fail if fails to parse response in older IE', () => {
    let error: any;
    const obj: AjaxConfig = {
      url: '/flibbertyJibbet',
      method: '',
    };

    // No `response` property on the object (for older IE).
    MockXMLHttpRequest.noResponseProp = true;

    ajax(obj).subscribe(
      () => {
        throw new Error('should not next');
      },
      (err: any) => {
        error = err;
      },
      () => {
        throw new Error('should not complete');
      }
    );

    MockXMLHttpRequest.mostRecent.respondWith({
      status: 207,
      responseText: 'Wee! I am text, but should be valid JSON!',
    });

    expect(error instanceof SyntaxError).to.be.true;
    expect(error.message).to.equal('Unexpected token W in JSON at position 0');
  });

  it('should fail on 404', () => {
    let error: any;
    const obj: AjaxConfig = {
      url: '/flibbertyJibbet',
      responseType: 'text',
      method: '',
    };

    ajax(obj).subscribe(
      () => {
        throw new Error('should not next');
      },
      (err: any) => {
        error = err;
      },
      () => {
        throw new Error('should not complete');
      }
    );

    expect(MockXMLHttpRequest.mostRecent.url).to.equal('/flibbertyJibbet');

    MockXMLHttpRequest.mostRecent.respondWith({
      status: 404,
      responseText: 'Wee! I am text!',
    });

    expect(error instanceof AjaxError).to.be.true;
    expect(error.name).to.equal('AjaxError');
    expect(error.message).to.equal('ajax error 404');
    expect(error.status).to.equal(404);
  });

  it('should succeed on 300', () => {
    let result: AjaxResponse<any>;
    let complete = false;
    const obj: AjaxConfig = {
      url: '/flibbertyJibbet',
      responseType: 'text',
      method: '',
    };

    ajax(obj).subscribe(
      (x: any) => {
        result = x;
      },
      null,
      () => {
        complete = true;
      }
    );

    expect(MockXMLHttpRequest.mostRecent.url).to.equal('/flibbertyJibbet');

    MockXMLHttpRequest.mostRecent.respondWith({
      status: 300,
      responseText: 'Wee! I am text!',
    });

    expect(result!.xhr).exist;
    expect(result!.response).to.deep.equal('Wee! I am text!');
    expect(complete).to.be.true;
  });

  it('should not fail if fails to parse error response', () => {
    let error: any;
    const obj: AjaxConfig = {
      url: '/flibbertyJibbet',
      responseType: 'json',
      method: '',
    };

    ajax(obj).subscribe(
      () => {
        throw new Error('should not next');
      },
      (err: any) => {
        error = err;
      },
      () => {
        throw new Error('should not complete');
      }
    );

    MockXMLHttpRequest.mostRecent.respondWith({
      status: 404,
      responseText: 'Unparsable as json',
    });

    expect(error instanceof AjaxError).to.be.true;
    // The default behavior of XHR if you get something back that you can't
    // parse as JSON, but you have a requestType of "json" is to
    // have `response` set to `null`.
    expect(error.response).to.be.null;
  });

  it('should succeed no settings', () => {
    const expected = JSON.stringify({ foo: 'bar' });

    ajax('/flibbertyJibbet').subscribe(
      (x: any) => {
        expect(x.status).to.equal(200);
        expect(x.xhr.method).to.equal('GET');
        expect(x.xhr.responseText).to.equal(expected);
      },
      () => {
        throw 'should not have been called';
      }
    );

    expect(MockXMLHttpRequest.mostRecent.url).to.equal('/flibbertyJibbet');
    MockXMLHttpRequest.mostRecent.respondWith({
      status: 200,
      responseText: expected,
    });
  });

  it('should fail no settings', () => {
    const expected = JSON.stringify({ foo: 'bar' });

    ajax('/flibbertyJibbet').subscribe(
      () => {
        throw 'should not have been called';
      },
      (x: any) => {
        expect(x.status).to.equal(500);
        expect(x.xhr.method).to.equal('GET');
        expect(x.xhr.responseText).to.equal(expected);
      },
      () => {
        throw 'should not have been called';
      }
    );

    expect(MockXMLHttpRequest.mostRecent.url).to.equal('/flibbertyJibbet');
    MockXMLHttpRequest.mostRecent.respondWith({
      status: 500,
      responseText: expected,
    });
  });

  it('should create an asynchronous request', () => {
    const obj: AjaxConfig = {
      url: '/flibbertyJibbet',
      responseType: 'text',
      timeout: 10,
    };

    ajax(obj).subscribe(
      (x: any) => {
        expect(x.status).to.equal(200);
        expect(x.xhr.method).to.equal('GET');
        expect(x.xhr.async).to.equal(true);
        expect(x.xhr.timeout).to.equal(10);
        expect(x.xhr.responseType).to.equal('text');
      },
      () => {
        throw 'should not have been called';
      }
    );

    const request = MockXMLHttpRequest.mostRecent;

    expect(request.url).to.equal('/flibbertyJibbet');

    request.respondWith({
      status: 200,
      responseText: 'Wee! I am text!',
    });
  });

  it('should error on timeout of asynchronous request', () => {
    const rxTestScheduler = new TestScheduler(noop);

    const obj: AjaxConfig = {
      url: '/flibbertyJibbet',
      responseType: 'text',
      timeout: 10,
    };

    ajax(obj).subscribe(
      () => {
        throw 'should not have been called';
      },
      (e) => {
        expect(e.status).to.equal(0);
        expect(e.xhr.method).to.equal('GET');
        expect(e.xhr.async).to.equal(true);
        expect(e.xhr.timeout).to.equal(10);
        expect(e.xhr.responseType).to.equal('text');
      }
    );

    const request = MockXMLHttpRequest.mostRecent;

    expect(request.url).to.equal('/flibbertyJibbet');

    rxTestScheduler.schedule(() => {
      request.respondWith({
        status: 200,
        responseText: 'Wee! I am text!',
      });
    }, 1000);

    rxTestScheduler.flush();
  });

  it('should create a synchronous request', () => {
    const obj: AjaxConfig = {
      url: '/flibbertyJibbet',
      responseType: 'text',
      timeout: 10,
      async: false,
    };

    ajax(obj).subscribe();

    const mockXHR = MockXMLHttpRequest.mostRecent;

    expect(mockXHR.url).to.equal('/flibbertyJibbet');
    // Open was called with async `false`.
    expect(mockXHR.async).to.be.false;

    mockXHR.respondWith({
      status: 200,
      responseText: 'Wee! I am text!',
    });
  });

  describe('ajax request body', () => {
    it('can take string body', () => {
      const obj = {
        url: '/flibbertyJibbet',
        method: 'POST',
        body: 'foobar',
      };

      ajax(obj).subscribe();

      expect(MockXMLHttpRequest.mostRecent.url).to.equal('/flibbertyJibbet');
      expect(MockXMLHttpRequest.mostRecent.data).to.equal('foobar');
    });

    it('can take FormData body', () => {
      const body = new root.FormData();
      const obj = {
        url: '/flibbertyJibbet',
        method: 'POST',
        body: body,
      };

      ajax(obj).subscribe();

      expect(MockXMLHttpRequest.mostRecent.url).to.equal('/flibbertyJibbet');
      expect(MockXMLHttpRequest.mostRecent.data).to.equal(body);
      expect(MockXMLHttpRequest.mostRecent.requestHeaders).to.deep.equal({
        'x-requested-with': 'XMLHttpRequest',
      });
    });

    it('should send the URLSearchParams straight through to the body', () => {
      const body = new URLSearchParams({
        '🌟': '🚀',
      });
      const obj = {
        url: '/flibbertyJibbet',
        method: 'POST',
        body: body,
      };

      ajax(obj).subscribe();

      expect(MockXMLHttpRequest.mostRecent.url).to.equal('/flibbertyJibbet');
      expect(MockXMLHttpRequest.mostRecent.data).to.equal(body);
    });

    it('should send by JSON', () => {
      const body = {
        '🌟': '🚀',
      };
      const obj = {
        url: '/flibbertyJibbet',
        method: 'POST',
        body: body,
      };

      ajax(obj).subscribe();

      expect(MockXMLHttpRequest.mostRecent.url).to.equal('/flibbertyJibbet');
      expect(MockXMLHttpRequest.mostRecent.data).to.equal('{"🌟":"🚀"}');
    });

    it('should send json body not mattered on case-sensitivity of HTTP headers', () => {
      const body = {
        hello: 'world',
      };

      const requestObj = {
        url: '/flibbertyJibbet',
        method: '',
        body: body,
        headers: {
          'cOnTeNt-TyPe': 'application/json;charset=UTF-8',
        },
      };

      ajax(requestObj).subscribe();

      expect(MockXMLHttpRequest.mostRecent.url).to.equal('/flibbertyJibbet');
      expect(MockXMLHttpRequest.mostRecent.data).to.equal('{"hello":"world"}');
    });

    it('should error if send request throws', (done) => {
      const expected = new Error('xhr send failure');

      const obj: AjaxConfig = {
        url: '/flibbertyJibbet',
        responseType: 'text',
        method: '',
        body: 'foobar',
        createXHR: () => {
          const ret = new MockXMLHttpRequest();
          ret.send = () => {
            throw expected;
          };
          return ret as any;
        },
      };

      ajax(obj).subscribe(
        () => {
          done(new Error('should not be called'));
        },
        (e: Error) => {
          expect(e).to.be.equal(expected);
          done();
        },
        () => {
          done(new Error('should not be called'));
        }
      );
    });
  });

  describe('ajax.get', () => {
    it('should succeed on 200', () => {
      const expected = { foo: 'bar' };
      let result;
      let complete = false;

      ajax.get('/flibbertyJibbet').subscribe(
        (x) => {
          result = x.response;
        },
        null,
        () => {
          complete = true;
        }
      );

      const request = MockXMLHttpRequest.mostRecent;

      expect(request.url).to.equal('/flibbertyJibbet');

      request.respondWith({
        status: 200,
        responseText: JSON.stringify(expected),
      });

      expect(result).to.deep.equal(expected);
      expect(complete).to.be.true;
    });

    it('should succeed on 204 No Content', () => {
      let result;
      let complete = false;

      ajax.get('/flibbertyJibbet').subscribe(
        (x) => {
          result = x.response;
        },
        null,
        () => {
          complete = true;
        }
      );

      const request = MockXMLHttpRequest.mostRecent;

      expect(request.url).to.equal('/flibbertyJibbet');

      request.respondWith({
        status: 204,
        responseText: '',
      });

      // Response will get set to null by the browser XHR
      // This is sort of arbitrarily determined by our test harness
      // but we want to be as accurate as possible.
      expect(result).to.be.null;
      expect(complete).to.be.true;
    });

    it('should able to select json response via getJSON', () => {
      const expected = { foo: 'bar' };
      let result;
      let complete = false;

      ajax.getJSON('/flibbertyJibbet').subscribe(
        (x) => {
          result = x;
        },
        null,
        () => {
          complete = true;
        }
      );

      const request = MockXMLHttpRequest.mostRecent;

      expect(request.url).to.equal('/flibbertyJibbet');

      request.respondWith({
        status: 200,
        responseText: JSON.stringify(expected),
      });

      expect(result).to.deep.equal(expected);
      expect(complete).to.be.true;
    });
  });

  describe('ajax.post', () => {
    it('should succeed on 200', () => {
      const expected = { foo: 'bar', hi: 'there you' };
      let result: AjaxResponse<any>;
      let complete = false;

      ajax.post('/flibbertyJibbet', expected).subscribe(
        (x) => {
          result = x;
        },
        null,
        () => {
          complete = true;
        }
      );

      const request = MockXMLHttpRequest.mostRecent;

      expect(request.method).to.equal('POST');
      expect(request.url).to.equal('/flibbertyJibbet');
      expect(request.requestHeaders).to.deep.equal({
        'content-type': 'application/json;charset=utf-8',
        'x-requested-with': 'XMLHttpRequest',
      });

      request.respondWith({
        status: 200,
        responseText: JSON.stringify(expected),
      });

      expect(request.data).to.equal(JSON.stringify(expected));
      expect(result!.response).to.deep.equal(expected);
      expect(complete).to.be.true;
    });

    it('should succeed on 204 No Content', () => {
      let result: AjaxResponse<any>;
      let complete = false;

      ajax.post('/flibbertyJibbet', undefined).subscribe(
        (x) => {
          result = x;
        },
        null,
        () => {
          complete = true;
        }
      );

      const request = MockXMLHttpRequest.mostRecent;

      expect(request.method).to.equal('POST');
      expect(request.url).to.equal('/flibbertyJibbet');
      expect(request.requestHeaders).to.deep.equal({
        'x-requested-with': 'XMLHttpRequest',
      });

      request.respondWith({
        status: 204,
        responseText: '',
      });

      // Since the default setting for `responseType` is "json",
      // and our `responseText` is an empty string (which isn't parsable as JSON),
      // response should be `null` here.
      expect(result!.response).to.be.null;
      expect(complete).to.be.true;
    });

    it('should allow partial progressSubscriber ', function () {
      const spy = sinon.spy();
      const progressSubscriber: any = {
        next: spy,
      };

      ajax({
        url: '/flibbertyJibbet',
        progressSubscriber,
      }).subscribe();

      const request = MockXMLHttpRequest.mostRecent;

      request.respondWith(
        {
          status: 200,
          responseText: JSON.stringify({}),
        },
        { uploadProgressTimes: 3 }
      );

      expect(spy).to.be.called.callCount(4);
    });

    it('should emit progress event when progressSubscriber is specified', function () {
      const spy = sinon.spy();
      const progressSubscriber = <any>{
        next: spy,
        error: () => {
          // noop
        },
        complete: () => {
          // noop
        },
      };

      ajax({
        url: '/flibbertyJibbet',
        progressSubscriber,
      }).subscribe();

      const request = MockXMLHttpRequest.mostRecent;

      request.respondWith(
        {
          status: 200,
          responseText: JSON.stringify({}),
        },
        { uploadProgressTimes: 3 }
      );

      expect(spy).to.be.called.callCount(4);
    });
  });

  describe('ajax.patch', () => {
    it('should create an AjaxObservable with correct options', () => {
      const expected = { foo: 'bar', hi: 'there you' };
      let result: AjaxResponse<any>;
      let complete = false;

      ajax.patch('/flibbertyJibbet', expected).subscribe(
        (x) => {
          result = x;
        },
        null,
        () => {
          complete = true;
        }
      );

      const request = MockXMLHttpRequest.mostRecent;

      expect(request.method).to.equal('PATCH');
      expect(request.url).to.equal('/flibbertyJibbet');
      expect(request.requestHeaders).to.deep.equal({
        'content-type': 'application/json;charset=utf-8',
        'x-requested-with': 'XMLHttpRequest',
      });

      request.respondWith({
        status: 200,
        responseText: JSON.stringify(expected),
      });

      expect(request.data).to.equal(JSON.stringify(expected));
      expect(result!.response).to.deep.equal(expected);
      expect(complete).to.be.true;
    });
  });

  describe('ajax error classes', () => {
    describe('AjaxError', () => {
      it('should extend Error class', () => {
        const error = new AjaxError('Test error', new XMLHttpRequest(), {
          url: '/',
          method: 'GET',
          responseType: 'json',
          headers: {},
          withCredentials: false,
          async: true,
          timeout: 0,
          crossDomain: false,
        });
        expect(error).to.be.an.instanceOf(Error);
      });
    });

    describe('AjaxTimeoutError', () => {
      it('should extend Error class', () => {
        const error = new AjaxTimeoutError(new XMLHttpRequest(), {
          url: '/',
          method: 'GET',
          responseType: 'json',
          headers: {},
          withCredentials: false,
          async: true,
          timeout: 0,
          crossDomain: false,
        });
        expect(error).to.be.an.instanceOf(Error);
      });

      it('should extend AjaxError class', () => {
        const error = new AjaxTimeoutError(new XMLHttpRequest(), {
          url: '/',
          method: 'GET',
          responseType: 'json',
          headers: {},
          withCredentials: false,
          async: true,
          timeout: 0,
          crossDomain: false,
        });
        expect(error).to.be.an.instanceOf(AjaxError);
      });
    });
  });

  it('should error if aborted early', () => {
    let thrown: any = null;

    ajax({
      method: 'GET',
      url: '/flibbertyJibbett',
    }).subscribe({
      next: () => {
        throw new Error('should not be called');
      },
      error: (err) => {
        thrown = err;
      },
    });

    const mockXHR = MockXMLHttpRequest.mostRecent;
    expect(thrown).to.be.null;

    mockXHR.triggerEvent('abort', { type: 'abort' });
    expect(thrown).to.be.an.instanceOf(AjaxError);
    expect(thrown.message).to.equal('aborted');
  });

  describe('with includeDownloadProgress', () => {
    it('should emit download progress', () => {
      const results: any[] = [];

      ajax({
        method: 'GET',
        url: '/flibbertyJibbett',
        includeDownloadProgress: true,
      }).subscribe({
        next: (value) => results.push(value),
        complete: () => results.push('done'),
      });

      const mockXHR = MockXMLHttpRequest.mostRecent;
      mockXHR.respondWith(
        {
          status: 200,
          total: 5,
          loaded: 5,
          responseText: JSON.stringify({ boo: 'I am a ghost' }),
        },
        { uploadProgressTimes: 5, downloadProgressTimes: 5 }
      );

      const request = {
        async: true,
        body: undefined,
        crossDomain: true,
        headers: {
          'x-requested-with': 'XMLHttpRequest',
        },
        includeDownloadProgress: true,
        method: 'GET',
        responseType: 'json',
        timeout: 0,
        url: '/flibbertyJibbett',
        withCredentials: false,
      };

      expect(results).to.deep.equal([
        {
          type: 'download_loadstart',
          responseHeaders: {},
          responseType: 'json',
          response: undefined,
          loaded: 0,
          total: 5,
          request,
          status: 0,
          xhr: mockXHR,
          originalEvent: { type: 'loadstart', loaded: 0, total: 5 },
        },
        {
          type: 'download_progress',
          responseHeaders: {},
          responseType: 'json',
          response: undefined,
          loaded: 1,
          total: 5,
          request,
          status: 0,
          xhr: mockXHR,
          originalEvent: { type: 'progress', loaded: 1, total: 5 },
        },
        {
          type: 'download_progress',
          responseHeaders: {},
          responseType: 'json',
          response: undefined,
          loaded: 2,
          total: 5,
          request,
          status: 0,
          xhr: mockXHR,
          originalEvent: { type: 'progress', loaded: 2, total: 5 },
        },
        {
          type: 'download_progress',
          responseHeaders: {},
          responseType: 'json',
          response: undefined,
          loaded: 3,
          total: 5,
          request,
          status: 0,
          xhr: mockXHR,
          originalEvent: { type: 'progress', loaded: 3, total: 5 },
        },
        {
          type: 'download_progress',
          responseHeaders: {},
          responseType: 'json',
          response: undefined,
          loaded: 4,
          total: 5,
          request,
          status: 0,
          xhr: mockXHR,
          originalEvent: { type: 'progress', loaded: 4, total: 5 },
        },
        {
          type: 'download_progress',
          responseHeaders: {},
          responseType: 'json',
          response: undefined,
          loaded: 5,
          total: 5,
          request,
          status: 0,
          xhr: mockXHR,
          originalEvent: { type: 'progress', loaded: 5, total: 5 },
        },
        {
          type: 'download_load',
          loaded: 5,
          total: 5,
          request,
          originalEvent: { type: 'load', loaded: 5, total: 5 },
          xhr: mockXHR,
          response: { boo: 'I am a ghost' },
          responseHeaders: {},
          responseType: 'json',
          status: 200,
        },
        'done', // from completion.
      ]);
    });

    it('should emit upload and download progress', () => {
      const results: any[] = [];

      ajax({
        method: 'GET',
        url: '/flibbertyJibbett',
        includeUploadProgress: true,
        includeDownloadProgress: true,
      }).subscribe({
        next: (value) => results.push(value),
        complete: () => results.push('done'),
      });

      const mockXHR = MockXMLHttpRequest.mostRecent;
      mockXHR.respondWith(
        {
          status: 200,
          total: 5,
          loaded: 5,
          responseText: JSON.stringify({ boo: 'I am a ghost' }),
        },
        { uploadProgressTimes: 5, downloadProgressTimes: 5 }
      );

      const request = {
        async: true,
        body: undefined,
        crossDomain: true,
        headers: {
          'x-requested-with': 'XMLHttpRequest',
        },
        includeUploadProgress: true,
        includeDownloadProgress: true,
        method: 'GET',
        responseType: 'json',
        timeout: 0,
        url: '/flibbertyJibbett',
        withCredentials: false,
      };

      expect(results).to.deep.equal([
        {
          type: 'upload_loadstart',
          loaded: 0,
          total: 5,
          request,
          status: 0,
          response: undefined,
          responseHeaders: {},
          responseType: 'json',
          xhr: mockXHR,
          originalEvent: { type: 'loadstart', loaded: 0, total: 5 },
        },
        {
          type: 'upload_progress',
          loaded: 1,
          total: 5,
          request,
          status: 0,
          response: undefined,
          responseHeaders: {},
          responseType: 'json',
          xhr: mockXHR,
          originalEvent: { type: 'progress', loaded: 1, total: 5 },
        },
        {
          type: 'upload_progress',
          loaded: 2,
          total: 5,
          request,
          status: 0,
          response: undefined,
          responseHeaders: {},
          responseType: 'json',
          xhr: mockXHR,
          originalEvent: { type: 'progress', loaded: 2, total: 5 },
        },
        {
          type: 'upload_progress',
          loaded: 3,
          total: 5,
          request,
          status: 0,
          response: undefined,
          responseHeaders: {},
          responseType: 'json',
          xhr: mockXHR,
          originalEvent: { type: 'progress', loaded: 3, total: 5 },
        },
        {
          type: 'upload_progress',
          loaded: 4,
          total: 5,
          request,
          status: 0,
          response: undefined,
          responseHeaders: {},
          responseType: 'json',
          xhr: mockXHR,
          originalEvent: { type: 'progress', loaded: 4, total: 5 },
        },
        {
          type: 'upload_progress',
          loaded: 5,
          total: 5,
          request,
          status: 0,
          response: undefined,
          responseHeaders: {},
          responseType: 'json',
          xhr: mockXHR,
          originalEvent: { type: 'progress', loaded: 5, total: 5 },
        },
        {
          type: 'upload_load',
          loaded: 5,
          total: 5,
          request,
          status: 0,
          response: undefined,
          responseHeaders: {},
          responseType: 'json',
          xhr: mockXHR,
          originalEvent: { type: 'load', loaded: 5, total: 5 },
        },
        {
          type: 'download_loadstart',
          responseHeaders: {},
          responseType: 'json',
          response: undefined,
          loaded: 0,
          total: 5,
          request,
          status: 0,
          xhr: mockXHR,
          originalEvent: { type: 'loadstart', loaded: 0, total: 5 },
        },
        {
          type: 'download_progress',
          responseHeaders: {},
          responseType: 'json',
          response: undefined,
          loaded: 1,
          total: 5,
          request,
          status: 0,
          xhr: mockXHR,
          originalEvent: { type: 'progress', loaded: 1, total: 5 },
        },
        {
          type: 'download_progress',
          responseHeaders: {},
          responseType: 'json',
          response: undefined,
          loaded: 2,
          total: 5,
          request,
          status: 0,
          xhr: mockXHR,
          originalEvent: { type: 'progress', loaded: 2, total: 5 },
        },
        {
          type: 'download_progress',
          responseHeaders: {},
          responseType: 'json',
          response: undefined,
          loaded: 3,
          total: 5,
          request,
          status: 0,
          xhr: mockXHR,
          originalEvent: { type: 'progress', loaded: 3, total: 5 },
        },
        {
          type: 'download_progress',
          responseHeaders: {},
          responseType: 'json',
          response: undefined,
          loaded: 4,
          total: 5,
          request,
          status: 0,
          xhr: mockXHR,
          originalEvent: { type: 'progress', loaded: 4, total: 5 },
        },
        {
          type: 'download_progress',
          responseHeaders: {},
          responseType: 'json',
          response: undefined,
          loaded: 5,
          total: 5,
          request,
          status: 0,
          xhr: mockXHR,
          originalEvent: { type: 'progress', loaded: 5, total: 5 },
        },
        {
          type: 'download_load',
          loaded: 5,
          total: 5,
          request,
          originalEvent: { type: 'load', loaded: 5, total: 5 },
          xhr: mockXHR,
          response: { boo: 'I am a ghost' },
          responseHeaders: {},
          responseType: 'json',
          status: 200,
        },
        'done', // from completion.
      ]);
    });
  });

  it('should return an object that allows access to response headers', () => {
    const sentResponseHeaders = {
      'content-type': 'application/json',
      'x-custom-header': 'test',
      'x-headers-are-fun': '<whatever/> {"weird": "things"}',
    };

    ajax({
      method: 'GET',
      url: '/whatever',
    }).subscribe((response) => {
      expect(response.responseHeaders).to.deep.equal(sentResponseHeaders);
    });

    const mockXHR = MockXMLHttpRequest.mostRecent;

    mockXHR.respondWith({
      status: 200,
      headers: sentResponseHeaders,
      responseText: JSON.stringify({ iam: 'tired', and: 'should go to bed', but: 'I am doing open source for no good reason' }),
    });

    expect(mockXHR.getAllResponseHeaders()).to.equal(`content-type: application/json
x-custom-header: test
x-headers-are-fun: <whatever/> {"weird": "things"}`);
  });

  describe('with queryParams', () => {
    it('should allow passing of search queryParams as a dictionary', () => {
      ajax({
        method: 'GET',
        url: '/whatever',
        queryParams: { foo: 'bar', whatever: '123' },
      }).subscribe();

      const mockXHR = MockXMLHttpRequest.mostRecent;

      mockXHR.respondWith({
        status: 200,
        responseText: JSON.stringify({ whatever: 'I want' }),
      });

      expect(mockXHR.url).to.equal('/whatever?foo=bar&whatever=123');
    });

    it('should allow passing of search queryParams as an entries array', () => {
      ajax({
        method: 'GET',
        url: '/whatever',
        queryParams: [
          ['foo', 'bar'],
          ['whatever', '123'],
        ],
      }).subscribe();

      const mockXHR = MockXMLHttpRequest.mostRecent;

      mockXHR.respondWith({
        status: 200,
        responseText: JSON.stringify({ whatever: 'I want' }),
      });

      expect(mockXHR.url).to.equal('/whatever?foo=bar&whatever=123');
    });

    it('should allow passing of search queryParams as a string', () => {
      ajax({
        method: 'GET',
        url: '/whatever',
        queryParams: '?foo=bar&whatever=123',
      }).subscribe();

      const mockXHR = MockXMLHttpRequest.mostRecent;

      mockXHR.respondWith({
        status: 200,
        responseText: JSON.stringify({ whatever: 'I want' }),
      });

      expect(mockXHR.url).to.equal('/whatever?foo=bar&whatever=123');
    });

    it('should allow passing of search queryParams as a URLSearchParams object', () => {
      const queryParams = new URLSearchParams();
      queryParams.set('foo', 'bar');
      queryParams.set('whatever', '123');
      ajax({
        method: 'GET',
        url: '/whatever',
        queryParams,
      }).subscribe();

      const mockXHR = MockXMLHttpRequest.mostRecent;

      mockXHR.respondWith({
        status: 200,
        responseText: JSON.stringify({ whatever: 'I want' }),
      });

      expect(mockXHR.url).to.equal('/whatever?foo=bar&whatever=123');
    });

    it('should not screw things up if there is an existing search string in the url passed', () => {
      ajax({
        method: 'GET',
        url: '/whatever?jays_face=is+a+param&lol=haha',
        queryParams: { foo: 'bar', whatever: '123' },
      }).subscribe();

      const mockXHR = MockXMLHttpRequest.mostRecent;

      mockXHR.respondWith({
        status: 200,
        responseText: JSON.stringify({ whatever: 'I want' }),
      });

      expect(mockXHR.url).to.equal('/whatever?jays_face=is+a+param&lol=haha&foo=bar&whatever=123');
    });

    it('should overwrite existing args from existing search strings in the url passed', () => {
      ajax({
        method: 'GET',
        url: '/whatever?terminator=2&uncle_bob=huh',
        queryParams: { uncle_bob: '...okayyyyyyy', movie_quote: 'yes' },
      }).subscribe();

      const mockXHR = MockXMLHttpRequest.mostRecent;

      mockXHR.respondWith({
        status: 200,
        responseText: JSON.stringify({ whatever: 'I want' }),
      });

      expect(mockXHR.url).to.equal('/whatever?terminator=2&uncle_bob=...okayyyyyyy&movie_quote=yes');
    });

    it('should properly encode values', () => {
      ajax({
        method: 'GET',
        url: '/whatever',
        queryParams: { 'this is a weird param name': '?#* value here rofl !!!' },
      }).subscribe();

      const mockXHR = MockXMLHttpRequest.mostRecent;

      mockXHR.respondWith({
        status: 200,
        responseText: JSON.stringify({ whatever: 'I want' }),
      });

      expect(mockXHR.url).to.equal('/whatever?this+is+a+weird+param+name=%3F%23*+value+here+rofl+%21%21%21');
    });

    it('should handle dictionaries that have numbers, booleans, and arrays of numbers, strings or booleans', () => {
      ajax({
        method: 'GET',
        url: '/whatever',
        queryParams: { a: 123, b: true, c: ['one', 'two', 'three'], d: [1, 3, 3, 7], e: [true, false, true] },
      }).subscribe();

      const mockXHR = MockXMLHttpRequest.mostRecent;

      mockXHR.respondWith({
        status: 200,
        responseText: JSON.stringify({ whatever: 'I want' }),
      });

      expect(mockXHR.url).to.equal('/whatever?a=123&b=true&c=one%2Ctwo%2Cthree&d=1%2C3%2C3%2C7&e=true%2Cfalse%2Ctrue');
    });

    it('should handle entries that have numbers, booleans, and arrays of numbers, strings or booleans', () => {
      ajax({
        method: 'GET',
        url: '/whatever',
        queryParams: [
          ['a', 123],
          ['b', true],
          ['c', ['one', 'two', 'three']],
          ['d', [1, 3, 3, 7]],
          ['e', [true, false, true]],
        ],
      }).subscribe();

      const mockXHR = MockXMLHttpRequest.mostRecent;

      mockXHR.respondWith({
        status: 200,
        responseText: JSON.stringify({ whatever: 'I want' }),
      });

      expect(mockXHR.url).to.equal('/whatever?a=123&b=true&c=one%2Ctwo%2Cthree&d=1%2C3%2C3%2C7&e=true%2Cfalse%2Ctrue');
    });
  });
});

// Some of the older versions of node we test on don't have EventTarget.
class MockXHREventTarget {
  private registry = new Map<string, Set<(e: ProgressEvent) => void>>();

  addEventListener(type: string, handler: (e: ProgressEvent) => void) {
    let handlers = this.registry.get(type);
    if (!handlers) {
      this.registry.set(type, (handlers = new Set()));
    }
    handlers.add(handler);
  }

  removeEventListener(type: string, handler: (e: ProgressEvent) => void) {
    this.registry.get(type)?.delete(handler);
  }

  dispatchEvent(event: ProgressEvent) {
    const { type } = event;
    const handlers = this.registry.get(type);
    if (handlers) {
      for (const handler of handlers) {
        handler(event);
      }
    }
  }
}
class MockXMLHttpRequest extends MockXHREventTarget {
  static readonly DONE = 4;

  /**
   * Set to `true` to test IE code paths.
   */
  static noResponseProp = false;

  private static requests: Array<MockXMLHttpRequest> = [];
  private static recentRequest: MockXMLHttpRequest;

  static get mostRecent(): MockXMLHttpRequest {
    return MockXMLHttpRequest.recentRequest;
  }

  static get allRequests(): Array<MockXMLHttpRequest> {
    return MockXMLHttpRequest.requests;
  }

  static clearRequest(): void {
    MockXMLHttpRequest.noResponseProp = false;
    MockXMLHttpRequest.requests.length = 0;
    MockXMLHttpRequest.recentRequest = null!;
  }

  protected responseType: string = '';
  private readyState: number = 0;

  /**
   * Used to test if `open` was called with `async` true or false.
   */
  public async: boolean = true;

  protected status: any;
  // @ts-ignore: Property has no initializer and is not definitely assigned
  protected responseText: string | undefined;
  protected response: any = undefined;

  url: any;
  method: any;
  data: any;
  requestHeaders: any = {};
  withCredentials: boolean = false;

  // @ts-ignore: Property has no initializer and is not definitely assigned
  onreadystatechange: (e: ProgressEvent) => any;
  // @ts-ignore: Property has no initializer and is not definitely assigned
  onerror: (e: ErrorEvent) => any;
  // @ts-ignore: Property has no initializer and is not definitely assigned
  onprogress: (e: ProgressEvent) => any;
  // @ts-ignore: Property has no initializer and is not definitely assigned
  ontimeout: (e: ProgressEvent) => any;

  upload: XMLHttpRequestUpload = new MockXHREventTarget() as any;

  constructor() {
    super();
    MockXMLHttpRequest.recentRequest = this;
    MockXMLHttpRequest.requests.push(this);
    if (MockXMLHttpRequest.noResponseProp) {
      delete this['response'];
    }
  }

  // @ts-ignore: Property has no initializer and is not definitely assigned
  timeout: number;

  send(data: any): void {
    this.data = data;
    if (this.timeout && this.timeout > 0) {
      setTimeout(() => {
        if (this.readyState != 4) {
          this.readyState = 4;
          this.status = 0;
          this.triggerEvent('readystatechange');
          this.triggerEvent('timeout');
        }
      }, this.timeout);
    }
  }

  abort() {
    // noop
  }

  open(method: any, url: any, async: any): void {
    this.method = method;
    this.url = url;
    this.async = async;
    this.readyState = 1;
    this.triggerEvent('readystatechange');
    const originalProgressHandler = this.upload.onprogress;
    Object.defineProperty(this.upload, 'progress', {
      get() {
        return originalProgressHandler;
      },
    });
  }

  setRequestHeader(key: any, value: any): void {
    this.requestHeaders[key] = value;
  }

  private _responseHeaders: any;

  getAllResponseHeaders() {
    return this._responseHeaders
      ? Object.entries(this._responseHeaders)
          .map((entryParts) => entryParts.join(': '))
          .join('\n')
      : '';
  }

  respondWith(
    response: {
      status?: number;
      headers?: any;
      responseText?: string | undefined;
      total?: number;
      loaded?: number;
    },
    config?: { uploadProgressTimes?: number; downloadProgressTimes?: number }
  ): void {
    const { uploadProgressTimes = 0, downloadProgressTimes = 0 } = config ?? {};

    // Fake our upload progress first, if requested by the test.
    if (uploadProgressTimes) {
      this.triggerUploadEvent('loadstart', { type: 'loadstart', total: uploadProgressTimes, loaded: 0 });
      for (let i = 1; i <= uploadProgressTimes; i++) {
        this.triggerUploadEvent('progress', { type: 'progress', total: uploadProgressTimes, loaded: i });
      }
      this.triggerUploadEvent('load', { type: 'load', total: uploadProgressTimes, loaded: uploadProgressTimes });
    }

    // Fake our download progress
    if (downloadProgressTimes) {
      this.triggerEvent('loadstart', { type: 'loadstart', total: downloadProgressTimes, loaded: 0 });
      for (let i = 1; i <= downloadProgressTimes; i++) {
        this.triggerEvent('progress', { type: 'progress', total: downloadProgressTimes, loaded: i });
      }
    }

    // Store our headers locally. This is used in `getAllResponseHeaders` mock impl.
    this._responseHeaders = response.headers;

    // Set the readyState to DONE (4)
    this.readyState = 4;

    // Default to OK
    this.status = response.status || 200;
    this.responseText = response.responseText;

    switch (this.responseType) {
      case 'json':
        try {
          this.response = JSON.parse(response.responseText!);
        } catch (err) {
          // Ignore this is for testing if we get an invalid server
          // response somehow, where responseType is "json" but the responseText
          // is not JSON. In truth, we need to invert these tests to just use
          // response, because `responseText` is a legacy path.
          this.response = null;
        }
        break;
      case 'arraybuffer':
      case 'document':
      case 'blob':
        throw new Error('Test harness does not support the responseType: ' + this.responseType);
      case 'text':
      case '':
      default:
        this.response = response.responseText;
        break;
    }

    // We're testing old IE, forget all of that response property stuff.
    if (MockXMLHttpRequest.noResponseProp) {
      delete this['response'];
    }

    this.triggerEvent('load', { type: 'load', total: response.total ?? 0, loaded: response.loaded ?? 0 });
    this.triggerEvent('readystatechange', { type: 'readystatechange' });
  }

  triggerEvent(this: any, name: any, eventObj?: any): void {
    // TODO: create a better default event
    const e: any = eventObj || { type: name };

    this.dispatchEvent({ type: name, ...eventObj });

    if (this['on' + name]) {
      this['on' + name](e);
    }
  }

  triggerUploadEvent(this: any, name: any, eventObj?: any): void {
    // TODO: create a better default event
    const e: any = eventObj || {};

    this.upload.dispatchEvent({ type: name, ...eventObj });

    if (this.upload['on' + name]) {
      this.upload['on' + name](e);
    }
  }
}
