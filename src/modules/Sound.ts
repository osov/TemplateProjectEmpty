/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import * as druid from 'druid.druid';
import { Messages } from "./modules_const";

/*
    Модуль для работы со звуком
*/

declare global {
    const Sound: ReturnType<typeof SoundModule>;
}

export function register_sound() {
    (_G as any).Sound = SoundModule();
}

function SoundModule() {

    function init() {
        set_active(is_active());
        play('empty');
    }

    function attach_druid_click(name = 'btn') {
        druid.set_sound_function(() => play(name));
    }

    function _on_message(_this: any, message_id: hash, _message: any, sender: hash) {
        if (message_id == to_hash('SYS_STOP_SND')) {
            const message = _message as Messages['SYS_STOP_SND'];
            sound.stop('/sounds#' + message.name);
        }
        if (message_id == to_hash('SYS_PLAY_SND')) {
            const message = _message as Messages['SYS_PLAY_SND'];
            sound.play('/sounds#' + message.name, { speed: message.speed, gain: message.volume });
        }

        if (message_id == to_hash('SYS_LOAD_SND')) {
            const message = _message as Messages['SYS_LOAD_SND'];
            const [sound_data, error] = sys.load_resource(message.path);
            if (error != null) {
                Log.log('SYS_LOAD_SND', error);
                return;
            }
            const sound_path = go.get(Manager.MAIN + 'sounds#' + message.name, "sound") as string;
            resource.set_sound(sound_path, sound_data);
            EventBus.trigger('SYS_SOUND_LOADED_' + message.name + '_' + message.path as any, null, false);
        }
    }

    function is_active() {
        return Storage.get_bool('is_sound', true);
    }

    function set_active(active: boolean) {
        Storage.set('is_sound', active);
        sound.set_group_gain('master', active ? 1 : 0);
    }

    function load(name: string, path: string, on_loaded?: () => void) {
        if (on_loaded != undefined)
            EventBus.once('SYS_SOUND_LOADED_' + name + '_' + path as any, on_loaded);
        Manager.send('SYS_LOAD_SND', { name, path });
    }

    function play(name: string, speed = 1, volume = 1) {
        Manager.send('SYS_PLAY_SND', { name, speed, volume });
    }

    function stop(name: string) {
        Manager.send('SYS_STOP_SND', { name });
    }

    function set_pause(val: boolean) {
        const scene_name = Scene.get_current_name();
        if (scene_name != '')
            EventBus.trigger('ON_SOUND_PAUSE', { val }, false);
        if (!is_active())
            return;
        sound.set_group_gain('master', val ? 0 : 1);
    }

    // todo groups sound
    


    init();

    return { _on_message, is_active, set_active, load, play, stop, set_pause, attach_druid_click };
}