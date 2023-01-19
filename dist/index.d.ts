import { IncomingMessage, ServerResponse, OutgoingMessage } from 'node:http';
export { IncomingMessage as NodeIncomingMessage, ServerResponse as NodeServerResponse } from 'node:http';
import { CookieSerializeOptions } from 'cookie-es';
import * as ufo from 'ufo';

type HTTPMethod = "GET" | "HEAD" | "PATCH" | "POST" | "PUT" | "DELETE" | "CONNECT" | "OPTIONS" | "TRACE";
type Encoding = false | "ascii" | "utf8" | "utf-8" | "utf16le" | "ucs2" | "ucs-2" | "base64" | "latin1" | "binary" | "hex";
interface H3EventContext extends Record<string, any> {
}
type EventHandlerResponse<T = any> = T | Promise<T>;
interface EventHandler<T = any> {
    __is_handler__?: true;
    (event: H3Event): EventHandlerResponse<T>;
}
type LazyEventHandler = () => EventHandler | Promise<EventHandler>;
type RequestHeaders = {
    [name: string]: string | undefined;
};

type NodeListener = (req: IncomingMessage, res: ServerResponse) => void;
type NodePromisifiedHandler = (req: IncomingMessage, res: ServerResponse) => Promise<any>;
type NodeMiddleware = (req: IncomingMessage, res: ServerResponse, next: (err?: Error) => any) => any;
declare const defineNodeListener: (handler: NodeListener) => NodeListener;
declare const defineNodeMiddleware: (middleware: NodeMiddleware) => NodeMiddleware;
declare function fromNodeMiddleware(handler: NodeListener | NodeMiddleware): EventHandler;
declare function toNodeListener(app: App): NodeListener;
declare function promisifyNodeListener(handler: NodeListener | NodeMiddleware): NodePromisifiedHandler;
declare function callNodeListener(handler: NodeMiddleware, req: IncomingMessage, res: ServerResponse): Promise<unknown>;

declare class H3Headers implements Headers {
    _headers: Record<string, string>;
    constructor(init?: HeadersInit);
    [Symbol.iterator](): IterableIterator<[string, string]>;
    entries(): IterableIterator<[string, string]>;
    keys(): IterableIterator<string>;
    values(): IterableIterator<string>;
    append(name: string, value: string): void;
    delete(name: string): void;
    get(name: string): string | null;
    has(name: string): boolean;
    set(name: string, value: string): void;
    forEach(callbackfn: (value: string, key: string, parent: Headers) => void): void;
}

declare class H3Response implements Response {
    readonly headers: H3Headers;
    readonly status: number;
    readonly statusText: string;
    readonly redirected: boolean;
    readonly ok: boolean;
    readonly url: string;
    _body: string | ArrayBuffer | Uint8Array;
    readonly body: ReadableStream<Uint8Array> | null;
    readonly type: ResponseType;
    readonly bodyUsed = false;
    constructor(body?: BodyInit | EventHandlerResponse | null, init?: ResponseInit);
    clone(): H3Response;
    arrayBuffer(): Promise<ArrayBuffer>;
    blob(): Promise<Blob>;
    formData(): Promise<FormData>;
    json<T = any>(): Promise<T>;
    text(): Promise<string>;
}

interface NodeEventContext {
    req: IncomingMessage;
    res: ServerResponse;
}
declare class H3Event implements Pick<FetchEvent, "respondWith"> {
    "__is_event__": boolean;
    node: NodeEventContext;
    context: H3EventContext;
    constructor(req: IncomingMessage, res: ServerResponse);
    get path(): string | undefined;
    /** @deprecated Please use `event.node.req` instead. **/
    get req(): IncomingMessage;
    /** @deprecated Please use `event.node.res` instead. **/
    get res(): ServerResponse<IncomingMessage>;
    respondWith(r: H3Response | PromiseLike<H3Response>): void;
}
declare function isEvent(input: any): input is H3Event;
declare function createEvent(req: IncomingMessage, res: ServerResponse): H3Event;

