import "tslib";

var __window = "undefined" !== typeof window && window;

var __self = "undefined" !== typeof self && "undefined" !== typeof WorkerGlobalScope && self instanceof WorkerGlobalScope && self;

var __global = "undefined" !== typeof global && global;

var _root = __window || __global || __self;

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

var isNode = function() {
    var proc = _root.process;
    if (!!proc && "object" === typeof proc) if (!!proc.versions && "object" === typeof proc.versions) if ("undefined" !== typeof proc.versions.node) return true;
    return false;
};

var isString = function(val) {
    return "string" === typeof val;
};

var isStandardBrowserEnv = function() {
    if (isNode()) return false;
    if ("undefined" !== typeof navigator && ("ReactNative" === navigator.product || "NativeScript" === navigator.product || "NS" === navigator.product)) return false;
    return "undefined" !== typeof window && "undefined" !== typeof document;
};

var resolveURL = function(url) {
    var msie = /(msie|trident)/i.test(navigator.userAgent);
    var urlParsingNode = document.createElement("a");
    if (msie) urlParsingNode.setAttribute("href", url);
    var href = msie ? urlParsingNode.href : url;
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

var isURLSameOrigin = isStandardBrowserEnv() ? function() {
    var originURL = resolveURL(window.location.href);
    return function(requestURL) {
        var parsed = isString(requestURL) ? resolveURL(requestURL) : requestURL;
        return parsed.protocol === originURL.protocol && parsed.host === originURL.host;
    };
}() : function() {
    return true;
};

var HttpEventType;

(function(HttpEventType) {
    HttpEventType["Sent"] = "Sent";
    HttpEventType["UploadProgress"] = "UploadProgress";
    HttpEventType["ResponseHeader"] = "ResponseHeader";
    HttpEventType["DownloadProgress"] = "DownloadProgress";
    HttpEventType["Response"] = "Response";
    HttpEventType["User"] = "User";
})(HttpEventType || (HttpEventType = {}));
