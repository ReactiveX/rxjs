import rewiremock from 'rewiremock';
import * as sinon from 'sinon';
import {
  HttpDownloadProgressEvent,
  HttpEventType,
  HttpHeaderResponse,
  HttpResponse,
  HttpUploadProgressEvent,
  Adapter,
  RequestConfig,
  ResponseType
} from 'rxjs/ajax';
import { expect, TEST_POST, trackEvents } from '../__fixtures__/testHelper';
import { MockXMLHttpRequest } from '../__mocks__/xhr-mock';

rewiremock('./xhrBackend').with({ xhrBackend: sinon.stub().returns(new MockXMLHttpRequest()) });

const getMockXhr = () => {
  const { mock } = rewiremock.getMock('./xhrBackend') as any;
  return mock.value.xhrBackend();
};

const XSSI_PREFIX = ")]}'\n";

describe('xhrAdapter', () => {
  let mockXhr: MockXMLHttpRequest;
  let adapter: Adapter;

  beforeEach(() => {
    rewiremock.enable();
    //tslint:disable-next-line:no-require-imports
    ({ adapter } = require('../../../../src/internal/observable/unstableAjax/adapters/xhr'));
    mockXhr = getMockXhr();
  });

  afterEach(() => {
    mockXhr.clear();
    mockXhr = null as any;
    rewiremock.disable();
  });

  it('emits status immediately', () => {
    const { next } = trackEvents(adapter(TEST_POST));
    expect(next).to.have.lengthOf(1);
    expect(next[0].type).to.equal(HttpEventType.Sent);
  });

  it('sets method, url, and responseType correctly', () => {
    adapter(TEST_POST).subscribe();
    expect(mockXhr.method).to.equal('POST');
    expect(mockXhr.responseType).to.equal(ResponseType.Text);
    expect(mockXhr.url).to.equal('/test');
  });

  it('sets outgoing body correctly', () => {
    adapter(TEST_POST).subscribe();
    expect(mockXhr.body).to.equal('some body');
  });

  it('sets outgoing headers, including default headers', () => {
    const post = {
      ...TEST_POST,
      headers: {
        Test: 'Test header'
      }
    };

    adapter(post).subscribe();
    expect(mockXhr.mockHeaders).to.deep.equal({
      Test: 'Test header',
      Accept: 'application/json, text/plain, */*'
    });
  });

  it('sets outgoing headers, including overriding defaults', () => {
    const headers = {
      Test: 'Test header',
      Accept: 'text/html',
      'Content-Type': 'text/css'
    };

    const post = {
      ...TEST_POST,
      headers
    };

    adapter(post).subscribe();
    expect(mockXhr.mockHeaders).to.deep.equal(headers);
  });

  it('passes withCredentials through', () => {
    const post = {
      ...TEST_POST,
      withCredentials: true
    };

    adapter(post).subscribe();
    expect(mockXhr.withCredentials).to.be.true;
  });

  it('handles a text response', () => {
    const { next } = trackEvents(adapter(TEST_POST));
    mockXhr.mockFlush(200, 'OK', 'some response');

    expect(next).to.have.lengthOf(2);
    expect(next[1].type).to.equal(HttpEventType.Response);
    expect(next[1]).containSubset({
      data: 'some response',
      status: 200,
      statusText: 'OK'
    });
  });

  it('handles a json response', () => {
    const post: RequestConfig = {
      ...TEST_POST,
      responseType: ResponseType.Json
    };

    const { next } = trackEvents(adapter(post));
    mockXhr.mockFlush(200, 'OK', JSON.stringify({ data: 'some data' }));

    expect(next).to.have.lengthOf(2);
    expect((next[1] as HttpResponse<any>).data.data).to.equal('some data');
  });

  it('handles a blank json response', () => {
    const post: RequestConfig = {
      ...TEST_POST,
      responseType: ResponseType.Json
    };

    const { next } = trackEvents(adapter(post));

    mockXhr.mockFlush(200, 'OK', '');

    expect(next).to.have.lengthOf(2);
    expect((next[1] as HttpResponse<any>).data).to.be.null;
  });

  it('handles a json error response with default validateStatus', () => {
    const post: RequestConfig = {
      ...TEST_POST,
      responseType: ResponseType.Json
    };

    const { next, error } = trackEvents(adapter(post));

    mockXhr.mockFlush(500, 'Error', JSON.stringify({ data: 'some data' }));

    expect(next).to.have.lengthOf(1);
    expect(error).to.have.lengthOf(1);
    expect(error[0].response!.data.data).to.equal('some data');
  });

  it('handle a json error even if validateStatus not provided', () => {
    const post: RequestConfig = {
      ...TEST_POST,
      responseType: ResponseType.Json,
      validateStatus: undefined
    };

    const { next, error } = trackEvents(adapter(post));

    mockXhr.mockFlush(500, 'Error', JSON.stringify({ data: 'some data' }));

    expect(next).to.have.lengthOf(1);
    expect(error).to.have.lengthOf(1);
    expect(error[0].response!.data.data).to.equal('some data');
  });

  it('handles a json error response with XSSI prefix', () => {
    const post: RequestConfig = {
      ...TEST_POST,
      responseType: ResponseType.Json
    };

    const { next, error } = trackEvents(adapter(post));
    mockXhr.mockFlush(500, 'Error', XSSI_PREFIX + JSON.stringify({ data: 'some data' }));

    expect(next).to.have.lengthOf(1);
    expect(error).to.have.lengthOf(1);
    expect(error[0].response!.data.data).to.equal('some data');
  });

  it('handles a json string response', () => {
    const post: RequestConfig = {
      ...TEST_POST,
      responseType: ResponseType.Json
    };

    const { next } = trackEvents(adapter(post));
    expect(mockXhr.responseType).to.equal(ResponseType.Text);
    mockXhr.mockFlush(200, 'OK', JSON.stringify('this is a string'));

    expect(next).to.have.lengthOf(2);
    expect((next[1] as HttpResponse<any>).data).to.equal('this is a string');
  });

  it('handles a json response with an XSSI prefix', () => {
    const post: RequestConfig = {
      ...TEST_POST,
      responseType: ResponseType.Json
    };

    const { next } = trackEvents(adapter(post));

    mockXhr.mockFlush(200, 'OK', XSSI_PREFIX + JSON.stringify({ data: 'some data' }));

    expect(next).to.have.lengthOf(2);
    expect((next[1] as HttpResponse<any>).data.data).to.equal('some data');
  });

  it('emits unsuccessful responses via the error path', () => {
    const { error } = trackEvents(adapter(TEST_POST));
    mockXhr.mockFlush(400, 'Bad Request', 'this is the error');

    expect(error[0]).to.be.instanceof(Error);
    expect(error[0].response!.data).to.equal('this is the error');
    expect(error[0].response!.status).to.equal(400);
  });

  it('emits real errors via the error path', () => {
    const { error } = trackEvents(adapter(TEST_POST));
    mockXhr.mockErrorEvent(new Error('blah'));

    expect(error[0]).to.be.instanceof(Error);
  });

  describe('progress events', () => {
    it('are emitted for download progress', () => {
      const post: RequestConfig = {
        ...TEST_POST,
        reportProgress: true
      };

      const { next } = trackEvents(adapter(post));
      mockXhr.responseText = 'down';
      mockXhr.mockDownloadProgressEvent(100, 300);
      mockXhr.responseText = 'download';
      mockXhr.mockDownloadProgressEvent(200, 300);
      mockXhr.mockFlush(200, 'OK', 'downloaded');

      expect(next.map(({ type }) => type)).to.deep.equal([
        HttpEventType.Sent,
        HttpEventType.ResponseHeader,
        HttpEventType.DownloadProgress,
        HttpEventType.DownloadProgress,
        HttpEventType.Response
      ]);

      const [progress1, progress2, response] = [
        next[2] as HttpDownloadProgressEvent,
        next[3] as HttpDownloadProgressEvent,
        next[4] as HttpResponse<string>
      ];

      expect(progress1).to.containSubset({
        partialText: 'down',
        loaded: 100,
        total: 300
      });

      expect(progress2).to.containSubset({
        partialText: 'download',
        loaded: 200,
        total: 300
      });

      expect(response.data).to.equal('downloaded');
    });

    it('are emitted for upload progress', () => {
      const post: RequestConfig = {
        ...TEST_POST,
        reportProgress: true
      };

      const { next } = trackEvents(adapter(post));
      mockXhr.mockUploadProgressEvent(100, 300);
      mockXhr.mockUploadProgressEvent(200, 300);
      mockXhr.mockFlush(200, 'OK', 'Done');

      expect(next.map(({ type }) => type)).to.deep.equal([
        HttpEventType.Sent,
        HttpEventType.UploadProgress,
        HttpEventType.UploadProgress,
        HttpEventType.Response
      ]);

      const [, progress1, progress2]: Array<HttpUploadProgressEvent> = next as any;

      expect(progress1).to.containSubset({ loaded: 100, total: 300 });
      expect(progress2).to.containSubset({ loaded: 200, total: 300 });
    });

    it('are emitted when both upload and download progress are available', () => {
      const post: RequestConfig = {
        ...TEST_POST,
        reportProgress: true
      };

      const { next } = trackEvents(adapter(post));
      mockXhr.mockUploadProgressEvent(100, 300);
      mockXhr.mockDownloadProgressEvent(200, 300);
      mockXhr.mockFlush(200, 'OK', 'Done');

      expect(next.map(({ type }) => type)).to.deep.equal([
        HttpEventType.Sent,
        HttpEventType.UploadProgress,
        HttpEventType.ResponseHeader,
        HttpEventType.DownloadProgress,
        HttpEventType.Response
      ]);
    });

    it('are emitted even if length is not computable', () => {
      const post: RequestConfig = {
        ...TEST_POST,
        reportProgress: true
      };

      const { next } = trackEvents(adapter(post));
      mockXhr.mockUploadProgressEvent(100);
      mockXhr.mockDownloadProgressEvent(200);
      mockXhr.mockFlush(200, 'OK', 'Done');

      expect(next.map(({ type }) => type)).to.deep.equal([
        HttpEventType.Sent,
        HttpEventType.UploadProgress,
        HttpEventType.ResponseHeader,
        HttpEventType.DownloadProgress,
        HttpEventType.Response
      ]);
    });

    it('include ResponseHeader with headers and status', () => {
      const post: RequestConfig = {
        ...TEST_POST,
        reportProgress: true
      };

      const { next } = trackEvents(adapter(post));
      mockXhr.mockResponseHeaders = 'Test: Test header\nContent-Type: text/plain\n';
      mockXhr.mockDownloadProgressEvent(200);
      mockXhr.mockFlush(200, 'OK', 'Done');

      expect(next.map(({ type }) => type)).to.deep.equal([
        HttpEventType.Sent,
        HttpEventType.ResponseHeader,
        HttpEventType.DownloadProgress,
        HttpEventType.Response
      ]);

      const partial = next[1] as HttpHeaderResponse;
      expect(partial.headers['content-type']).to.equal('text/plain');
      expect(partial.headers['test']).to.equal('Test header');
    });

    it('are unsubscribed along with the main request', () => {
      const post: RequestConfig = {
        ...TEST_POST,
        reportProgress: true
      };

      const sub = adapter(post).subscribe();
      expect(mockXhr.listeners.progress).not.to.be.undefined;
      sub.unsubscribe();
      expect(mockXhr.listeners.progress).to.be.undefined;
    });

    it('do not cause headers to be re-parsed on main response', () => {
      const post: RequestConfig = {
        ...TEST_POST,
        reportProgress: true
      };
      const { next } = trackEvents(adapter(post));

      mockXhr.mockResponseHeaders = 'Test: This is a test\n';
      mockXhr.status = 203;
      mockXhr.mockDownloadProgressEvent(100, 300);
      mockXhr.mockResponseHeaders = 'Test: should never be read\n';
      mockXhr.mockFlush(203, 'OK', 'Testing 1 2 3');

      const responses = next.filter(
        ({ type }) => type === HttpEventType.Response || type === HttpEventType.ResponseHeader
      ) as Array<HttpResponse<any>>;
      responses.forEach(({ status, headers }) => {
        expect(status).to.equal(203);
        expect(headers.test).to.equal('This is a test');
      });
    });
  });

  describe('gets response URL', () => {
    it('from XHR.responsesURL', () => {
      const { next } = trackEvents(adapter(TEST_POST));
      mockXhr.responseURL = '/response/url';
      mockXhr.mockFlush(200, 'OK', 'Test');

      expect(next).to.have.lengthOf(2);
      expect(next[1].type).to.equal(HttpEventType.Response);
      expect((next[1] as HttpResponse<string>).responseUrl).to.equal('/response/url');
    });

    it('from X-Request-URL header if XHR.responseURL is not present', () => {
      const { next } = trackEvents(adapter(TEST_POST));
      mockXhr.mockResponseHeaders = 'X-Request-URL: /response/url\n';
      mockXhr.mockFlush(200, 'OK', 'Test');

      expect(next).to.have.lengthOf(2);
      expect(next[1].type).to.equal(HttpEventType.Response);
      expect((next[1] as HttpResponse<string>).responseUrl).to.equal('/response/url');
    });

    it('falls back on Request.url if neither are available', () => {
      const { next } = trackEvents(adapter(TEST_POST));
      mockXhr.mockFlush(200, 'OK', 'Test');

      expect(next).to.have.lengthOf(2);
      expect(next[1].type).to.equal(HttpEventType.Response);
      expect((next[1] as HttpResponse<string>).responseUrl).to.equal('/test');
      expect((next[1] as HttpResponse<string>).request.url).to.equal('/test');
    });
  });

  describe('corrects for quirks', () => {
    it('by normalizing 0 status to 200 if a body is present', () => {
      const { next } = trackEvents(adapter(TEST_POST));
      mockXhr.mockFlush(0, 'CORS 0 status', 'Test');

      expect(next).to.have.lengthOf(2);
      expect((next[1] as HttpResponse<any>).status).to.equal(200);
    });

    it('by leaving 0 status as 0 if a body is not present', () => {
      const { next, error } = trackEvents(adapter(TEST_POST));
      mockXhr.mockFlush(0, 'CORS 0 status');

      expect(next).to.have.lengthOf(1);
      expect(error).to.have.lengthOf(1);
      expect(error[0].response!.status).to.equal(0);
    });
  });
});
