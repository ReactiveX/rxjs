import { isNumber, isStandardBrowserEnv, isString } from './base';

const cookies = (() => {
  // Non standard browser env (web workers, react-native) lack needed support.
  if (!isStandardBrowserEnv()) {
    return {
      write: () => {
        /* noop */
      },
      read: (_name: string) => '',
      remove: () => {
        /* noop */
      }
    };
  }

  // Standard browser envs support document.cookie
  const cookies = {
    write: (name: string, value: any, expires?: number, path?: string, domain?: string, secure?: boolean) => {
      const cookie = [];
      cookie.push(name + '=' + encodeURIComponent(value));

      if (isNumber(expires)) {
        cookie.push('expires=' + new Date(expires).toUTCString());
      }

      if (isString(path)) {
        cookie.push('path=' + path);
      }

      if (isString(domain)) {
        cookie.push('domain=' + domain);
      }

      if (secure === true) {
        cookie.push('secure');
      }

      document.cookie = cookie.join('; ');
    },

    read: (name: string) => {
      const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
      return match ? decodeURIComponent(match[3]) : null;
    }
  };

  return {
    ...cookies,
    remove: (name: string) => cookies.write(name, '', Date.now() - 86400000)
  };
})();

export { cookies };
