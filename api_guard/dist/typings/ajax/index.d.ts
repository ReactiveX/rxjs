export declare const ajax: AjaxCreationMethod;

export interface AjaxError extends Error {
    request: AjaxRequest;
    response: any;
    responseType: string;
    status: number;
    xhr: XMLHttpRequest;
}

export declare const AjaxError: AjaxErrorCtor;

export interface AjaxRequest {
    async?: boolean;
    body?: any;
    createXHR?: () => XMLHttpRequest;
    crossDomain?: boolean;
    hasContent?: boolean;
    headers?: Object;
    method?: string;
    password?: string;
    progressSubscriber?: Subscriber<any>;
    responseType?: string;
    timeout?: number;
    url?: string;
    user?: string;
    withCredentials?: boolean;
}

export declare class AjaxResponse {
    originalEvent: Event;
    request: AjaxRequest;
    response: any;
    responseText: string;
    responseType: string;
    status: number;
    xhr: XMLHttpRequest;
    constructor(originalEvent: Event, xhr: XMLHttpRequest, request: AjaxRequest);
}

export interface AjaxTimeoutError extends AjaxError {
}

export declare const AjaxTimeoutError: AjaxTimeoutErrorCtor;
