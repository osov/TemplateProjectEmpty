/** @noResolution **/
/* eslint-disable @typescript-eslint/no-explicit-any */


declare namespace collectionproxy {
    export function missing_resources(url: string): any;
}

declare interface Mount {
    name: string,
    uri: string,
    priority: number
}

declare namespace liveupdate {
    export function get_mounts(): Mount[];
    export function remove_mount(name: string): void;
}