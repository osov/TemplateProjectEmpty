/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */

interface Props {
    is_ready: boolean;
    use_only_projection: boolean;
    state_clear: any;

    view: vmath.matrix4;
    proj: vmath.matrix4;
    frustum: vmath.matrix4;
    proj_gui: vmath.matrix4;
    frustum_gui: vmath.matrix4;

    tile_pred: any;
    gui_pred: any;
    text_pred: any;
    particle_pred: any;
    model_pred: any;
}
const IDENTITY_MATRIX = vmath.matrix4();

function update_window(self: Props) {
    self.proj_gui = vmath.matrix4_orthographic(0, render.get_window_width(), 0, render.get_window_height(), -1, 1);
    self.frustum_gui = self.proj_gui * IDENTITY_MATRIX as vmath.matrix4;
}

export function init(self: Props) {
    self.view = vmath.matrix4();
    self.proj = vmath.matrix4();
    self.frustum = vmath.matrix4();

    self.is_ready = false;
    self.use_only_projection = false;
    self.tile_pred = render.predicate(["tile"]);
    self.gui_pred = render.predicate(["gui"]);
    self.text_pred = render.predicate(["text"]);
    self.particle_pred = render.predicate(["particle"]);
    self.model_pred = render.predicate(["model"]);

    self.state_clear = { [render.BUFFER_COLOR_BIT]: vmath.vector4(0, 0, 0, 0), [render.BUFFER_DEPTH_BIT]: 1, [render.BUFFER_STENCIL_BIT]: 0 };
    update_window(self);
}


export function update(self: Props) {
    if (!self.is_ready)
        return;
    const window_width = render.get_window_width();
    const window_height = render.get_window_height();
    if (window_width === 0 || window_height === 0)
        return;

    // clear screen buffers
    render.set_depth_mask(true);
    render.set_stencil_mask(0xff);
    render.clear(self.state_clear);

    const camera = Camera.go_camera;
    camera.get_view_to_matrix(self.view);
    camera.get_proj_to_matrix(self.proj);
    camera.get_frustum_to_matrix(self.frustum);

    render.set_viewport(0, 0, window_width, window_height);
    render.set_view(self.view);
    render.set_projection(self.proj);

    // render models
    /*
        render.set_blend_func(render.BLEND_SRC_ALPHA, render.BLEND_ONE_MINUS_SRC_ALPHA);
        //render.enable_state(render.STATE_CULL_FACE);
        render.enable_state(render.STATE_DEPTH_TEST);
        render.set_depth_mask(true);
        render.draw(self.model_pred, { frustum:self.frustum });
        render.set_depth_mask(false);
        render.disable_state(render.STATE_DEPTH_TEST);
        render.disable_state(render.STATE_CULL_FACE);
    */

    //render world(sprites, tilemaps, particles etc)
    render.set_blend_func(render.BLEND_SRC_ALPHA, render.BLEND_ONE_MINUS_SRC_ALPHA);
    render.enable_state(render.STATE_DEPTH_TEST);
    render.enable_state(render.STATE_STENCIL_TEST);
    render.enable_state(render.STATE_BLEND);
    render.draw(self.tile_pred, { frustum: self.frustum });
    render.draw(self.particle_pred, { frustum: self.frustum });
    render.disable_state(render.STATE_STENCIL_TEST);
    render.disable_state(render.STATE_DEPTH_TEST);
    //debug
    render.draw_debug3d();


    //render GUI
    let frustum_gui = self.frustum;
    if (!self.use_only_projection) {
        render.set_view(IDENTITY_MATRIX);
        render.set_projection(self.proj_gui);
        frustum_gui = self.frustum_gui;
    }
    render.enable_state(render.STATE_STENCIL_TEST);
    render.draw(self.gui_pred, { frustum: frustum_gui });
    render.draw(self.text_pred, { frustum: frustum_gui });
    render.disable_state(render.STATE_STENCIL_TEST);

}


export function on_message(self: Props, message_id: number, message: any) {
    if (message_id === to_hash("clear_color")) {
        self.state_clear[render.BUFFER_COLOR_BIT] = message.color;
    }
    else if (message_id == to_hash('window_resized')) {
        update_window(self);
    }
    else if (message_id === to_hash('MANAGER_READY')) {
        self.is_ready = true;
    }
    else if (message_id === hash('use_only_projection')) {
        self.use_only_projection = message.value;
    }
}