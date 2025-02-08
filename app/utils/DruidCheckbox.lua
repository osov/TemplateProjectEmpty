local ____exports = {}
____exports.DruidCheckbox = function(druid, node_btn, func, checked_node, default_value)
    if default_value == nil then
        default_value = false
    end
    local is_checked = default_value
    druid:new_button(
        node_btn,
        function()
            is_checked = not is_checked
            if checked_node then
                gui.set_enabled(
                    gui.get_node(checked_node),
                    is_checked
                )
            end
            func(is_checked)
        end
    )
    return {}
end
return ____exports
