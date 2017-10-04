/**
 * schema 布局-global
 * ui: []
 */

define(function(require, exports, module) {
    // 布局模型
    var LayoutModel = require('src/schema/layout/model');

    var layouts = []; // 顶层布局
    var itemsCache = []; // 全量业务数据

    // 重置
    var reset = function() {
        layouts = [];
        itemsCache = [];
    };

    // 重置接口
    exports.reset = reset;

    // 创建过程
    exports.create = function(rawLayouts) {
        //
        reset();

        // 建立模型
        _.each(rawLayouts, function(rawLayout) {
            if (_.isObject(rawLayout)) {
                var layout = new LayoutModel({ 'layout': rawLayout });
                layouts.push(layout);
            } else {
                error('顶层布局数据异常：', rawLayout, '不为对象！');
            }
        });
    };

    exports.allItems = function() {
        if (itemsCache.length > 0) {
            return itemsCache;
        }

        _.each(layouts, function(rootLayout) {
            var items = rootLayout.allItems();
            if (items && items.length > 0) {
                itemsCache = itemsCache.concat(items);
            }
        });

        return itemsCache;
    };

    exports.replaceToSchemaItem = function(cbFindSchemaItem) {
        _.each(layouts, function(layout) {
            layout.replaceToSchemaItem(cbFindSchemaItem);
        });
    };

    exports.allLayouts = function() {
        return layouts;
    };

    exports.getLayout = function(id) {
        var layout = _.find(layouts, function(layout) {
            return (layout.id === id);
        });

        return layout;
    };
});
