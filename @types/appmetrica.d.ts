/** @noResolution */

declare namespace appmetrica {
    export function initialize(key: string): void;
    export function set_callback(cb: Callback): void;
    export function report_event(event: string, json: string): void;
    export function send_revenue(money: string, network_name: string, ad_unit_id: string, precision: string, ad_type: string): void;
}