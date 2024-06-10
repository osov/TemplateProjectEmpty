/** @noResolution */
declare module 'defjs.defjs' {
    export function call_js(method: string, ...parameters: any[]): any;
    export function call_js_with_callback(method: string, parameters: any, callback: any): void;
    export function call_js_with_static_callback(method: string, parameters: any, callback: any): void;
}