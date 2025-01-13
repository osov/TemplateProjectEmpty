/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { VoidMessage } from "../modules/modules_const";

export const IS_DEBUG_MODE = false;
export const IS_HUAWEI = sys.get_sys_info().system_name == 'Android' && sys.get_config("android.package").includes('huawei');
export const SERVER_URL = './';

// параметры инициализации для ADS
export const ADS_CONFIG = {
    is_mediation: false,
    id_banners: [],
    id_inters: [],
    id_reward: [],
    banner_on_init: false,
    ads_interval: 3 * 60,
    ads_delay: 30,
};

// для вк
export const VK_SHARE_URL = '';
export const OK_SHARE_TEXT = '';
// для андроида метрика
export const ID_YANDEX_METRICA = '';
// через сколько показать первое окно оценки
export const RATE_FIRST_SHOW = 24 * 60 * 60;
// через сколько второй раз показать 
export const RATE_SECOND_SHOW = 3 * 24 * 60 * 60;

// игровой конфиг (сюда не пишем/не читаем если предполагается сохранение после выхода из игры)
// все обращения через глобальную переменную GAME_CONFIG
export const _GAME_CONFIG = {

};

// конфиг с хранилищем  (отсюда не читаем/не пишем, все запрашивается/меняется через GameStorage)
export const _STORAGE_CONFIG = {
    resource_manifest: {}
};



// пользовательские сообщения под конкретный проект, доступны типы через глобальную тип-переменную UserMessages
export type _UserMessages = {
    HOME_LOADED: VoidMessage
};
