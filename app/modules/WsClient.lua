local ____exports = {}
local WsClientModule
function WsClientModule()
    local is_connected, client, _is_connected
    function is_connected()
        return client ~= nil and _is_connected
    end
    local logger = Log.get_with_prefix("WsClient")
    _is_connected = false
    local wait_stop = false
    local is_message_callback = false
    local cb_on_message
    local function set_on_message_callback(callback)
        is_message_callback = true
        cb_on_message = callback
    end
    local function websocket_callback(_self, conn, data)
        if data.event == websocket.EVENT_DISCONNECTED then
            logger.log("Disconnected: ", conn, wait_stop)
            client = nil
            _is_connected = false
            EventBus.trigger("ON_WS_DISCONNECTED", {wait_stop = wait_stop}, false)
        elseif data.event == websocket.EVENT_CONNECTED then
            logger.log(
                "Connected: ",
                tostring(conn)
            )
            _is_connected = true
            EventBus.trigger("ON_WS_CONNECTED", {}, false)
        elseif data.event == websocket.EVENT_ERROR then
            logger.error("Error WS: ", data.message)
            _is_connected = false
        elseif data.event == websocket.EVENT_MESSAGE then
            if is_message_callback then
                cb_on_message(data.message)
            else
                EventBus.trigger("ON_WS_DATA", {data = data.message})
            end
        end
    end
    local function connect(url)
        client = websocket.connect(url, {timeout = 5000}, websocket_callback)
        wait_stop = false
    end
    local function disconnect()
        wait_stop = true
        if is_connected() then
            websocket.disconnect(client)
        end
    end
    local function send_raw(data, is_binary)
        if is_binary == nil then
            is_binary = true
        end
        if is_connected() then
            websocket.send(client, data, {type = is_binary and websocket.DATA_TYPE_BINARY or websocket.DATA_TYPE_TEXT})
        else
            logger.error("Not connected, send:", data)
        end
    end
    return {
        connect = connect,
        disconnect = disconnect,
        send_raw = send_raw,
        is_connected = is_connected,
        set_on_message_callback = set_on_message_callback
    }
end
function ____exports.register_ws_client()
    _G.WsClient = WsClientModule()
end
return ____exports
