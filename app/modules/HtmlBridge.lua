local ____exports = {}
local HtmlBridgeModule
local js = require("defjs.defjs")
function HtmlBridgeModule()
    local function init(cb)
        js.call_js_with_callback(
            "init_sdk_platform",
            {},
            function(success)
                log("init_sdk_platform:", success)
                cb()
            end
        )
    end
    local function get_data_from_storage(params, cb)
        js.call_js_with_callback("sdk.get_data_from_storage", params, cb)
    end
    local function set_data_to_storage(params, cb)
        js.call_js_with_callback("sdk.set_data_to_storage", params, cb)
    end
    local function get_cached_key(key)
        local result = js.call_js("sdk.get_cached_key", {key = key})
        return result[2]
    end
    local function show_banner(params)
        js.call_js("sdk.show_banner", params)
    end
    local function hide_banner()
        js.call_js("sdk.hide_banner")
    end
    local function show_interstitial()
        js.call_js("sdk.show_interstitial")
    end
    local function show_rewarded()
        js.call_js("sdk.show_rewarded")
    end
    local function start_resize_monitor()
        local w = tonumber(sys.get_config("display.width"))
        local h = tonumber(sys.get_config("display.height"))
        js.call_js("sdk.start_resize_monitor", {is_vert = h > w})
    end
    local function get_platform()
        return js.call_js("sdk.get_platform")
    end
    local function get_platform_device()
        return js.call_js("sdk.get_platform_device")
    end
    local function get_platform_tld()
        return js.call_js("sdk.get_platform_tld")
    end
    local function get_language()
        return js.call_js("sdk.get_language")
    end
    local function get_payload()
        return js.call_js("sdk.get_payload")
    end
    local function is_favorite_supported()
        return js.call_js("sdk.is_favorite_supported")
    end
    local function is_share_supported()
        return js.call_js("sdk.is_share_supported")
    end
    local function is_player_authorized()
        return js.call_js("sdk.is_player_authorized")
    end
    local function player_id()
        return js.call_js("sdk.player_id")
    end
    local function player_name()
        return js.call_js("sdk.player_name")
    end
    local function player_photos()
        return js.call_js("sdk.player_photos")
    end
    local function authorize_player(cb)
        js.call_js_with_callback("sdk.authorize_player", {scopes = true}, cb)
    end
    local function has_ad_block()
        return js.call_js("sdk.has_ad_block")
    end
    local function share(params, cb)
        js.call_js_with_callback("sdk.share", params, cb)
    end
    local function rate(cb)
        js.call_js_with_callback("sdk.rate", {}, cb)
    end
    local function add_to_favorites(cb)
        js.call_js_with_callback("sdk.add_to_favorites", {}, cb)
    end
    local function set_leaderboard_score(params, cb)
        js.call_js_with_callback("sdk.set_leaderboard_score", params, cb)
    end
    local function get_leaderboard_score(params, cb)
        js.call_js_with_callback("sdk.get_leaderboard_score", params, cb)
    end
    local function get_leaderboard_entries(params, cb)
        js.call_js_with_callback("sdk.get_leaderboard_entries", params, cb)
    end
    local function bind_visible_state(cb)
        js.call_js_with_static_callback("sdk.bind_visible_state", {}, cb)
    end
    local function bind_interstitial_events(cb)
        js.call_js_with_static_callback("sdk.bind_interstitial_events", {}, cb)
    end
    local function bind_banner_events(cb)
        js.call_js_with_static_callback("sdk.bind_banner_events", {}, cb)
    end
    local function bind_rewarded_events(cb)
        js.call_js_with_static_callback("sdk.bind_rewarded_events", {}, cb)
    end
    local function open_url(url)
        js.call_js("window.open", url, "_blank")
    end
    local function game_ready()
        js.call_js("sdk.game_ready")
    end
    return {
        init = init,
        get_data_from_storage = get_data_from_storage,
        set_data_to_storage = set_data_to_storage,
        show_banner = show_banner,
        hide_banner = hide_banner,
        show_interstitial = show_interstitial,
        show_rewarded = show_rewarded,
        start_resize_monitor = start_resize_monitor,
        get_cached_key = get_cached_key,
        get_platform = get_platform,
        get_platform_tld = get_platform_tld,
        get_platform_device = get_platform_device,
        authorize_player = authorize_player,
        bind_visible_state = bind_visible_state,
        bind_interstitial_events = bind_interstitial_events,
        bind_banner_events = bind_banner_events,
        bind_rewarded_events = bind_rewarded_events,
        get_language = get_language,
        get_payload = get_payload,
        is_favorite_supported = is_favorite_supported,
        is_share_supported = is_share_supported,
        is_player_authorized = is_player_authorized,
        player_id = player_id,
        player_name = player_name,
        player_photos = player_photos,
        share = share,
        rate = rate,
        add_to_favorites = add_to_favorites,
        has_ad_block = has_ad_block,
        set_leaderboard_score = set_leaderboard_score,
        get_leaderboard_score = get_leaderboard_score,
        get_leaderboard_entries = get_leaderboard_entries,
        open_url = open_url,
        game_ready = game_ready
    }
end
function ____exports.register_html_bridge()
    _G.HtmlBridge = HtmlBridgeModule()
end
return ____exports
