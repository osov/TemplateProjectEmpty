local ____exports = {}
local CameraModule
function CameraModule()
    local get_zoom, set_zoom, update_window_size, update_center_screen, get_width_height, screen_to_world, get_ltrb, update_auto_zoom, calculate_view, set_camera_position, go_camera, DISPLAY_WIDTH, DISPLAY_HEIGHT, camera_position, world_center_screen, WINDOW_WIDTH, WINDOW_HEIGHT, is_auto_zoom, _dynamic_orientation, _zoom_width, _zoom_height, offset_to_center
    function get_zoom()
        return go_camera:get_ortho_scale()
    end
    function set_zoom(zoom)
        go_camera:set_ortho_scale(zoom)
        update_center_screen()
        set_camera_position(camera_position.x, camera_position.y, camera_position.z)
    end
    function update_window_size(is_trigger_event)
        if is_trigger_event == nil then
            is_trigger_event = true
        end
        local width, height = window.get_size()
        if width > 0 and height > 0 then
            WINDOW_WIDTH = width
            WINDOW_HEIGHT = height
        else
            Log.error("!!! window.get_size is", width, height)
        end
        go_camera:set_screen_size(width, height)
        update_auto_zoom(width, height)
        update_center_screen()
        set_zoom(get_zoom())
        if is_trigger_event then
            EventBus.trigger("SYS_ON_RESIZED", {width = width, height = height}, false)
        end
    end
    function update_center_screen()
        local ltrb = get_ltrb()
        world_center_screen.x = DISPLAY_WIDTH / 2
        world_center_screen.y = -math.abs(ltrb.y - ltrb.w) / 2
    end
    function get_width_height()
        if _dynamic_orientation then
            local is_portrait = DISPLAY_WIDTH < DISPLAY_HEIGHT
            local cur_is_portrait = WINDOW_WIDTH < WINDOW_HEIGHT
            if is_portrait ~= cur_is_portrait then
                return {DISPLAY_HEIGHT, DISPLAY_WIDTH}
            end
        end
        return {DISPLAY_WIDTH, DISPLAY_HEIGHT}
    end
    function screen_to_world(screen_x, screen_y)
        local x, y = go_camera:screen_to_world_2d(screen_x, screen_y)
        return vmath.vector3(x, y, 0)
    end
    function get_ltrb(win_space)
        if win_space == nil then
            win_space = true
        end
        local w = win_space and WINDOW_WIDTH or DISPLAY_WIDTH
        local h = win_space and WINDOW_HEIGHT or DISPLAY_HEIGHT
        local bl = screen_to_world(0, 0)
        local br = screen_to_world(w, 0)
        local tl = screen_to_world(0, h)
        return vmath.vector4(bl.x, tl.y, br.x, bl.y)
    end
    function update_auto_zoom(width, height)
        local dw = 0
        local dh = 0
        if _zoom_width > 0 and _zoom_height > 0 then
            dw = _zoom_width
            dh = _zoom_height
        else
            dw, dh = unpack(get_width_height())
        end
        if not is_auto_zoom then
            return
        end
        local window_aspect = width / height
        local aspect = dw / dh
        local zoom = 1
        if window_aspect >= aspect then
            local height = dw / window_aspect
            zoom = height / dh
        end
        go_camera:set_view_area(dw, dh)
        set_zoom(zoom)
    end
    function calculate_view()
        if offset_to_center then
            go_camera:set_position_raw(camera_position.x - world_center_screen.x, camera_position.y - world_center_screen.y, camera_position.z)
        else
            go_camera:set_position_raw(camera_position.x, camera_position.y, camera_position.z)
        end
    end
    function set_camera_position(x, y, z)
        camera_position.x = x
        camera_position.y = y
        camera_position.z = z or camera_position.z
        calculate_view()
    end
    go_camera = native_camera.create({orthographic = true, near_z = -1, far_z = 1})
    DISPLAY_WIDTH = tonumber(sys.get_config("display.width"))
    DISPLAY_HEIGHT = tonumber(sys.get_config("display.height"))
    local is_gui_projection = false
    camera_position = vmath.vector3(0, 0, 0)
    world_center_screen = vmath.vector3()
    WINDOW_WIDTH = DISPLAY_WIDTH
    WINDOW_HEIGHT = DISPLAY_HEIGHT
    is_auto_zoom = false
    _dynamic_orientation = false
    _zoom_width = 0
    _zoom_height = 0
    offset_to_center = false
    local function init()
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
        go_camera:set_view_area(DISPLAY_WIDTH, DISPLAY_HEIGHT)
        update_window_size()
    end
    local function set_gui_projection(value)
        is_gui_projection = value
        msg.post("@render:", "use_only_projection", {value = value})
    end
    local function transform_input_action(action)
        if is_gui_projection and action.x ~= nil then
            action.orig_x = action.x
            action.orig_y = action.y
            local wp = screen_to_world(action.x, action.y)
            local window_x, window_y = window.get_size()
            local stretch_x = window_x / gui.get_width()
            local stretch_y = window_y / gui.get_height()
            action.x = wp.x / stretch_x
            action.y = wp.y / stretch_y
        end
    end
    local function set_go_prjection(ax, ay, near, far)
        if near == nil then
            near = -1
        end
        if far == nil then
            far = 1
        end
        go_camera:set_anchor(ax, ay)
        go_camera:set_near_z(near)
        go_camera:set_far_z(far)
        update_window_size()
    end
    local function window_to_world(x, y)
        local scale_x = x / (DISPLAY_WIDTH / WINDOW_WIDTH)
        local scale_y = y / (DISPLAY_HEIGHT / WINDOW_HEIGHT)
        return screen_to_world(scale_x, scale_y)
    end
    local function world_to_screen(world)
        local x, y = go_camera:world_to_screen(world)
        return vmath.vector3(x, y, 0)
    end
    local function world_to_window(world)
        local sp = world_to_screen(world)
        local scale_x = sp.x * (DISPLAY_WIDTH / WINDOW_WIDTH)
        local scale_y = sp.y * (DISPLAY_HEIGHT / WINDOW_HEIGHT)
        return vmath.vector3(scale_x, scale_y, 0)
    end
    local function set_auto_zoom(active, zoom_width, zoom_height)
        if zoom_width == nil then
            zoom_width = 0
        end
        if zoom_height == nil then
            zoom_height = 0
        end
        is_auto_zoom = active
        _zoom_width = zoom_width
        _zoom_height = zoom_height
        update_window_size(false)
    end
    local function set_dynamic_orientation(active)
        _dynamic_orientation = active
        update_window_size(true)
    end
    local function is_dynamic_orientation()
        return _dynamic_orientation
    end
    local function set_offset_to_center(active)
        offset_to_center = active
        calculate_view()
    end
    init()
    return {
        set_camera_position = set_camera_position,
        set_gui_projection = set_gui_projection,
        transform_input_action = transform_input_action,
        set_go_prjection = set_go_prjection,
        get_ltrb = get_ltrb,
        screen_to_world = screen_to_world,
        window_to_world = window_to_world,
        get_zoom = get_zoom,
        set_zoom = set_zoom,
        world_to_window = world_to_window,
        world_to_screen = world_to_screen,
        set_auto_zoom = set_auto_zoom,
        set_dynamic_orientation = set_dynamic_orientation,
        is_dynamic_orientation = is_dynamic_orientation,
        update_window_size = update_window_size,
        set_offset_to_center = set_offset_to_center,
        go_camera = go_camera,
        camera_position = camera_position
    }
end
function ____exports.register_camera()
    _G.Camera = CameraModule()
end
return ____exports
