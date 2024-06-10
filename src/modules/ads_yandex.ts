/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { ADS_CONFIG } from "../main/game_config";

const config = {
    is_auto_init: true,
    banner_interval: 30,
};


let id_banners: string[] = [];
let id_inters: string[] = [];
let id_rewards: string[] = [];
let id_timer_inter: hash | null;
let id_timer_banner: hash | null;
let banner_visible = false;
let banner_pos = 5; // yandexads.POS_BOTTOM_CENTER
let is_rewarded = false;
let is_ready = false;
let banner_index = 0;
let inter_index = 0;
let reward_index = 0;



function _load_banner() {
    yandexads.load_banner(id_banners[banner_index], 0);
}

function _load_interstitial() {
    yandexads.load_interstitial(id_inters[inter_index]);
}

function _load_rewarded() {
    is_rewarded = false;
    yandexads.load_rewarded(id_rewards[reward_index]);
}

function _update_banner() {
    id_timer_banner = null;
    log('yandexads: updating banner');
    if (banner_visible)
        _load_banner();
}

// если вызвали с listener, то попытка остановить его вне будет неудачной
function _clear_banner_timer() {
    if (id_timer_banner !== null) {
        log('yandexads: clear timer banner', timer.cancel(id_timer_banner));
        id_timer_banner = null;
    }
}

function _start_refresh_banner(time = -1) {
    _clear_banner_timer();
    id_timer_banner = timer.delay(time != -1 ? time : config.banner_interval, false, _update_banner);
}

function _start_refresh_inter(time = 0) {
    if (id_timer_inter !== null) {
        log('yandexads: clear timer inter');
        timer.cancel(id_timer_inter);
        id_timer_inter = null;
    }
    id_timer_inter = timer.delay(time, false, _load_interstitial);
}

let id_timer_hack: hash | null = null;
function stop_banner_hack() {
    if (id_timer_hack != null) {
        timer.cancel(id_timer_hack);
        id_timer_hack = null;
    }
}

function start_banner_hack() {
    stop_banner_hack();
    id_timer_hack = timer.delay(10, false, () => {
        if (banner_visible) {
            yandexads.hide_banner();
            timer.delay(0.5, false, () => {
                if (banner_visible)
                    yandexads.show_banner(banner_pos);
            });
        }
    });
}


function listener(self: any, message_id: string | hash, message: any) {
    const event = message.event;

    // init
    if (message_id == yandexads.MSG_ADS_INITED) {
        if (event == yandexads.EVENT_LOADED) {
            log("yandexads: MSG_ADS_INITED ok");
            is_ready = true;
            if (config.is_auto_init) {
                // если убрать условие то получается undefined после показа, поэтому лучше грузить когда он реально нужен
                if (banner_visible && id_banners.length > 0)
                    _load_banner();
                if (id_inters.length > 0)
                    _load_interstitial();
                if (id_rewards.length > 0)
                    _load_rewarded();
            }
        }
    }

    // banner
    else if (message_id == yandexads.MSG_BANNER) {
        if (event == yandexads.EVENT_LOADED) {
            log("yandexads: MSG_BANNER EVENT_LOADED[" + banner_index + "]", banner_visible);
            banner_index = 0;
            if (banner_visible) {
                yandexads.show_banner(banner_pos);
                if (System.platform == 'iPhone OS')
                    start_banner_hack();
            }
            else
                yandexads.hide_banner();
            _start_refresh_banner(); // sticky auto update is low 60 sec
        }
        else if (event == yandexads.EVENT_ERROR_LOAD) {
            log("yandexads: MSG_BANNER EVENT_ERROR_LOAD[" + banner_index + "]", banner_visible);
            banner_index++;
            if (banner_index > id_banners.length - 1)
                banner_index = 0;
            _start_refresh_banner(5);
        }
        else if (event == yandexads.EVENT_IMPRESSION) {
            log("yandexads: MSG_BANNER EVENT_IMPRESSION[" + banner_index + "]", banner_visible, message.data);
            const jdata = json.decode(message.data as string);
            appmetrica.send_revenue(jdata.revenueUSD as string, jdata.network.name as string, jdata.ad_unit_id as string, jdata.precision as string, 'BANNER');
        }
    }


    // inter
    else if (message_id == yandexads.MSG_INTERSTITIAL) {
        if (event == yandexads.EVENT_LOADED) {
            log("yandexads: MSG_INTERSTITIAL EVENT_LOADED[" + inter_index + "]");
            inter_index = 0;
        }
        else if (event == yandexads.EVENT_ERROR_LOAD) {
            log("yandexads: MSG_INTERSTITIAL EVENT_ERROR_LOAD[" + inter_index + "]");
            inter_index++;
            if (inter_index > id_inters.length - 1)
                inter_index = 0;
            _start_refresh_inter(5);
        }
        else if (event == yandexads.EVENT_DISMISSED) {
            log('yandexads: fix last show inter');
            _start_refresh_inter(2);
            EventBus.trigger('ON_INTER_SHOWN');
        }
        else if (event == yandexads.EVENT_IMPRESSION) {
            log("yandexads: MSG_INTERSTITIAL EVENT_IMPRESSION[" + inter_index + "]", message.data);
            const jdata = json.decode(message.data as string);
            appmetrica.send_revenue(jdata.revenueUSD as string, jdata.network.name as string, jdata.ad_unit_id as string, jdata.precision as string, 'INTERSTITIAL');
        }
    }


    // reward
    else if (message_id == yandexads.MSG_REWARDED) {
        if (event == yandexads.EVENT_LOADED) {
            log("yandexads: MSG_REWARDED EVENT_LOADED[" + reward_index + "]");
            reward_index = 0;
        }
        else if (event == yandexads.EVENT_ERROR_LOAD) {
            log("yandexads: MSG_REWARDED EVENT_ERROR_LOAD[" + reward_index + "]");
            reward_index++;
            if (reward_index > id_rewards.length - 1)
                reward_index = 0;
        }
        else if (event == yandexads.EVENT_REWARDED) {
            is_rewarded = true;
            log('yandexads: fix reward');
        }
        else if (event == yandexads.EVENT_DISMISSED) {
            _load_rewarded();
            EventBus.trigger('ON_REWARDED_SHOWN');
        }
        else if (event == yandexads.EVENT_IMPRESSION) {
            log("yandexads: MSG_REWARDED EVENT_IMPRESSION[" + reward_index + "]", message.data);
            const jdata = json.decode(message.data as string);
            appmetrica.send_revenue(jdata.revenueUSD as string, jdata.network.name as string, jdata.ad_unit_id as string, jdata.precision as string, 'REWARDED');
        }
    }
    else {
        log("yandexads: NOT DEFINED", tostring(message_id));
        log(message);
        return;
    }

    log('yandexads: message_id:' + message_id);
    log(message);

}


