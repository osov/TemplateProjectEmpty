local ____lualib = require("lualib_bundle")
local __TS__Delete = ____lualib.__TS__Delete
local __TS__ArraySplice = ____lualib.__TS__ArraySplice
local ____exports = {}
local EventBusModule
local event = require("event.event")
function EventBusModule()
    local bus_log = Log.get_with_prefix("Bus")
    local events = {}
    local listeners = {}
    local send_messages = {}
    local id_counter_message_bus = 0
    local EVENT_BUS_MESSAGE = hash("event_bus_message")
    local function ensure_hash(string_or_hash)
        return type(string_or_hash) == "string" and hash(string_or_hash) or string_or_hash
    end
    local function get_id_script()
        local url = msg.url()
        return (hash_to_hex(url.socket) .. hash_to_hex(url.path)) .. hash_to_hex(url.fragment or hash(""))
    end
    local function update_cache()
        for k in pairs(send_messages) do
            local message = send_messages[k]
            if message.time + 2 < System.now() then
                __TS__Delete(send_messages, k)
            end
        end
    end
    local function _on(id_message, callback, is_message_mode, callback_context, once)
        local key_message = ensure_hash(id_message)
        if is_message_mode then
        else
            if not events[key_message] then
                events[key_message] = event.create()
            end
            events[key_message]:subscribe(callback)
        end
        if not listeners[key_message] then
            listeners[key_message] = {}
        end
        local ____listeners_key_message_0 = listeners[key_message]
        ____listeners_key_message_0[#____listeners_key_message_0 + 1] = {
            callback = callback,
            callback_context = callback_context,
            once = once,
            is_message_mode = is_message_mode,
            url = msg.url(),
            id_script = get_id_script()
        }
    end
    local function on(id_message, callback, is_message_mode, callback_context)
        if is_message_mode == nil then
            is_message_mode = false
        end
        _on(
            id_message,
            callback,
            is_message_mode,
            callback_context,
            false
        )
    end
    local function once(id_message, callback, is_message_mode, callback_context)
        if is_message_mode == nil then
            is_message_mode = false
        end
        _on(
            id_message,
            callback,
            is_message_mode,
            callback_context,
            true
        )
    end
    local function off(id_message, callback)
        local key_message = ensure_hash(id_message)
        if not listeners[key_message] then
            bus_log.warn(("Ни один слушатель для события не зарегистрирован: " .. id_message) .. ", off")
            return
        end
        local list = listeners[key_message]
        do
            local i = #list - 1
            while i >= 0 do
                local l = list[i + 1]
                if l.callback == callback then
                    if not l.is_message_mode and events[key_message] then
                        events[key_message]:unsubscribe(callback)
                    end
                    __TS__ArraySplice(list, i, 1)
                    return
                end
                i = i - 1
            end
        end
    end
    local function off_all_id_message(id_message)
        local key_message = ensure_hash(id_message)
        if not listeners[key_message] then
            bus_log.warn(("Ни один слушатель для события не зарегистрирован: " .. id_message) .. ", off_all_id_message")
            return
        end
        if events[key_message] then
            events[key_message]:clear()
            __TS__Delete(events, key_message)
        end
        __TS__Delete(listeners, key_message)
    end
    local function off_all_context(context)
        for key_message in pairs(listeners) do
            local listener = listeners[key_message]
            do
                local i = #listener - 1
                while i >= 0 do
                    local l = listener[i + 1]
                    if l.callback_context == context then
                        if not l.is_message_mode and events[key_message] then
                            events[key_message]:unsubscribe(l.callback)
                        end
                        __TS__ArraySplice(listener, i, 1)
                    end
                    i = i - 1
                end
            end
        end
    end
    local function off_all_current_script()
        local id_script = get_id_script()
        for key_message in pairs(listeners) do
            local listener = listeners[key_message]
            do
                local i = #listener - 1
                while i >= 0 do
                    local l = listener[i + 1]
                    if l.id_script == id_script then
                        if not l.is_message_mode and events[key_message] then
                            events[key_message]:unsubscribe(l.callback)
                        end
                        __TS__ArraySplice(listener, i, 1)
                    end
                    i = i - 1
                end
            end
        end
    end
    local function trigger(id_message, message_data, show_warning, is_copy_data)
        if show_warning == nil then
            show_warning = true
        end
        if is_copy_data == nil then
            is_copy_data = false
        end
        local key_message = ensure_hash(id_message)
        if not listeners[key_message] then
            if show_warning then
                bus_log.warn(("Ни один слушатель для события не зарегистрирован: " .. id_message) .. ", trigger/send")
            end
            return
        end
        local ____is_copy_data_1
        if is_copy_data then
            ____is_copy_data_1 = json.decode(json.encode(message_data))
        else
            ____is_copy_data_1 = message_data
        end
        local data = ____is_copy_data_1
        local list = listeners[key_message]
        local del_ids = {}
        do
            local i = 0
            while i < #list do
                local l = list[i + 1]
                if l.is_message_mode then
                    id_counter_message_bus = id_counter_message_bus + 1
                    send_messages[id_counter_message_bus] = {
                        time = System.now(),
                        data = data,
                        listener = l
                    }
                    msg.post(l.url, EVENT_BUS_MESSAGE, {id_counter_message_bus = id_counter_message_bus})
                end
                if l.once then
                    del_ids[#del_ids + 1] = i
                end
                i = i + 1
            end
        end
        if events[key_message] then
            events[key_message]:trigger(data)
        end
        do
            local i = #del_ids - 1
            while i >= 0 do
                local id = del_ids[i + 1]
                local l = list[id + 1]
                if not l.is_message_mode and events[key_message] then
                    events[key_message]:unsubscribe(l.callback)
                end
                __TS__ArraySplice(list, id, 1)
                i = i - 1
            end
        end
    end
    local function send(id_message, message_data)
        return trigger(id_message, message_data)
    end
    local function on_message(_this, id_message, _message, sender)
        if id_message == EVENT_BUS_MESSAGE then
            local id_script = get_id_script()
            local message = send_messages[_message.id_counter_message_bus]
            local listener = message.listener
            if listener.id_script == id_script then
                listener.callback(message.data)
            end
            update_cache()
        end
    end
    return {
        on = on,
        once = once,
        off = off,
        off_all_id_message = off_all_id_message,
        off_all_context = off_all_context,
        off_all_current_script = off_all_current_script,
        on_message = on_message,
        send = send,
        trigger = trigger
    }
end
function ____exports.register_event_bus()
    if not event then
        return Log.error("Не подключена библиотека event.event")
    end
    event.set_logger({error = Log.error})
    _G.EventBus = EventBusModule()
end
return ____exports
