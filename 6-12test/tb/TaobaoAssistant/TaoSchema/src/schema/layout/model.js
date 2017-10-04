/**
 * schema 布局-model
 * 数据格式:
   {
      id: "ui"
    type: "layout",
    width: ,
    column: ,
    style: ,
    biz: ,
    layout: [
      {
        id: "price",
        type: "input",
        ...
      },
      {
        id: "basic",
        type: "layout",
        layout: {
          ...
        }
      },
      ...
    ]
   }
 */

define(function(require, exports, module) {
    // 
    var Field = require('src/schema/field');

    //
    var setChildren = function(items, parent) {
        var children = [];
        _.each(items, function(item) {
            if (item['type'] === 'layout') {
                var child = new LayoutModel({ 'layout': item, 'parent': parent });
                children.push(child);
            } else {
                if (!item.id) {
                    item.id = as.util.genUniqueID();
                    item.submit = false;
                }
                children.push(item.id);
            }
        });

        return children;
    };

    /**
     * 提取layout下所有业务字段
     */
    var patchItems = function(layout) {
        var items = [];
        var patch = function(layout) {
            if (layout['type'] !== 'layout') {
                return;
            }

            var me = arguments.callee;
            var pid = layout.id;
            _.each(layout['layout'], function(item) {
                if (item['type'] === 'layout') {
                    var spid = item.id;
                    _.each(item['layout'], function(sub) {
                        if (sub.type === 'layout') {
                            me(sub);
                        } else {
                            sub.pid = spid;
                            items.push(sub);
                        }
                    });
                } else {
                    item.pid = pid;
                    items.push(item);
                }
            });
        };

        patch(layout);
        return items;
    };

    /**
     * IN:
     * layout: { uiconfig }
     * parent: [可选]
     */
    module.exports = Backbone.Model.extend({
        initialize: function() {
            var layout = this.get('layout');
            // 布局id
            var id = layout.id;
            // type 都为layout布局类型
            var type = 'layout';
            // 容器默认长度为一个单位
            var width = layout.width ? layout.width : 1;
            // 子UI默认长度为一个单位，不设置则为0，此时为100%
            var column = layout.column ? layout.column : 0;
            // 排版方式
            var style = layout.style ? layout.style : 'vertical';
            // 任意样式
            var css = layout.css ? layout.css : {};
            // 业务组件标识
            var biz = layout.biz;
            // 子,若为布局则是对象；若为字段，则为字段id
            var children = setChildren(layout['layout'], this);

            // layout 的白名单属性，其他属性直接到layout属性上取
            this.set({
                'id': id,
                'type': type,
                'width': width,
                'column': column,
                'style': style,
                'css': css,
                'biz': biz,
                'children': children,
                'control': layout['control'],
                'reactions': layout['reactions'],
                'async': layout['async'],
                'mode': layout.mode
            });
        },

        getBizAttr: function(name) {
            var layout = this.get('layout');
            if (_.isObject(layout)) {
                return layout[name];
            }
        },

        children: function() {
            return this.get('children');
        },

        allItems: function() {
            return patchItems(this.get('layout'));
        },

        replaceToSchemaItem: function(cbFindSchemaItem) {
            var children = this.get('children');
            var pid = this.id;
            _.each(children, function(child, index, list) {
                if (_.isString(child)) {
                    var schemaItem = cbFindSchemaItem(child, pid);
                    if (schemaItem) {
                        list[index] = schemaItem;
                    } else {
                        error('can not find schema item >> ' + child);
                    }
                } else if (_.isObject(child)) {
                    child.replaceToSchemaItem(cbFindSchemaItem);
                }
            });
        },

        replaceChildren: function(children, valueSet) {
            // ------ clear ------
            var oldItems = patchItems(this.get('layout'));
            var oldValues = this.collectValues(oldItems, valueSet);
            this.removeOldItems(oldItems);
            this.set('children', []);

            // ------ update ------
            var layout = this.get('layout');
            layout.layout = children;
            this.set('children', setChildren(children, this));
            var newFields = this.addNewItems(patchItems(layout), oldValues);

            // ------ build ------
            // 初始化组件依赖
            _.each(newFields, function(field) {
                field.initControl();
            });

            // 1.组件替换,2.布局内组件模型已经动态更新，通知视图渲染
            this.replaceToSchemaItem(as.schema.getFindItemCb());
            this.trigger('schemaRefreshed');

            // 计算一次组件初始状态
            _.each(newFields, function(field) {
                var actions = field.get('actions');
                _.each(actions, function(action) {
                    action.check();
                });
            });
        },

        collectValues: function(items, valueSet) {
            var values = _.isObject(valueSet) ? valueSet : {};
            if (_.isArray(items)) {
                _.each(items, function(item) {
                    var field = as.schema.find(item.id, item.pid);
                    if (field) {
                        values[item.id] = field.value();
                    }
                });
            }
            return values;
        },

        removeOldItems: function(items) {
            if (_.isArray(items)) {
                _.each(items, function(item) {
                    as.schema.removeOneField(item.id);
                });
            }
        },

        addNewItems: function(items, oldValues) {
            var fields = [];
            _.each(items, function(item) {
                var field = new Field({
                    'schemaItem': {
                        id: item.id,
                        schema: {},
                        ui: item,
                        value: oldValues[item.id]
                    }
                });

                // 追加到全局业务字段
                as.schema.addOneField(field);
                fields.push(field);
            });

            return fields;
        },

        isTop: function() {
            return (this.get('parent') === undefined);
        },

        isEmpty: function() {
            var isEmpty = true;
            var children = this.children();
            for (var i = children.length - 1; i >= 0; --i) {
                var child = children[i];
                if (child.get('type') === 'layout') {
                    isEmpty = child.isEmpty();
                    if (!isEmpty) {
                        break;
                    }
                } else {
                    isEmpty = false;
                    break;
                }
            }
            return isEmpty;
        }
    });

    // 内部使用 
    var LayoutModel = module.exports;
});
