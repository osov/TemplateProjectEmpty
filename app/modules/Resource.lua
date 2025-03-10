local ____exports = {}
local ResourceModule
local ____game_config = require("main.game_config")
local SERVER_URL = ____game_config.SERVER_URL
function ResourceModule()
    local log_mounts, load_manifest, manifest, _is_ready
    function log_mounts()
        if liveupdate ~= nil then
            local mounts = liveupdate.get_mounts()
            if #mounts ~= 0 then
                log("Найдены рессурсы: ")
                for ____, mount in ipairs(mounts) do
                    log((("\t " .. mount.uri) .. " в маунте: ") .. mount.name)
                end
            end
        end
    end
    function load_manifest()
        local function handle(____self, id, response)
            if response.status == 200 then
                log("RESOURCE MANIFEST LOADED")
                manifest = json.decode(response.response)
                log_mounts()
            else
                Log.error("Failed load manifest of resources " .. tostring(response.status))
            end
            _is_ready = true
        end
        http.request(
            (SERVER_URL .. "resources/manifest.json?") .. tostring(math.random()),
            "GET",
            handle
        )
    end
    local RESOURCE_ID = Manager.MAIN .. "resources"
    manifest = {}
    _is_ready = false
    local function init()
        if liveupdate ~= nil then
            load_manifest()
        else
            _is_ready = true
        end
    end
    local function is_ready()
        return _is_ready
    end
    local function load(name, on_loaded, path)
        if path == nil then
            path = RESOURCE_ID
        end
        if on_loaded ~= nil then
            EventBus.once("SYS_RESOURCE_LOADED_" .. name, on_loaded)
        end
        Manager.send("SYS_LOAD_RESOURCE", {name = name, path = path})
    end
    local function try_load(name, path, on_loaded)
        if on_loaded ~= nil then
            on_loaded()
        end
    end
    local function _on_message(_this, message_id, _message, sender)
        if message_id == to_hash("SYS_LOAD_RESOURCE") then
            local message = _message
            try_load(
                message.name,
                message.path,
                function() return EventBus.trigger("SYS_RESOURCE_LOADED_" .. message.name, nil, false) end
            )
        end
    end
    init()
    return {load = load, log_mounts = log_mounts, is_ready = is_ready, _on_message = _on_message}
end
function ____exports.register_resources()
    _G.Resource = ResourceModule()
end
return ____exports
