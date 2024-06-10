local ____exports = {}
local ____game_config = require("main.game_config")
local ADS_CONFIG = ____game_config.ADS_CONFIG
local config = {is_auto_init = true, banner_interval = 30}
local id_banners = {}
local id_inters = {}
local id_rewards = {}
local id_timer_inter
local id_timer_banner
local banner_visible = false
local banner_pos = 5
local is_rewarded = false
local is_ready = false
local banner_index = 0
local inter_index = 0
local reward_index = 0
local function _load_banner()
    yandexads.load_banner(id_banners[banner_index + 1], 0)
end
local function _load_interstitial()
    yandexads.load_interstitial(id_inters[inter_index + 1])
end
local function _load_rewarded()
    is_rewarded = false
    yandexads.load_rewarded(id_rewards[reward_index + 1])
end
local function _update_banner()
    id_timer_banner = nil
    log("yandexads: updating banner")
    if banner_visible then
        _load_banner()
    end
end
local function _clear_banner_timer()
    if id_timer_banner ~= nil then
        log(
            "yandexads: clear timer banner",
            timer.cancel(id_timer_banner)
        )
        id_timer_banner = nil
    end
end
local function _start_refresh_banner(time)
    if time == nil then
        time = -1
    end
    _clear_banner_timer()
    id_timer_banner = timer.delay(time ~= -1 and time or config.banner_interval, false, _update_banner)
end
local function _start_refresh_inter(time)
    if time == nil then
        time = 0
    end
    if id_timer_inter ~= nil then
        log("yandexads: clear timer inter")
        timer.cancel(id_timer_inter)
        id_timer_inter = nil
    end
    id_timer_inter = timer.delay(time, false, _load_interstitial)
end
local id_timer_hack = nil
local function stop_banner_hack()
    if id_timer_hack ~= nil then
        timer.cancel(id_timer_hack)
        id_timer_hack = nil
    end
end
local function start_banner_hack()
    stop_banner_hack()
    id_timer_hack = timer.delay(
        10,
        false,
        function()
            if banner_visible then
                yandexads.hide_banner()
                timer.delay(
                    0.5,
                    false,
                    function()
                        if banner_visible then
                            yandexads.show_banner(banner_pos)
                        end
                    end
                )
            end
        end
    )
end
local function listener(____self, message_id, message)
    local event = message.event
    if message_id == yandexads.MSG_ADS_INITED then
        if event == yandexads.EVENT_LOADED then
            log("yandexads: MSG_ADS_INITED ok")
            is_ready = true
            if config.is_auto_init then
                if banner_visible and #id_banners > 0 then
                    _load_banner()
                end
                if #id_inters > 0 then
                    _load_interstitial()
                end
                if #id_rewards > 0 then
                    _load_rewarded()
                end
            end
        end
    elseif message_id == yandexads.MSG_BANNER then
        if event == yandexads.EVENT_LOADED then
            log(
                ("yandexads: MSG_BANNER EVENT_LOADED[" .. tostring(banner_index)) .. "]",
                banner_visible
            )
            banner_index = 0
            if banner_visible then
                yandexads.show_banner(banner_pos)
                if System.platform == "iPhone OS" then
                    start_banner_hack()
                end
            else
                yandexads.hide_banner()
            end
            _start_refresh_banner()
        elseif event == yandexads.EVENT_ERROR_LOAD then
            log(
                ("yandexads: MSG_BANNER EVENT_ERROR_LOAD[" .. tostring(banner_index)) .. "]",
                banner_visible
            )
            banner_index = banner_index + 1
            if banner_index > #id_banners - 1 then
                banner_index = 0
            end
            _start_refresh_banner(5)
        elseif event == yandexads.EVENT_IMPRESSION then
            log(
                ("yandexads: MSG_BANNER EVENT_IMPRESSION[" .. tostring(banner_index)) .. "]",
                banner_visible,
                message.data
            )
            local jdata = json.decode(message.data)
            appmetrica.send_revenue(
                jdata.revenueUSD,
                jdata.network.name,
                jdata.ad_unit_id,
                jdata.precision,
                "BANNER"
            )
        end
    elseif message_id == yandexads.MSG_INTERSTITIAL then
        if event == yandexads.EVENT_LOADED then
            log(("yandexads: MSG_INTERSTITIAL EVENT_LOADED[" .. tostring(inter_index)) .. "]")
            inter_index = 0
        elseif event == yandexads.EVENT_ERROR_LOAD then
            log(("yandexads: MSG_INTERSTITIAL EVENT_ERROR_LOAD[" .. tostring(inter_index)) .. "]")
            inter_index = inter_index + 1
            if inter_index > #id_inters - 1 then
                inter_index = 0
            end
            _start_refresh_inter(5)
        elseif event == yandexads.EVENT_DISMISSED then
            log("yandexads: fix last show inter")
            _start_refresh_inter(2)
            EventBus.trigger("ON_INTER_SHOWN")
        elseif event == yandexads.EVENT_IMPRESSION then
            log(
                ("yandexads: MSG_INTERSTITIAL EVENT_IMPRESSION[" .. tostring(inter_index)) .. "]",
                message.data
            )
            local jdata = json.decode(message.data)
            appmetrica.send_revenue(
                jdata.revenueUSD,
                jdata.network.name,
                jdata.ad_unit_id,
                jdata.precision,
                "INTERSTITIAL"
            )
        end
    elseif message_id == yandexads.MSG_REWARDED then
        if event == yandexads.EVENT_LOADED then
            log(("yandexads: MSG_REWARDED EVENT_LOADED[" .. tostring(reward_index)) .. "]")
            reward_index = 0
        elseif event == yandexads.EVENT_ERROR_LOAD then
            log(("yandexads: MSG_REWARDED EVENT_ERROR_LOAD[" .. tostring(reward_index)) .. "]")
            reward_index = reward_index + 1
            if reward_index > #id_rewards - 1 then
                reward_index = 0
            end
        elseif event == yandexads.EVENT_REWARDED then
            is_rewarded = true
            log("yandexads: fix reward")
        elseif event == yandexads.EVENT_DISMISSED then
            _load_rewarded()
            EventBus.trigger("ON_REWARDED_SHOWN")
        elseif event == yandexads.EVENT_IMPRESSION then
            log(
                ("yandexads: MSG_REWARDED EVENT_IMPRESSION[" .. tostring(reward_index)) .. "]",
                message.data
            )
            local jdata = json.decode(message.data)
            appmetrica.send_revenue(
                jdata.revenueUSD,
                jdata.network.name,
                jdata.ad_unit_id,
                jdata.precision,
                "REWARDED"
            )
        end
    else
        log(
            "yandexads: NOT DEFINED",
            tostring(message_id)
        )
        log(message)
        return
    end
    log("yandexads: message_id:" .. tostring(message_id))
    log(message)
