/**
 * action支持:
 * disable - true/false 元素从页面隐藏
 * readonly - true/false 元素只读
 *
 * 数据校验：
 * schema规则，统一在点击验证时才执行数据校验
 * 
 */
/* jshint -W116 */
/* jshint -W033 */
/* jshint -W030 */
/* jshint -W025 */
/* jshint -W028 */
/* jshint -W067 */

define(function(require, exports, module) {
    //----------------------------------------------------------------------------------------------------
    var blacks = ['enum', 'title', 'description', 'not', 'definitions', 'allOf', 'anyOf', 'oneOf', 'uniqueItems',
        'items', 'additionalItems', 'additionalProperties', 'dependencies', 'value', 'text'
    ];
    var isBlackKey = function(key) {
        // 对JSON schema关键字有一部分是不处理的
        // 对于黑名单之外，又无法处理的，应该报警
        return (blacks.indexOf(key) !== -1);
    };

    var schemaHanlder = require('src/schema/translate/schemahandler');
    var setSchema = function(schema) {
        if (!_.isObject(schema)) {
            this.set({ "isValid": false });
            return;
        }

        var me = this;
        _.each(schema, function(value, key) {
            if (isBlackKey(key)) {
                return;
            }

            var handle = schemaHanlder[key];
            if (!handle || !_.isFunction(handle)) {
                warn('不支持的schema关键字 >> ' + key);
                return;
            }

            handle(value, me, schema);
        });
    };

    var uiHandler = require('src/schema/translate/uihandler');
    var setUI = function(ui) {
        if (!_.isObject(ui)) {
            return;
        }

        var me = this;
        _.each(ui, function(value, key) {
            var handle = uiHandler[key];
            if (handle && _.isFunction(handle)) {
                handle(value, me, ui);
            } else {
                //不需要特殊处理的UI属性，挂到业务字段上，后续其他功能模块自行去取
                me.set(key, value);
            }
        });
    };

    /**
     * schemaItem {id:'', schmea:'', ui:'', value:''}
     */

    //body
    var Action = require('src/schema/control/action');
    var adjuster = require('src/base/datatype-adjuster');
    var asyncService = require('src/schema/async/service');
    var helper = require('src/base/common/helper/filter');
    var spu = require('src/schema/async/spu');

    var Model = Backbone.Model.extend({
        setProperties: function() {
            this.set({
                id: undefined,
                value: undefined,

                type: undefined, // UI类型
                dataType: undefined, // 数据类型
                title: "", // 标题
                reminders: [], // 提示集合
                rules: [], // 规则
                control: [], // 依赖关系
                precondition: [], // 前置条件\
                initActionStatus: {}, // 初始的action状态
                actionStatus: {}, // action列表状态
                actions: [], // 依赖模型
                async: [], // 异步
                sub: { // 当前字段的子属性
                    value: undefined,
                    props: []
                },

                //规则校验，错误汇总
                options: undefined,
                errors: [], // 规则校验的错误集合
                bizErrors: {}, // 自定义错误提示

                column: 0, // 在父容器中，所在列数，当为0时，为100%
                isValid: true, // 默认数据合法

                render: true, // 组件默认都是渲染的，可指定不渲染
                submit: true, // 默认数据是需要提交的，如果不需要提交，要显式将该值置为false
                prop: false, // 是否为类目属性，默认否
                spu: false, // 是否为关键属性，用于查询spu
            });
        },

        events: {
            textchange: undefined, // 文本变化（输入类型）
            valueChanged: undefined, // 字段值发生了变化
            spuChanged: undefined, // 关键属性发生变化，需要自动查询SPU
            valueUpdated: undefined, // 值已更新，通知ui刷新
            hasError: undefined, // 出现了错误 - 影响标题
            noError: undefined, // 没有错误 - 影响标题
            errorAdded: undefined, // 规则提示文本增加了 [name]
            errorChanged: undefined, // 规则提示文本改变了 [name]
            errorRemoved: undefined, // 规则提示文本删除了 [name]
            disableStatusChanged: undefined, // 元素生效状态
            readonlyStatusChanged: undefined, // 元素只读状态
            autoValueStatusChanged: undefined, // autoValue状态变化
            statusChanged: undefined, // action状态变化 [name, value]
            focus: undefined, // 焦点聚集到本业务单元,
            viewActived: undefined, // 当前组件对应的ui拥有鼠标指针
            stateUpdated: undefined, // 状态变更，通知view重新渲染
            reminderChanged: undefined, // 提示信息变更,prop重新渲染下
        },

        initialize: function() {
            // 设置默认值
            this.setProperties();

            // 设置基本值
            var schemaItem = this.get("schemaItem");
            this.set({ "id": schemaItem.id, "value": schemaItem.value });

            // 设置配置值
            setSchema.apply(this, [schemaItem.schema]);
            setUI.apply(this, [schemaItem.ui]);

            // 每一个模型都有可能向spu发射信号
            this.on('spuChanged', spu.onSpuChanged, spu);
        },

        "setSchema": setSchema,
        "setUI": setUI,

        addRule: function(rule) {
            var rules = this.get('rules');
            if (rules.indexOf(rule) === -1) {
                rule.install();
                rules.push(rule);
            }
        },

        removeRule: function(name) {
            var rules = this.get('rules');
            var findIndex;
            _.find(rules, function(rule, index) {
                if (rule.name === name) {
                    findIndex = index;
                    return true;
                }
            });

            if (findIndex !== undefined) {
                var rule = rules[findIndex];
                if (_.isFunction(rule.uninstall)) {
                    rule.uninstall();
                }
                rules.splice(findIndex, 1);
            }
        },

        findRule: function(name) {
            var rules = this.get('rules');
            var findRule;
            _.find(rules, function(rule) {
                if (rule.name === name) {
                    findRule = rule;
                    return true;
                }
            });

            return findRule;
        },

        doPrecheck: function(value) {
            var precondition = _.find(this.get('precondition'), function(condition) {
                return _.isEqual(condition.value(), value);
            });

            if (!_.isObject(precondition)) {
                return true;
            }

            if (precondition.isPass()) {
                return true;
            }

            var me = this;
            precondition.tryPass(function() {
                me.setValue(value);
            }, function() {
                // 通知控件重新渲染值
                me.trigger('valueUpdated');
            });
            return false;
        },

        setValue: function(value, forbidEvent) {
            // 如果只读或者失效，则不可写
            if (this.isDisable()) {
                return;
            }

            // 预检查，如果不通过则直接返回
            if (!this.doPrecheck(value)) {
                return;
            }

            // 从外面进来需要转型
            var rawValue = value;
            value = adjuster.adjust(value, this.get('dataType'));

            // 优化，避免没有意义的重新渲染
            var last = this.get('value');
            if (!_.isObject(value) && last === value) {
                if (rawValue != value) {
                    // 不产生真正写入时 -（针对输入类型的值）
                    // 如果写入的值和原始的值不一致，则通知视图更新真正写入的值
                    this.trigger('valueUpdated');
                }
                return;
            }

            // debug
            if (typeof(value) === 'object') {
                warn('set(' + this.id + ')', value);
            } else {
                warn('set(' + this.id + ')', value, 'last:', last);
            }

            // 写
            this.set({ 'value': value });
            if (rawValue != value) {
                // 产生真正写入时 -（针对输入类型的值）
                // 如果写入的值和原始的值不一致，则通知视图更新真正写入的值
                this.trigger('valueUpdated');
            }

            if (forbidEvent !== true) { // 可以禁用事件通知
                this.trigger('valueChanged');
            }

            // 响应必填规则
            if (!as.util.isEmpty(value)) {
                this.removeRuleError('must');
            }

            // 如果是关键属性，需要触发响应信号，自动查询spu
            if (this.isSpu()) {
                this.trigger('spuChanged');
            }

            // 如果有子属性，且当前值为空，则清空其所有子属性
            if (this.hasSubprop() && !value) {
                this.updateSubProp([]);
            }
        },

        value: function() {
            var actionStatus = this.get('actionStatus');
            if (!actionStatus.disable) {
                return this.get('value');
            }
        },

        addRuleError: function(name, text) {
            var errors = this.get('errors');
            var error = _.find(errors, function(error) {
                return (error.name === name);
            });

            text = this.handleErrorText(name, text);
            if (error) {
                if (error.text !== text) {
                    error.text = text;
                    this.trigger('errorChanged', name);
                }
            } else {
                error = { 'name': name, 'text': text };
                errors.push(error);
                this.trigger('errorAdded', name);
            }

            // 发送“存在错误”事件
            this.trigger('hasError');
        },

        handleErrorText: function(name, text) {
            var bizErrors = this.get('bizErrors');
            if (bizErrors[name]) {
                var bizError = bizErrors[name];
                var rule = this.findRule(name);
                rule = (_.isObject(rule) ? rule.value : '空');
                text = as.util.format(bizError, {
                    title: this.get('title'),
                    rule: rule,
                    value: _.isUndefined(this.value()) ? '空' : this.value()
                });
            }

            return text;
        },

        removeRuleError: function(name) {
            var findIndex;
            var errors = this.get('errors');
            _.find(errors, function(error, index) {
                if (error.name === name) {
                    findIndex = index;
                    return true;
                }
            });

            if (!_.isUndefined(findIndex)) {
                errors.splice(findIndex, 1);
                this.trigger('errorRemoved', name);

                // 发送“没有错误”事件
                if (errors.length === 0) {
                    this.trigger('noError', this.id);
                }
            }
        },

        hasError: function() {
            var errors = this.get('errors');
            return (errors.length > 0);
        },

        addReminder: function(reminder) {
            var reminders = this.get('reminders');
            if (reminders.indexOf(reminder) === -1) {
                reminders.push(reminder);
            }
        },

        addAction: function(action) {
            var control = this.get('control');
            if (control.indexOf(action) === -1) {
                control.push(action);
            }
        },

        setActionStatus: function(name, value) {
            var actionStatus = this.get('actionStatus');
            var lastValue = actionStatus[name];
            if (name === 'value' || as.util.isExp(value) || as.util.isExp(lastValue) || lastValue !== value) {
                var eventId = 'actionStatusChanged';
                if (name === 'disable') {
                    eventId = 'disableStatusChanged';
                } else if (name === 'readonly') {
                    eventId = 'readonlyStatusChanged';
                } else if (name === 'autoValue') {
                    eventId = 'autoValueStatusChanged';
                } else if (name === 'value') {
                    this.setValue(value);
                    this.trigger('valueUpdated');
                } else if (name === 'reminder') {
                    eventId = 'actionReminderChanged';
                } else if (name === 'estimateAmount') {
                    eventId = 'actionEstimateAmountChanged';
                }

                actionStatus[name] = value;
                this.trigger(eventId, name, value);

                // 如果是失效状态发生变化，同时发射值变化信号，解决链式依赖的问题
                if (eventId === 'disableStatusChanged') {
                    this.trigger('valueChanged');
                }
            }
        },

        getActionStatus: function(name) {
            var actionStatus = this.get('actionStatus');
            return actionStatus[name];
        },

        initControl: function() {
            // 为每一个control项，监听
            var me = this;
            var control = this.get('control');
            var actions = this.get('actions');
            _.each(control, function(actionCfg) {
                var action = new Action(_.extend({ 'field': me }, actionCfg));
                if (!action.isValid()) {
                    return;
                }

                var expression = action.get('expression');
                var depends = expression.depends();
                _.each(depends, function(depend) {
                    depend = as.schema.find(depend.substr(1));
                    if (depend) {
                        depend.on('valueChanged', action.check, action);
                    }
                });

                actions.push(action);
            });

            // 支持部分异步
            this.initAsync();
        },

        initAsync: function() {
            var me = this;
            var asyncs = [];
            _.each(this.get('async'), function(async) {
                var Async;
                if (_.isString(async.action) && async.action) {
                    Async = asyncService.get(async.action.toLowerCase());
                }
                if (_.isFunction(Async)) {
                    asyncs.push(new Async({ 'async': async, 'field': me }));
                }
            });
            this.set('async', asyncs);

            // 数据准备好以后，去初始化业务 
            this.initSomeAsync();
        },

        initSomeAsync: function() {
            this.initItemCheck();
            this.initGetSubprop();
            this.initBrandCheck();
        },

        findAsync: function(action) {
            action = action.toLowerCase();
            return (_.find(this.get('async'), function(async) {
                return (action === async.action());
            }));
        },

        initItemCheck: function() {
            // 支持单个针对自身的检查
            var me = this;
            var itemChecker = this.findAsync('checkQualification', this.get('async'));
            if (itemChecker) {
                itemChecker.setCb(function(error) {
                    if (error) {
                        me.addRuleError('checkitem' + itemChecker.method(), error);
                    } else {
                        me.removeRuleError('checkitem' + itemChecker.method());
                    }
                });
            }
        },

        initBrandCheck: function() {
            var find = function(list, id) {
                var index = -1;
                _.find(list, function(item, i) {
                    if (item.id === id) {
                        index = i;
                        return true;
                    }
                });

                return index;
            };

            var me = this;
            var brandChecker = this.findAsync('checkbrand', this.get('async'));
            if (brandChecker) {
                brandChecker.setCb(function(tip) {
                    var reminderId = 'checkbrand' + brandChecker.method();
                    var reminderList = me.get('reminders');
                    var findIndex = find(reminderList, reminderId);
                    if (tip) {
                        if (findIndex >= 0) {
                            reminderList[findIndex].text = tip;
                        } else {
                            var reminder = { mode: 'normal', level: 'warn', align: 'left', text: tip, id: reminderId };
                            reminderList.push(reminder);
                        }
                        me.trigger('reminderChanged');
                    } else {
                        if (findIndex >= 0) {
                            reminderList.splice(findIndex, 1);
                            me.trigger('reminderChanged');
                        }
                    }
                });

                // 尝试发起一次请求
                setTimeout(function(){
                    brandChecker.check();
                }, 200);
            }
        },

        initGetSubprop: function() {
            // 针对有值且有子属性的组件
            if (!this.hasSubprop() || !this.value()) {
                return;
            }

            var me = this;
            setTimeout(function() {
                var getSubprop = me.findAsync('getSubprop', me.get('async'));
                if (getSubprop) {
                    getSubprop.check();
                }
            }, 200);
        },

        dispatch: function(e) {
            // 转发消息
            var me = e.data;
            var eventId = e.type;
            var target = e.target;
            me.trigger(eventId, target);
        },

        column: function() {
            return this.get('column');
        },

        findOptionText: function(value) {
            var options = this.get('options');
            if (_.isArray(options)) {
                var option = _.find(options, function(option) {
                    return (option.value == value);
                });

                if (option) {
                    return option.text;
                }
            }
        },

        findOptionValue: function(text) {
            var options = this.get('options');
            if (_.isArray(options)) {
                var option = _.find(options, function(option) {
                    return (option.text === text);
                });

                if (option) {
                    return option.value;
                }
            }
        },

        validate: function() {
            // 失效字段不验证
            if (!this.isSubmit() || !this.get('render') || this.isDisable()) {
                return;
            }

            // 规则都必须关注valueChanged，那么直接发射该信号即可
            this.trigger('valueChanged', true); // true代表是数据校验

            // 响应必填规则
            var errors = this.get('errors');
            if (this.isMust() && _.isEmpty(errors) && as.util.isEmpty(this.value())) {
                this.addRuleError('must', '该字段不能为空');
            }
        },

        isMust: function() {
            return this.get('must');
        },

        isDisable: function() {
            return (this.get('actionStatus').disable === true);
        },

        isReadonly: function() {
            return (this.get('actionStatus').readonly === true);
        },

        focus: function() {
            this.trigger('focus');
        },

        isSubmit: function() {
            return (this.get('submit') !== false);
        },

        isProp: function() {
            return (this.get('prop') === true || this.get('spu') === true || this.get('sale') === true);
        },

        isSpu: function() {
            return (this.get('spu') === true);
        },

        hasSubprop: function() {
            return (this.get('subprop') === true);
        },

        isSale: function() {
            return (this.get('sale') === true || this.isCustomSale());
        },

        isCustomSale: function() {
            return (this.get('customsale') === true);
        },

        removeSubProp: function() {
            var lastStatus = {};
            var sub = this.get('sub');
            var ids = [];
            _.each(sub.props, function(prop) {
                // 递归删除
                prop.removeSubProp();
                ids.push(prop.id);

                var field = as.schema.find(prop.id);
                lastStatus[prop.id] = {
                    'value': field.value(),
                    'readonly': field.isReadonly()
                };

                as.schema.removeOneField(prop.id);
            });

            // 通知类目属性大组件移除指定组件
            as.schema.trigger('propRemoved', ids);

            sub.value = undefined;
            sub.props = [];

            return lastStatus;
        },

        updateSubProp: function(propsSchema) {
            var lastStatus = this.removeSubProp();

            var props = [];
            _.each(propsSchema, function(ui) {
                var item = {};
                item.id = ui.id;
                item.ui = ui;
                item.schema = {};

                // 如果上一次存在同样的字段，则去上一个字段的值
                if(lastStatus[item.id]){
                    item.value = lastStatus[item.id].value;
                }else{
                    item.value = as.schema.getInitData(ui.id);    
                }

                var field = new Model({ 'schemaItem': item });
                if (lastStatus[item.id]) {
                    field.setActionStatus('readonly', lastStatus[item.id].readonly);
                }

                as.schema.addOneField(field);
                props.push(field);
            });

            var sub = this.get('sub');
            sub.value = this.value();
            sub.props = props;

            // 通知类目组件插入子组件
            as.schema.trigger('propAdded', this.id, sub.props);

            // 初始化异步
            _.each(props, function(prop) {
                prop.initAsync();
            });
        },

        setActive: function($el) {
            helper.setCurrentComponent(this.id, $el);
        },

        // 通知view更新
        updateView: function() {
            this.trigger('stateUpdated');
        }
    });

    //
    module.exports = Model;
});
