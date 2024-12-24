/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */


declare global {
    const WsClient: ReturnType<typeof WsClientModule>;
}

export function register_ws_client() {
    (_G as any).WsClient = WsClientModule();
}

type CbOnMessage = (data: string) => void;

function WsClientModule() {
    const logger = Log.get_with_prefix('WsClient');
    let client: WebSocketConnection;
    let _is_connected = false;
    let wait_stop = false;
    let is_message_callback = false;
    let cb_on_message: CbOnMessage;

    function set_on_message_callback(callback: CbOnMessage) {
        is_message_callback = true;
        cb_on_message = callback;
    }

    function websocket_callback(_self: any, conn: WebSocketConnection, data: WebSocketData) {
        if (data.event === websocket.EVENT_DISCONNECTED) {
            logger.log("Disconnected: ", conn, wait_stop);
            client = null;
            _is_connected = false;
            EventBus.trigger('ON_WS_DISCONNECTED', { wait_stop }, false);
        } else if (data.event === websocket.EVENT_CONNECTED) {
            logger.log("Connected: ", tostring(conn));
            _is_connected = true;
            EventBus.trigger('ON_WS_CONNECTED', {}, false);
        } else if (data.event === websocket.EVENT_ERROR) {
            logger.error("Error WS: ", data.message);
            _is_connected = false;
        } else if (data.event === websocket.EVENT_MESSAGE) {
            //logger.log("Receiving: '", pack);
            if (is_message_callback)
                cb_on_message(data.message);
            else
                EventBus.trigger('ON_WS_DATA', { data: data.message });
        }
    }

    function connect(url: string) {
        client = websocket.connect(url, { timeout: 5000 }, websocket_callback);
        wait_stop = false;
    }

    function disconnect() {
        wait_stop = true;
        if (is_connected())
            websocket.disconnect(client);
    }

    function send_raw(data: string, is_binary = true) {
        if (is_connected())
            websocket.send(client, data, { type: is_binary ? websocket.DATA_TYPE_BINARY : websocket.DATA_TYPE_TEXT });
        else
            logger.error("Not connected, send:", data);
    }
   

    function is_connected() {
        return client != null && _is_connected;
    }

    return { connect, disconnect, send_raw, is_connected, set_on_message_callback };
}
