/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { GoManager } from "../modules/GoManager";


interface props {
}

export function init(this: props) {
    Manager.init_script();

    const go_manager = GoManager();

    EventBus.on('HOME_LOADED', () => {
        Sound.play('music');
        go_manager.set_prefab('/assets/resources/home/prefab.goc', () => {
            go_manager.make_go(vmath.vector3(270, -480, 0));
        });
    });

    Resource.load("home", () => {
        Sound.load('music', '/assets/resources/home/music.oggc');
        EventBus.send('HOME_LOADED');
    });
}

export function final(this: props) {
    EventBus.off_all_current_script();
    Manager.final_script();
}