end
local function is_check(sub)
    if sub == nil then
        sub = ""
    end
    if not yandexads then
        log("yandexads: not installed", sub)
        return false
    end
    if not is_ready then
        log("yandexads: not ready", sub)
        return false
    end
    return true
end
function ____exports.init(_id_banners, _id_inters, _id_rewards, _banner_visible)
    if _id_banners == nil then
        _id_banners = {}
    end
    if _id_inters == nil then
        _id_inters = {}
    end
    if _id_rewards == nil then
        _id_rewards = {}
    end
    if _banner_visible == nil then
        _banner_visible = false
    end
    if not yandexads then
        log("yandexads: not installed")
        return
    end
    id_banners = _id_banners
    id_inters = _id_inters
    id_rewards = _id_rewards
    banner_visible = _banner_visible
    yandexads.set_callback(listener)
    if ADS_CONFIG.is_mediation then
        local gdpr = Storage.get_int("gdpr", -1)
        if gdpr ~= -1 then
            yandexads.set_user_consent(gdpr == 1)
        end
    end
    yandexads.initialize()
end
function ____exports.load_banner(visible)
    if visible == nil then
        visible = false
    end
    if not is_check("load_banner") then
        return false
    end
    banner_visible = visible
    _load_banner()
    return true
end
function ____exports.show_banner(pos)
    if pos == nil then
        pos = -1
    end
    banner_pos = pos == -1 and yandexads.POS_BOTTOM_CENTER or pos
    if not is_check("show_banner") then
        return false
    end
    banner_visible = true
    if not yandexads.is_banner_loaded() then
        log("yandexads: show_banner, banner not loaded ")
        return false
    end
    yandexads.show_banner(banner_pos)
    log("yandexads: show_banner", banner_pos)
    return true
end
function ____exports.hide_banner()
    if not is_check("hide_banner") then
        return false
    end
    banner_visible = false
    if not yandexads.is_banner_loaded() then
        log("yandexads: hide_banner, banner not loaded ")
        return false
    end
    yandexads.hide_banner()
    log("yandexads: hide_banner")
    return true
end
function ____exports.destroy_banner()
    if not is_check("destroy_banner") then
        return false
    end
    banner_visible = false
    yandexads.destroy_banner()
    log("yandexads: destroy_banner")
    return true
end
function ____exports.show_interstitial()
    if not is_check("show_interstitial") then
        return false
    end
    if not yandexads.is_interstitial_loaded() then
        log("yandexads: show_interstitial, interstitial not loaded")
        return false
    end
    yandexads.show_interstitial()
    return true
end
function ____exports.show_rewarded()
    if not is_check("show_rewarded") then
        return false
    end
    if not yandexads.is_rewarded_loaded() then
        log("yandexads: show_rewarded, rewarded not loaded")
        return false
    end
    is_rewarded = false
    yandexads.show_rewarded()
    return true
end
return ____exports
