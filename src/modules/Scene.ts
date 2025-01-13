/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { hex2rgba } from "../utils/utils";
import { Messages } from "./modules_const";

/*
    Модуль для работы со сценой
*/

declare global {
    const Scene: ReturnType<typeof SceneModule>;
}

export function register_scene() {
    (_G as any).Scene = SceneModule();
}

function SceneModule() {
    const SCENE_ID = Manager.MAIN + 'scenes';
    const loaded_scenes: { [key in string]: hash } = {};

    let last_loading_scene = '';
    let last_scene = '';

    let is_restarting_scene = false;
    let _unload_last_scene = false;

    function init() {
        if (System.platform == 'HTML5')
            html5.run(`window.set_light = function(val){document.body.style.backgroundColor = val}`);
    }

    function set_bg(color: string) {
        msg.post("@render:", "clear_color", { color: hex2rgba(color, 1) });
        if (System.platform == 'HTML5')
            html5.run(`set_light('` + color + `')`);
    }

    // загрузить сцену с именем
    // unload_last_scene - будет ли выгружена текущая сцена
    function load(name: string,  unload_last_scene = true) {
        _unload_last_scene = unload_last_scene;
        Manager.send('SYS_LOAD_SCENE', { name });
    }

    function unload(name: string) {
        Manager.send('SYS_UNLOAD_SCENE', { name });
    }

    function restart() {
        Manager.send('SYS_RESTART_SCENE');
    }

    function get_current_name() {
        return last_scene;
    }

    function _on_message(_this: any, message_id: hash, _message: any, sender: hash) {
        on_restart_scene(message_id);
        on_unload_scene(message_id, _message);
        on_load_scene(message_id, _message, sender);
    }

    function on_restart_scene(message_id: hash) {
        if (message_id == to_hash('SYS_RESTART_SCENE')) {
            if (last_scene == '')
                return Log.warn('Сцена для перезагрузки не найдена');
            const name = SCENE_ID + "#" + last_scene;
            msg.post(name, "disable");
            msg.post(name, "final");
            msg.post(name, "unload");
            is_restarting_scene = true;
        }

        // рестарт сцены после выгрузки
        if (message_id == hash("proxy_unloaded")) {
            if (is_restarting_scene && last_scene != '') {
                last_loading_scene = last_scene;
                msg.post(SCENE_ID + "#" + last_scene, "load");
            }
        }
    }

    function on_load_scene(message_id: hash, _message: any, sender: hash) {
        if (message_id == to_hash('SYS_LOAD_SCENE')) {
            const message = _message as Messages['SYS_LOAD_SCENE'];
            last_loading_scene = message.name;
            Resource.load(message.name, () => {
                msg.post(SCENE_ID + "#" + message.name, "load");
            }, SCENE_ID);

        }

        if (message_id == hash("proxy_loaded")) {
            is_restarting_scene = false;
            msg.post(sender, "init");
            msg.post(sender, "enable");
            last_scene = last_loading_scene;
            last_loading_scene = '';
            loaded_scenes[last_scene] = sender;
            EventBus.trigger('ON_SCENE_LOADED', { name: last_scene }, false);
        }
    }

    function on_unload_scene(message_id: hash, _message: any) {
        if (message_id == to_hash("SYS_UNLOAD_SCENE")) {
            const message = _message as Messages['SYS_UNLOAD_SCENE'];
            const name = loaded_scenes[message.name];
            if (name != undefined) {
                msg.post(name, "disable");
                msg.post(name, "final");
                msg.post(name, "unload");
                delete loaded_scenes[message.name];
            }
        }

        if (message_id == hash("proxy_loaded") && _unload_last_scene && last_scene != '' && !is_restarting_scene) {
            const name = SCENE_ID + "#" + last_scene;
            msg.post(name, "disable");
            msg.post(name, "final");
            msg.post(name, "unload");
            delete loaded_scenes[last_scene];
            last_scene = '';
        }
    }

    init();

    return { _on_message, restart, load, unload, set_bg, get_current_name };
}