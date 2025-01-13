local ____exports = {}
local PopupModule
function PopupModule()
    local hide
    function hide(name)
        EventBus.trigger("POPUP_CALL", {name = name, data = nil, is_hide = true})
        EventBus.off_all_id_message("POPUP_RESULT_" .. name)
    end
    local function register(name, callback_show, callback_hide)
        local function fnc_callback(data, is_closed)
            EventBus.trigger("POPUP_RESULT_" .. name, {result = data, is_closed = is_closed}, false)
            if is_closed then
                callback_hide()
            end
        end
        EventBus.on(
            "POPUP_CALL",
            function(e)
                if e.name == name then
                    if e.is_hide then
                        callback_hide()
                    else
                        callback_show(e.data)
                    end
                end
            end
        )
        return fnc_callback
    end
    local function show(name, data, callback)
        hide(name)
        if callback ~= nil then
            local function fnc_result(data)
                callback(data.result, data.is_closed)
                if data.is_closed then
                    EventBus.off_all_id_message("POPUP_RESULT_" .. name)
                end
            end
            EventBus.on("POPUP_RESULT_" .. name, fnc_result)
        end
        EventBus.trigger("POPUP_CALL", {name = name, data = data, is_hide = false})
    end
    return {register = register, show = show, hide = hide}
end
function ____exports.register_popup()
    _G.Popup = PopupModule()
end
return ____exports