function is_check(sub = '') {
    if (!yandexads) {
        log('yandexads: not installed', sub);
        return false;
    }
    if (!is_ready) {
        log('yandexads: not ready', sub);
        return false;
    }
    return true;
}


//------------------------------------------------------------------------------------------------


export function init(_id_banners: string[] = [], _id_inters: string[] = [], _id_rewards: string[] = [], _banner_visible = false) {
    if (!yandexads) {
        log('yandexads: not installed');
        return;
    }
    id_banners = _id_banners;
    id_inters = _id_inters;
    id_rewards = _id_rewards;
    banner_visible = _banner_visible;
    yandexads.set_callback(listener);

    // GDPR если был задан то передаем данные(должен быть вызван до инициализации)
    if (ADS_CONFIG.is_mediation) {
        const gdpr = Storage.get_int('gdpr', -1);
        if (gdpr != -1)
            yandexads.set_user_consent(gdpr == 1);
    }
    yandexads.initialize();
}

export function load_banner(visible = false) {
    if (!is_check('load_banner'))
        return false;
    banner_visible = visible;
    _load_banner();
    return true;
}

export function show_banner(pos = -1) {
    banner_pos = pos == -1 ? yandexads.POS_BOTTOM_CENTER : pos;
    if (!is_check('show_banner'))
        return false;
    banner_visible = true;
    if (!yandexads.is_banner_loaded()) {
        log('yandexads: show_banner, banner not loaded ');
        return false;
    }
    yandexads.show_banner(banner_pos);
    log('yandexads: show_banner', banner_pos);
    return true;

}

export function hide_banner() {
    if (!is_check('hide_banner'))
        return false;
    banner_visible = false;
    if (!yandexads.is_banner_loaded()) {
        log('yandexads: hide_banner, banner not loaded ');
        return false;
    }
    yandexads.hide_banner();
    log('yandexads: hide_banner');
    return true;
}

export function destroy_banner() {
    if (!is_check('destroy_banner'))
        return false;
    banner_visible = false;
    yandexads.destroy_banner();
    log('yandexads: destroy_banner');
    return true;
}

export function show_interstitial() {
    if (!is_check('show_interstitial'))
        return false;
    if (!yandexads.is_interstitial_loaded()) {
        log('yandexads: show_interstitial, interstitial not loaded');
        return false;
    }
    yandexads.show_interstitial();
    return true;
}

export function show_rewarded() {
    if (!is_check('show_rewarded'))
        return false;
    if (!yandexads.is_rewarded_loaded()) {
        log('yandexads: show_rewarded, rewarded not loaded');
        return false;
    }
    is_rewarded = false;
    yandexads.show_rewarded();
    return true;
}
