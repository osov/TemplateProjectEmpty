local ____lualib = require("lualib_bundle")
local __TS__StringIncludes = ____lualib.__TS__StringIncludes
local ____exports = {}
____exports.IS_DEBUG_MODE = false
____exports.IS_HUAWEI = sys.get_sys_info().system_name == "Android" and __TS__StringIncludes(
    sys.get_config("android.package"),
    "huawei"
)
____exports.ADS_CONFIG = {
    is_mediation = false,
    id_banners = {},
    id_inters = {},
    id_reward = {},
    banner_on_init = false,
    ads_interval = 3 * 60,
    ads_delay = 30
}
____exports.VK_SHARE_URL = ""
____exports.OK_SHARE_TEXT = ""
____exports.ID_YANDEX_METRICA = ""
____exports.RATE_FIRST_SHOW = 24 * 60 * 60
____exports.RATE_SECOND_SHOW = 3 * 24 * 60 * 60
____exports._GAME_CONFIG = {}
____exports._STORAGE_CONFIG = {}
return ____exports
