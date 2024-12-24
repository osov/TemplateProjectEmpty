/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */


/*
    Модуль для работы с попапапами вне зависимости от контекста
*/

declare global {
    const Popup: ReturnType<typeof PopupModule>;

}

export function register_popup() {
    (_G as any).Popup = PopupModule();
}

type FncEmpty = () => void;
type FncOneArg = (data: any) => void;
type FncTwoArg = (data: any, is_closed: boolean) => void;


function PopupModule() {

    function register(name: string, callback_show: FncOneArg, callback_hide: FncEmpty) {
        const fnc_callback = function (data: any, is_closed: boolean) {
            EventBus.trigger('POPUP_RESULT_' + name as any, { result: data, is_closed }, false);
            if (is_closed)
             callback_hide();
            
        };

        EventBus.on('POPUP_CALL', (e) => {
            if (e.name == name) {
                if (e.is_hide)
                    callback_hide();
                else
                    callback_show(e.data);
            }
        });
        return fnc_callback;
    }

    function show(name: string, data?: any, callback?: FncTwoArg) {
        hide(name);
        if (callback != null) {
            const fnc_result = (data: { id: number, result: any, is_closed: boolean }) => {
                callback(data.result, data.is_closed);
                if (data.is_closed)
                    EventBus.off_all_id_message('POPUP_RESULT_' + name as any);
            };
            EventBus.on('POPUP_RESULT_' + name as any, fnc_result);
        }
        EventBus.trigger('POPUP_CALL', { name, data, is_hide: false });
    }

    function hide(name: string) {
        EventBus.trigger('POPUP_CALL', { name, data: null, is_hide: true });
        EventBus.off_all_id_message('POPUP_RESULT_' + name as any);
    }

    return { register, show, hide };
}

