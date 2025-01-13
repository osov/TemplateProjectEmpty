local ____lualib = require("lualib_bundle")
local __TS__Delete = ____lualib.__TS__Delete
local ____exports = {}
local SceneModule
local ____utils = require("utils.utils")
local hex2rgba = ____utils.hex2rgba
function SceneModule()
    local on_restart_scene, on_load_scene, on_unload_scene, SCENE_ID, loaded_scenes, last_loading_scene, last_scene, is_restarting_scene, _unload_last_scene
    function on_restart_scene(message_id)
        if message_id == to_hash("SYS_RESTART_SCENE") then
            if last_scene == "" then
                return Log.warn("Сцена для перезагрузки не найдена")
            end
            local name = (SCENE_ID .. "#") .. last_scene
            msg.post(name, "disable")
            msg.post(name, "final")
            msg.post(name, "unload")
            is_restarting_scene = true
        end
        if message_id == hash("proxy_unloaded") then
            if is_restarting_scene and last_scene ~= "" then
                last_loading_scene = last_scene
                msg.post((SCENE_ID .. "#") .. last_scene, "load")
            end
        end
    end
    function on_load_scene(message_id, _message, sender)
        if message_id == to_hash("SYS_LOAD_SCENE") then
            local message = _message
            last_loading_scene = message.name
            Resource.load(
                message.name,
                function()
                    msg.post((SCENE_ID .. "#") .. message.name, "load")
                end,
                SCENE_ID
            )
        end
        if message_id == hash("proxy_loaded") then
            is_restarting_scene = false
            msg.post(sender, "init")
            msg.post(sender, "enable")
            last_scene = last_loading_scene
            last_loading_scene = ""
            loaded_scenes[last_scene] = sender
            EventBus.trigger("ON_SCENE_LOADED", {name = last_scene}, false)
        end
    end
    function on_unload_scene(message_id, _message)
        if message_id == to_hash("SYS_UNLOAD_SCENE") then
            local message = _message
            local name = loaded_scenes[message.name]
            if name ~= nil then
                msg.post(name, "disable")
                msg.post(name, "final")
                msg.post(name, "unload")
                __TS__Delete(loaded_scenes, message.name)
            end
        end
        if message_id == hash("proxy_loaded") and _unload_last_scene and last_scene ~= "" and not is_restarting_scene then
            local name = (SCENE_ID .. "#") .. last_scene
            msg.post(name, "disable")
            msg.post(name, "final")
            msg.post(name, "unload")
            __TS__Delete(loaded_scenes, last_scene)
            last_scene = ""
        end
    end
    SCENE_ID = Manager.MAIN .. "scenes"
    loaded_scenes = {}
    last_loading_scene = ""
    last_scene = ""
    is_restarting_scene = false
    _unload_last_scene = false
    local function init()
        if System.platform == "HTML5" then
            html5.run("window.set_light = function(val){document.body.style.backgroundColor = val}")
        end
    end
    local function set_bg(color)
        msg.post(
            "@render:",
            "clear_color",
            {color = hex2rgba(color, 1)}
        )
        if System.platform == "HTML5" then
            html5.run(("set_light('" .. color) .. "')")
        end
    end
    local function load(name, unload_last_scene)
        if unload_last_scene == nil then
            unload_last_scene = true
        end
        _unload_last_scene = unload_last_scene
        Manager.send("SYS_LOAD_SCENE", {name = name})
    end
    local function unload(name)
        Manager.send("SYS_UNLOAD_SCENE", {name = name})
    end
    local function restart()
        Manager.send("SYS_RESTART_SCENE")
    end
    local function get_current_name()
        return last_scene
    end
    local function _on_message(_this, message_id, _message, sender)
        on_restart_scene(message_id)
        on_unload_scene(message_id, _message)
        on_load_scene(message_id, _message, sender)
    end
    init()
    return {
        _on_message = _on_message,
        restart = restart,
        load = load,
        unload = unload,
        set_bg = set_bg,
        get_current_name = get_current_name
    }
end
function ____exports.register_scene()
    _G.Scene = SceneModule()
end
return ____exports