declare function defineEventHandler<T = any>(handler: EventHandler<T>): EventHandler<T>;
declare const eventHandler: typeof defineEventHandler;
declare function isEventHandler(input: any): input is EventHandler;
declare function toEventHandler(input: any, _?: any, _route?: string): EventHandler;
interface DynamicEventHandler extends EventHandler {
    set: (handler: EventHandler) => void;
}
declare function dynamicEventHandler(initial?: EventHandler): DynamicEventHandler;
declare function defineLazyEventHandler(factory: LazyEventHandler): EventHandler;
declare const lazyEventHandler: typeof defineLazyEventHandler;

interface Layer {
    route: string;
    match?: Matcher;
    handler: EventHandler;
}
type Stack = Layer[];
interface InputLayer {
    route?: string;
    match?: Matcher;
    handler: EventHandler;
    lazy?: boolean;
}
type InputStack = InputLayer[];
type Matcher = (url: string, event?: H3Event) => boolean;
interface AppUse {
    (route: string | string[], handler: EventHandler | EventHandler[], options?: Partial<InputLayer>): App;
    (handler: EventHandler | EventHandler[], options?: Partial<InputLayer>): App;
    (options: InputLayer): App;
}
interface AppOptions {
    debug?: boolean;
    onError?: (error: Error, event: H3Event) => any;
}
interface App {
    stack: Stack;
    handler: EventHandler;
    options: AppOptions;
    use: AppUse;
}
declare function createApp(options?: AppOptions): App;
declare function use(app: App, arg1: string | EventHandler | InputLayer | InputLayer[], arg2?: Partial<InputLayer> | EventHandler | EventHandler[], arg3?: Partial<InputLayer>): App;
declare function createAppEventHandler(stack: Stack, options: AppOptions): EventHandler<void>;

/**
 * H3 Runtime Error
 * @class
 * @extends Error
 * @property {Number} statusCode An Integer indicating the HTTP response status code.
 * @property {String} statusMessage A String representing the HTTP status message
 * @property {String} fatal Indicates if the error is a fatal error.
 * @property {String} unhandled Indicates if the error was unhandled and auto captured.
 * @property {Any} data An extra data that will includes in the response.<br>
 *  This can be used to pass additional information about the error.
 * @property {Boolean} internal Setting this property to <code>true</code> will mark error as an internal error
 */
declare class H3Error extends Error {
    static __h3_error__: boolean;
    toJSON(): Pick<H3Error, "data" | "statusCode" | "statusMessage" | "message">;
    statusCode: number;
    fatal: boolean;
    unhandled: boolean;
    statusMessage?: string;
    data?: any;
}
/**
 * Creates new `Error` that can be used to handle both internal and runtime errors.
 *
 * @param input {Partial<H3Error>}
 * @return {H3Error} An instance of the H3Error
 */
declare function createError(input: string | (Partial<H3Error> & {
    status?: number;
    statusText?: string;
})): H3Error;
/**
 * Receive an error and return the corresponding response.<br>
 *  H3 internally uses this function to handle unhandled errors.<br>
 *  Note that calling this function will close the connection and no other data will be sent to client afterwards.
 *
 @param event {H3Event} H3 event or req passed by h3 handler
 * @param error {H3Error|Error} Raised error
 * @param debug {Boolean} Whether application is in debug mode.<br>
 *  In the debug mode the stack trace of errors will be return in response.
 */
declare function sendError(event: H3Event, error: Error | H3Error, debug?: boolean): void;
declare function isError(input: any): input is H3Error;

declare function useBase(base: string, handler: EventHandler): EventHandler;

interface MultiPartData {
    data: Buffer;
    name?: string;
    filename?: string;
    type?: string;
}

/**
 * Reads body of the request and returns encoded raw string (default) or `Buffer` if encoding if falsy.
 * @param event {H3Event} H3 event or req passed by h3 handler
 * @param encoding {Encoding} encoding="utf-8" - The character encoding to use.
 *
 * @return {String|Buffer} Encoded raw string or raw Buffer of the body
 */
