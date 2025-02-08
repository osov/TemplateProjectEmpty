local ____exports = {}
local MetricaModule
function MetricaModule()
    local has_metrica = false
    local function init(id_metrica_android)
        if System.platform == "HTML5" then
            if yametrica ~= nil then
                yametrica.not_bounce()
            end
        elseif appmetrica ~= nil then
            has_metrica = id_metrica_android ~= ""
            appmetrica.set_callback(function() return log("app metrica init ok") end)
            if has_metrica then
                appmetrica.initialize(id_metrica_android)
            end
        end
    end
    local function report(event, json_data)
        if json_data == nil then
            json_data = ""
        end
        if appmetrica ~= nil and has_metrica then
            appmetrica.report_event(
                event,
                json_data == "" and "" or json.encode(json_data)
            )
        end
        if yametrica ~= nil then
            yametrica.reach_goal(event, json_data == "" and ({}) or json_data)
        end
    end
    return {init = init, report = report}
end
function ____exports.register_metrica()
    _G.Metrica = MetricaModule()
end
return ____exports
