local ____lualib = require("lualib_bundle")
local __TS__ArrayIncludes = ____lualib.__TS__ArrayIncludes
local ____exports = {}
local AdsModule
local ____game_config = require("main.game_config")
local ADS_CONFIG = ____game_config.ADS_CONFIG
local IS_HUAWEI = ____game_config.IS_HUAWEI
local OK_SHARE_TEXT = ____game_config.OK_SHARE_TEXT
local VK_SHARE_URL = ____game_config.VK_SHARE_URL
local ads_android = require("modules.ads_yandex")
local ____HtmlBridgeTypes = require("modules.HtmlBridgeTypes")
local INTERSTITIAL_STATE = ____HtmlBridgeTypes.INTERSTITIAL_STATE
local REWARDED_STATE = ____HtmlBridgeTypes.REWARDED_STATE
function AdsModule()
    local get_social_platform, interstitial_state_changed, rewarded_state_changed, is_view_inter, _show_interstitial, _show_reward, is_banner_supported, _convert_positions, _show_banner, _hide_banner, show_interstitial, bind_messsages, ads_init_callback, _is_ready, ads_log, social_platform, last_view_ads, is_fix_last_inter, is_real_reward, is_rewarded
    function get_social_platform()
        if System.platform == "HTML5" then
            return social_platform
        end
        return ""
    end
    function interstitial_state_changed(state)
        if state == INTERSTITIAL_STATE.OPENED then
            if is_fix_last_inter then
                last_view_ads = System.now()
            end
            Sound.set_pause(true)
            ads_log.log("Fix last ads time")
        elseif state == INTERSTITIAL_STATE.CLOSED then
            EventBus.trigger("ON_INTER_SHOWN", {result = true})
            Sound.set_pause(false)
        elseif state == INTERSTITIAL_STATE.FAILED then
            EventBus.trigger("ON_INTER_SHOWN", {result = false})
            Sound.set_pause(false)
        end
    end
    function rewarded_state_changed(state)
        if state == REWARDED_STATE.OPENED then
            is_rewarded = false
            Sound.set_pause(true)
        elseif state == REWARDED_STATE.REWARDED then
            is_rewarded = true
        elseif state == REWARDED_STATE.CLOSED then
            EventBus.trigger("ON_REWARDED_SHOWN", {result = is_rewarded})
            Sound.set_pause(false)
        elseif state == REWARDED_STATE.FAILED then
            is_rewarded = false
            EventBus.trigger("ON_REWARDED_SHOWN", {result = false})
            Sound.set_pause(false)
        end
    end
    function is_view_inter()
        return System.now() - last_view_ads > ADS_CONFIG.ads_interval
    end
    function _show_interstitial(is_check)
        if is_check == nil then
            is_check = true
        end
        local now = System.now()
        local is_allow = not is_check or is_view_inter()
        if not is_allow then
            ads_log.log("Wait ads time:" .. tostring(ADS_CONFIG.ads_interval - (now - last_view_ads)))
            EventBus.trigger("ON_INTER_SHOWN", {result = false})
            return
        end
        is_fix_last_inter = is_check
        if System.platform == "HTML5" then
            HtmlBridge.show_interstitial()
        elseif System.platform == "Android" or System.platform == "iPhone OS" then
            ads_android.show_interstitial()
            EventBus.trigger("ON_INTER_SHOWN", {result = true})
        elseif System.platform == "Windows" or System.platform == "Darwin" or System.platform == "Linux" then
            log("fake-Inter show wait")
            Sound.set_pause(true)
            if is_fix_last_inter then
                last_view_ads = System.now()
            end
            timer.delay(
                5,
                false,
                function()
                    EventBus.trigger("ON_INTER_SHOWN", {result = true})
                    log("fake-Inter show triggered")
                    Sound.set_pause(false)
                end
            )
        end
    end
    function _show_reward()
        if System.platform == "HTML5" then
            HtmlBridge.show_rewarded()
        elseif System.platform == "Android" or System.platform == "iPhone OS" then
            if is_real_reward then
                ads_android.show_rewarded()
            else
                ads_android.show_interstitial()
            end
            EventBus.trigger("ON_REWARDED_SHOWN", {result = true})
        elseif System.platform == "Windows" or System.platform == "Darwin" or System.platform == "Linux" then
            log("fake-Reward showingt")
            Sound.set_pause(true)
            timer.delay(
                5,
                false,
                function()
                    EventBus.trigger("ON_REWARDED_SHOWN", {result = true})
                    log("fake-Reward shown triggered")
                    Sound.set_pause(false)
                end
            )
        end
    end
    function is_banner_supported()
        if System.platform == "Android" or System.platform == "iPhone OS" then
            return true
        end
        if System.platform == "HTML5" then
            if social_platform == "vk" and __TS__ArrayIncludes(
                {"android", "ios", "mobile-web"},
                HtmlBridge.get_platform_device()
            ) then
                return false
            end
            if __TS__ArrayIncludes({"ok", "vk"}, social_platform) then
                return true
            end
        end
        return false
    end
    function _convert_positions(pos)
        if pos == ____exports.BannerPos.POS_BOTTOM_CENTER then
            return yandexads.POS_BOTTOM_CENTER
        elseif pos == ____exports.BannerPos.POS_BOTTOM_LEFT then
            return yandexads.POS_BOTTOM_LEFT
        elseif pos == ____exports.BannerPos.POS_BOTTOM_RIGHT then
            return yandexads.POS_BOTTOM_RIGHT
        elseif pos == ____exports.BannerPos.POS_TOP_CENTER then
            return yandexads.POS_TOP_CENTER
        elseif pos == ____exports.BannerPos.POS_TOP_LEFT then
            return yandexads.POS_TOP_LEFT
        elseif pos == ____exports.BannerPos.POS_TOP_RIGHT then
            return yandexads.POS_TOP_RIGHT
        elseif pos == ____exports.BannerPos.POS_NONE then
            return -1
        end
        return -1
    end
    function _show_banner(pos)
        if not is_banner_supported() then
            return
        end
        local bannerOptions = {position = "bottom", layoutType = "resize", canClose = true}
        if System.platform == "HTML5" then
            HtmlBridge.show_banner(bannerOptions)
        elseif System.platform == "Android" or System.platform == "iPhone OS" then
            ads_android.load_banner(true)
            ads_android.show_banner(_convert_positions(pos))
        else
            ads_log.warn("Вызов баннера вручную не поддерживается")
        end
    end
    function _hide_banner()
        if not is_banner_supported() then
            return
        end
        if System.platform == "HTML5" then
            HtmlBridge.hide_banner()
        elseif System.platform == "Android" or System.platform == "iPhone OS" then
            ads_android.destroy_banner()
        end
    end
    function show_interstitial(is_check, callback_shown)
        if is_check == nil then
            is_check = true
        end
        if callback_shown then
            EventBus.once(
                "ON_INTER_SHOWN",
                function(state) return callback_shown(state.result) end
            )
        end
        EventBus.trigger("SYS_SHOW_INTER", {is_check = is_check})
    end
    function bind_messsages()
        EventBus.on(
            "ON_INTER_SHOWN",
            function()
                if is_fix_last_inter then
                    last_view_ads = System.now()
                end
            end
        )
        EventBus.on(
            "SYS_SHOW_REWARD",
            function() return _show_reward() end
        )
        EventBus.on(
            "SYS_SHOW_INTER",
            function(m) return _show_interstitial(m.is_check) end
        )
        EventBus.on(
            "SYS_SHOW_BANNER",
            function(m) return _show_banner(m.pos) end
        )
        EventBus.on(
            "SYS_HIDE_BANNER",
            function() return _hide_banner() end
        )
    end
    function ads_init_callback()
        if System.platform == "HTML5" then
            local code = HtmlBridge.get_language()
            local cl = html5.run("new URL(location).searchParams.get('lang')||''")
            if cl ~= "" then
                code = cl
            end
            Lang.set_custom_lang(code)
            if get_social_platform() == "yandex" then
                show_interstitial(false)
            end
        end
        _is_ready = true
    end
    _is_ready = false
    ads_log = Log.get_with_prefix("Ads")
    local share_options = {vk = {link = VK_SHARE_URL}, ok = {link = OK_SHARE_TEXT}}
    last_view_ads = 0
    is_fix_last_inter = true
    is_real_reward = false
    local function init()
        last_view_ads = System.now() - (ADS_CONFIG.ads_interval - ADS_CONFIG.ads_delay)
        bind_messsages()
        if System.platform == "HTML5" then
            social_platform = HtmlBridge.get_platform()
            ads_log.log("Detect platform:", social_platform)
            HtmlBridge.bind_interstitial_events(interstitial_state_changed)
            HtmlBridge.bind_rewarded_events(rewarded_state_changed)
            ads_init_callback()
        elseif System.platform == "Android" or System.platform == "iPhone OS" then
            ads_android.init(ADS_CONFIG.id_banners, ADS_CONFIG.id_inters, ADS_CONFIG.id_reward, ADS_CONFIG.banner_on_init)
            ads_init_callback()
        else
            ads_init_callback()
        end
    end
    local function player_init(authorizationOptions, callback)
        if authorizationOptions == nil then
            authorizationOptions = {}
        end
    end
    local function leaderboards_set_score(params, callback)
        if System.platform == "HTML5" then
            HtmlBridge.set_leaderboard_score(params, callback)
        end
    end
    local function leaderboards_get_entitys(params, cb)
        if System.platform == "HTML5" then
            HtmlBridge.get_leaderboard_entries(params, cb)
        end
    end
    local function feedback_request_review(callback)
        if System.platform == "HTML5" then
            HtmlBridge.rate(callback)
        end
    end
    is_rewarded = false
    local function show_reward(callback_shown)
        if callback_shown then
            EventBus.once(
                "ON_REWARDED_SHOWN",
                function(state) return callback_shown(state.result) end
            )
        end
        EventBus.trigger("SYS_SHOW_REWARD")
    end
    local function show_banner(pos)
        if pos == nil then
            pos = ____exports.BannerPos.POS_NONE
        end
        EventBus.trigger("SYS_SHOW_BANNER", {pos = pos})
    end
    local function hide_banner()
        EventBus.trigger("SYS_HIDE_BANNER")
    end
    local function is_share_supported()
        if System.platform == "HTML5" then
            return HtmlBridge.is_share_supported()
        elseif System.platform == "Android" and not IS_HUAWEI then
            return true
        else
            return false
        end
    end
    local function social_share()
        if System.platform == "HTML5" then
            HtmlBridge.share(
                social_platform == "vk" and share_options.vk or share_options.ok,
                function()
                end
            )
        else
            if share ~= nil then
                if System.platform == "Android" then
                    share.text("https://play.google.com/store/apps/details?id=" .. sys.get_config("android.package"))
                end
            end
        end
        Metrica.report("share")
    end
    local function is_favorite_supported()
        if System.platform == "HTML5" then
            return HtmlBridge.is_favorite_supported()
        else
            return false
        end
    end
    local function add_favorite()
        if not is_favorite_supported() then
            return
        end
        if System.platform == "HTML5" then
            HtmlBridge.add_to_favorites(function()
            end)
        end
    end
    local function is_ready()
        return _is_ready
    end
    local function is_allow_ads()
        if System.platform == "HTML5" then
            return not HtmlBridge.has_ad_block()
        else
            return true
        end
    end
    local function set_real_reward_mode(val)
        is_real_reward = val
    end
    local function set_ads_interval(time)
        ADS_CONFIG.ads_interval = time
        last_view_ads = System.now() - (ADS_CONFIG.ads_interval - ADS_CONFIG.ads_delay)
    end
    init()
    return {
        is_ready = is_ready,
        get_social_platform = get_social_platform,
        player_init = player_init,
        leaderboards_set_score = leaderboards_set_score,
        feedback_request_review = feedback_request_review,
        add_favorite = add_favorite,
        social_share = social_share,
        is_share_supported = is_share_supported,
        show_reward = show_reward,
        show_interstitial = show_interstitial,
        show_banner = show_banner,
        hide_banner = hide_banner,
        is_favorite_supported = is_favorite_supported,
        leaderboards_get_entitys = leaderboards_get_entitys,
        set_real_reward_mode = set_real_reward_mode,
        is_view_inter = is_view_inter,
        is_allow_ads = is_allow_ads,
        set_ads_interval = set_ads_interval
    }
