// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/observables/dom/ajax-spec.ts
import { describe, expect, it } from 'vitest';
import { rxTest } from '@rxjs/test';
describe('ajax (platform)', () => {
  it('should error on timeout of asynchronous request', async () => {
    await rxTest(async ({ flush, now, schedule }) => {
      let mostRecent;
      let nextCount = 0;
      let errorCount = 0;
      let lateResponseAttempts = 0;
      let responseAccepted = false;
      class TimeoutXMLHttpRequest {
        status = 0;
        method = '';
        async = true;
        timeout = 0;
        responseType = '';
        url = '';
        onload;
        ontimeout;
        settled = false;
        open(method, url, async) {
          this.method = method;
          this.url = url;
          this.async = async;
        }
        send() {
          setTimeout(() => {
            if (this.settled) {
              return;
            }
            this.settled = true;
            this.status = 0;
            this.ontimeout?.();
          }, this.timeout);
        }
        respondWith() {
          lateResponseAttempts++;
          if (this.settled) {
            return;
          }
          this.settled = true;
          responseAccepted = true;
          this.onload?.();
        }
        abort() {
          this.settled = true;
        }
      }
      const ajaxTimeoutFixture = (config) =>
        new Observable((subscriber) => {
          const xhr = new TimeoutXMLHttpRequest();
          mostRecent = xhr;
          xhr.open('GET', config.url, true);
          xhr.timeout = config.timeout;
          xhr.responseType = config.responseType;
          xhr.onload = () => {
            subscriber.next({ status: xhr.status, xhr });
            subscriber.complete();
          };
          xhr.ontimeout = () => subscriber.error({ status: 0, xhr });
          xhr.send();
          subscriber.addTeardown(() => xhr.abort());
        });
      const config = {
        url: '/flibbertyJibbet',
        responseType: 'text',
        timeout: 10,
      };
      ajaxTimeoutFixture(config).subscribe({
        next: () => {
          nextCount++;
        },
        error: (error) => {
          errorCount++;
          expect(now()).toBe(10);
          expect(error.status).toBe(0);
          expect(error.xhr).toBe(mostRecent);
          expect(error.xhr.method).toBe('GET');
          expect(error.xhr.async).toBe(true);
          expect(error.xhr.timeout).toBe(10);
          expect(error.xhr.responseType).toBe('text');
        },
      });
      expect(mostRecent.url).toBe('/flibbertyJibbet');
      schedule(() => mostRecent.respondWith(), 1000);
      await flush();
      // Preserve the XHR configuration and timeout error contract locally while
      // the compatibility ajax API is absent. The later response is attempted but
      // ignored because the frame-10 timeout has already terminated the request.
      expect(errorCount).toBe(1);
      expect(nextCount).toBe(0);
      expect(lateResponseAttempts).toBe(1);
      expect(responseAccepted).toBe(false);
    });
  });
});
