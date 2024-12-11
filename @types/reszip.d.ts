/* eslint-disable @typescript-eslint/no-explicit-any */

/** @noResolution */

declare module "liveupdate_reszip.reszip" {
    export function version_match(filename: string, mount: string): boolean;
    export function load_and_mount_zip(path: string, options: any): void;
}