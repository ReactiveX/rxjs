import "tslib";

const __window = "undefined" !== typeof window && window;

const __self = "undefined" !== typeof self && "undefined" !== typeof WorkerGlobalScope && self instanceof WorkerGlobalScope && self;

const __global = "undefined" !== typeof global && global;

const _root = __window || __global || __self;

var Method;

(function(Method) {
    Method["Get"] = "get";
    Method["Delete"] = "delete";
    Method["Head"] = "head";
    Method["Options"] = "options";
    Method["Post"] = "post";
    Method["Put"] = "put";
    Method["Patch"] = "patch";
})(Method || (Method = {}));

var ResponseType;

(function(ResponseType) {
    ResponseType["ArrayBuffer"] = "arraybuffer";
    ResponseType["Blob"] = "blob";
    ResponseType["Document"] = "document";
    ResponseType["Json"] = "json";
    ResponseType["Text"] = "text";
    ResponseType["Stream"] = "stream";
})(ResponseType || (ResponseType = {}));

const isNode = () => {
    const proc = _root.process;
    if (!!proc && "object" === typeof proc) if (!!proc.versions && "object" === typeof proc.versions) if ("undefined" !== typeof proc.versions.node) return true;
    return false;
};

const isString = val => "string" === typeof val;

const isStandardBrowserEnv = () => {
    if (isNode()) return false;
    if ("undefined" !== typeof navigator && ("ReactNative" === navigator.product || "NativeScript" === navigator.product || "NS" === navigator.product)) return false;
    return "undefined" !== typeof window && "undefined" !== typeof document;
};

const resolveURL = url => {
    const msie = /(msie|trident)/i.test(navigator.userAgent);
    const urlParsingNode = document.createElement("a");
    if (msie) urlParsingNode.setAttribute("href", url);
    const href = msie ? urlParsingNode.href : url;
    urlParsingNode.setAttribute("href", href);
    return {
        href: urlParsingNode.href,
        protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, "") : "",
        host: urlParsingNode.host,
        search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, "") : "",
        hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, "") : "",
        hostname: urlParsingNode.hostname,
        port: urlParsingNode.port,
        pathname: "/" === urlParsingNode.pathname.charAt(0) ? urlParsingNode.pathname : "/" + urlParsingNode.pathname
    };
};

const isURLSameOrigin = isStandardBrowserEnv() ? (() => {
    const originURL = resolveURL(window.location.href);
    return requestURL => {
        const parsed = isString(requestURL) ? resolveURL(requestURL) : requestURL;
        return parsed.protocol === originURL.protocol && parsed.host === originURL.host;
    };
})() : () => true;

var HttpEventType;

(function(HttpEventType) {
    HttpEventType["Sent"] = "Sent";
    HttpEventType["UploadProgress"] = "UploadProgress";
    HttpEventType["ResponseHeader"] = "ResponseHeader";
    HttpEventType["DownloadProgress"] = "DownloadProgress";
    HttpEventType["Response"] = "Response";
    HttpEventType["User"] = "User";
})(HttpEventType || (HttpEventType = {}));