declare function readRawBody<E extends Encoding = "utf8">(event: H3Event, encoding?: E): E extends false ? Promise<Buffer | undefined> : Promise<string | undefined>;
/**
 * Reads request body and try to safely parse using [destr](https://github.com/unjs/destr)
 * @param event {H3Event} H3 event or req passed by h3 handler
 * @param encoding {Encoding} encoding="utf-8" - The character encoding to use.
 *
 * @return {*} The `Object`, `Array`, `String`, `Number`, `Boolean`, or `null` value corresponding to the request JSON body
 *
 * ```ts
 * const body = await useBody(req)
 * ```
 */
declare function readBody<T = any>(event: H3Event): Promise<T>;
declare function readMultipartFormData(event: H3Event): Promise<MultiPartData[] | undefined>;

interface CacheConditions {
    modifiedTime?: string | Date;
    maxAge?: number;
    etag?: string;
    cacheControls?: string[];
}
/**
 * Check request caching headers (`If-Modified-Since`) and add caching headers (Last-Modified, Cache-Control)
 * Note: `public` cache control will be added by default
 * @returns `true` when cache headers are matching. When `true` is returned, no reponse should be sent anymore
 */
declare function handleCacheHeaders(event: H3Event, opts: CacheConditions): boolean;

declare const MIMES: {
    html: string;
    json: string;
};

/**
 * Parse the request to get HTTP Cookie header string and returning an object of all cookie name-value pairs.
 * @param event {H3Event} H3 event or req passed by h3 handler
 * @returns Object of cookie name-value pairs
 * ```ts
 * const cookies = parseCookies(event)
 * ```
 */
declare function parseCookies(event: H3Event): Record<string, string>;
/**
 * Get a cookie value by name.
 * @param event {H3Event} H3 event or req passed by h3 handler
 * @param name Name of the cookie to get
 * @returns {*} Value of the cookie (String or undefined)
 * ```ts
 * const authorization = useCookie(request, 'Authorization')
 * ```
 */
declare function getCookie(event: H3Event, name: string): string | undefined;
/**
 * Set a cookie value by name.
 * @param event {H3Event} H3 event or res passed by h3 handler
 * @param name Name of the cookie to set
 * @param value Value of the cookie to set
 * @param serializeOptions {CookieSerializeOptions} Options for serializing the cookie
 * ```ts
 * setCookie(res, 'Authorization', '1234567')
 * ```
 */
declare function setCookie(event: H3Event, name: string, value: string, serializeOptions?: CookieSerializeOptions): void;
/**
 * Set a cookie value by name.
 * @param event {H3Event} H3 event or res passed by h3 handler
 * @param name Name of the cookie to delete
 * @param serializeOptions {CookieSerializeOptions} Cookie options
 * ```ts
 * deleteCookie(res, 'SessionId')
 * ```
 */
declare function deleteCookie(event: H3Event, name: string, serializeOptions?: CookieSerializeOptions): void;

interface ProxyOptions {
    headers?: RequestHeaders | HeadersInit;
    fetchOptions?: RequestInit;
    fetch?: typeof fetch;
    sendStream?: boolean;
}
declare function proxyRequest(event: H3Event, target: string, opts?: ProxyOptions): Promise<void>;
declare function sendProxy(event: H3Event, target: string, opts?: ProxyOptions): Promise<void>;

declare function getQuery(event: H3Event): ufo.QueryObject;
declare function getRouterParams(event: H3Event): H3Event["context"];
declare function getRouterParam(event: H3Event, name: string): H3Event["context"][string];
declare function getMethod(event: H3Event, defaultMethod?: HTTPMethod): HTTPMethod;
declare function isMethod(event: H3Event, expected: HTTPMethod | HTTPMethod[], allowHead?: boolean): boolean;
declare function assertMethod(event: H3Event, expected: HTTPMethod | HTTPMethod[], allowHead?: boolean): void;
declare function getRequestHeaders(event: H3Event): RequestHeaders;
declare const getHeaders: typeof getRequestHeaders;
declare function getRequestHeader(event: H3Event, name: string): RequestHeaders[string];
declare const getHeader: typeof getRequestHeader;

