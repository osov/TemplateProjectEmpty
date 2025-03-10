/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */


//import * as reszip from 'liveupdate_reszip.reszip';
import { SERVER_URL } from '../main/game_config';
import { Messages } from './modules_const';

/*
    Модуль для работы с рессурсами
*/

declare global {
    const Resource: ReturnType<typeof ResourceModule>;
}

export function register_resources() {
    (_G as any).Resource = ResourceModule();
}


function ResourceModule() {
    const RESOURCE_ID = Manager.MAIN + 'resources';
    let manifest: { [key in string]: { hash: string, dependencies: string[] } } = {};
    let _is_ready = false;

    function init() {
        if (liveupdate != null)
            load_manifest();
        else
            _is_ready = true;
    }

    function is_ready() {
        return _is_ready;
    }

    function log_mounts() {
        if (liveupdate != null) {
            const mounts = liveupdate.get_mounts();
            if (mounts.length != 0) {
                log("Найдены рессурсы: ");
                for (const mount of mounts) {
                    log(`\t ${mount.uri} в маунте: ${mount.name}`);
                }
            }
        }
    }

    function load_manifest() {
        const handle = (self: any, id: number, response: any) => {
            if (response.status == 200) {
                log('RESOURCE MANIFEST LOADED');
                manifest = json.decode(response.response);
                log_mounts();
            }
            else {
                Log.error(`Failed load manifest of resources ${response.status as number}`);
            }
            _is_ready = true;
        };
        http.request(SERVER_URL + "resources/manifest.json?" + math.random(), 'GET', handle);
    }

    function load(name: string, on_loaded?: () => void, path = RESOURCE_ID) {
        if (on_loaded != undefined)
            EventBus.once('SYS_RESOURCE_LOADED_' + name as any, on_loaded);
        Manager.send('SYS_LOAD_RESOURCE', { name, path });
    }

    function try_load(name: string, path: string, on_loaded?: () => void) {
        if (on_loaded != undefined)
            on_loaded();
    /*
        // работаем в редакторе, ресурсы все внутри
        if (liveupdate == null) {
            if (on_loaded != undefined)
                on_loaded();
            return;
        }


        for (const [_, res] of Object.entries(collectionproxy.get_resources(path + '#' + name))) {
            Log.log(path + '#' + name + ": ", res);
        }

        // не найдены в загруженной коллекции
        const missing_resources = collectionproxy.missing_resources(path + '#' + name);
        const is_miss = next(missing_resources)[0] != null;
        let is_missing = false;
        for (const [key, value] of Object.entries(missing_resources)) {
            if (value != null) {
                if (manifest[name].dependencies.includes(value as string)) {
                    Log.warn("Не найден ресурс: " + key + " " + value, 'в коллекции:', path + '#' + name, 'is_miss', is_miss);
                    is_missing = true;
                    //break;
                }
            }
        }

        log_mounts();

        // нет в списке манифеста - либо косяк при упаковке или он там и не должен быть(те уже включен на старте значит все ок)
        const resource = manifest[name];
        if (resource == null) {
            if (is_missing)
                Log.error("Не удалось найти хеш ресурса: " + name);
            if (on_loaded != undefined)
                on_loaded();
            return;
        }


        const miss_match_version = !reszip.version_match(resource.hash, name);
        if (miss_match_version) {
            Log.warn("Не совпадает версия ресурс файла:" + name);
            log('resource_hash', resource.hash);
            log_mounts();
        }

        if (miss_match_version || is_missing) {
            Log.log("Загрузка ресурсов: " + name);

            reszip.load_and_mount_zip('resources/' + resource.hash + ".zip", {
                filename: resource.hash,
                mount_name: name,
                delete_old_file: true,
                on_finish: (self: any, err: any) => {
                    if (!err) {
                        Log.log("Загружены ресурсы: " + name);
                        if (on_loaded != undefined)
                            on_loaded();
                    }
                    else
                        Log.warn('Не удалось загрузить ресурсы: ' + name);
                },
            });
        }
        else if (on_loaded != undefined)
            on_loaded();
    */
    }

    function _on_message(_this: any, message_id: hash, _message: any, sender: hash) {
        if (message_id == to_hash('SYS_LOAD_RESOURCE')) {
            const message = _message as Messages['SYS_LOAD_RESOURCE'];
            try_load(message.name, message.path, () => EventBus.trigger('SYS_RESOURCE_LOADED_' + message.name as any, null, false));
        }
    }

    init();

    return { load, log_mounts, is_ready, _on_message };
}