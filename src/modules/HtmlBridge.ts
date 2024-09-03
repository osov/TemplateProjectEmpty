/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import * as js from 'defjs.defjs';
import { _STORAGE_CONFIG } from '../main/game_config';
import { CbBannerState, CbInterstitialState, CbLeaderboardList, CbResultData, CbResultVal, CbRewardedState, CbVisibleState } from './HtmlBridgeTypes';

declare global {
    const HtmlBridge: ReturnType<typeof HtmlBridgeModule>;
}

export function register_html_bridge() {
    (_G as any).HtmlBridge = HtmlBridgeModule();
}

type VoidCallback = () => void;

function HtmlBridgeModule() {

    function init(cb: VoidCallback) {
        js.call_js_with_callback('init_sdk_platform', {}, (success: boolean) => {
            log('init_sdk_platform:', success);
            cb();
        });
    }

    function get_data_from_storage(params: { key: string | string[] }, cb: CbResultData) {
        js.call_js_with_callback('sdk.get_data_from_storage', params, cb);
    }

    function set_data_to_storage(params: { key: string | string[], value: any }, cb: CbResultVal) {
        js.call_js_with_callback('sdk.set_data_to_storage', params, cb);
    }

    function get_cached_key<T>(key: string) {
        const result = js.call_js('sdk.get_cached_key', { key }) as [boolean, any];
        return result[1] as T;
    }

    function show_banner(params?: any) {
        js.call_js('sdk.show_banner', params);
    }

    function hide_banner() {
        js.call_js('sdk.hide_banner');
    }

    function show_interstitial() {
        js.call_js('sdk.show_interstitial');
    }

    function show_rewarded() {
        js.call_js('sdk.show_rewarded');
    }


    function start_resize_monitor() {
        const w = tonumber(sys.get_config("display.width")) as number;
        const h = tonumber(sys.get_config("display.height")) as number;
        js.call_js('sdk.start_resize_monitor', { is_vert: h > w });
    }

    function get_platform() {
        return js.call_js('sdk.get_platform') as 'ok' | 'vk' | 'yandex';
    }

    function get_platform_device() {
        return js.call_js('sdk.get_platform_device') as 'android' | 'ios' | 'pc';
    }

    function get_platform_tld() {
        return js.call_js('sdk.get_platform_tld') as string;
    }

    function get_language() {
        return js.call_js('sdk.get_language') as string;
    }

    function get_payload() {
        return js.call_js('sdk.get_payload') as string;
    }

    function is_favorite_supported() {
        return js.call_js('sdk.is_favorite_supported') as boolean;
    }

    function is_share_supported() {
        return js.call_js('sdk.is_share_supported') as boolean;
    }

    function is_player_authorized() {
        return js.call_js('sdk.is_player_authorized') as boolean;
    }

    function player_id() {
        return js.call_js('sdk.player_id') as string;
    }

    function player_name() {
        return js.call_js('sdk.player_name') as string;
    }

    function player_photos() {
        return js.call_js('sdk.player_photos') as string[];
    }

    function authorize_player(cb: CbResultVal) {
        js.call_js_with_callback('sdk.authorize_player', { scopes: true }, cb);
    }

    function has_ad_block() {
        return js.call_js('sdk.has_ad_block') as boolean;
    }

    function share(params: { link: string }, cb: CbResultVal) {
        js.call_js_with_callback('sdk.share', params, cb);
    }

    function rate(cb: CbResultVal) {
        js.call_js_with_callback('sdk.rate', {}, cb);
    }

    function add_to_favorites(cb: CbResultVal) {
        js.call_js_with_callback('sdk.add_to_favorites', {}, cb);
    }


    function set_leaderboard_score(params: { leaderboardName: string, score: number, extraData?: any }, cb: CbResultVal) {
        js.call_js_with_callback('sdk.set_leaderboard_score', params, cb);
    }

    function get_leaderboard_score(params: { leaderboardName: string }, cb: CbResultData) {
        js.call_js_with_callback('sdk.get_leaderboard_score', params, cb);
    }

    function get_leaderboard_entries(params: { leaderboardName: string, includeUser?: boolean, quantityAround?: number, quantityTop?: number }, cb: CbLeaderboardList) {
        js.call_js_with_callback('sdk.get_leaderboard_entries', params, cb);
    }


    function bind_visible_state(cb: CbVisibleState) {
        js.call_js_with_static_callback('sdk.bind_visible_state', {}, cb);
    }

    function bind_interstitial_events(cb: CbInterstitialState) {
        js.call_js_with_static_callback('sdk.bind_interstitial_events', {}, cb);
    }

    function bind_banner_events(cb: CbBannerState) {
        js.call_js_with_static_callback('sdk.bind_banner_events', {}, cb);
    }

    function bind_rewarded_events(cb: CbRewardedState) {
        js.call_js_with_static_callback('sdk.bind_rewarded_events', {}, cb);
    }

    function open_url(url: string) {
        js.call_js('window.open', url, '_blank');
    }

      function game_ready() {
        js.call_js('sdk.game_ready');
    }


    return {
        init, get_data_from_storage, set_data_to_storage, show_banner, hide_banner, show_interstitial, show_rewarded,
        start_resize_monitor, get_cached_key, get_platform, get_platform_tld, get_platform_device, authorize_player,
        bind_visible_state, bind_interstitial_events, bind_banner_events, bind_rewarded_events,
        get_language, get_payload, is_favorite_supported, is_share_supported, is_player_authorized,
        player_id, player_name, player_photos, share, rate, add_to_favorites, has_ad_block,
        set_leaderboard_score, get_leaderboard_score, get_leaderboard_entries, open_url,game_ready
    };
}