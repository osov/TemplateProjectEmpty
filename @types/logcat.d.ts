/** @noResolution */

declare namespace logcat {
    export function initialize(key: string): void;
    export function set_callback(cb: Callback): void;
    export function report_event(level: string, data: string): void;
}

