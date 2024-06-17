(() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));

  // bazel-out/k8-fastbuild-ST-2e5f3376adb5/bin/packages/service-worker/worker/src/named-cache-storage.mjs
  var NamedCacheStorage = class {
    constructor(original, cacheNamePrefix) {
      this.original = original;
      this.cacheNamePrefix = cacheNamePrefix;
    }
    delete(cacheName) {
      return this.original.delete(`${this.cacheNamePrefix}:${cacheName}`);
    }
    has(cacheName) {
      return this.original.has(`${this.cacheNamePrefix}:${cacheName}`);
    }
    async keys() {
      const prefix = `${this.cacheNamePrefix}:`;
      const allCacheNames = await this.original.keys();
      const ownCacheNames = allCacheNames.filter((name) => name.startsWith(prefix));
      return ownCacheNames.map((name) => name.slice(prefix.length));
    }
    match(request, options) {
      return this.original.match(request, options);
    }
    async open(cacheName) {
      const cache = await this.original.open(`${this.cacheNamePrefix}:${cacheName}`);
      return Object.assign(cache, { name: cacheName });
    }
  };

  // bazel-out/k8-fastbuild-ST-2e5f3376adb5/bin/packages/service-worker/worker/src/adapter.mjs
  var Adapter = class {
    constructor(scopeUrl, caches) {
      this.scopeUrl = scopeUrl;
      const parsedScopeUrl = this.parseUrl(this.scopeUrl);
      this.origin = parsedScopeUrl.origin;
      this.caches = new NamedCacheStorage(caches, `ngsw:${parsedScopeUrl.path}`);
    }
    newRequest(input, init) {
      return new Request(input, init);
    }
    newResponse(body, init) {
      return new Response(body, init);
    }
    newHeaders(headers) {
      return new Headers(headers);
    }
    isClient(source) {
      return source instanceof Client;
    }
    get time() {
      return Date.now();
    }
    normalizeUrl(url) {
      const parsed = this.parseUrl(url, this.scopeUrl);
      return parsed.origin === this.origin ? parsed.path : url;
    }
    parseUrl(url, relativeTo) {
      const parsed = !relativeTo ? new URL(url) : new URL(url, relativeTo);
      return { origin: parsed.origin, path: parsed.pathname, search: parsed.search };
    }
    timeout(ms) {
      return new Promise((resolve) => {
        setTimeout(() => resolve(), ms);
      });
    }
  };

  // bazel-out/k8-fastbuild-ST-2e5f3376adb5/bin/packages/service-worker/worker/src/database.mjs
  var NotFound = class {
    constructor(table, key) {
      this.table = table;
      this.key = key;
    }
  };

  // bazel-out/k8-fastbuild-ST-2e5f3376adb5/bin/packages/service-worker/worker/src/db-cache.mjs
  var CacheDatabase = class {
    constructor(adapter2) {
      this.adapter = adapter2;
      this.cacheNamePrefix = "db";
      this.tables = /* @__PURE__ */ new Map();
    }
    "delete"(name) {
      if (this.tables.has(name)) {
        this.tables.delete(name);
      }
      return this.adapter.caches.delete(`${this.cacheNamePrefix}:${name}`);
    }
    async list() {
      const prefix = `${this.cacheNamePrefix}:`;
      const allCacheNames = await this.adapter.caches.keys();
      const dbCacheNames = allCacheNames.filter((name) => name.startsWith(prefix));
      return dbCacheNames.map((name) => name.slice(prefix.length));
    }
    async open(name, cacheQueryOptions) {
      if (!this.tables.has(name)) {
        const cache = await this.adapter.caches.open(`${this.cacheNamePrefix}:${name}`);
        const table = new CacheTable(name, cache, this.adapter, cacheQueryOptions);
        this.tables.set(name, table);
      }
      return this.tables.get(name);
    }
  };
  var CacheTable = class {
    constructor(name, cache, adapter2, cacheQueryOptions) {
      this.name = name;
      this.cache = cache;
      this.adapter = adapter2;
      this.cacheQueryOptions = cacheQueryOptions;
      this.cacheName = this.cache.name;
    }
    request(key) {
      return this.adapter.newRequest("/" + key);
    }
    "delete"(key) {
      return this.cache.delete(this.request(key), this.cacheQueryOptions);
    }
    keys() {
      return this.cache.keys().then((requests) => requests.map((req) => req.url.substr(1)));
    }
    read(key) {
      return this.cache.match(this.request(key), this.cacheQueryOptions).then((res) => {
        if (res === void 0) {
          return Promise.reject(new NotFound(this.name, key));
        }
        return res.json();
      });
    }
    write(key, value) {
      return this.cache.put(this.request(key), this.adapter.newResponse(JSON.stringify(value)));
    }
  };

  // bazel-out/k8-fastbuild-ST-2e5f3376adb5/bin/packages/service-worker/worker/src/api.mjs
  var UpdateCacheStatus;
  (function(UpdateCacheStatus2) {
    UpdateCacheStatus2[UpdateCacheStatus2["NOT_CACHED"] = 0] = "NOT_CACHED";
    UpdateCacheStatus2[UpdateCacheStatus2["CACHED_BUT_UNUSED"] = 1] = "CACHED_BUT_UNUSED";
    UpdateCacheStatus2[UpdateCacheStatus2["CACHED"] = 2] = "CACHED";
  })(UpdateCacheStatus || (UpdateCacheStatus = {}));

  // bazel-out/k8-fastbuild-ST-2e5f3376adb5/bin/packages/service-worker/worker/src/error.mjs
  var SwCriticalError = class extends Error {
    constructor() {
      super(...arguments);
      this.isCritical = true;
    }
  };
  function errorToString(error) {
    if (error instanceof Error) {
      return `${error.message}
${error.stack}`;
    } else {
      return `${error}`;
    }
  }
  var SwUnrecoverableStateError = class extends SwCriticalError {
    constructor() {
      super(...arguments);
      this.isUnrecoverableState = true;
    }
  };

  // bazel-out/k8-fastbuild-ST-2e5f3376adb5/bin/packages/service-worker/worker/src/sha1.mjs
  function sha1(str) {
    const utf8 = str;
    const words32 = stringToWords32(utf8, Endian.Big);
    return _sha1(words32, utf8.length * 8);
  }
  function sha1Binary(buffer) {
    const words32 = arrayBufferToWords32(buffer, Endian.Big);
    return _sha1(words32, buffer.byteLength * 8);
  }
  function _sha1(words32, len) {
    const w = [];
    let [a, b, c, d, e] = [1732584193, 4023233417, 2562383102, 271733878, 3285377520];
    words32[len >> 5] |= 128 << 24 - len % 32;
    words32[(len + 64 >> 9 << 4) + 15] = len;
    for (let i = 0; i < words32.length; i += 16) {
      const [h0, h1, h2, h3, h4] = [a, b, c, d, e];
      for (let j = 0; j < 80; j++) {
        if (j < 16) {
          w[j] = words32[i + j];
        } else {
          w[j] = rol32(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
        }
        const [f, k] = fk(j, b, c, d);
        const temp = [rol32(a, 5), f, e, k, w[j]].reduce(add32);
        [e, d, c, b, a] = [d, c, rol32(b, 30), a, temp];
      }
      [a, b, c, d, e] = [add32(a, h0), add32(b, h1), add32(c, h2), add32(d, h3), add32(e, h4)];
    }
    return byteStringToHexString(words32ToByteString([a, b, c, d, e]));
  }
  function add32(a, b) {
    return add32to64(a, b)[1];
  }
  function add32to64(a, b) {
    const low = (a & 65535) + (b & 65535);
    const high = (a >>> 16) + (b >>> 16) + (low >>> 16);
    return [high >>> 16, high << 16 | low & 65535];
  }
  function rol32(a, count) {
    return a << count | a >>> 32 - count;
  }
  var Endian;
  (function(Endian2) {
    Endian2[Endian2["Little"] = 0] = "Little";
    Endian2[Endian2["Big"] = 1] = "Big";
  })(Endian || (Endian = {}));
  function fk(index, b, c, d) {
    if (index < 20) {
      return [b & c | ~b & d, 1518500249];
    }
    if (index < 40) {
      return [b ^ c ^ d, 1859775393];
    }
    if (index < 60) {
      return [b & c | b & d | c & d, 2400959708];
    }
    return [b ^ c ^ d, 3395469782];
  }
  function stringToWords32(str, endian) {
    const size = str.length + 3 >>> 2;
    const words32 = [];
    for (let i = 0; i < size; i++) {
      words32[i] = wordAt(str, i * 4, endian);
    }
    return words32;
  }
  function arrayBufferToWords32(buffer, endian) {
    const size = buffer.byteLength + 3 >>> 2;
    const words32 = [];
    const view = new Uint8Array(buffer);
    for (let i = 0; i < size; i++) {
      words32[i] = wordAt(view, i * 4, endian);
    }
    return words32;
  }
  function byteAt(str, index) {
    if (typeof str === "string") {
      return index >= str.length ? 0 : str.charCodeAt(index) & 255;
    } else {
      return index >= str.byteLength ? 0 : str[index] & 255;
    }
  }
  function wordAt(str, index, endian) {
    let word = 0;
    if (endian === Endian.Big) {
      for (let i = 0; i < 4; i++) {
        word += byteAt(str, index + i) << 24 - 8 * i;
      }
    } else {
      for (let i = 0; i < 4; i++) {
        word += byteAt(str, index + i) << 8 * i;
      }
    }
    return word;
  }
  function words32ToByteString(words32) {
    return words32.reduce((str, word) => str + word32ToByteString(word), "");
  }
  function word32ToByteString(word) {
    let str = "";
    for (let i = 0; i < 4; i++) {
      str += String.fromCharCode(word >>> 8 * (3 - i) & 255);
    }
    return str;
  }
  function byteStringToHexString(str) {
    let hex = "";
    for (let i = 0; i < str.length; i++) {
      const b = byteAt(str, i);
      hex += (b >>> 4).toString(16) + (b & 15).toString(16);
    }
    return hex.toLowerCase();
  }

  // bazel-out/k8-fastbuild-ST-2e5f3376adb5/bin/packages/service-worker/worker/src/assets.mjs
  var AssetGroup = class {
    constructor(scope2, adapter2, idle, config, hashes, db, cacheNamePrefix) {
      this.scope = scope2;
      this.adapter = adapter2;
      this.idle = idle;
      this.config = config;
      this.hashes = hashes;
      this.db = db;
      this.inFlightRequests = /* @__PURE__ */ new Map();
      this.urls = [];
      this.patterns = [];
      this.name = config.name;
      this.urls = config.urls.map((url) => adapter2.normalizeUrl(url));
      this.patterns = config.patterns.map((pattern) => new RegExp(pattern));
      this.cache = adapter2.caches.open(`${cacheNamePrefix}:${config.name}:cache`);
      this.metadata = this.db.open(`${cacheNamePrefix}:${config.name}:meta`, config.cacheQueryOptions);
    }
    async cacheStatus(url) {
      const cache = await this.cache;
      const meta = await this.metadata;
      const req = this.adapter.newRequest(url);
      const res = await cache.match(req, this.config.cacheQueryOptions);
      if (res === void 0) {
        return UpdateCacheStatus.NOT_CACHED;
      }
      try {
        const data = await meta.read(req.url);
        if (!data.used) {
          return UpdateCacheStatus.CACHED_BUT_UNUSED;
        }
      } catch (_) {
      }
      return UpdateCacheStatus.CACHED;
    }
    async getCacheNames() {
      const [cache, metadata] = await Promise.all([
        this.cache,
        this.metadata
      ]);
      return [cache.name, metadata.cacheName];
    }
    async handleFetch(req, _event) {
      const url = this.adapter.normalizeUrl(req.url);
      if (this.urls.indexOf(url) !== -1 || this.patterns.some((pattern) => pattern.test(url))) {
        const cache = await this.cache;
        const cachedResponse = await cache.match(req, this.config.cacheQueryOptions);
        if (cachedResponse !== void 0) {
          if (this.hashes.has(url)) {
            return cachedResponse;
          } else {
            if (await this.needToRevalidate(req, cachedResponse)) {
              this.idle.schedule(`revalidate(${cache.name}): ${req.url}`, async () => {
                await this.fetchAndCacheOnce(req);
              });
            }
            return cachedResponse;
          }
        }
        const res = await this.fetchAndCacheOnce(this.adapter.newRequest(req.url));
        return res.clone();
      } else {
        return null;
      }
    }
    async needToRevalidate(req, res) {
      if (res.headers.has("Cache-Control")) {
        const cacheControl = res.headers.get("Cache-Control");
        const cacheDirectives = cacheControl.split(",").map((v) => v.trim()).map((v) => v.split("="));
        cacheDirectives.forEach((v) => v[0] = v[0].toLowerCase());
        const maxAgeDirective = cacheDirectives.find((v) => v[0] === "max-age");
        const cacheAge = maxAgeDirective ? maxAgeDirective[1] : void 0;
        if (!cacheAge) {
          return true;
        }
        try {
          const maxAge = 1e3 * parseInt(cacheAge);
          let ts;
          try {
            const metaTable = await this.metadata;
            ts = (await metaTable.read(req.url)).ts;
          } catch (e) {
            const date = res.headers.get("Date");
            if (date === null) {
              return true;
            }
            ts = Date.parse(date);
          }
          const age = this.adapter.time - ts;
          return age < 0 || age > maxAge;
        } catch (e) {
          return true;
        }
      } else if (res.headers.has("Expires")) {
        const expiresStr = res.headers.get("Expires");
        try {
          return this.adapter.time > Date.parse(expiresStr);
        } catch (e) {
          return true;
        }
      } else {
        return true;
      }
    }
    async fetchFromCacheOnly(url) {
      const cache = await this.cache;
      const metaTable = await this.metadata;
      const request = this.adapter.newRequest(url);
      const response = await cache.match(request, this.config.cacheQueryOptions);
      if (response === void 0) {
        return null;
      }
      let metadata = void 0;
      try {
        metadata = await metaTable.read(request.url);
      } catch (e) {
      }
      return { response, metadata };
    }
    async unhashedResources() {
      const cache = await this.cache;
      return (await cache.keys()).map((request) => this.adapter.normalizeUrl(request.url)).filter((url) => !this.hashes.has(url));
    }
    async fetchAndCacheOnce(req, used = true) {
      if (this.inFlightRequests.has(req.url)) {
        return this.inFlightRequests.get(req.url);
      }
      const fetchOp = this.fetchFromNetwork(req);
      this.inFlightRequests.set(req.url, fetchOp);
      try {
        const res = await fetchOp;
        if (!res.ok) {
          throw new Error(`Response not Ok (fetchAndCacheOnce): request for ${req.url} returned response ${res.status} ${res.statusText}`);
        }
        try {
          const cache = await this.cache;
          await cache.put(req, res.clone());
          if (!this.hashes.has(this.adapter.normalizeUrl(req.url))) {
            const meta = { ts: this.adapter.time, used };
            const metaTable = await this.metadata;
            await metaTable.write(req.url, meta);
          }
          return res;
        } catch (err) {
          throw new SwCriticalError(`Failed to update the caches for request to '${req.url}' (fetchAndCacheOnce): ${errorToString(err)}`);
        }
      } finally {
        this.inFlightRequests.delete(req.url);
      }
    }
    async fetchFromNetwork(req, redirectLimit = 3) {
      const res = await this.cacheBustedFetchFromNetwork(req);
      if (res["redirected"] && !!res.url) {
        if (redirectLimit === 0) {
          throw new SwCriticalError(`Response hit redirect limit (fetchFromNetwork): request redirected too many times, next is ${res.url}`);
        }
        return this.fetchFromNetwork(this.adapter.newRequest(res.url), redirectLimit - 1);
      }
      return res;
    }
    async cacheBustedFetchFromNetwork(req) {
      const url = this.adapter.normalizeUrl(req.url);
      if (this.hashes.has(url)) {
        const canonicalHash = this.hashes.get(url);
        let response = await this.safeFetch(req);
        let makeCacheBustedRequest = response.ok;
        if (makeCacheBustedRequest) {
          const fetchedHash = sha1Binary(await response.clone().arrayBuffer());
          makeCacheBustedRequest = fetchedHash !== canonicalHash;
        }
        if (makeCacheBustedRequest) {
          const cacheBustReq = this.adapter.newRequest(this.cacheBust(req.url));
          response = await this.safeFetch(cacheBustReq);
          if (response.ok) {
            const cacheBustedHash = sha1Binary(await response.clone().arrayBuffer());
            if (canonicalHash !== cacheBustedHash) {
              throw new SwCriticalError(`Hash mismatch (cacheBustedFetchFromNetwork): ${req.url}: expected ${canonicalHash}, got ${cacheBustedHash} (after cache busting)`);
            }
          }
        }
        if (!response.ok && response.status === 404) {
          throw new SwUnrecoverableStateError(`Failed to retrieve hashed resource from the server. (AssetGroup: ${this.config.name} | URL: ${url})`);
        }
        return response;
      } else {
        return this.safeFetch(req);
      }
    }
    async maybeUpdate(updateFrom, req, cache) {
      const url = this.adapter.normalizeUrl(req.url);
      if (this.hashes.has(url)) {
        const hash = this.hashes.get(url);
        const res = await updateFrom.lookupResourceWithHash(url, hash);
        if (res !== null) {
          await cache.put(req, res);
          return true;
        }
      }
      return false;
    }
    cacheBust(url) {
      return url + (url.indexOf("?") === -1 ? "?" : "&") + "ngsw-cache-bust=" + Math.random();
    }
    async safeFetch(req) {
      try {
        return await this.scope.fetch(req);
      } catch (e) {
        return this.adapter.newResponse("", {
          status: 504,
          statusText: "Gateway Timeout"
        });
      }
    }
  };
  var PrefetchAssetGroup = class extends AssetGroup {
    async initializeFully(updateFrom) {
      const cache = await this.cache;
      await this.urls.reduce(async (previous, url) => {
        await previous;
        const req = this.adapter.newRequest(url);
        const alreadyCached = await cache.match(req, this.config.cacheQueryOptions) !== void 0;
        if (alreadyCached) {
          return;
        }
        if (updateFrom !== void 0 && await this.maybeUpdate(updateFrom, req, cache)) {
          return;
        }
        await this.fetchAndCacheOnce(req, false);
      }, Promise.resolve());
      if (updateFrom !== void 0) {
        const metaTable = await this.metadata;
        await (await updateFrom.previouslyCachedResources()).filter((url) => this.urls.indexOf(url) !== -1 || this.patterns.some((pattern) => pattern.test(url))).reduce(async (previous, url) => {
          await previous;
          const req = this.adapter.newRequest(url);
          const alreadyCached = await cache.match(req, this.config.cacheQueryOptions) !== void 0;
          if (alreadyCached) {
            return;
          }
          const res = await updateFrom.lookupResourceWithoutHash(url);
          if (res === null || res.metadata === void 0) {
            return;
          }
          await cache.put(req, res.response);
          await metaTable.write(req.url, __spreadProps(__spreadValues({}, res.metadata), { used: false }));
        }, Promise.resolve());
      }
    }
  };
  var LazyAssetGroup = class extends AssetGroup {
    async initializeFully(updateFrom) {
      if (updateFrom === void 0) {
        return;
      }
      const cache = await this.cache;
      await this.urls.reduce(async (previous, url) => {
        await previous;
        const req = this.adapter.newRequest(url);
        const alreadyCached = await cache.match(req, this.config.cacheQueryOptions) !== void 0;
        if (alreadyCached) {
          return;
        }
        const updated = await this.maybeUpdate(updateFrom, req, cache);
        if (this.config.updateMode === "prefetch" && !updated) {
          const cacheStatus = await updateFrom.recentCacheStatus(url);
          if (cacheStatus !== UpdateCacheStatus.CACHED) {
            return;
          }
          await this.fetchAndCacheOnce(req, false);
        }
      }, Promise.resolve());
    }
  };

  // bazel-out/k8-fastbuild-ST-2e5f3376adb5/bin/packages/service-worker/worker/src/data.mjs
  var LruList = class {
    constructor(state) {
      if (state === void 0) {
        state = {
          head: null,
          tail: null,
          map: {},
          count: 0
        };
      }
      this.state = state;
    }
    get size() {
      return this.state.count;
    }
    pop() {
      if (this.state.tail === null) {
        return null;
      }
      const url = this.state.tail;
      this.remove(url);
      return url;
    }
    remove(url) {
      const node = this.state.map[url];
      if (node === void 0) {
        return false;
      }
      if (this.state.head === url) {
        if (node.next === null) {
          this.state.head = null;
          this.state.tail = null;
          this.state.map = {};
          this.state.count = 0;
          return true;
        }
        const next = this.state.map[node.next];
        next.previous = null;
        this.state.head = next.url;
        node.next = null;
        delete this.state.map[url];
        this.state.count--;
        return true;
      }
      const previous = this.state.map[node.previous];
      previous.next = node.next;
      if (node.next !== null) {
        this.state.map[node.next].previous = node.previous;
      } else {
        this.state.tail = node.previous;
      }
      node.next = null;
      node.previous = null;
      delete this.state.map[url];
      this.state.count--;
      return true;
    }
    accessed(url) {
      if (this.state.head === url) {
        return;
      }
      const node = this.state.map[url] || { url, next: null, previous: null };
      if (this.state.map[url] !== void 0) {
        this.remove(url);
      }
      if (this.state.head !== null) {
        this.state.map[this.state.head].previous = url;
      }
      node.next = this.state.head;
      this.state.head = url;
      if (this.state.tail === null) {
        this.state.tail = url;
      }
      this.state.map[url] = node;
      this.state.count++;
    }
  };
  var DataGroup = class {
    constructor(scope2, adapter2, config, db, debugHandler, cacheNamePrefix) {
      this.scope = scope2;
      this.adapter = adapter2;
      this.config = config;
      this.db = db;
      this.debugHandler = debugHandler;
      this._lru = null;
      this.patterns = config.patterns.map((pattern) => new RegExp(pattern));
      this.cache = adapter2.caches.open(`${cacheNamePrefix}:${config.name}:cache`);
      this.lruTable = this.db.open(`${cacheNamePrefix}:${config.name}:lru`, config.cacheQueryOptions);
      this.ageTable = this.db.open(`${cacheNamePrefix}:${config.name}:age`, config.cacheQueryOptions);
    }
    async lru() {
      if (this._lru === null) {
        const table = await this.lruTable;
        try {
          this._lru = new LruList(await table.read("lru"));
        } catch (e) {
          this._lru = new LruList();
        }
      }
      return this._lru;
    }
    async syncLru() {
      if (this._lru === null) {
        return;
      }
      const table = await this.lruTable;
      try {
        return table.write("lru", this._lru.state);
      } catch (err) {
        this.debugHandler.log(err, `DataGroup(${this.config.name}@${this.config.version}).syncLru()`);
      }
    }
    async handleFetch(req, event) {
      if (!this.patterns.some((pattern) => pattern.test(req.url))) {
        return null;
      }
      const lru = await this.lru();
      switch (req.method) {
        case "OPTIONS":
          return null;
        case "GET":
        case "HEAD":
          switch (this.config.strategy) {
            case "freshness":
              return this.handleFetchWithFreshness(req, event, lru);
            case "performance":
              return this.handleFetchWithPerformance(req, event, lru);
            default:
              throw new Error(`Unknown strategy: ${this.config.strategy}`);
          }
        default:
          const wasCached = lru.remove(req.url);
          if (wasCached) {
            await this.clearCacheForUrl(req.url);
          }
          await this.syncLru();
          return this.safeFetch(req);
      }
    }
    async handleFetchWithPerformance(req, event, lru) {
      let res = null;
      const fromCache = await this.loadFromCache(req, lru);
      if (fromCache !== null) {
        res = fromCache.res;
        if (this.config.refreshAheadMs !== void 0 && fromCache.age >= this.config.refreshAheadMs) {
          event.waitUntil(this.safeCacheResponse(req, this.safeFetch(req), lru));
        }
      }
      if (res !== null) {
        return res;
      }
      const [timeoutFetch, networkFetch] = this.networkFetchWithTimeout(req);
      res = await timeoutFetch;
      if (res === void 0) {
        res = this.adapter.newResponse(null, { status: 504, statusText: "Gateway Timeout" });
        event.waitUntil(this.safeCacheResponse(req, networkFetch, lru));
      } else {
        await this.safeCacheResponse(req, res, lru);
      }
      return res;
    }
    async handleFetchWithFreshness(req, event, lru) {
      const [timeoutFetch, networkFetch] = this.networkFetchWithTimeout(req);
      let res;
      try {
        res = await timeoutFetch;
      } catch (e) {
        res = void 0;
      }
      if (res === void 0) {
        event.waitUntil(this.safeCacheResponse(req, networkFetch, lru, true));
        const fromCache = await this.loadFromCache(req, lru);
        res = fromCache !== null ? fromCache.res : null;
      } else {
        await this.safeCacheResponse(req, res, lru, true);
      }
      if (res !== null) {
        return res;
      }
      return networkFetch;
    }
    networkFetchWithTimeout(req) {
      if (this.config.timeoutMs !== void 0) {
        const networkFetch = this.scope.fetch(req);
        const safeNetworkFetch = (async () => {
          try {
            return await networkFetch;
          } catch (e) {
            return this.adapter.newResponse(null, {
              status: 504,
              statusText: "Gateway Timeout"
            });
          }
        })();
        const networkFetchUndefinedError = (async () => {
          try {
            return await networkFetch;
          } catch (e) {
            return void 0;
          }
        })();
        const timeout = this.adapter.timeout(this.config.timeoutMs);
        return [Promise.race([networkFetchUndefinedError, timeout]), safeNetworkFetch];
      } else {
        const networkFetch = this.safeFetch(req);
        return [networkFetch, networkFetch];
      }
    }
    async safeCacheResponse(req, resOrPromise, lru, okToCacheOpaque) {
      try {
        const res = await resOrPromise;
        try {
          await this.cacheResponse(req, res, lru, okToCacheOpaque);
        } catch (err) {
          this.debugHandler.log(err, `DataGroup(${this.config.name}@${this.config.version}).safeCacheResponse(${req.url}, status: ${res.status})`);
        }
      } catch (e) {
      }
    }
    async loadFromCache(req, lru) {
      const cache = await this.cache;
      let res = await cache.match(req, this.config.cacheQueryOptions);
      if (res !== void 0) {
        try {
          const ageTable = await this.ageTable;
          const age = this.adapter.time - (await ageTable.read(req.url)).age;
          if (age <= this.config.maxAge) {
            lru.accessed(req.url);
            return { res, age };
          }
        } catch (e) {
        }
        lru.remove(req.url);
        await this.clearCacheForUrl(req.url);
        await this.syncLru();
      }
      return null;
    }
    async cacheResponse(req, res, lru, okToCacheOpaque = false) {
      if (!(res.ok || okToCacheOpaque && res.type === "opaque")) {
        return;
      }
      if (lru.size >= this.config.maxSize) {
        const evictedUrl = lru.pop();
        if (evictedUrl !== null) {
          await this.clearCacheForUrl(evictedUrl);
        }
      }
      lru.accessed(req.url);
      await (await this.cache).put(req, res.clone());
      const ageTable = await this.ageTable;
      await ageTable.write(req.url, { age: this.adapter.time });
      await this.syncLru();
    }
    async cleanup() {
      await Promise.all([
        this.cache.then((cache) => this.adapter.caches.delete(cache.name)),
        this.ageTable.then((table) => this.db.delete(table.name)),
        this.lruTable.then((table) => this.db.delete(table.name))
      ]);
    }
    async getCacheNames() {
      const [cache, ageTable, lruTable] = await Promise.all([
        this.cache,
        this.ageTable,
        this.lruTable
      ]);
      return [cache.name, ageTable.cacheName, lruTable.cacheName];
    }
    async clearCacheForUrl(url) {
      const [cache, ageTable] = await Promise.all([this.cache, this.ageTable]);
      await Promise.all([
        cache.delete(this.adapter.newRequest(url, { method: "GET" }), this.config.cacheQueryOptions),
        cache.delete(this.adapter.newRequest(url, { method: "HEAD" }), this.config.cacheQueryOptions),
        ageTable.delete(url)
      ]);
    }
    async safeFetch(req) {
      try {
        return this.scope.fetch(req);
      } catch (e) {
        return this.adapter.newResponse(null, {
          status: 504,
          statusText: "Gateway Timeout"
        });
      }
    }
  };

  // bazel-out/k8-fastbuild-ST-2e5f3376adb5/bin/packages/service-worker/worker/src/app-version.mjs
  var BACKWARDS_COMPATIBILITY_NAVIGATION_URLS = [
    { positive: true, regex: "^/.*$" },
    { positive: false, regex: "^/.*\\.[^/]*$" },
    { positive: false, regex: "^/.*__" }
  ];
  var AppVersion = class {
    constructor(scope2, adapter2, database, idle, debugHandler, manifest, manifestHash) {
      this.scope = scope2;
      this.adapter = adapter2;
      this.database = database;
      this.debugHandler = debugHandler;
      this.manifest = manifest;
      this.manifestHash = manifestHash;
      this.hashTable = /* @__PURE__ */ new Map();
      this.indexUrl = this.adapter.normalizeUrl(this.manifest.index);
      this._okay = true;
      Object.keys(manifest.hashTable).forEach((url) => {
        this.hashTable.set(adapter2.normalizeUrl(url), manifest.hashTable[url]);
      });
      const assetCacheNamePrefix = `${manifestHash}:assets`;
      this.assetGroups = (manifest.assetGroups || []).map((config) => {
        switch (config.installMode) {
          case "prefetch":
            return new PrefetchAssetGroup(scope2, adapter2, idle, config, this.hashTable, database, assetCacheNamePrefix);
          case "lazy":
            return new LazyAssetGroup(scope2, adapter2, idle, config, this.hashTable, database, assetCacheNamePrefix);
        }
      });
      this.dataGroups = (manifest.dataGroups || []).map((config) => new DataGroup(scope2, adapter2, config, database, debugHandler, `${config.version}:data`));
      manifest.navigationUrls = manifest.navigationUrls || BACKWARDS_COMPATIBILITY_NAVIGATION_URLS;
      const includeUrls = manifest.navigationUrls.filter((spec) => spec.positive);
      const excludeUrls = manifest.navigationUrls.filter((spec) => !spec.positive);
      this.navigationUrls = {
        include: includeUrls.map((spec) => new RegExp(spec.regex)),
        exclude: excludeUrls.map((spec) => new RegExp(spec.regex))
      };
    }
    get okay() {
      return this._okay;
    }
    async initializeFully(updateFrom) {
      try {
        await this.assetGroups.reduce(async (previous, group) => {
          await previous;
          return group.initializeFully(updateFrom);
        }, Promise.resolve());
      } catch (err) {
        this._okay = false;
        throw err;
      }
    }
    async handleFetch(req, event) {
      const asset = await this.assetGroups.reduce(async (potentialResponse, group) => {
        const resp = await potentialResponse;
        if (resp !== null) {
          return resp;
        }
        return group.handleFetch(req, event);
      }, Promise.resolve(null));
      if (asset !== null) {
        return asset;
      }
      const data = await this.dataGroups.reduce(async (potentialResponse, group) => {
        const resp = await potentialResponse;
        if (resp !== null) {
          return resp;
        }
        return group.handleFetch(req, event);
      }, Promise.resolve(null));
      if (data !== null) {
        return data;
      }
      if (this.adapter.normalizeUrl(req.url) !== this.indexUrl && this.isNavigationRequest(req)) {
        if (this.manifest.navigationRequestStrategy === "freshness") {
          try {
            return await this.scope.fetch(req);
          } catch (e) {
          }
        }
        return this.handleFetch(this.adapter.newRequest(this.indexUrl), event);
      }
      return null;
    }
    isNavigationRequest(req) {
      if (req.mode !== "navigate") {
        return false;
      }
      if (!this.acceptsTextHtml(req)) {
        return false;
      }
      const urlPrefix = this.scope.registration.scope.replace(/\/$/, "");
      const url = req.url.startsWith(urlPrefix) ? req.url.substr(urlPrefix.length) : req.url;
      const urlWithoutQueryOrHash = url.replace(/[?#].*$/, "");
      return this.navigationUrls.include.some((regex) => regex.test(urlWithoutQueryOrHash)) && !this.navigationUrls.exclude.some((regex) => regex.test(urlWithoutQueryOrHash));
    }
    async lookupResourceWithHash(url, hash) {
      if (!this.hashTable.has(url)) {
        return null;
      }
      if (this.hashTable.get(url) !== hash) {
        return null;
      }
      const cacheState = await this.lookupResourceWithoutHash(url);
      return cacheState && cacheState.response;
    }
    lookupResourceWithoutHash(url) {
      return this.assetGroups.reduce(async (potentialResponse, group) => {
        const resp = await potentialResponse;
        if (resp !== null) {
          return resp;
        }
        return group.fetchFromCacheOnly(url);
      }, Promise.resolve(null));
    }
    previouslyCachedResources() {
      return this.assetGroups.reduce(async (resources, group) => (await resources).concat(await group.unhashedResources()), Promise.resolve([]));
    }
    async recentCacheStatus(url) {
      return this.assetGroups.reduce(async (current, group) => {
        const status = await current;
        if (status === UpdateCacheStatus.CACHED) {
          return status;
        }
        const groupStatus = await group.cacheStatus(url);
        if (groupStatus === UpdateCacheStatus.NOT_CACHED) {
          return status;
        }
        return groupStatus;
      }, Promise.resolve(UpdateCacheStatus.NOT_CACHED));
    }
    async getCacheNames() {
      const allGroupCacheNames = await Promise.all([
        ...this.assetGroups.map((group) => group.getCacheNames()),
        ...this.dataGroups.map((group) => group.getCacheNames())
      ]);
      return [].concat(...allGroupCacheNames);
    }
    get appData() {
      return this.manifest.appData || null;
    }
    acceptsTextHtml(req) {
      const accept = req.headers.get("Accept");
      if (accept === null) {
        return false;
      }
      const values = accept.split(",");
      return values.some((value) => value.trim().toLowerCase() === "text/html");
    }
  };

  // bazel-out/k8-fastbuild-ST-2e5f3376adb5/bin/packages/service-worker/worker/src/debug.mjs
  var SW_VERSION = "13.4.0";
  var DEBUG_LOG_BUFFER_SIZE = 100;
  var DebugHandler = class {
    constructor(driver, adapter2) {
      this.driver = driver;
      this.adapter = adapter2;
      this.debugLogA = [];
      this.debugLogB = [];
    }
    async handleFetch(req) {
      const [state, versions, idle] = await Promise.all([
        this.driver.debugState(),
        this.driver.debugVersions(),
        this.driver.debugIdleState()
      ]);
      const msgState = `NGSW Debug Info:

Driver version: ${SW_VERSION}
Driver state: ${state.state} (${state.why})
Latest manifest hash: ${state.latestHash || "none"}
Last update check: ${this.since(state.lastUpdateCheck)}`;
      const msgVersions = versions.map((version) => `=== Version ${version.hash} ===

Clients: ${version.clients.join(", ")}`).join("\n\n");
      const msgIdle = `=== Idle Task Queue ===
Last update tick: ${this.since(idle.lastTrigger)}
Last update run: ${this.since(idle.lastRun)}
Task queue:
${idle.queue.map((v) => " * " + v).join("\n")}

Debug log:
${this.formatDebugLog(this.debugLogB)}
${this.formatDebugLog(this.debugLogA)}
`;
      return this.adapter.newResponse(`${msgState}

${msgVersions}

${msgIdle}`, { headers: this.adapter.newHeaders({ "Content-Type": "text/plain" }) });
    }
    since(time) {
      if (time === null) {
        return "never";
      }
      let age = this.adapter.time - time;
      const days = Math.floor(age / 864e5);
      age = age % 864e5;
      const hours = Math.floor(age / 36e5);
      age = age % 36e5;
      const minutes = Math.floor(age / 6e4);
      age = age % 6e4;
      const seconds = Math.floor(age / 1e3);
      const millis = age % 1e3;
      return (days > 0 ? `${days}d` : "") + (hours > 0 ? `${hours}h` : "") + (minutes > 0 ? `${minutes}m` : "") + (seconds > 0 ? `${seconds}s` : "") + (millis > 0 ? `${millis}u` : "");
    }
    log(value, context = "") {
      if (this.debugLogA.length === DEBUG_LOG_BUFFER_SIZE) {
        this.debugLogB = this.debugLogA;
        this.debugLogA = [];
      }
      if (typeof value !== "string") {
        value = this.errorToString(value);
      }
      this.debugLogA.push({ value, time: this.adapter.time, context });
    }
    errorToString(err) {
      return `${err.name}(${err.message}, ${err.stack})`;
    }
    formatDebugLog(log) {
      return log.map((entry) => `[${this.since(entry.time)}] ${entry.value} ${entry.context}`).join("\n");
    }
  };

  // bazel-out/k8-fastbuild-ST-2e5f3376adb5/bin/packages/service-worker/worker/src/idle.mjs
  var IdleScheduler = class {
    constructor(adapter2, delay, maxDelay, debug) {
      this.adapter = adapter2;
      this.delay = delay;
      this.maxDelay = maxDelay;
      this.debug = debug;
      this.queue = [];
      this.scheduled = null;
      this.empty = Promise.resolve();
      this.emptyResolve = null;
      this.lastTrigger = null;
      this.lastRun = null;
      this.oldestScheduledAt = null;
    }
    async trigger() {
      var _a;
      this.lastTrigger = this.adapter.time;
      if (this.queue.length === 0) {
        return;
      }
      if (this.scheduled !== null) {
        this.scheduled.cancel = true;
      }
      const scheduled = {
        cancel: false
      };
      this.scheduled = scheduled;
      const now = this.adapter.time;
      const maxDelay = Math.max(0, ((_a = this.oldestScheduledAt) != null ? _a : now) + this.maxDelay - now);
      const delay = Math.min(maxDelay, this.delay);
      await this.adapter.timeout(delay);
      if (scheduled.cancel) {
        return;
      }
      this.scheduled = null;
      await this.execute();
    }
    async execute() {
      this.lastRun = this.adapter.time;
      while (this.queue.length > 0) {
        const queue = this.queue;
        this.queue = [];
        await queue.reduce(async (previous, task) => {
          await previous;
          try {
            await task.run();
          } catch (err) {
            this.debug.log(err, `while running idle task ${task.desc}`);
          }
        }, Promise.resolve());
      }
      if (this.emptyResolve !== null) {
        this.emptyResolve();
        this.emptyResolve = null;
      }
      this.empty = Promise.resolve();
      this.oldestScheduledAt = null;
    }
    schedule(desc, run) {
      this.queue.push({ desc, run });
      if (this.emptyResolve === null) {
        this.empty = new Promise((resolve) => {
          this.emptyResolve = resolve;
        });
      }
      if (this.oldestScheduledAt === null) {
        this.oldestScheduledAt = this.adapter.time;
      }
    }
    get size() {
      return this.queue.length;
    }
    get taskDescriptions() {
      return this.queue.map((task) => task.desc);
    }
  };

  // bazel-out/k8-fastbuild-ST-2e5f3376adb5/bin/packages/service-worker/worker/src/manifest.mjs
  function hashManifest(manifest) {
    return sha1(JSON.stringify(manifest));
  }

  // bazel-out/k8-fastbuild-ST-2e5f3376adb5/bin/packages/service-worker/worker/src/msg.mjs
  function isMsgCheckForUpdates(msg) {
    return msg.action === "CHECK_FOR_UPDATES";
  }
  function isMsgActivateUpdate(msg) {
    return msg.action === "ACTIVATE_UPDATE";
  }

  // bazel-out/k8-fastbuild-ST-2e5f3376adb5/bin/packages/service-worker/worker/src/driver.mjs
  var IDLE_DELAY = 5e3;
  var MAX_IDLE_DELAY = 3e4;
  var SUPPORTED_CONFIG_VERSION = 1;
  var NOTIFICATION_OPTION_NAMES = [
    "actions",
    "badge",
    "body",
    "data",
    "dir",
    "icon",
    "image",
    "lang",
    "renotify",
    "requireInteraction",
    "silent",
    "tag",
    "timestamp",
    "title",
    "vibrate"
  ];
  var DriverReadyState;
  (function(DriverReadyState2) {
    DriverReadyState2[DriverReadyState2["NORMAL"] = 0] = "NORMAL";
    DriverReadyState2[DriverReadyState2["EXISTING_CLIENTS_ONLY"] = 1] = "EXISTING_CLIENTS_ONLY";
    DriverReadyState2[DriverReadyState2["SAFE_MODE"] = 2] = "SAFE_MODE";
  })(DriverReadyState || (DriverReadyState = {}));
  var Driver = class {
    constructor(scope2, adapter2, db) {
      this.scope = scope2;
      this.adapter = adapter2;
      this.db = db;
      this.state = DriverReadyState.NORMAL;
      this.stateMessage = "(nominal)";
      this.initialized = null;
      this.clientVersionMap = /* @__PURE__ */ new Map();
      this.versions = /* @__PURE__ */ new Map();
      this.latestHash = null;
      this.lastUpdateCheck = null;
      this.scheduledNavUpdateCheck = false;
      this.loggedInvalidOnlyIfCachedRequest = false;
      this.ngswStatePath = this.adapter.parseUrl("ngsw/state", this.scope.registration.scope).path;
      this.controlTable = this.db.open("control");
      this.scope.addEventListener("install", (event) => {
        event.waitUntil(this.scope.skipWaiting());
      });
      this.scope.addEventListener("activate", (event) => {
        event.waitUntil((async () => {
          await this.scope.clients.claim();
          this.idle.schedule("activate: cleanup-old-sw-caches", async () => {
            try {
              await this.cleanupOldSwCaches();
            } catch (err) {
              this.debugger.log(err, "cleanupOldSwCaches @ activate: cleanup-old-sw-caches");
            }
          });
        })());
        if (this.scope.registration.active !== null) {
          this.scope.registration.active.postMessage({ action: "INITIALIZE" });
        }
      });
      this.scope.addEventListener("fetch", (event) => this.onFetch(event));
      this.scope.addEventListener("message", (event) => this.onMessage(event));
      this.scope.addEventListener("push", (event) => this.onPush(event));
      this.scope.addEventListener("notificationclick", (event) => this.onClick(event));
      this.debugger = new DebugHandler(this, this.adapter);
      this.idle = new IdleScheduler(this.adapter, IDLE_DELAY, MAX_IDLE_DELAY, this.debugger);
    }
    onFetch(event) {
      const req = event.request;
      const scopeUrl = this.scope.registration.scope;
      const requestUrlObj = this.adapter.parseUrl(req.url, scopeUrl);
      if (req.headers.has("ngsw-bypass") || /[?&]ngsw-bypass(?:[=&]|$)/i.test(requestUrlObj.search)) {
        return;
      }
      if (requestUrlObj.path === this.ngswStatePath) {
        event.respondWith(this.debugger.handleFetch(req));
        return;
      }
      if (this.state === DriverReadyState.SAFE_MODE) {
        event.waitUntil(this.idle.trigger());
        return;
      }
      if (requestUrlObj.origin.startsWith("http:") && scopeUrl.startsWith("https:")) {
        this.debugger.log(`Ignoring passive mixed content request: Driver.fetch(${req.url})`);
        return;
      }
      if (req.cache === "only-if-cached" && req.mode !== "same-origin") {
        if (!this.loggedInvalidOnlyIfCachedRequest) {
          this.loggedInvalidOnlyIfCachedRequest = true;
          this.debugger.log(`Ignoring invalid request: 'only-if-cached' can be set only with 'same-origin' mode`, `Driver.fetch(${req.url}, cache: ${req.cache}, mode: ${req.mode})`);
        }
        return;
      }
      event.respondWith(this.handleFetch(event));
    }
    onMessage(event) {
      if (this.state === DriverReadyState.SAFE_MODE) {
        return;
      }
      const data = event.data;
      if (!data || !data.action) {
        return;
      }
      event.waitUntil((async () => {
        if (data.action === "INITIALIZE") {
          return this.ensureInitialized(event);
        }
        if (!this.adapter.isClient(event.source)) {
          return;
        }
        await this.ensureInitialized(event);
        await this.handleMessage(data, event.source);
      })());
    }
    onPush(msg) {
      if (!msg.data) {
        return;
      }
      msg.waitUntil(this.handlePush(msg.data.json()));
    }
    onClick(event) {
      event.waitUntil(this.handleClick(event.notification, event.action));
    }
    async ensureInitialized(event) {
      if (this.initialized !== null) {
        return this.initialized;
      }
      try {
        this.initialized = this.initialize();
        await this.initialized;
      } catch (error) {
        this.state = DriverReadyState.SAFE_MODE;
        this.stateMessage = `Initialization failed due to error: ${errorToString(error)}`;
        throw error;
      } finally {
        event.waitUntil(this.idle.trigger());
      }
    }
    async handleMessage(msg, from) {
      if (isMsgCheckForUpdates(msg)) {
        const action = this.checkForUpdate();
        await this.completeOperation(from, action, msg.nonce);
      } else if (isMsgActivateUpdate(msg)) {
        const action = this.updateClient(from);
        await this.completeOperation(from, action, msg.nonce);
      }
    }
    async handlePush(data) {
      await this.broadcast({
        type: "PUSH",
        data
      });
      if (!data.notification || !data.notification.title) {
        return;
      }
      const desc = data.notification;
      let options = {};
      NOTIFICATION_OPTION_NAMES.filter((name) => desc.hasOwnProperty(name)).forEach((name) => options[name] = desc[name]);
      await this.scope.registration.showNotification(desc["title"], options);
    }
    async handleClick(notification, action) {
      var _a, _b, _c;
      notification.close();
      const options = {};
      NOTIFICATION_OPTION_NAMES.filter((name) => name in notification).forEach((name) => options[name] = notification[name]);
      const notificationAction = action === "" || action === void 0 ? "default" : action;
      const onActionClick = (_b = (_a = notification == null ? void 0 : notification.data) == null ? void 0 : _a.onActionClick) == null ? void 0 : _b[notificationAction];
      const urlToOpen = new URL((_c = onActionClick == null ? void 0 : onActionClick.url) != null ? _c : "", this.scope.registration.scope).href;
      switch (onActionClick == null ? void 0 : onActionClick.operation) {
        case "openWindow":
          await this.scope.clients.openWindow(urlToOpen);
          break;
        case "focusLastFocusedOrOpen": {
          let matchingClient = await this.getLastFocusedMatchingClient(this.scope);
          if (matchingClient) {
            await (matchingClient == null ? void 0 : matchingClient.focus());
          } else {
            await this.scope.clients.openWindow(urlToOpen);
          }
          break;
        }
        case "navigateLastFocusedOrOpen": {
          let matchingClient = await this.getLastFocusedMatchingClient(this.scope);
          if (matchingClient) {
            matchingClient = await matchingClient.navigate(urlToOpen);
            await (matchingClient == null ? void 0 : matchingClient.focus());
          } else {
            await this.scope.clients.openWindow(urlToOpen);
          }
          break;
        }
        default:
          break;
      }
      await this.broadcast({
        type: "NOTIFICATION_CLICK",
        data: { action, notification: options }
      });
    }
    async getLastFocusedMatchingClient(scope2) {
      const windowClients = await scope2.clients.matchAll({ type: "window" });
      return windowClients[0];
    }
    async completeOperation(client, promise, nonce) {
      const response = { type: "OPERATION_COMPLETED", nonce };
      try {
        client.postMessage(__spreadProps(__spreadValues({}, response), {
          result: await promise
        }));
      } catch (e) {
        client.postMessage(__spreadProps(__spreadValues({}, response), {
          error: e.toString()
        }));
      }
    }
    async updateClient(client) {
      const existing = this.clientVersionMap.get(client.id);
      if (existing === this.latestHash) {
        return false;
      }
      let previous = void 0;
      if (existing !== void 0) {
        const existingVersion = this.versions.get(existing);
        previous = this.mergeHashWithAppData(existingVersion.manifest, existing);
      }
      this.clientVersionMap.set(client.id, this.latestHash);
      await this.sync();
      const current = this.versions.get(this.latestHash);
      const notice = {
        type: "UPDATE_ACTIVATED",
        previous,
        current: this.mergeHashWithAppData(current.manifest, this.latestHash)
      };
      client.postMessage(notice);
      return true;
    }
    async handleFetch(event) {
      try {
        await this.ensureInitialized(event);
      } catch (e) {
        return this.safeFetch(event.request);
      }
      if (event.request.mode === "navigate" && !this.scheduledNavUpdateCheck) {
        this.scheduledNavUpdateCheck = true;
        this.idle.schedule("check-updates-on-navigation", async () => {
          this.scheduledNavUpdateCheck = false;
          await this.checkForUpdate();
        });
      }
      const appVersion = await this.assignVersion(event);
      let res = null;
      try {
        if (appVersion !== null) {
          try {
            res = await appVersion.handleFetch(event.request, event);
          } catch (err) {
            if (err.isUnrecoverableState) {
              await this.notifyClientsAboutUnrecoverableState(appVersion, err.message);
            }
            if (err.isCritical) {
              this.debugger.log(err, `Driver.handleFetch(version: ${appVersion.manifestHash})`);
              await this.versionFailed(appVersion, err);
              return this.safeFetch(event.request);
            }
            throw err;
          }
        }
        if (res === null) {
          return this.safeFetch(event.request);
        }
        return res;
      } finally {
        event.waitUntil(this.idle.trigger());
      }
    }
    async initialize() {
      const table = await this.controlTable;
      let manifests, assignments, latest;
      try {
        [manifests, assignments, latest] = await Promise.all([
          table.read("manifests"),
          table.read("assignments"),
          table.read("latest")
        ]);
        if (!this.versions.has(latest.latest) && !manifests.hasOwnProperty(latest.latest)) {
          this.debugger.log(`Missing manifest for latest version hash ${latest.latest}`, "initialize: read from DB");
          throw new Error(`Missing manifest for latest hash ${latest.latest}`);
        }
        this.idle.schedule("init post-load (update)", async () => {
          await this.checkForUpdate();
        });
      } catch (_) {
        const manifest = await this.fetchLatestManifest();
        const hash = hashManifest(manifest);
        manifests = { [hash]: manifest };
        assignments = {};
        latest = { latest: hash };
        await Promise.all([
          table.write("manifests", manifests),
          table.write("assignments", assignments),
          table.write("latest", latest)
        ]);
      }
      this.idle.schedule("init post-load (cleanup)", async () => {
        await this.cleanupCaches();
      });
      Object.keys(manifests).forEach((hash) => {
        const manifest = manifests[hash];
        if (!this.versions.has(hash)) {
          this.versions.set(hash, new AppVersion(this.scope, this.adapter, this.db, this.idle, this.debugger, manifest, hash));
        }
      });
      Object.keys(assignments).forEach((clientId) => {
        const hash = assignments[clientId];
        if (this.versions.has(hash)) {
          this.clientVersionMap.set(clientId, hash);
        } else {
          this.clientVersionMap.set(clientId, latest.latest);
          this.debugger.log(`Unknown version ${hash} mapped for client ${clientId}, using latest instead`, `initialize: map assignments`);
        }
      });
      this.latestHash = latest.latest;
      if (!this.versions.has(latest.latest)) {
        throw new Error(`Invariant violated (initialize): latest hash ${latest.latest} has no known manifest`);
      }
      await Promise.all(Object.keys(manifests).map(async (hash) => {
        try {
          await this.scheduleInitialization(this.versions.get(hash));
        } catch (err) {
          this.debugger.log(err, `initialize: schedule init of ${hash}`);
          return false;
        }
      }));
    }
    lookupVersionByHash(hash, debugName = "lookupVersionByHash") {
      if (!this.versions.has(hash)) {
        throw new Error(`Invariant violated (${debugName}): want AppVersion for ${hash} but not loaded`);
      }
      return this.versions.get(hash);
    }
    async assignVersion(event) {
      const clientId = event.resultingClientId || event.clientId;
      if (clientId) {
        if (this.clientVersionMap.has(clientId)) {
          const hash = this.clientVersionMap.get(clientId);
          let appVersion = this.lookupVersionByHash(hash, "assignVersion");
          if (this.state === DriverReadyState.NORMAL && hash !== this.latestHash && appVersion.isNavigationRequest(event.request)) {
            if (this.latestHash === null) {
              throw new Error(`Invariant violated (assignVersion): latestHash was null`);
            }
            const client = await this.scope.clients.get(clientId);
            if (client) {
              await this.updateClient(client);
            }
            appVersion = this.lookupVersionByHash(this.latestHash, "assignVersion");
          }
          return appVersion;
        } else {
          if (this.state !== DriverReadyState.NORMAL) {
            return null;
          }
          if (this.latestHash === null) {
            throw new Error(`Invariant violated (assignVersion): latestHash was null`);
          }
          this.clientVersionMap.set(clientId, this.latestHash);
          await this.sync();
          return this.lookupVersionByHash(this.latestHash, "assignVersion");
        }
      } else {
        if (this.state !== DriverReadyState.NORMAL) {
          return null;
        }
        if (this.latestHash === null) {
          throw new Error(`Invariant violated (assignVersion): latestHash was null`);
        }
        return this.lookupVersionByHash(this.latestHash, "assignVersion");
      }
    }
    async fetchLatestManifest(ignoreOfflineError = false) {
      const res = await this.safeFetch(this.adapter.newRequest("ngsw.json?ngsw-cache-bust=" + Math.random()));
      if (!res.ok) {
        if (res.status === 404) {
          await this.deleteAllCaches();
          await this.scope.registration.unregister();
        } else if ((res.status === 503 || res.status === 504) && ignoreOfflineError) {
          return null;
        }
        throw new Error(`Manifest fetch failed! (status: ${res.status})`);
      }
      this.lastUpdateCheck = this.adapter.time;
      return res.json();
    }
    async deleteAllCaches() {
      const cacheNames = await this.adapter.caches.keys();
      await Promise.all(cacheNames.map((name) => this.adapter.caches.delete(name)));
    }
    async scheduleInitialization(appVersion) {
      const initialize = async () => {
        try {
          await appVersion.initializeFully();
        } catch (err) {
          this.debugger.log(err, `initializeFully for ${appVersion.manifestHash}`);
          await this.versionFailed(appVersion, err);
        }
      };
      if (this.scope.registration.scope.indexOf("://localhost") > -1) {
        return initialize();
      }
      this.idle.schedule(`initialization(${appVersion.manifestHash})`, initialize);
    }
    async versionFailed(appVersion, err) {
      const broken = Array.from(this.versions.entries()).find(([hash, version]) => version === appVersion);
      if (broken === void 0) {
        return;
      }
      const brokenHash = broken[0];
      if (this.latestHash === brokenHash) {
        this.state = DriverReadyState.EXISTING_CLIENTS_ONLY;
        this.stateMessage = `Degraded due to: ${errorToString(err)}`;
      }
    }
    async setupUpdate(manifest, hash) {
      try {
        const newVersion = new AppVersion(this.scope, this.adapter, this.db, this.idle, this.debugger, manifest, hash);
        if (manifest.configVersion !== SUPPORTED_CONFIG_VERSION) {
          await this.deleteAllCaches();
          await this.scope.registration.unregister();
          throw new Error(`Invalid config version: expected ${SUPPORTED_CONFIG_VERSION}, got ${manifest.configVersion}.`);
        }
        await newVersion.initializeFully(this);
        this.versions.set(hash, newVersion);
        this.latestHash = hash;
        if (this.state === DriverReadyState.EXISTING_CLIENTS_ONLY) {
          this.state = DriverReadyState.NORMAL;
          this.stateMessage = "(nominal)";
        }
        await this.sync();
        await this.notifyClientsAboutVersionReady(manifest, hash);
      } catch (e) {
        await this.notifyClientsAboutVersionInstallationFailed(manifest, hash, e);
        throw e;
      }
    }
    async checkForUpdate() {
      let hash = "(unknown)";
      try {
        const manifest = await this.fetchLatestManifest(true);
        if (manifest === null) {
          this.debugger.log("Check for update aborted. (Client or server offline.)");
          return false;
        }
        hash = hashManifest(manifest);
        if (this.versions.has(hash)) {
          return false;
        }
        await this.notifyClientsAboutVersionDetected(manifest, hash);
        await this.setupUpdate(manifest, hash);
        return true;
      } catch (err) {
        this.debugger.log(err, `Error occurred while updating to manifest ${hash}`);
        this.state = DriverReadyState.EXISTING_CLIENTS_ONLY;
        this.stateMessage = `Degraded due to failed initialization: ${errorToString(err)}`;
        return false;
      }
    }
    async sync() {
      const table = await this.controlTable;
      const manifests = {};
      this.versions.forEach((version, hash) => {
        manifests[hash] = version.manifest;
      });
      const assignments = {};
      this.clientVersionMap.forEach((hash, clientId) => {
        assignments[clientId] = hash;
      });
      const latest = {
        latest: this.latestHash
      };
      await Promise.all([
        table.write("manifests", manifests),
        table.write("assignments", assignments),
        table.write("latest", latest)
      ]);
    }
    async cleanupCaches() {
      try {
        const activeClients = new Set((await this.scope.clients.matchAll()).map((client) => client.id));
        const knownClients = Array.from(this.clientVersionMap.keys());
        const obsoleteClients = knownClients.filter((id) => !activeClients.has(id));
        obsoleteClients.forEach((id) => this.clientVersionMap.delete(id));
        const usedVersions = new Set(this.clientVersionMap.values());
        const obsoleteVersions = Array.from(this.versions.keys()).filter((version) => !usedVersions.has(version) && version !== this.latestHash);
        obsoleteVersions.forEach((version) => this.versions.delete(version));
        await this.sync();
        const allCaches = await this.adapter.caches.keys();
        const usedCaches = new Set(await this.getCacheNames());
        const cachesToDelete = allCaches.filter((name) => !usedCaches.has(name));
        await Promise.all(cachesToDelete.map((name) => this.adapter.caches.delete(name)));
      } catch (err) {
        this.debugger.log(err, "cleanupCaches");
      }
    }
    async cleanupOldSwCaches() {
      const caches = this.adapter.caches.original;
      const cacheNames = await caches.keys();
      const oldSwCacheNames = cacheNames.filter((name) => /^ngsw:(?!\/)/.test(name));
      await Promise.all(oldSwCacheNames.map((name) => caches.delete(name)));
    }
    lookupResourceWithHash(url, hash) {
      return Array.from(this.versions.values()).reduce(async (prev, version) => {
        if (await prev !== null) {
          return prev;
        }
        return version.lookupResourceWithHash(url, hash);
      }, Promise.resolve(null));
    }
    async lookupResourceWithoutHash(url) {
      await this.initialized;
      const version = this.versions.get(this.latestHash);
      return version ? version.lookupResourceWithoutHash(url) : null;
    }
    async previouslyCachedResources() {
      await this.initialized;
      const version = this.versions.get(this.latestHash);
      return version ? version.previouslyCachedResources() : [];
    }
    async recentCacheStatus(url) {
      const version = this.versions.get(this.latestHash);
      return version ? version.recentCacheStatus(url) : UpdateCacheStatus.NOT_CACHED;
    }
    mergeHashWithAppData(manifest, hash) {
      return {
        hash,
        appData: manifest.appData
      };
    }
    async notifyClientsAboutUnrecoverableState(appVersion, reason) {
      const broken = Array.from(this.versions.entries()).find(([hash, version]) => version === appVersion);
      if (broken === void 0) {
        return;
      }
      const brokenHash = broken[0];
      const affectedClients = Array.from(this.clientVersionMap.entries()).filter(([clientId, hash]) => hash === brokenHash).map(([clientId]) => clientId);
      await Promise.all(affectedClients.map(async (clientId) => {
        const client = await this.scope.clients.get(clientId);
        if (client) {
          client.postMessage({ type: "UNRECOVERABLE_STATE", reason });
        }
      }));
    }
    async notifyClientsAboutVersionInstallationFailed(manifest, hash, error) {
      await this.initialized;
      const clients = await this.scope.clients.matchAll();
      await Promise.all(clients.map(async (client) => {
        client.postMessage({
          type: "VERSION_INSTALLATION_FAILED",
          version: this.mergeHashWithAppData(manifest, hash),
          error: errorToString(error)
        });
      }));
    }
    async notifyClientsAboutVersionDetected(manifest, hash) {
      await this.initialized;
      const clients = await this.scope.clients.matchAll();
      await Promise.all(clients.map(async (client) => {
        const version = this.clientVersionMap.get(client.id);
        if (version === void 0) {
          return;
        }
        client.postMessage({ type: "VERSION_DETECTED", version: this.mergeHashWithAppData(manifest, hash) });
      }));
    }
    async notifyClientsAboutVersionReady(manifest, hash) {
      await this.initialized;
      const clients = await this.scope.clients.matchAll();
      await Promise.all(clients.map(async (client) => {
        const version = this.clientVersionMap.get(client.id);
        if (version === void 0) {
          return;
        }
        if (version === this.latestHash) {
          return;
        }
        const current = this.versions.get(version);
        const notice = {
          type: "VERSION_READY",
          currentVersion: this.mergeHashWithAppData(current.manifest, version),
          latestVersion: this.mergeHashWithAppData(manifest, hash)
        };
        client.postMessage(notice);
      }));
    }
    async broadcast(msg) {
      const clients = await this.scope.clients.matchAll();
      clients.forEach((client) => {
        client.postMessage(msg);
      });
    }
    async debugState() {
      return {
        state: DriverReadyState[this.state],
        why: this.stateMessage,
        latestHash: this.latestHash,
        lastUpdateCheck: this.lastUpdateCheck
      };
    }
    async debugVersions() {
      return Array.from(this.versions.keys()).map((hash) => {
        const version = this.versions.get(hash);
        const clients = Array.from(this.clientVersionMap.entries()).filter(([clientId, version2]) => version2 === hash).map(([clientId, version2]) => clientId);
        return {
          hash,
          manifest: version.manifest,
          clients,
          status: ""
        };
      });
    }
    async debugIdleState() {
      return {
        queue: this.idle.taskDescriptions,
        lastTrigger: this.idle.lastTrigger,
        lastRun: this.idle.lastRun
      };
    }
    async safeFetch(req) {
      try {
        return await this.scope.fetch(req);
      } catch (err) {
        this.debugger.log(err, `Driver.fetch(${req.url})`);
        return this.adapter.newResponse(null, {
          status: 504,
          statusText: "Gateway Timeout"
        });
      }
    }
    async getCacheNames() {
      const controlTable = await this.controlTable;
      const appVersions = Array.from(this.versions.values());
      const appVersionCacheNames = await Promise.all(appVersions.map((version) => version.getCacheNames()));
      return [controlTable.cacheName].concat(...appVersionCacheNames);
    }
  };

  // bazel-out/k8-fastbuild-ST-2e5f3376adb5/bin/packages/service-worker/worker/main.mjs
  var scope = self;
  var adapter = new Adapter(scope.registration.scope, self.caches);
  new Driver(scope, adapter, new CacheDatabase(adapter));
})();
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
