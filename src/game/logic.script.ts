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
    log('logic.script');

    timer.delay(3, false, () => {
        log('loading new_f');
        Scene.load('new_f', false);
    });

    timer.delay(1, false, () => {
        log('start loading');
        Resource.load("home", () => {
            log('loaded 2');
            //Sound.load('music', '/assets/resources/home/music.oggc', () => Sound.play('music'));
            Sound.load('music', '/assets/resources/home/music.oggc');
            Sound.play('music',  1);
            const go_manager = GoManager();
            go_manager.set_factory_prefab('factory', '/assets/resources/home/prefab.goc', () => {
                go_manager.make_go('factory', vmath.vector3(270, -480, 0));
            });

        });
    });

}

export function final(this: props) {
    EventBus.off_all_current_script();
    Manager.final_script();
}