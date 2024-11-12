/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { ADS_CONFIG, IS_HUAWEI, OK_SHARE_TEXT, VK_SHARE_URL } from "../main/game_config";
import * as ads_android from "./ads_yandex";
import { CbLeaderboardList, CbResultVal, INTERSTITIAL_STATE, REWARDED_STATE } from "./HtmlBridgeTypes";

/*
    Модуль для работы с рекламой
*/

declare global {
    const Ads: ReturnType<typeof AdsModule>;
}

export function register_ads() {
    (_G as any).Ads = AdsModule();
}

export enum BannerPos {
    POS_NONE,
    POS_TOP_LEFT,
    POS_TOP_CENTER,
    POS_TOP_RIGHT,
    POS_BOTTOM_LEFT,
    POS_BOTTOM_CENTER,
    POS_BOTTOM_RIGHT,
    POS_CENTER
}


type WebPlatform = "yandex" | "vk" | 'ok' | '';
type CallbackAds = (state: boolean) => void;

function AdsModule() {
    let _is_ready = false;
    const ads_log = Log.get_with_prefix('Ads');

    let social_platform: WebPlatform;
    const share_options = { 'vk': { link: VK_SHARE_URL }, 'ok': { link: OK_SHARE_TEXT } };
    let last_view_ads = 0;
    let is_fix_last_inter = true;
    let is_real_reward = false;

    function init() {
        last_view_ads = System.now() - (ADS_CONFIG.ads_interval - ADS_CONFIG.ads_delay);
        bind_messsages();
        // html5
        if (System.platform == "HTML5") {
            social_platform = HtmlBridge.get_platform();
            ads_log.log("Detect platform:", social_platform);
            HtmlBridge.bind_interstitial_events(interstitial_state_changed);
            HtmlBridge.bind_rewarded_events(rewarded_state_changed);
            ads_init_callback();
        }
        // android
        else if (System.platform == "Android" || System.platform == "iPhone OS") {
            ads_android.init(ADS_CONFIG.id_banners, ADS_CONFIG.id_inters, ADS_CONFIG.id_reward, ADS_CONFIG.banner_on_init);
            ads_init_callback();
        }
        else {
            ads_init_callback();
        }
    }

    function get_social_platform() {
        if (System.platform == "HTML5")
            return social_platform;
        return '';
    }

    function player_init(authorizationOptions = {}, callback: any) {
    }

    function leaderboards_set_score(params: { leaderboardName: string, score: number, extraData?: any }, callback: CbResultVal) {
        if (System.platform == "HTML5")
            HtmlBridge.set_leaderboard_score(params, callback);
    }

    function leaderboards_get_entitys(params: { leaderboardName: string, includeUser?: boolean, quantityAround?: number, quantityTop?: number }, cb: CbLeaderboardList) {
        if (System.platform == "HTML5")
            HtmlBridge.get_leaderboard_entries(params, cb);
    }

    function feedback_request_review(callback: CbResultVal) {
        if (System.platform == "HTML5")
            HtmlBridge.rate(callback);
    }

    function interstitial_state_changed(state: INTERSTITIAL_STATE) {
        if (state == INTERSTITIAL_STATE.OPENED) {
            if (is_fix_last_inter)
                last_view_ads = System.now();
            Sound.set_pause(true);
            ads_log.log('Fix last ads time');
        } else if (state == INTERSTITIAL_STATE.CLOSED) {
            EventBus.trigger('ON_INTER_SHOWN', { result: true });
            Sound.set_pause(false);
        } else if (state == INTERSTITIAL_STATE.FAILED) {
            EventBus.trigger('ON_INTER_SHOWN', { result: false });
            Sound.set_pause(false);
        }
    }

    let is_rewarded = false;
    function rewarded_state_changed(state: REWARDED_STATE) {
        if (state == REWARDED_STATE.OPENED) {
            is_rewarded = false;
            Sound.set_pause(true);
        } else if (state == REWARDED_STATE.REWARDED) {
            // получена награда
            is_rewarded = true;
        } else if (state == REWARDED_STATE.CLOSED) {
            EventBus.trigger('ON_REWARDED_SHOWN', { result: is_rewarded });
            Sound.set_pause(false);
        } else if (state == REWARDED_STATE.FAILED) {
            is_rewarded = false;
            EventBus.trigger('ON_REWARDED_SHOWN', { result: false });
            Sound.set_pause(false);
        }
    }

    function is_view_inter() {
        return System.now() - last_view_ads > ADS_CONFIG.ads_interval;
    }

    function _show_interstitial(is_check = true) {
        const now = System.now();
        const is_allow = (!is_check || is_view_inter());
        if (!is_allow) {
            ads_log.log('Wait ads time:' + (ADS_CONFIG.ads_interval - (now - last_view_ads)));
            EventBus.trigger('ON_INTER_SHOWN', { result: false });
            return;
        }
        is_fix_last_inter = is_check;

        if (System.platform == "HTML5") {
            HtmlBridge.show_interstitial();
        }
        // android
        else if (System.platform == "Android" || System.platform == "iPhone OS") {
            ads_android.show_interstitial();
            EventBus.trigger('ON_INTER_SHOWN', { result: true });
        }
        else if (System.platform == 'Windows' || System.platform == 'Darwin' || System.platform == 'Linux') {
            log('fake-Inter show wait');
            Sound.set_pause(true);
            if (is_fix_last_inter)
                last_view_ads = System.now();
            timer.delay(5, false, () => {
                EventBus.trigger('ON_INTER_SHOWN', { result: true });
                log('fake-Inter show triggered');
                Sound.set_pause(false);
            });
        }
    }

    function _show_reward() {
        if (System.platform == "HTML5") {
            HtmlBridge.show_rewarded();
        }
        else if (System.platform == "Android" || System.platform == "iPhone OS") {
            if (is_real_reward)
                ads_android.show_rewarded();
            else
                ads_android.show_interstitial();
            EventBus.trigger('ON_REWARDED_SHOWN', { result: true });
        }
        else if (System.platform == 'Windows' || System.platform == 'Darwin' || System.platform == 'Linux') {
            log('fake-Reward showingt');
            Sound.set_pause(true);
            timer.delay(5, false, () => {
                EventBus.trigger('ON_REWARDED_SHOWN', { result: true });
                log('fake-Reward shown triggered');
                Sound.set_pause(false);
            });
        }
    }

    function is_banner_supported() {
        if (System.platform == 'Android' || System.platform == 'iPhone OS')
            return true;
        if (System.platform == 'HTML5') {
            if (social_platform == 'vk' && ['android', 'ios', 'mobile-web'].includes(HtmlBridge.get_platform_device()))
                return false;
            if (['ok', 'vk'].includes(social_platform))
                return true;
        }
        return false;
    }

    function _convert_positions(pos: BannerPos) {
        if (pos == BannerPos.POS_BOTTOM_CENTER)
            return yandexads.POS_BOTTOM_CENTER;
        else if (pos == BannerPos.POS_BOTTOM_LEFT)
            return yandexads.POS_BOTTOM_LEFT;
        else if (pos == BannerPos.POS_BOTTOM_RIGHT)
            return yandexads.POS_BOTTOM_RIGHT;
        else if (pos == BannerPos.POS_TOP_CENTER)
            return yandexads.POS_TOP_CENTER;
        else if (pos == BannerPos.POS_TOP_LEFT)
            return yandexads.POS_TOP_LEFT;
        else if (pos == BannerPos.POS_TOP_RIGHT)
            return yandexads.POS_TOP_RIGHT;
        else if (pos == BannerPos.POS_NONE)
            return -1;
        return -1;
    }

    function _show_banner(pos: BannerPos) {
        if (!is_banner_supported())
            return;
        const bannerOptions = {
            position: 'bottom', // Необязательный параметр, по умолчанию = bottom
            layoutType: 'resize', // Необязательный параметр
            canClose: true // Необязательный параметр
        };
        if (System.platform == "HTML5") {
            HtmlBridge.show_banner(bannerOptions);
        } else if (System.platform == "Android" || System.platform == "iPhone OS") {
            ads_android.load_banner(true);
            ads_android.show_banner(_convert_positions(pos));
        } else {
            ads_log.warn("Вызов баннера вручную не поддерживается");
        }
    }

    function _hide_banner() {
        if (!is_banner_supported())
            return;
        if (System.platform == "HTML5") {
            HtmlBridge.hide_banner();
        }
        else if (System.platform == "Android" || System.platform == "iPhone OS")
            ads_android.destroy_banner();
    }

    function show_reward(callback_shown?: CallbackAds) {
        if (callback_shown)
            EventBus.once('ON_REWARDED_SHOWN', (state) => callback_shown(state.result));
        EventBus.trigger("SYS_SHOW_REWARD");
    }

    function show_interstitial(is_check = true, callback_shown?: CallbackAds) {
        if (callback_shown)
            EventBus.once('ON_INTER_SHOWN', (state) => callback_shown(state.result));
        EventBus.trigger("SYS_SHOW_INTER", { is_check });
    }

    function show_banner(pos: BannerPos = BannerPos.POS_NONE) {
        EventBus.trigger("SYS_SHOW_BANNER", { pos });
    }

    function hide_banner() {
        EventBus.trigger("SYS_HIDE_BANNER");
    }

    function is_share_supported() {
        if (System.platform == "HTML5")
            return HtmlBridge.is_share_supported();
        else if (System.platform == "Android" && !IS_HUAWEI)
            return true;
        else
            return false;
    }

    function social_share() {
        if (System.platform == "HTML5") {
            HtmlBridge.share(social_platform == 'vk' ? share_options.vk : share_options.ok, () => { });
        } else {
            if (share != null) {
                if (System.platform == "Android")
                    share.text("https://play.google.com/store/apps/details?id=" + sys.get_config("android.package"));
            }
        }
        Metrica.report('share');
    }

    function is_favorite_supported() {
        if (System.platform == "HTML5")
            return HtmlBridge.is_favorite_supported();
        else
            return false;
    }

    function add_favorite() {
        if (!is_favorite_supported())
            return;
        if (System.platform == "HTML5")
            HtmlBridge.add_to_favorites(() => { });
    }

    function bind_messsages(): void {
        EventBus.on('ON_INTER_SHOWN', () => {
            if (is_fix_last_inter)
                last_view_ads = System.now();
        });
        EventBus.on('SYS_SHOW_REWARD', () => _show_reward());
        EventBus.on('SYS_SHOW_INTER', (m) => _show_interstitial(m.is_check));
        EventBus.on('SYS_SHOW_BANNER', (m) => _show_banner(m.pos));
        EventBus.on('SYS_HIDE_BANNER', () => _hide_banner());
    }

    function ads_init_callback() {
        if (System.platform == "HTML5") {
            let code = HtmlBridge.get_language();
            const cl = html5.run(`new URL(location).searchParams.get('lang')||''`);
            if (cl != '')
                code = cl;
            Lang.set_custom_lang(code);
            if (get_social_platform() == "yandex")
                show_interstitial(false);
        }
        _is_ready = true;
    }

    function is_ready() {
        return _is_ready;
    }

    function is_allow_ads() {
        if (System.platform == "HTML5")
            return !HtmlBridge.has_ad_block();
        else
            return true;
    }

    function set_real_reward_mode(val: boolean) {
        is_real_reward = val;
    }

   function set_ads_interval(time: number) {
        ADS_CONFIG.ads_interval = time;
        last_view_ads = System.now() - (ADS_CONFIG.ads_interval - ADS_CONFIG.ads_delay);
    }


    init();

    return {
        is_ready, get_social_platform, player_init, leaderboards_set_score, feedback_request_review,
        add_favorite, social_share, is_share_supported,
        show_reward, show_interstitial, show_banner, hide_banner, is_favorite_supported, leaderboards_get_entitys, set_real_reward_mode, is_view_inter, is_allow_ads,set_ads_interval
    };

}