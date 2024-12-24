/* eslint-disable @typescript-eslint/no-explicit-any */
/** @noResolution */

declare namespace websocket {
    export let EVENT_CONNECTED: number;
    export let EVENT_DISCONNECTED: number;
    export let EVENT_MESSAGE: number;
    export let EVENT_ERROR: number;
    export let DATA_TYPE_BINARY: number;
    export let DATA_TYPE_TEXT: number;


    export function connect(url: string, params: { timeout?: number, protocol?: string, headers?: any }, callback: CbConnection): WebSocketConnection;
    export function disconnect(connection: WebSocketConnection): void;
    export function send(connection: WebSocketConnection, message: string, options?: { type: number }): void;

    // 
    export function listen(port: number, max_connections: number, connection_timeout: number, callback: any): void;
    export function stop_listening(): void;

}
type WebSocketConnection = any;
type WebSocketData = { event: number, message: string, handshake_response: any, code: number };
type CbConnection = (self: any, connection: WebSocketConnection, data: WebSocketData) => void;