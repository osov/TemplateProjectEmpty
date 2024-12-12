/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */


import * as reszip from 'liveupdate_reszip.reszip';

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
    const loading_resource_callbacks: { [key in string]: () => void } = {};

    let manifest: { [key in string]: string } = {};

    function init() {
        if (html5 != null)
            load_manifest();

        EventBus.on('SYS_LOAD_RESOURCE', (message) => {
            try_load(message.name, message.path, loading_resource_callbacks[message.name]);
        });
    }

    function load_manifest() {
        const url = html5.run('window.location.href');
        const handle = (self: any, id: number, response: any) => {
            if (response.status == 200) {
                Log.log('RESOURCE MANIFEST LOADED');
                manifest = json.decode(response.response);
            } else Log.error(`Failed load manifest of resources ${response.status as number}`);
        };
        http.request(url + "resources/manifest.json", 'GET', handle);
    }

    function load(name: string, on_loaded?: () => void, path = RESOURCE_ID) {
        if (on_loaded != undefined)
            loading_resource_callbacks[name] = on_loaded;
        EventBus.send('SYS_LOAD_RESOURCE', { name, path });
    }

    function try_load(name: string, path: string, on_loaded?: () => void) {
        if (!liveupdate) {
            if (on_loaded != undefined)
                on_loaded();
            return;
        }

        const mounts = liveupdate.get_mounts();
        if (mounts.length != 0) {
            Log.log("Найдены рессурсы: ");
            for (const mount of mounts) {
                Log.log(`\tРессурс: ${mount.uri} в маунте: ${mount.name}`);
            }
        }

        const missing_resources = collectionproxy.missing_resources(path + '#' + name);
        let is_missing = false;
        for (const [key, value] of Object.entries(missing_resources)) {
            if (value != null) {
                Log.warn("Ненайден ресурс: " + key + " " + value);
                is_missing = true;
                break;
            }
        }

        if (!is_missing) {
            if (on_loaded != undefined)
                on_loaded();
            return;
        }

        const resource_hash = manifest[name];
        const resource_file = resource_hash + ".zip";
        const miss_match_version = !reszip.version_match(resource_hash, name);
        if (miss_match_version) Log.warn("Несовпадает версия ресурс файла!");

        if (miss_match_version || is_missing) {
            Log.log("Загрузка ресурсов: " + name);

            reszip.load_and_mount_zip('resources/' + resource_file, {
                filename: resource_file,
                mount_name: name,
                delete_old_file: true,
                on_finish: (self: any, err: any) => {
                    if (!err) {
                        Log.log("Загружены ресурсы: " + name);
                        if (on_loaded != undefined) on_loaded();
                    } else Log.warn('Неудалось загрузить ресурсы: ' + name);
                },
            });
        } else if (on_loaded != undefined) on_loaded();
    }

    init();

    return { load };
}