local ____exports = {}
local ManagerModule
local ____modules_const = require("modules.modules_const")
local _ID_MESSAGES = ____modules_const._ID_MESSAGES
local ____game_config = require("main.game_config")
local ID_YANDEX_METRICA = ____game_config.ID_YANDEX_METRICA
local ____System = require("modules.System")
local register_system = ____System.register_system
local ____Log = require("modules.Log")
local register_log = ____Log.register_log
local ____EventBus = require("modules.EventBus")
local register_event_bus = ____EventBus.register_event_bus
local ____Storage = require("modules.Storage")
local register_storage = ____Storage.register_storage
local ____GameStorage = require("modules.GameStorage")
local register_game_storage = ____GameStorage.register_game_storage
local ____Sound = require("modules.Sound")
local register_sound = ____Sound.register_sound
local ____Lang = require("modules.Lang")
local register_lang = ____Lang.register_lang
local ____Scene = require("modules.Scene")
local register_scene = ____Scene.register_scene
local ____Ads = require("modules.Ads")
local register_ads = ____Ads.register_ads
local ____Rate = require("modules.Rate")
local register_rate = ____Rate.register_rate
local ____Metrica = require("modules.Metrica")
local register_metrica = ____Metrica.register_metrica
local ____Camera = require("modules.Camera")
local register_camera = ____Camera.register_camera
local ____HtmlBridge = require("modules.HtmlBridge")
local register_html_bridge = ____HtmlBridge.register_html_bridge
function ManagerModule()
    local register_modules, check_ready, send_raw, send, _is_ready, MANAGER_ID
    function register_modules(callback_ready)
        register_metrica()
        register_sound()
        register_lang()
        register_scene()
        register_camera()
        register_ads()
        register_rate()
        Metrica.init(ID_YANDEX_METRICA)
        check_ready(callback_ready)
    end
    function check_ready(callback_ready)
        local id_timer
        id_timer = timer.delay(
            0.1,
            true,
            function()
                if Ads.is_ready() then
                    timer.cancel(id_timer)
                    _is_ready = true
                    log("All Managers ready ver: " .. sys.get_config("project.version"))
                    send("MANAGER_READY")
                    if callback_ready then
                        callback_ready()
                    end
                end
            end
        )
    end
    function send_raw(message_id, message_data, receiver)
        if receiver == nil then
            receiver = MANAGER_ID
        end
        msg.post(receiver, message_id, message_data)
    end
    function send(message_id, message_data, receiver)
        if receiver == nil then
            receiver = MANAGER_ID
        end
        send_raw(message_id, message_data, receiver)
    end
    _is_ready = false
    MANAGER_ID = "main:/manager"
    local UI_ID = "/ui#game"
    local LOGIC_ID = "/game_logic#game"
    local VIEW_ID = "/game_view#view"
    local function init(callback_ready, use_custom_storage_key)
        if use_custom_storage_key == nil then
            use_custom_storage_key = false
        end
        math.randomseed(socket.gettime())
        register_system()
        register_log()
        register_storage(use_custom_storage_key)
        register_game_storage()
        register_event_bus()
        if System.platform == "HTML5" then
            register_html_bridge()
            HtmlBridge.init(function() return register_modules(callback_ready) end)
        else
            register_modules(callback_ready)
        end
    end
    local function is_ready()
        return _is_ready
    end
    local function send_raw_ui(message_id, message_data, receiver)
        if receiver == nil then
            receiver = UI_ID
        end
        send_raw(message_id, message_data, receiver)
    end
    local function send_raw_view(message_id, message_data, receiver)
        if receiver == nil then
            receiver = VIEW_ID
        end
        send_raw(message_id, message_data, receiver)
    end
    local function send_view(message_id, message_data, receiver)
        if receiver == nil then
            receiver = VIEW_ID
        end
        send_raw(message_id, message_data, receiver)
    end
    local function send_raw_game(message_id, message_data, receiver)
        if receiver == nil then
            receiver = LOGIC_ID
        end
        send_raw(message_id, message_data, receiver)
    end
    local function send_game(message_id, message_data, receiver)
        if receiver == nil then
            receiver = LOGIC_ID
        end
        send_raw(message_id, message_data, receiver)
    end
    local function on_message(_this, message_id, message, sender)
        EventBus.on_message(_this, message_id, message, sender)
    end
    local function on_message_main(_this, message_id, message, sender)
        if _is_ready then
            Scene._on_message(_this, message_id, message, sender)
            Sound._on_message(_this, message_id, message, sender)
            Rate._on_message(_this, message_id, message, sender)
        end
    end
    local function init_script()
        Lang.apply()
        EventBus.on(
            "ON_APPLY_CUSTOM_LANG",
            function() return Lang.apply() end
        )
    end
    local function final_script()
        EventBus.off_all_current_script()
    end
    return {
        init = init,
        on_message_main = on_message_main,
        on_message = on_message,
        is_ready = is_ready,
        init_script = init_script,
        final_script = final_script,
        send = send,
        send_raw = send_raw,
        send_game = send_game,
        send_raw_game = send_raw_game,
        send_view = send_view,
        send_raw_view = send_raw_view,
        send_raw_ui = send_raw_ui,
        MANAGER_ID = MANAGER_ID,
        UI_ID = UI_ID,
        LOGIC_ID = LOGIC_ID,
        VIEW_ID = VIEW_ID
    }
end
local hashed_keys = {}
local function _to_hash(key)
    if hashed_keys[key] ~= nil then
        return hashed_keys[key]
    end
    hashed_keys[key] = hash(key)
    return hashed_keys[key]
end
function ____exports.register_manager()
    _G.Manager = ManagerModule()
    _G.to_hash = _to_hash
    _G.ID_MESSAGES = _ID_MESSAGES
end
return ____exports
