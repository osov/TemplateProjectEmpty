/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable prefer-const */
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
    let is_gui_projection = false;
    const v4_tmp = vmath.vector4();
    const DISPLAY_WIDTH = tonumber(sys.get_config("display.width"))!;
    const DISPLAY_HEIGHT = tonumber(sys.get_config("display.height"))!;
    const HIGH_DPI = tonumber(sys.get_config("display.high_dpi"));
    let WINDOW_WIDTH = DISPLAY_WIDTH;
    let WINDOW_HEIGHT = DISPLAY_HEIGHT;
    let dpi_ratio = 1;
    let _view_matrix = vmath.matrix4();
    let anchor_x = 0;
    let anchor_y = 0;
    let _near = -1;
    let _far = 1;
    let _zoom = 1;
    let _game_width = DISPLAY_WIDTH;

    function init() {
        update_window_size();
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
    }

    function set_gui_projection(value: boolean) {
        is_gui_projection = value;
        msg.post("@render:", "use_only_projection", { value });
    }


    function transform_input_action(action: any) {
        if (is_gui_projection && action.x !== undefined) {
            const tp = screen_to_world(action.x as number, action.y as number);
            const [window_x, window_y] = window.get_size();
            const stretch_x = window_x / gui.get_width();
            const stretch_y = window_y / gui.get_height();
            action.x = tp.x / stretch_x;
            action.y = tp.y / stretch_y;
        }
    }

    function set_go_prjection(ax: number, ay: number, near = -1, far = 1) {
        anchor_x = ax;
        anchor_y = ay;
        _near = near;
        _far = far;
        msg.post("@render:", "use_width_projection", { anchor_x, anchor_y, near, far });
        update_window_size();
    }

    function set_width_range(value: number) {
        _game_width = value;
        WINDOW_WIDTH = 1;
        update_window_size();
    }

    function get_width_range() {
        return _game_width;
    }


    function get_zoom() {
        return _zoom;
    }

    function set_zoom(zoom: number) {
        _zoom = zoom;
        msg.post("@render:", "set_zoom", { zoom });
    }

    function set_view(view: vmath.matrix4) {
        _view_matrix = view;
    }

    function update_window_size() {
        const [width, height] = window.get_size();
        if (width == 0 || height == 0)
            return;
        if (width == WINDOW_WIDTH && height == WINDOW_HEIGHT)
            return;
        WINDOW_WIDTH = width;
        WINDOW_HEIGHT = height;
        EventBus.trigger('SYS_ON_RESIZED', { width, height }, false);
    }

    function set_window_scaling_factor(scaling_factor: number) {
        if (HIGH_DPI)
            dpi_ratio = 1 / scaling_factor;
        else
            dpi_ratio = 1;
    }

    function width_viewport() {
        let w = _game_width / get_zoom();
        let h = WINDOW_HEIGHT / WINDOW_WIDTH * w;

        let left = -w / 2;
        let right = w / 2;
        let bottom = -h / 2;
        let top = h / 2;

        const left_x = (DISPLAY_WIDTH - w) / 2;
        // ----
        if (anchor_y == 1) {
            bottom = -h;
            top = 0;
        }

        if (anchor_y == -1) {
            bottom = 0;
            top = h;
        }

        if (anchor_x == -1) {
            left = left_x;
            right = w + left_x;
        }

        if (anchor_x == 1) {
            left = -w;
            right = 0;
        }
        return [left, right, top, bottom];
    }

    function width_projection() {
        const [left, right, top, bottom] = width_viewport();
        return vmath.matrix4_orthographic(left, right, bottom, top, _near, _far);
    }

    function get_viewport() {
        return vmath.vector4(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT); // lb w h
    }

    function unproject_xyz(inverse_view_projection: any, x: number, y: number, z: number) {
        x = (2 * x / DISPLAY_WIDTH) - 1;
        y = (2 * y / DISPLAY_HEIGHT) - 1;
        z = (2 * z);
        const inv = inverse_view_projection;
        const x1: number = x * inv.m00 + y * inv.m01 + z * inv.m02 + inv.m03;
        const y1: number = x * inv.m10 + y * inv.m11 + z * inv.m12 + inv.m13;
        const z1: number = x * inv.m20 + y * inv.m21 + z * inv.m22 + inv.m23;
        return [x1, y1, z1];
    }

    function unproject(view: vmath.matrix4, projection: vmath.matrix4, screen: vmath.vector3) {
        const inv = vmath.inv(projection * view as vmath.matrix4);
        [screen.x, screen.y, screen.z] = unproject_xyz(inv, screen.x, screen.y, screen.z);
        return screen;
    }

    function screen_to_world(x: number, y: number) {
        const viewport = get_viewport();
        const viewport_width = viewport.z * DISPLAY_WIDTH / WINDOW_WIDTH;
        const viewport_height = viewport.w * DISPLAY_HEIGHT / WINDOW_HEIGHT;
        const viewport_left = viewport.x * DISPLAY_WIDTH / WINDOW_WIDTH;
        const viewport_bottom = viewport.y * DISPLAY_HEIGHT / WINDOW_HEIGHT;

        const s = vmath.vector3(x, y, 0);
        s.x = (s.x - viewport_left) * (DISPLAY_WIDTH / viewport_width);
        s.y = (s.y - viewport_bottom) * (DISPLAY_HEIGHT / viewport_height);

        return unproject(_view_matrix, width_projection(), s);
    }

    function window_to_world(screen_x: number, screen_y: number) {
        const viewport = get_viewport();
        const viewport_width = viewport.z * DISPLAY_WIDTH / WINDOW_WIDTH;
        const viewport_height = viewport.w * DISPLAY_HEIGHT / WINDOW_HEIGHT;
        const viewport_left = viewport.x * DISPLAY_WIDTH / WINDOW_WIDTH;
        const viewport_bottom = viewport.y * DISPLAY_HEIGHT / WINDOW_HEIGHT;
        const scale_x = screen_x * dpi_ratio * DISPLAY_WIDTH / WINDOW_WIDTH;
        const scale_y = screen_y * dpi_ratio * DISPLAY_HEIGHT / WINDOW_HEIGHT;

        const screen = vmath.vector3(scale_x, scale_y, 0);
        screen.x = (screen.x - viewport_left) * (DISPLAY_WIDTH / viewport_width);
        screen.y = (screen.y - viewport_bottom) * (DISPLAY_HEIGHT / viewport_height);
        return unproject(_view_matrix, width_projection(), screen);
    }

    // -- Window coordinates are the non-scaled coordinates provided by action.screen_x and action.screen_y in on_input()
    function world_to_window(world: vmath.vector3) {
        const screen = project(_view_matrix, width_projection(), vmath.vector3(world));
        const scale_x = screen.x / (dpi_ratio * DISPLAY_WIDTH / WINDOW_WIDTH);
        const scale_y = screen.y / (dpi_ratio * DISPLAY_HEIGHT / WINDOW_HEIGHT);
        return vmath.vector3(scale_x, scale_y, 0);
    }

    function project(view: vmath.matrix4, projection: vmath.matrix4, world: vmath.vector3) {
        v4_tmp.x, v4_tmp.y, v4_tmp.z, v4_tmp.w = world.x, world.y, world.z, 1;
        const v4: vmath.vector3 = projection * view * v4_tmp as vmath.vector3;
        world.x = ((v4.x + 1) / 2) * DISPLAY_WIDTH;
        world.y = ((v4.y + 1) / 2) * DISPLAY_HEIGHT;
        world.z = ((v4.z + 0) / 2);
        return world;
    }

    // left top right bottom world coordinates in screen
    function get_ltrb() {
        const inv = vmath.inv(width_projection() * _view_matrix as vmath.matrix4);
        const [bl_x, bl_y] = unproject_xyz(inv, 0, 0, 0);
        const [br_x, br_y] = unproject_xyz(inv, DISPLAY_WIDTH, 0, 0);
        const [tl_x, tl_y] = unproject_xyz(inv, 0, DISPLAY_HEIGHT, 0);
        return vmath.vector4(bl_x, tl_y, br_x, bl_y);
    }
    init();

    return { set_gui_projection, transform_input_action, set_go_prjection, get_ltrb, screen_to_world, window_to_world, get_zoom, set_zoom, set_view, world_to_window, width_projection, set_width_range, get_width_range };
}
