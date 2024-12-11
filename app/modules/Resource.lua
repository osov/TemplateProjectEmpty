local ____lualib = require("lualib_bundle")
local __TS__ObjectEntries = ____lualib.__TS__ObjectEntries
local ____exports = {}
local ResourceModule
local reszip = require("liveupdate_reszip.reszip")
function ResourceModule()
    local load_manifest, try_load, manifest
    function load_manifest()
        local url = html5.run("window.location.href")
        local function handle(____self, id, response)
            if response.status == 200 then
                Log.log("RESOURCE MANIFEST LOADED")
                manifest = json.decode(response.response)
            else
                Log.error("Failed load manifest of resources " .. tostring(response.status))
            end
        end
        http.request(url .. "resources/manifest.json", "GET", handle)
    end
    function try_load(name, path, on_loaded)
        if not liveupdate then
            if on_loaded ~= nil then
                on_loaded()
            end
            return
        end
        local mounts = liveupdate.get_mounts()
        if #mounts ~= 0 then
            Log.log("Найдены рессурсы: ")
            for ____, mount in ipairs(mounts) do
                Log.log((("\tРессурс: " .. mount.uri) .. " в маунте: ") .. mount.name)
            end
        end
        local missing_resources = collectionproxy.missing_resources((path .. "#") .. name)
        local is_missing = false
        for ____, ____value in ipairs(__TS__ObjectEntries(missing_resources)) do
            local key = ____value[1]
            local value = ____value[2]
            if value ~= nil then
                Log.warn((("Ненайден ресурс: " .. tostring(key)) .. " ") .. tostring(value))
                is_missing = true
                break
            end
        end
        if not is_missing then
            if on_loaded ~= nil then
                on_loaded()
            end
            return
        end
        local resource_hash = manifest[name]
        local resource_file = resource_hash .. ".zip"
        local miss_match_version = not reszip.version_match(resource_hash, name)
        if miss_match_version then
            Log.warn("Несовпадает версия ресурс файла!")
        end
        if miss_match_version or is_missing then
            Log.log("Загрузка ресурсов: " .. name)
            reszip.load_and_mount_zip(
                "resources/" .. resource_file,
                {
                    filename = resource_file,
                    mount_name = name,
                    delete_old_file = true,
                    on_finish = function(____self, err)
                        if not err then
                            Log.log("Загружены ресурсы: " .. name)
                            if on_loaded ~= nil then
                                on_loaded()
                            end
                        else
                            Log.warn("Неудалось загрузить ресурсы: " .. name)
                        end
                    end
                }
            )
        elseif on_loaded ~= nil then
            on_loaded()
        end
    end
    local RESOURCE_ID = Manager.MAIN .. "resources"
    local loading_resource_callbacks = {}
    manifest = {}
    local function init()
        if html5 ~= nil then
            load_manifest()
        end
        EventBus.on(
            "SYS_LOAD_RESOURCE",
            function(message)
                try_load(message.name, message.path, loading_resource_callbacks[message.name])
            end
        )
    end
    local function load(name, on_loaded, path)
        if path == nil then
            path = RESOURCE_ID
        end
        if on_loaded ~= nil then
            loading_resource_callbacks[name] = on_loaded
        end
        EventBus.send("SYS_LOAD_RESOURCE", {name = name, path = path})
    end
    init()
    return {load = load}
end
function ____exports.register_resources()
    _G.Resource = ResourceModule()
end
return ____exports