declare function send(event: H3Event, data?: any, type?: string): Promise<void>;
/**
 * Respond with an empty payload.<br>
 * Note that calling this function will close the connection and no other data can be sent to the client afterwards.
 *
 * @param event H3 event
 * @param code status code to be send. By default, it is `204 No Content`.
 */
declare function sendNoContent(event: H3Event, code?: number): void;
declare function setResponseStatus(event: H3Event, code: number, text?: string): void;
declare function getResponseStatus(event: H3Event): number;
declare function getResponseStatusText(event: H3Event): string;
declare function defaultContentType(event: H3Event, type?: string): void;
declare function sendRedirect(event: H3Event, location: string, code?: number): Promise<void>;
declare function getResponseHeaders(event: H3Event): ReturnType<H3Event["res"]["getHeaders"]>;
declare function getResponseHeader(event: H3Event, name: string): ReturnType<H3Event["res"]["getHeader"]>;
declare function setResponseHeaders(event: H3Event, headers: Record<string, Parameters<OutgoingMessage["setHeader"]>[1]>): void;
declare const setHeaders: typeof setResponseHeaders;
declare function setResponseHeader(event: H3Event, name: string, value: Parameters<OutgoingMessage["setHeader"]>[1]): void;
declare const setHeader: typeof setResponseHeader;
declare function appendResponseHeaders(event: H3Event, headers: Record<string, string>): void;
declare const appendHeaders: typeof appendResponseHeaders;
declare function appendResponseHeader(event: H3Event, name: string, value: string): void;
declare const appendHeader: typeof appendResponseHeader;
declare function isStream(data: any): any;
declare function sendStream(event: H3Event, data: any): Promise<void>;
declare function writeEarlyHints(event: H3Event, hints: string | string[] | Record<string, string | string[]>, cb?: () => void): void;

type RouterMethod = Lowercase<HTTPMethod>;
type RouterUse = (path: string, handler: EventHandler, method?: RouterMethod | RouterMethod[]) => Router;
type AddRouteShortcuts = Record<RouterMethod, RouterUse>;
interface Router extends AddRouteShortcuts {
    add: RouterUse;
    use: RouterUse;
    handler: EventHandler;
}
interface CreateRouterOptions {
    /** @deprecated Please use `preemptive` instead. **/
    preemtive?: boolean;
    preemptive?: boolean;
}
declare function createRouter(opts?: CreateRouterOptions): Router;

export { AddRouteShortcuts, App, AppOptions, AppUse, CacheConditions, CreateRouterOptions, DynamicEventHandler, Encoding, EventHandler, EventHandlerResponse, H3Error, H3Event, H3EventContext, H3Headers, H3Response, HTTPMethod, InputLayer, InputStack, Layer, LazyEventHandler, MIMES, Matcher, NodeEventContext, NodeListener, NodeMiddleware, NodePromisifiedHandler, ProxyOptions, RequestHeaders, Router, RouterMethod, RouterUse, Stack, appendHeader, appendHeaders, appendResponseHeader, appendResponseHeaders, assertMethod, callNodeListener, createApp, createAppEventHandler, createError, createEvent, createRouter, defaultContentType, defineEventHandler, defineLazyEventHandler, defineNodeListener, defineNodeMiddleware, deleteCookie, dynamicEventHandler, eventHandler, fromNodeMiddleware, getCookie, getHeader, getHeaders, getMethod, getQuery, getRequestHeader, getRequestHeaders, getResponseHeader, getResponseHeaders, getResponseStatus, getResponseStatusText, getRouterParam, getRouterParams, handleCacheHeaders, isError, isEvent, isEventHandler, isMethod, isStream, lazyEventHandler, parseCookies, promisifyNodeListener, proxyRequest, readBody, readMultipartFormData, readRawBody, send, sendError, sendNoContent, sendProxy, sendRedirect, sendStream, setCookie, setHeader, setHeaders, setResponseHeader, setResponseHeaders, setResponseStatus, toEventHandler, toNodeListener, use, useBase, writeEarlyHints };