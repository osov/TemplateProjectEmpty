/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import * as druid from 'druid.druid';
import * as default_style from "druid.styles.default.style";
import { BannerPos } from '../modules/Ads';
import { register_manager } from '../modules/Manager';


interface props {
}

export function init(this: props) {
    msg.post('.', 'acquire_input_focus');
    register_manager();
    Manager.init(() => {

        EventBus.on('ON_SCENE_LOADED', (message) => {
            const name = message.name;
            window.set_dim_mode(name.includes('game') ? window.DIMMING_OFF : window.DIMMING_ON);
            if (message.name == 'game')
                Ads.show_banner(BannerPos.POS_BOTTOM_CENTER);
            else
                Ads.hide_banner();
        });

        // если это одноклассники
        if (System.platform == 'HTML5' && HtmlBridge.get_platform() == 'ok')
            HtmlBridge.start_resize_monitor();

        default_style.scroll.WHEEL_SCROLL_SPEED = 10;
        druid.set_default_style(default_style);
        Sound.attach_druid_click('sel');
        Camera.set_go_prjection(-1, 1);
        if (System.platform == 'HTML5')
            HtmlBridge.game_ready();
        Scene.load('menu');
        Scene.set_bg('#999');
    }, true);
}


export function on_message(this: props, message_id: hash, _message: any, sender: hash): void {
    Manager.on_message_main(this, message_id, _message, sender);
}
