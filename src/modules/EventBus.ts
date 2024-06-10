/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */


import { MessageId, Messages } from "./modules_const";
import * as event from 'event.event';

/*
    шина сообщений
*/

declare global {
    const EventBus: ReturnType<typeof EventBusModule>;
}


export function register_event_bus() {
    if (!event)
        return Log.error('Не подключена библиотека event.event');
    event.set_logger({ error: Log.error });
    (_G as any).EventBus = EventBusModule();
}

type FncOnCallback<T> = (data: T) => void;

interface ListenerInfo {
    callback: FncOnCallback<any>;
    callback_context: any;
    url: hash;
    once: boolean;
    id_script: string;
    is_message_mode: boolean;
}

function EventBusModule() {
    const bus_log = Log.get_with_prefix('Bus');
    const events: { [key_message: string]: IEventClass } = {};
    const listeners: { [key_message: number]: ListenerInfo[] } = {};
    const send_messages: { [k: number]: { time: number, data: any, listener: ListenerInfo } } = {};
    let id_counter_message_bus = 0;
    const EVENT_BUS_MESSAGE = hash('event_bus_message');

    function ensure_hash(string_or_hash: string | hash) {
        return (type(string_or_hash) == "string" ? hash(string_or_hash as string) : string_or_hash) as number; // real is hash
    }

    function get_id_script() {
        const url: any = msg.url();
        return hash_to_hex(url.socket) + hash_to_hex(url.path) + hash_to_hex(url.fragment || hash(""));
    }

    function update_cache() {
        for (const k in send_messages) {
            const message = send_messages[k];
            if (message.time + 2 < System.now())
                delete send_messages[k];
        }
    }

    function _on<T extends MessageId>(id_message: T, callback: FncOnCallback<Messages[T]>, is_message_mode: boolean, callback_context: any, once: boolean) {
        //bus_log.log('on', id_message, is_message_mode);
        const key_message = ensure_hash(id_message);
        if (is_message_mode) {
            //
        }
        else {
            if (!events[key_message])
                events[key_message] = event.create();
            events[key_message].subscribe(callback);
        }
        if (!listeners[key_message])
            listeners[key_message] = [];
        listeners[key_message].push({ callback, callback_context, once, is_message_mode, url: msg.url(), id_script: get_id_script() });
    }

    function on<T extends MessageId>(id_message: T, callback: FncOnCallback<Messages[T]>, is_message_mode = false, callback_context?: any) {
        _on(id_message, callback, is_message_mode, callback_context, false);
    }

    function once<T extends MessageId>(id_message: T, callback: FncOnCallback<Messages[T]>, is_message_mode = false, callback_context?: any) {
        _on(id_message, callback, is_message_mode, callback_context, true);
    }

    function off<T extends MessageId>(id_message: T, callback: FncOnCallback<Messages[T]>) {
        const key_message = ensure_hash(id_message);
        if (!listeners[key_message]) {
            bus_log.warn(`Ни один слушатель для события не зарегистрирован: ${id_message}, off`);
            return;
        }
        const list = listeners[key_message];
        for (let i = list.length - 1; i >= 0; i--) {
            const l = list[i];
            if (l.callback == callback) {
                if (!l.is_message_mode && events[key_message])
                    events[key_message].unsubscribe(callback);
                list.splice(i, 1);
                return;
            }
        }
    }

    function off_all_id_message<T extends MessageId>(id_message: T) {
        const key_message = ensure_hash(id_message);
        if (!listeners[key_message]) {
            bus_log.warn(`Ни один слушатель для события не зарегистрирован: ${id_message}, off_all_id_message`);
            return;
        }
        if (events[key_message]) {
            events[key_message].clear();
            delete events[key_message];
        }
        delete listeners[key_message];
    }

    function off_all_context(context: any) {
        for (const key_message in listeners) {
            const listener = listeners[key_message];
            for (let i = listener.length - 1; i >= 0; i--) {
                const l = listener[i];
                if (l.callback_context == context) {
                    if (!l.is_message_mode && events[key_message])
                        events[key_message].unsubscribe(l.callback);
                    listener.splice(i, 1);
                }
            }
        }
    }

    function off_all_current_script() {
        const id_script = get_id_script();
        for (const key_message in listeners) {
            const listener = listeners[key_message];
            for (let i = listener.length - 1; i >= 0; i--) {
                const l = listener[i];
                if (l.id_script == id_script) {
                    if (!l.is_message_mode && events[key_message])
                        events[key_message].unsubscribe(l.callback);
                    listener.splice(i, 1);
                }
            }
        }
    }

    function trigger<T extends MessageId>(id_message: T, message_data?: Messages[T], show_warning = true, is_copy_data = false) {
        const key_message = ensure_hash(id_message);
        if (!listeners[key_message]) {
            if (show_warning)
                bus_log.warn(`Ни один слушатель для события не зарегистрирован: ${id_message}, trigger/send`);
            return;
        }
        const data = is_copy_data ? json.decode(json.encode(message_data)) : message_data; // чтобы во всех случаях была копия(редко когда нужно иначе)
        // важный момент для случая once, что сначала происходит тригер, а затем удаление события, т.е. вешать событие внутри колбека нужно аккуратно учитывая это
        const list = listeners[key_message];
        const del_ids = [];
        for (let i = 0; i < list.length; i++) {
            const l = list[i];
            if (l.is_message_mode) {
                id_counter_message_bus++;
                send_messages[id_counter_message_bus] = { time: System.now(), data, listener: l };
                msg.post(l.url, EVENT_BUS_MESSAGE, { id_counter_message_bus });
            }
            if (l.once)
                del_ids.push(i);
        }
        if (events[key_message])
            events[key_message].trigger(data);

        for (let i = del_ids.length - 1; i >= 0; i--) {
            const id = del_ids[i];
            const l = list[id];
            if (!l.is_message_mode && events[key_message])
                events[key_message].unsubscribe(l.callback);
            list.splice(id, 1);
        }
    }

    function send<T extends MessageId>(id_message: T, message_data?: Messages[T]) {
        return trigger(id_message, message_data);
    }

    function on_message(_this: any, id_message: hash, _message: any, sender: hash) {
        if (id_message == EVENT_BUS_MESSAGE) {
            const id_script = get_id_script();
            const message = send_messages[_message.id_counter_message_bus];
            const listener = message.listener;
            if (listener.id_script == id_script)
                listener.callback(message.data);
            update_cache();
        }
    }

    return { on, once, off, off_all_id_message, off_all_context, off_all_current_script, on_message, send, trigger };
}