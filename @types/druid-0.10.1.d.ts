/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-interface */
/// <library version="0.10.1" src="https://github.com/Insality/druid/archive/master.zip" />
/** @noResolution */

declare module 'druid.druid' {
    let exports: DruidConstructor;
    export = exports;
}

/** @noResolution */
declare module 'druid.styles.default.style' {
    let exports: DruidStyles;
    export = exports;
}

/** @noResolution */
declare module 'druid.extended.checkbox' {
    let exports: any;
    export = exports;
}

/** @noResolution */
declare module 'druid.extended.radio_group' {
    let exports: any;
    export = exports;
}


/** @noResolution */
declare module 'druid.extended.slider' {
    let exports: any;
    export = exports;
}

type Context = unknown;
type Callback = (self: Context) => void;
type BtnCallback = (self: Context, params?: any, btn?: any) => void;
type CreateItemFunction = (this: any, data: any, index: number, data_list: any) => [DruidNode, DruidNode?];
type DragCallback = (this: any, dx: number, dy: number, total_x: number, total_y: number) => void;
type OnButtonHover = (self: any, node: any, hover_state: any) => void;
type SliderCallback = (self: any, dist: number, end_pos: vmath.vector3, is_drag: boolean, node: string, on_change_value: DruidEvent, 
    pos: vmath.vector3, start_pos: vmath.vector3, target_pos: vmath.vector3, value: number) => void;

interface DruidEvent {
    subscribe: (params?: any) => void;
}

interface DruidClass {
    final(): void;
    on_message(message_id: string | hash, message: unknown, sender: string | hash | url): void;
    on_input: (action_id: string | hash, action: unknown) => boolean;
    update(dt: number): void;
    remove(component: DruidNode): void;

    new_blocker: (node: string) => DruidBlocker;
    new_button: (node: string, cb: BtnCallback) => DruidButton;
    new_checkbox: (node: string, cb?: BtnCallback, click_node?: string, init_state?: boolean) => DruidCheckBox;
    new_radio_group: (nodes: string[], cb?: BtnCallback, click_nodes?: string[]) => DruidRadioGroup;
    new_scroll(scroll: string, container: string): DruidScroll;
    new_static_grid(parent: string, element: string, in_row: number): DruidGridVertical;
    new_data_list(scroll: DruidScroll, grid: DruidGrid, fncCreate: CreateItemFunction): DruidGridVertical;
    new_input(node: string, text_node_name: string, keyboard_type?: number): DruidInput;
    new_drag(node: string, on_drag_callback: DragCallback): DruidDrag;
    new_slider(node: string, end_pos:vmath.vector3, cb?: SliderCallback): DruidSlider;
}

/** @noSelf **/
interface DruidConstructor {
    new: (self: Context, style?: any) => DruidClass;
    set_sound_function: (self: Context) => void;
    set_default_style: (style: any) => void;
    register: (name: string, module: any) => void;
}

interface DruidSlider extends DruidNode {
    set(value: number, is_silent ?: boolean): void;
}


interface DruidBlocker {
    set_enabled: (state: boolean) => void;
}

interface DruidButton {
    set_click_zone: (zone: node) => void;
    set_enabled: (state: boolean) => void;

    style: DruidButtonStyle;
}

interface DruidNode {

}

interface DruidScroll extends DruidNode {
    set_horizontal_scroll(active: boolean): void;
    set_size(size: vmath.vector3, offset: vmath.vector3): void;
    set_extra_stretch_size(size: number): void;
    scroll_to(point: vmath.vector3, is_instant?: boolean): void;
    set_inert(state: boolean): void;
    scroll_to_percent(percent: vmath.vector3, is_instant?: boolean): void;
    get_percent(): vmath.vector3;
    on_scroll: DruidEvent;
}

interface DruidGrid extends DruidNode {
    set_data: (data: any) => void;
}


interface DruidGridVertical extends DruidGrid {
    add: (node: DruidNode, index: number, is_inst?: boolean) => void;
    set_position_function(callback: (node: AnyTable, position: vmath.vector3) => void): DruidGrid;
    get_size(): vmath.vector3
}

interface DruidInput extends DruidNode {

}

interface DruidStyles {
    scroll: {
        WHEEL_SCROLL_SPEED: number;
    }
}

/** @noSelf **/
interface DruidButtonStyle {
    LONGTAP_TIME: number,
    DOUBLETAP_TIME: number,
    on_click: (self?: Context, node?: node) => void,
    on_hover: (self?: Context, node?: node, hover_state?: boolean) => void,
    on_mouse_hover: (self: Context, node: node, state: any) => void,
}

interface DruidDrag {
    is_drag: boolean;
    is_touch: boolean;
    touch_start_pos: vmath.vector3;
    can_x: boolean;
    can_y: boolean;
    on_drag_start: DruidEvent;
    on_drag_end: DruidEvent;
    on_touch_start: DruidEvent;

    set_enabled: (state: boolean) => void;
}

interface DruidRadioGroup {
    set_state: (index: number, is_instant: boolean) => void;
    get_state: () => number;
}

interface DruidCheckBox {
    get_state: () => boolean;
    set_state: (state: boolean, is_silent: boolean, is_instant: boolean) => void;
    on_change_state: DruidEvent;
   
}
