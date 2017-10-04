/**
 * schema总流程控制
 * 数据入口
 * 1. JSON schema
 * 2. UiConfig
 * 3. BizData
 */

/* jshint -W083 */

define(function(require, exports, module) {
    //
    var layoutManager = require('src/schema/layout/manager');
    var Field = require('src/schema/field');
    var caculate = require('src/schema/control/caculate');
    var assistant = require('src/base/common/assistant/model');
    var Tip = require('src/base/common/dialog/tip');
    var TabTip = require('src/base/common/dialog/tabtip');
    var spu = require('src/schema/async/spu');
    var helper = require('src/base/common/helper/filter');

    // 发布助手UI实例
    require('src/base/common/assistant/view');

    //
    var globalSchema = {};
    var globalUi = {};
    var globalBiz = {};
    var globalItems = [];

    //
    var reset = function() {
        //
        globalSchema = {};
        globalUi = {};
        globalBiz = {};
        globalItems = [];

        // 清空布局
        layoutManager.reset();

        // 清空发布助手
        assistant.clearErrors();
        helper.reset();
    };

    var findSchemaItem = function(id, pid) {
        return (_.find(globalItems, function(item) {
            if (pid) {
                return ((item.id === id) && item.get('pid') === pid);
            } else {
                return (item.id === id);
            }
        }));
    };

    var matchSchemaItem = function(query) {
        _.each(globalItems, function(item) {
            var title = item.get('title');
            if ((typeof title === 'string') && title.indexOf(query) !== -1) {
                warn(item.id, title);
            }
        });
    };

    //在保存前，移除所有类目属性和子属性的值
    var removeCategoryProperty = function(biz) {
        _.each(biz, function(value, id) {
            if (id.indexOf('prop_') === 0 || id.indexOf('subProp_') === 0) {
                delete biz[id];
            }
        });
    };

    // 在保存前，移除所有已知组件的值
    var removeKnownAttributes = function(biz) {
        var attributes = ['departurePlace', 'payment'];
        _.each(attributes, function(name) {
            delete biz[name];
        });
    };

    var collectBizData = function() {
        var bizData = globalBiz;
        removeCategoryProperty(bizData);
        removeKnownAttributes(bizData);

        _.each(globalItems, function(item) {
            // 不需要提交的数据
            if (!item.isSubmit()) {
                return;
            }

            // 空值也要提交，并按照数据类型，给数字0，布尔false，空字符串
            var value = item.value();
            if (as.util.isEmpty(value)) { //空值不提交，避免校验
                value = undefined;
            }

            var id = item.id;
            var subIds = id.split('.');
            var temp = bizData;
            for (var i = 0; i < subIds.length; ++i) {
                var subId = subIds[i];
                if (i === subIds.length - 1) {
                    temp[subId] = value;
                } else {
                    if (temp[subId] === undefined) {
                        temp[subId] = {};
                        temp = temp[subId];
                    } else if (_.isObject(temp[subId])) {
                        temp = temp[subId];
                    } else {
                        error('非叶子层级出现非对象值！ >> ' + id);
                    }
                }
            }
        });

        as.util.removeEmptyObject(bizData);
        return handleBizData(bizData);
    };

    // 最后处理一下业务数据
    var handleBizData = function(bizData) {
        // sku，若存在，去掉skuId
        var sku = bizData['sku'];
        if (_.isArray(sku) && sku.length > 0) {
            var rawSku = [];
            _.each(sku, function(skuItem) {
                var rawSkuItem = _.extend({}, skuItem);
                rawSkuItem['skuId'] = '';
                rawSku.push(rawSkuItem);
            });

            bizData['sku'] = rawSku;
        }

        // 兜底方案（白名单）
        // FIX:必填但不支持的业务，有该字段时，从默认值中取值，为其赋值
        // payment.payType，若custom布局中存在该字段，则要保证其有值（从default里面获取）
        var payType = findSchemaItem('payment.payType', 'custom');
        if (payType) {
            if (!_.isObject(bizData.payment)) {
                bizData.payment = {};
            }
            if (_.isUndefined(bizData.payment.payType)) {
                var defaults = fetchDefault(globalUi);
                if (_.isObject(defaults) && _.isObject(defaults.payment)) {
                    bizData.payment.payType = defaults.payment.payType;
                }
            }
        }

        return bizData;
    };

    /* 1.不要类目属性 2.不要sku */
    var collectCommonData = function() {
        var bizData = globalBiz;
        removeCategoryProperty(bizData);
        _.each(globalItems, function(item) {
            // 不需要提交的数据
            if (!item.isSubmit()) {
                return;
            }

            // 空值也要提交，并按照数据类型，给数字0，布尔false，空字符串
            var value = item.value();
            if (as.util.isEmpty(value)) { //空值不提交，避免校验
                value = undefined;
            }

            var id = item.id;
            if (id.indexOf('prop_') === 0 || id.indexOf('subProp_') === 0) { // 1.剔除类目属性
                value = undefined;
            }

            var subIds = id.split('.');
            var temp = bizData;
            for (var i = 0; i < subIds.length; ++i) {
                var subId = subIds[i];
                if (i === subIds.length - 1) {
                    temp[subId] = value;
                } else {
                    if (temp[subId] === undefined) {
                        temp[subId] = {};
                        temp = temp[subId];
                    } else if (_.isObject(temp[subId])) {
                        temp = temp[subId];
                    } else {
                        error('非叶子层级出现非对象值！ >> ' + id);
                    }
                }
            }
        });

        bizData['sku'] = undefined; // 2.剔除sku
        as.util.removeEmptyObject(bizData);
        as.util.removeUndefined(bizData);
        return bizData;
    };

    var fetchDefault = function(ui) {
        if (_.isObject(ui.global) && _.isObject(ui.global['default'])) {
            return ui.global['default'];
        } else {
            return {};
        }
    };

    var refresh = function(JSONSchema, ui, bizData) {
        reset();
        warn('refresh', bizData);

        globalSchema = _.extend({}, JSONSchema);
        globalUi = _.extend({}, ui);
        if (_.isEmpty(bizData)) {
            globalBiz = _.extend({}, fetchDefault(globalUi));
        } else {
            globalBiz = _.extend({}, bizData);
        }

        // 设置发布助手的提示文本集合
        if (_.isObject(globalUi.global)) {
            helper.init(globalUi.global.helper);
        }

        layoutManager.create(globalUi['ui']);

        var findSchema = function(ids, index, schema) {
            if (index >= ids.length) {
                error(ids.join('.'), 'JSON schema查询递归函数没有正常中止');
                return {};
            }

            if (schema === undefined) {
                warn(ids.join('.'), 'schema中找不到对应描述');
                return {};
            }

            var id = ids[index];
            var type = schema['type'];
            var properties;
            if (type === 'array') {
                var items = schema['items'];
                if (_.isArray(items) && items.length === 1) {
                    var itemSchema = items[0];
                    if (itemSchema['type'] === 'object') {
                        properties = itemSchema['properties'];
                    }
                }
            } else {
                properties = schema['properties'];
            }

            if (index < ids.length - 1) {
                if (_.isObject(properties)) {
                    schema = properties[id];
                    index += 1;
                    return arguments.callee(ids, index, schema);
                } else {
                    warn(ids.join('.'), 'schema中找不到对应描述');
                    return {};
                }
            }

            var required = schema['required'];
            var patternProperties = schema['patternProperties'];
            var normalSchema = _.isObject(properties) ? properties[id] : undefined;
            var isMust = _.isArray(required) ? (required.indexOf(id) !== -1) : false;

            if (normalSchema) {
                normalSchema = _.extend({}, normalSchema);
                if (isMust) {
                    normalSchema['must'] = isMust;
                }
                return normalSchema;
            } else {
                var patternSchema = _.find(patternProperties, function(schema, patternId) {
                    var regexId = new RegExp(patternId);
                    return regexId.test(id);
                });

                if (patternSchema) {
                    patternSchema = _.extend({}, patternSchema);
                    if (isMust) {
                        patternSchema['must'] = isMust;
                    }
                    return patternSchema;
                } else {
                    // alert('UI config节点在JSON schema中无匹配项 >> ' + ids.join('.'));
                    return {};
                }
            }
        };

        var findValue = function(ids, index, data) {
            if (index >= ids.length) {
                return;
            }

            var id = ids[index];
            if (!_.isObject(data)) {
                return;
            }

            if (index < ids.length - 1) {
                data = data[id];
                index += 1;
                return arguments.callee(ids, index, data);
            }

            return data[id];
        };

        // ui config
        _.each(layoutManager.allItems(), function(ui) {
            var item = {};

            var id = ui.id;
            var schema = findSchema(id.split('.'), 0, globalSchema);
            var value = findValue(id.split('.'), 0, globalBiz);

            item['id'] = id;
            item['schema'] = schema;
            item['ui'] = ui;
            item['value'] = value;

            // 构建模型
            var field = new Field({ 'schemaItem': item });
            globalItems.push(field);
        });

        // initControl
        _.each(globalItems, function(item) {
            item.initControl();
        });

        // relace schema item
        layoutManager.replaceToSchemaItem(findSchemaItem);
    };

    //
    var SchemaService = Backbone.Model.extend({
        events: {
            'beforeSchemaChanged': '给对话框之类的控件一个退出的时机',
            'schemaChanged': 'schema数据变更',
            'beforeSave': '保存之前，给插件一个回填数据的时机',
        },

        initialize: function() {
            // 设置表达式的值获取器
            caculate.registerValueHook(function(pathId) {
                var item = findSchemaItem(pathId);
                if (item) {
                    var value = item.value();
                    var dataType = item.get('dataType');
                    if (!_.isObject(value) && (dataType === 'number' || dataType === 'integer')) {
                        value = Number(value);
                    }
                    return value;
                }
            });
        },

        refresh: function(JSONSchema, ui, bizData) {
            var begin = new Date();

            reset();
            refresh(JSONSchema, ui, bizData);
            if (this.isChangeCid()) { // 如果正在切换类目，则将之前不认识的数据全部清空
                globalBiz = {};
                this.setChangeCid(false);
            }

            as.etc.detach();
            this.trigger('schemaChanged');

            // 使初始化状态生效
            var setActionInitStatus = function(action, item) {
                var status = item.get('initActionStatus');
                if (status[action] !== undefined) {
                    item.setActionStatus(action, status[action]);
                }
            };

            // 校正初始状态
            _.each(globalItems, function(item) {
                setActionInitStatus('disable', item);
                setActionInitStatus('readonly', item);

                var actions = item.get('actions');
                _.each(actions, function(action) {
                    action.check();
                });
            });

            // 校准spu状态
            spu.afterRenderSchema();
            debug('render cost >>', (new Date()) - begin, 'ms');
        },

        reset: function() {
            reset();
            as.etc.detach();
            this.trigger('schemaChanged');
        },

        getLayout: function(id) {
            // 返回顶层Layout对应的Model 
            return layoutManager.getLayout(id);
        },

        find: function(id, pid) {
            return findSchemaItem(id, pid);
        },

        match: function(query) {
            return matchSchemaItem(query);
        },

        validate: function(type) {
            var errorItems = [];
            _.each(globalItems, function(item) {
                item.validate();
                if ((!item.isDisable()) && item.hasError() && item.isSubmit()) {
                    errorItems.push(item);
                }
            });

            if (errorItems.length > 0) {
                assistant.updateErrors(errorItems);
            } else {
                assistant.clearErrors();
            }

            var text;
            var icon = '../img/tip-ok.png';
            if (errorItems.length === 0) {
                if (type === as.SAVE || type === as.UPLOAD) {
                    text = '保存成功！';
                } else if (type === as.VALIDATE) {
                    text = '验证无误！';
                }
            } else {
                icon = '../img/tip-warn.png';
                if (type === as.VALIDATE) {
                    text = '验证失败';
                } else if (type === as.SAVE) {
                    text = '保存成功，但是数据存在错误';
                } else if (type === as.UPLOAD) {
                    text = '保存成功，请先修改错误信息再上传';
                }
            }

            if (text) {
                (new Tip({ model: { 'text': text, 'icon': icon } })).render();
                if (as.popPlugin) { // 如果是插件被激活状态,fix
                    (new TabTip({ model: { 'text': text, 'icon': icon } })).render();
                }
            }

            return (errorItems.length === 0);
        },

        getBizData: function() {
            return collectBizData();
        },

        getCommonData: function() {
            return collectCommonData();
        },

        focus: function(id) {
            _.find(globalItems, function(item) {
                if (item.id === id) {
                    item.focus();
                    return true;
                }
            });
        },

        registerBeforeSaveHandler: function(cb) {
            var beforeSaveHandlers = this.get('beforeSaveHandlers');
            if (!beforeSaveHandlers) {
                beforeSaveHandlers = [];
                this.set('beforeSaveHandlers', beforeSaveHandlers);
            }

            if (_.isFunction(cb) && beforeSaveHandlers.indexOf(cb) === -1) {
                beforeSaveHandlers.push(cb);
            } else {
                error('重复注册beforeSave回调或者参数不为函数值');
            }
        },

        unregisterBeforeSaveHandler: function(cb) {
            var beforeSaveHandlers = this.get('beforeSaveHandlers');
            if (!beforeSaveHandlers) {
                return;
            }

            var index = beforeSaveHandlers.indexOf(cb);
            if (index !== -1) {
                beforeSaveHandlers.splice(index, 1);
            }
        },

        beforeSave: function(doSaveCb) {
            if (!_.isFunction(doSaveCb)) {
                return;
            }

            var beforeSaveHandlers = this.get('beforeSaveHandlers');
            if (_.isArray(beforeSaveHandlers) && beforeSaveHandlers.length > 0) {
                var size = beforeSaveHandlers.length;
                var counter = size;
                for (var i = 0; i < size; ++i) {
                    var handle = beforeSaveHandlers[i];
                    if (_.isFunction(handle)) {
                        handle(function() {
                            counter -= 1;
                            if (counter === 0) {
                                doSaveCb();
                            }
                        });
                    } else {
                        error('beforeSave的回调出现非函数值!');
                        counter -= 1;
                    }
                }
            } else {
                doSaveCb();
            }
        },

        getSpuFields: function() {
            var fields = [];
            _.each(globalItems, function(field) {
                if (field.isSpu()) {
                    fields.push(field);
                }
            });

            return fields;
        },

        setChangeCid: function(isChanged) {
            this.set('changeCid', isChanged);
        },

        isChangeCid: function() {
            return (this.get('changeCid') === true);
        },

        removeOneField: function(id) {
            var findIndex;
            _.find(globalItems, function(item, index) {
                if (item.id === id) {
                    findIndex = index;
                    return true;
                }
            });

            if (findIndex !== undefined) {
                warn('remove', globalItems[findIndex].id);
                globalItems.splice(findIndex, 1);
            }
        },

        addOneField: function(item) {
            if (_.isObject(item)) {
                warn('add', item.id);
                globalItems.push(item);
            }
        },

        getFindItemCb: function() {
            return findSchemaItem;
        },

        getInitData: function(id) {
            if (id) {
                return globalBiz[id];
            } else {
                globalBiz;
            }
        },

        removeBizData: function(id) {
            if (id) {
                globalBiz[id] = undefined;
            } else {
                globalBiz = {};
            }
        },

        getRawBiz: function() {
            return globalBiz;
        }
    });

    // schema数据服务实例
    module.exports = new SchemaService({});
});
