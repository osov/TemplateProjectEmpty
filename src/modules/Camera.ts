/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

/*
    Модуль для работы с камерой и преобразованиями
*/

declare global {
    const Camera: ReturnType<typeof CameraModule>;
}

export function register_camera() {
    (_G as any).Camera = CameraModule();
}

function CameraModule() {
    const go_camera = native_camera.create({
        orthographic: true,
        near_z: -1,
        far_z: 1
    });

    const DISPLAY_WIDTH = tonumber(sys.get_config("display.width"))!;
    const DISPLAY_HEIGHT = tonumber(sys.get_config("display.height"))!;
    let is_gui_projection = false;
    const camera_position = vmath.vector3(0, 0, 0);
    const world_center_screen = vmath.vector3();
    let WINDOW_WIDTH = DISPLAY_WIDTH;
    let WINDOW_HEIGHT = DISPLAY_HEIGHT;
    let is_auto_zoom = false;
    let _dynamic_orientation = false;
    let _zoom_width = 0;
    let _zoom_height = 0;
    let offset_to_center = false;


    function init() {
        let last_window_x = 0;
        let last_window_y = 0;

        timer.delay(0.1, true, () => {
            const [window_x, window_y] = window.get_size();
            if (last_window_x != window_x || last_window_y != window_y) {
                last_window_x = window_x;
                last_window_y = window_y;
                update_window_size();
            }
        });
        go_camera.set_view_area(DISPLAY_WIDTH, DISPLAY_HEIGHT);
        update_window_size();
    }

    function set_gui_projection(value: boolean) {
        is_gui_projection = value;
        msg.post("@render:", "use_only_projection", { value });
    }


    // todo not checking, potential bugs...
    function transform_input_action(action: any) {
        if (is_gui_projection && action.x !== undefined) {
            action.orig_x = action.x;
            action.orig_y = action.y;
            const wp = screen_to_world(action.x as number, action.y as number);
            const [window_x, window_y] = window.get_size();
            const stretch_x = window_x / gui.get_width();
            const stretch_y = window_y / gui.get_height();
            action.x = wp.x / stretch_x;
            action.y = wp.y / stretch_y;
        }
    }

    function set_go_prjection(ax: number, ay: number, near = -1, far = 1) {
        go_camera.set_anchor(ax, ay);
        go_camera.set_near_z(near);
        go_camera.set_far_z(far);
        update_window_size();
    }

    function get_zoom() {
        return go_camera.get_ortho_scale();
    }

    function set_zoom(zoom: number) {
        go_camera.set_ortho_scale(zoom);
        update_center_screen();
        set_camera_position(camera_position.x, camera_position.y, camera_position.z);
    }


    function update_window_size(is_trigger_event = true) {
        const [width, height] = window.get_size();

        if (width > 0 && height > 0) {
            WINDOW_WIDTH = width;
            WINDOW_HEIGHT = height;
        }
        else
            Log.error('!!! window.get_size is', width, height);

        // screen
        go_camera.set_screen_size(width, height);
        update_auto_zoom(width, height);
        update_center_screen();
        set_zoom(get_zoom());
        if (is_trigger_event)
            EventBus.trigger('SYS_ON_RESIZED', { width, height }, false);
    }

    function update_center_screen() {
        const ltrb = get_ltrb();
        world_center_screen.x = DISPLAY_WIDTH / 2;
        world_center_screen.y = -Math.abs(ltrb.y - ltrb.w) / 2;
    }

    function get_width_height() {
        if (_dynamic_orientation) {
            const is_portrait = DISPLAY_WIDTH < DISPLAY_HEIGHT;
            const cur_is_portrait = WINDOW_WIDTH < WINDOW_HEIGHT;
            if (is_portrait != cur_is_portrait)
                return [DISPLAY_HEIGHT, DISPLAY_WIDTH];
        }
        return [DISPLAY_WIDTH, DISPLAY_HEIGHT];
    }

    function screen_to_world(screen_x: number, screen_y: number) {
        const [x, y] = go_camera.screen_to_world_2d(screen_x, screen_y);
        return vmath.vector3(x, y, 0);
    }

    function window_to_world(x: number, y: number) {
        const scale_x = x / (DISPLAY_WIDTH / WINDOW_WIDTH);
        const scale_y = y / (DISPLAY_HEIGHT / WINDOW_HEIGHT);
        return screen_to_world(scale_x, scale_y);
    }

    function world_to_screen(world: vmath.vector3) {
        const [x, y] = go_camera.world_to_screen(world);
        return vmath.vector3(x, y, 0);
    }

    function world_to_window(world: vmath.vector3) {
        const sp = world_to_screen(world);
        const scale_x = sp.x * (DISPLAY_WIDTH / WINDOW_WIDTH);
        const scale_y = sp.y * (DISPLAY_HEIGHT / WINDOW_HEIGHT);
        return vmath.vector3(scale_x, scale_y, 0);
    }

    // left top right bottom world coordinates in screen
    function get_ltrb(win_space = true) {
        const w = win_space ? WINDOW_WIDTH : DISPLAY_WIDTH;
        const h = win_space ? WINDOW_HEIGHT : DISPLAY_HEIGHT;
        const bl = screen_to_world(0, 0);
        const br = screen_to_world(w, 0);
        //const tr = screen_to_world(w, h);
        const tl = screen_to_world(0, h);
        return vmath.vector4(bl.x, tl.y, br.x, bl.y);

    }

    function update_auto_zoom(width: number, height: number) {
        let dw = 0;
        let dh = 0;
        if (_zoom_width > 0 && _zoom_height > 0) {
            dw = _zoom_width;
            dh = _zoom_height;
        }
        else
            [dw, dh] = get_width_height();
        if (!is_auto_zoom)
            return;
        const window_aspect = width / height;
        const aspect = dw / dh;
        let zoom = 1;
        if (window_aspect >= aspect) {
            const height = dw / window_aspect;
            zoom = height / dh;
        }
        go_camera.set_view_area(dw, dh);
        set_zoom(zoom);
    }

    function set_auto_zoom(active: boolean, zoom_width = 0, zoom_height = 0) {
        is_auto_zoom = active;
        _zoom_width = zoom_width;
        _zoom_height = zoom_height;
        update_window_size(false);
    }

    function set_dynamic_orientation(active: boolean) {
        _dynamic_orientation = active;
        update_window_size(true);
    }

    function is_dynamic_orientation() {
        return _dynamic_orientation;
    }


    function calculate_view() {
        if (offset_to_center)
            go_camera.set_position_raw(camera_position.x - world_center_screen.x, camera_position.y - world_center_screen.y, camera_position.z);
        else
            go_camera.set_position_raw(camera_position.x, camera_position.y, camera_position.z);
    }


    function set_camera_position(x: number, y: number, z?: number) {
        camera_position.x = x;
        camera_position.y = y;
        camera_position.z = z || camera_position.z;
        calculate_view();
    }

    function set_offset_to_center(active: boolean) {
        offset_to_center = active;
        calculate_view();
    }

    init();

    return { set_camera_position, set_gui_projection, transform_input_action, set_go_prjection, get_ltrb, screen_to_world, window_to_world, get_zoom, set_zoom, world_to_window, world_to_screen, set_auto_zoom, set_dynamic_orientation, is_dynamic_orientation, update_window_size, set_offset_to_center, go_camera, camera_position };
}
