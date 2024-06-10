/* eslint-disable @typescript-eslint/no-explicit-any */

/** @noResolution */
declare module 'event.event' {
    export function create(callback?: IcbFnc, callback_context?: any): IEventClass;
    export function set_logger(logger: any): void;
}

interface IEventClass {
    subscribe(callback: IcbFnc, callback_context?: any): void;
    unsubscribe(callback: IcbFnc, callback_context?: any): void;
    is_subscribed(callback: IcbFnc, callback_context?: any): boolean;
    trigger(...args: any[]): void;
    is_empty(): boolean;
    clear(): void;

}

type IcbFnc = (slf: any) => void;