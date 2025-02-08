/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

/*
    Модуль для работы с метрикой
*/

declare global {
    const Metrica: ReturnType<typeof MetricaModule>;
}

export function register_metrica() {
    (_G as any).Metrica = MetricaModule();
}

function MetricaModule() {
    let has_metrica = false;
    
    function init(id_metrica_android: string) {
        if (System.platform == 'HTML5') {
            if (yametrica != null)
                yametrica.not_bounce();
        }
        else if (appmetrica != null) {
            has_metrica = id_metrica_android != '';
            appmetrica.set_callback(() => log('app metrica init ok'));
            if (has_metrica)
                appmetrica.initialize(id_metrica_android);
        }
    }

    function report(event: string, json_data: any = '') {
        if (appmetrica != null && has_metrica)
            appmetrica.report_event(event, json_data == '' ? '' : json.encode(json_data));
        if (yametrica != null)
            yametrica.reach_goal(event, json_data == '' ? {} : json_data);
    }

    return { init, report };
}