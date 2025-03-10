/** @noResolution */
declare namespace native_camera {
    export function create(config: CameraConfig): CameraClass;
}




interface CameraConfig {
    orthographic: boolean;
    ortho_scale?: number;
    ortho_scale_mode?: any;
    view_area_width?: number;
    view_area_height?: number;

    fov?: number;
    near_z: number;
    far_z: number;

    position?: vmath.vector3;
    rotation?: vmath.quaternion;
}

interface CameraClass {
    set_orthographic: (is_orthographic: boolean) => void;
    set_ortho_scale: (scale: number) => void;
    get_ortho_scale: () => number;
    set_scale_mode: (scale_mode: any) => void;
    set_view_area: (width: number, height: number) => void;
    set_screen_size: (width: number, height: number) => void;
    set_anchor: (x: number, y: number) => void;
    set_fov: (fov: number) => void;
    set_near_z: (near_z: number) => void;
    set_far_z: (far_z: number) => void;
    set_position: (position: vmath.vector3) => void;
    set_position_raw: (x: number, y: number, z: number) => void;
    set_rotation: (rotation: vmath.quaternion) => void;
    set_rotation_raw: (x: number, y: number, z: number, w: number) => void;
    get_rotation: () => vmath.quaternion;
    get_rotation_to_quat: () => vmath.quaternion;
    get_rotation_raw: () => [number, number, number, number];
    get_view: () => vmath.matrix4;
    get_view_to_matrix: (mat: vmath.matrix4) => void;
    get_proj: () => vmath.matrix4;
    get_proj_to_matrix: (mat: vmath.matrix4) => void;
    get_frustum: () => vmath.matrix4;
    get_frustum_to_matrix: (mat: vmath.matrix4) => void;
    get_fov: () => number;
    get_near_z: () => number;
    get_far_z: () => number;
    get_position: () => vmath.vector3;
    get_position_to_vector3: (vec: vmath.vector3) => void;
    get_position_raw: () => [number, number, number];
    screen_to_world_ray: (screen_x: number, screen_y: number) => LuaMultiReturn<[vmath.vector3, vmath.vector3]>;
    screen_to_world_ray_to_vector3: (screen_x: number, screen_y: number, near_point: vmath.vector3, far_point: vmath.vector3) => void;
    screen_to_world_2d: (screen_x: number, screen_y: number) => LuaMultiReturn<[number, number]>;
    world_to_screen: (worldPos: vmath.vector3) => LuaMultiReturn<[number, number]>;
    screen_to_world_plane: (screen_x: number, screen_y: number, planeNormal: vmath.vector3, pointOnPlane: vmath.vector3) => LuaMultiReturn<[boolean, vmath.vector3 | null]>;
    screen_to_world_plane_to_vector3: (screen_x: number, screen_y: number, planeNormal: vmath.vector3, pointOnPlane: vmath.vector3, out: vmath.vector3) => boolean;
    screen_to_world_plane_raw: (screen_x: number, screen_y: number, planeNormal: vmath.vector3, pointOnPlane: vmath.vector3) => LuaMultiReturn<[boolean, number | null, number | null, number | null]>;

}