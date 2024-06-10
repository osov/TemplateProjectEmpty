/* eslint-disable @typescript-eslint/ban-types */

import { BannerPos } from "./Ads";

/* eslint-disable @typescript-eslint/no-empty-interface */
export type VoidCallback = () => void;
export type Messages = UserMessages & SystemMessages;
export type MessageId = keyof Messages;

export interface VoidMessage { }

export interface NameMessage extends VoidMessage { name: string; }
export interface InterMessage extends VoidMessage { is_check: boolean; }
export interface ValMessage extends VoidMessage { val: boolean; }
export interface SndMessage extends NameMessage { volume: number; speed: number }
export interface IGameItem {
    _hash: hash;
    is_clickable?: boolean;
    is_dragable?: boolean;
}
export interface PosXYMessage extends VoidMessage { x: number; y: number }
export interface HashesMessage extends VoidMessage { hashes: hash[] }
export interface ItemMessage extends VoidMessage { item: IGameItem }
export interface AdsResult { result: boolean }
export interface ShowBannerData { pos: BannerPos }

export type _SystemMessages = {
    MANAGER_READY: VoidMessage,
    SYS_PLAY_SND: SndMessage,
    SYS_STOP_SND: NameMessage,
    ON_SOUND_PAUSE: ValMessage,
    SYS_LOAD_SCENE: NameMessage,
    SYS_RESTART_SCENE: VoidMessage,
    SYS_SHOW_RATE: VoidMessage,
    ON_APPLY_CUSTOM_LANG: VoidMessage,
    ON_SCENE_LOADED: NameMessage,
    SYS_SHOW_REWARD: VoidMessage,
    SYS_SHOW_INTER: InterMessage,
    SYS_SHOW_BANNER: ShowBannerData,
    SYS_HIDE_BANNER: VoidMessage,
    SYS_ON_RESIZED: { width: number, height: number },

    ON_INTER_SHOWN: AdsResult,
    ON_REWARDED_SHOWN: AdsResult,
    MSG_ON_MOVE: PosXYMessage,
    MSG_ON_DOWN: PosXYMessage,
    MSG_ON_UP: PosXYMessage,
    MSG_ON_DOWN_HASHES: HashesMessage,
    MSG_ON_UP_HASHES: HashesMessage,
    MSG_ON_DOWN_ITEM: ItemMessage,
    MSG_ON_UP_ITEM: ItemMessage,
    MSG_ON_MOVE_ITEM: ItemMessage,

};

export const _ID_MESSAGES = {
    MSG_LAYOUT_CHANGED: hash('layout_changed'),
    MSG_INPUT_FOCUS: hash('acquire_input_focus'),
    MSG_TOUCH: hash('touch'),
    MSG_ON_MOVE: hash('MSG_ON_MOVE'),
    MSG_ON_DOWN: hash('MSG_ON_DOWN'),
    MSG_ON_UP: hash('MSG_ON_UP'),
    MSG_ON_DOWN_HASHES: hash('MSG_ON_DOWN_HASHES'),
    MSG_ON_UP_HASHES: hash('MSG_ON_UP_HASHES'),
    MSG_ON_DOWN_ITEM: hash('MSG_ON_DOWN_ITEM'),
    MSG_ON_UP_ITEM: hash('MSG_ON_UP_ITEM'),
    MSG_ON_MOVE_ITEM: hash('MSG_ON_MOVE_ITEM'),
};