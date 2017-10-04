/**
 * 提供视图服务 
 * {type, view, }
 */

define(function(require, exports, module) {
    //
    var viewMap = {};

    //
    exports.register = function(type, view) {
        if (type && _.isFunction(view)) {
            if (!viewMap[type]) {
                viewMap[type] = view;
            } else {
                error('schema组件重复注册：', type);
                return false;
            }
        }

        return true;
    };

    exports.get = function(type) {
        return viewMap[type];
    };

});
