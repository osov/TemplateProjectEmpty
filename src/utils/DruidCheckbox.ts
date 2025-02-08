
export const DruidCheckbox = (druid: DruidClass, node_btn: string, func: (v: boolean) => void, checked_node?: node, default_value = false) => {
    let is_checked = default_value;

    druid.new_button(node_btn, () => {
        is_checked = !is_checked;
        if (checked_node)
            gui.set_enabled(gui.get_node(checked_node), is_checked);

        func(is_checked);
    });


    
    return {
        //
    };
};