end
function ____exports.register_ads()
    _G.Ads = AdsModule()
end
____exports.BannerPos = BannerPos or ({})
____exports.BannerPos.POS_NONE = 0
____exports.BannerPos[____exports.BannerPos.POS_NONE] = "POS_NONE"
____exports.BannerPos.POS_TOP_LEFT = 1
____exports.BannerPos[____exports.BannerPos.POS_TOP_LEFT] = "POS_TOP_LEFT"
____exports.BannerPos.POS_TOP_CENTER = 2
____exports.BannerPos[____exports.BannerPos.POS_TOP_CENTER] = "POS_TOP_CENTER"
____exports.BannerPos.POS_TOP_RIGHT = 3
____exports.BannerPos[____exports.BannerPos.POS_TOP_RIGHT] = "POS_TOP_RIGHT"
____exports.BannerPos.POS_BOTTOM_LEFT = 4
____exports.BannerPos[____exports.BannerPos.POS_BOTTOM_LEFT] = "POS_BOTTOM_LEFT"
____exports.BannerPos.POS_BOTTOM_CENTER = 5
____exports.BannerPos[____exports.BannerPos.POS_BOTTOM_CENTER] = "POS_BOTTOM_CENTER"
____exports.BannerPos.POS_BOTTOM_RIGHT = 6
____exports.BannerPos[____exports.BannerPos.POS_BOTTOM_RIGHT] = "POS_BOTTOM_RIGHT"
____exports.BannerPos.POS_CENTER = 7
____exports.BannerPos[____exports.BannerPos.POS_CENTER] = "POS_CENTER"
return ____exports
