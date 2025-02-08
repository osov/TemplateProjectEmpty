/* eslint-disable no-constant-condition */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import * as druid from 'druid.druid';
import { ADS_CONFIG } from '../main/game_config';
import { DruidCheckbox } from '../utils/DruidCheckbox';
import { show_gui_list, hide_gui_list, set_text } from '../utils/utils';

interface props {
    druid: DruidClass;
}


export function init(this: props): void {
    msg.post('.', 'acquire_input_focus');
    Manager.init_script();
    this.druid = druid.new(this);

    if (System.platform == 'iPhone OS') {
        set_text('privacy', Lang.get_lang() == 'ru' ? "Политика конфиденциальности" : "Privacy Policy");
        this.druid.new_button('btnPrivacy', () => sys.open_url(Lang.get_lang() == 'ru' ? 'https://sb-games.ru/policy-ru.html' : 'https://sb-games.ru/policy.html'));
    }
    else
        hide_gui_list(['btnPrivacy']);

    if (Ads.is_share_supported())
        this.druid.new_button('btnShare', () => Ads.social_share());
    else
        hide_gui_list(['btnShare']);


    if (ADS_CONFIG.is_mediation && System.platform != "HTML5" && Lang.is_gdpr()) {
        log('check request GDPR');
        const gdpr = Storage.get_int('gdpr', -1);
        // запрашиваем, инфа не сохранена
        if (gdpr == -1) {
            log('request GDPR');
            let is_checked = true;
            show_gui_list(['gdpr_block']);
            this.druid.new_blocker('gdpr_block');
            this.druid.new_button('gdpr_url', () => sys.open_url(Lang.get_lang() == 'ru' ? 'https://sb-games.ru/policy-ru.html' : 'https://sb-games.ru/policy.html'));
            DruidCheckbox(this.druid, 'gdrp_check_bg', (v) => is_checked = v, 'gdpr_check_box', is_checked);
            this.druid.new_button('btnGdprOk', () => {
                hide_gui_list(['gdpr_block']);
                Storage.set('gdpr', is_checked ? 1 : 0);
                yandexads.set_user_consent(is_checked);
            });
        }
    }

}


export function on_input(this: props, action_id: string | hash, action: unknown) {
    return this.druid.on_input(action_id, action);
}

export function update(this: props, dt: number): void {
    this.druid.update(dt);
}

export function on_message(this: props, message_id: string | hash, message: any, sender: string | hash | url): void {
    this.druid.on_message(message_id, message, sender);
}

export function final(this: props): void {
    Manager.final_script();
    this.druid.final();
}