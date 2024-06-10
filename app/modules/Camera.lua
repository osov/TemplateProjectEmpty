local ____exports = {}
local CameraModule
function CameraModule()
    local get_zoom, update_window_size, width_viewport, width_projection, get_viewport, unproject_xyz, unproject, screen_to_world, project, v4_tmp, DISPLAY_WIDTH, DISPLAY_HEIGHT, WINDOW_WIDTH, WINDOW_HEIGHT, _view_matrix, anchor_x, anchor_y, _near, _far, _zoom, _game_width
    function get_zoom()
        return _zoom
    end
    function update_window_size()
        local width, height = window.get_size()
        if width == 0 or height == 0 then
            return
        end
        if width == WINDOW_WIDTH and height == WINDOW_HEIGHT then
            return
        end
        WINDOW_WIDTH = width
        WINDOW_HEIGHT = height
        EventBus.trigger("SYS_ON_RESIZED", {width = width, height = height}, false)
    end
    function width_viewport()
        local w = _game_width / get_zoom()
        local h = WINDOW_HEIGHT / WINDOW_WIDTH * w
        local left = -w / 2
        local right = w / 2
        local bottom = -h / 2
        local top = h / 2
        local left_x = (DISPLAY_WIDTH - w) / 2
        if anchor_y == 1 then
            bottom = -h
            top = 0
        end
        if anchor_y == -1 then
            bottom = 0
            top = h
        end
        if anchor_x == -1 then
            left = left_x
            right = w + left_x
        end
        if anchor_x == 1 then
            left = -w
            right = 0
        end
        return {left, right, top, bottom}
    end
    function width_projection()
        local left, right, top, bottom = unpack(width_viewport())
        return vmath.matrix4_orthographic(
            left,
            right,
            bottom,
            top,
            _near,
            _far
        )
    end
    function get_viewport()
        return vmath.vector4(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT)
    end
    function unproject_xyz(inverse_view_projection, x, y, z)
        x = 2 * x / DISPLAY_WIDTH - 1
        y = 2 * y / DISPLAY_HEIGHT - 1
        z = 2 * z
        local inv = inverse_view_projection
        local x1 = x * inv.m00 + y * inv.m01 + z * inv.m02 + inv.m03
        local y1 = x * inv.m10 + y * inv.m11 + z * inv.m12 + inv.m13
        local z1 = x * inv.m20 + y * inv.m21 + z * inv.m22 + inv.m23
        return {x1, y1, z1}
    end
    function unproject(view, projection, screen)
        local inv = vmath.inv(projection * view)
        local ____unproject_xyz_result_0 = unproject_xyz(inv, screen.x, screen.y, screen.z)
        screen.x = ____unproject_xyz_result_0[1]
        screen.y = ____unproject_xyz_result_0[2]
        screen.z = ____unproject_xyz_result_0[3]
        return screen
    end
    function screen_to_world(x, y)
        local viewport = get_viewport()
        local viewport_width = viewport.z * DISPLAY_WIDTH / WINDOW_WIDTH
        local viewport_height = viewport.w * DISPLAY_HEIGHT / WINDOW_HEIGHT
        local viewport_left = viewport.x * DISPLAY_WIDTH / WINDOW_WIDTH
        local viewport_bottom = viewport.y * DISPLAY_HEIGHT / WINDOW_HEIGHT
        local s = vmath.vector3(x, y, 0)
        s.x = (s.x - viewport_left) * (DISPLAY_WIDTH / viewport_width)
        s.y = (s.y - viewport_bottom) * (DISPLAY_HEIGHT / viewport_height)
        return unproject(
            _view_matrix,
            width_projection(),
            s
        )
    end
    function project(view, projection, world)
        do
            do
                do
                    do
                        do
                            do
                                local ____ = v4_tmp.x
                                local ____ = v4_tmp.y
                            end
                            local ____ = v4_tmp.z
                        end
                        v4_tmp.w = world.x
                    end
                    local ____ = world.y
                end
                local ____ = world.z
            end
            local ____ = 1
        end
        local v4 = projection * view * v4_tmp
        world.x = (v4.x + 1) / 2 * DISPLAY_WIDTH
        world.y = (v4.y + 1) / 2 * DISPLAY_HEIGHT
        world.z = (v4.z + 0) / 2
        return world
    end
    local is_gui_projection = false
    v4_tmp = vmath.vector4()
    DISPLAY_WIDTH = tonumber(sys.get_config("display.width"))
    DISPLAY_HEIGHT = tonumber(sys.get_config("display.height"))
    local HIGH_DPI = tonumber(sys.get_config("display.high_dpi"))
    WINDOW_WIDTH = DISPLAY_WIDTH
    WINDOW_HEIGHT = DISPLAY_HEIGHT
    local dpi_ratio = 1
    _view_matrix = vmath.matrix4()
    anchor_x = 0
    anchor_y = 0
    _near = -1
    _far = 1
    _zoom = 1
    _game_width = DISPLAY_WIDTH
    local function init()
        update_window_size()
        local last_window_x = 0
        local last_window_y = 0
        timer.delay(
            0.1,
            true,
            function()
                local window_x, window_y = window.get_size()
                if last_window_x ~= window_x or last_window_y ~= window_y then
                    last_window_x = window_x
                    last_window_y = window_y
                    update_window_size()
                end
            end
        )
    end
    local function set_gui_projection(value)
        is_gui_projection = value
        msg.post("@render:", "use_only_projection", {value = value})
    end
    local function transform_input_action(action)
        if is_gui_projection and action.x ~= nil then
            local tp = screen_to_world(action.x, action.y)
            local window_x, window_y = window.get_size()
            local stretch_x = window_x / gui.get_width()
            local stretch_y = window_y / gui.get_height()
            action.x = tp.x / stretch_x
            action.y = tp.y / stretch_y
        end
    end
    local function set_go_prjection(ax, ay, near, far)
        if near == nil then
            near = -1
        end
        if far == nil then
            far = 1
        end
        anchor_x = ax
        anchor_y = ay
        _near = near
        _far = far
        msg.post("@render:", "use_width_projection", {anchor_x = anchor_x, anchor_y = anchor_y, near = near, far = far})
        update_window_size()
    end
    local function set_width_range(value)
        _game_width = value
        WINDOW_WIDTH = 1
        update_window_size()
    end
    local function get_width_range()
        return _game_width
    end
    local function set_zoom(zoom)
        _zoom = zoom
        msg.post("@render:", "set_zoom", {zoom = zoom})
    end
    local function set_view(view)
        _view_matrix = view
    end
    local function set_window_scaling_factor(scaling_factor)
        if HIGH_DPI then
            dpi_ratio = 1 / scaling_factor
        else
            dpi_ratio = 1
        end
    end
    local function window_to_world(screen_x, screen_y)
        local viewport = get_viewport()
        local viewport_width = viewport.z * DISPLAY_WIDTH / WINDOW_WIDTH
        local viewport_height = viewport.w * DISPLAY_HEIGHT / WINDOW_HEIGHT
        local viewport_left = viewport.x * DISPLAY_WIDTH / WINDOW_WIDTH
        local viewport_bottom = viewport.y * DISPLAY_HEIGHT / WINDOW_HEIGHT
        local scale_x = screen_x * dpi_ratio * DISPLAY_WIDTH / WINDOW_WIDTH
        local scale_y = screen_y * dpi_ratio * DISPLAY_HEIGHT / WINDOW_HEIGHT
        local screen = vmath.vector3(scale_x, scale_y, 0)
        screen.x = (screen.x - viewport_left) * (DISPLAY_WIDTH / viewport_width)
        screen.y = (screen.y - viewport_bottom) * (DISPLAY_HEIGHT / viewport_height)
        return unproject(
            _view_matrix,
            width_projection(),
            screen
        )
    end
    local function world_to_window(world)
        local screen = project(
            _view_matrix,
            width_projection(),
            vmath.vector3(world)
        )
        local scale_x = screen.x / (dpi_ratio * DISPLAY_WIDTH / WINDOW_WIDTH)
        local scale_y = screen.y / (dpi_ratio * DISPLAY_HEIGHT / WINDOW_HEIGHT)
        return vmath.vector3(scale_x, scale_y, 0)
    end
    local function get_ltrb()
        local inv = vmath.inv(width_projection() * _view_matrix)
        local bl_x, bl_y = unpack(unproject_xyz(inv, 0, 0, 0))
        local br_x, br_y = unpack(unproject_xyz(inv, DISPLAY_WIDTH, 0, 0))
        local tl_x, tl_y = unpack(unproject_xyz(inv, 0, DISPLAY_HEIGHT, 0))
        return vmath.vector4(bl_x, tl_y, br_x, bl_y)
    end
    init()
    return {
        set_gui_projection = set_gui_projection,
        transform_input_action = transform_input_action,
        set_go_prjection = set_go_prjection,
        get_ltrb = get_ltrb,
        screen_to_world = screen_to_world,
        window_to_world = window_to_world,
        get_zoom = get_zoom,
        set_zoom = set_zoom,
        set_view = set_view,
        world_to_window = world_to_window,
        width_projection = width_projection,
        set_width_range = set_width_range,
        get_width_range = get_width_range
    }
end
function ____exports.register_camera()
    _G.Camera = CameraModule()
end
return ____exports
