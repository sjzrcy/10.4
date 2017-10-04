/**
 *
 */
define(function(require, exports, module) {
    var AbstractRule = require('src/schema/rule/abstractrule');

    // type 控件类型
    exports['type'] = function(value, field, ui) {
        field.set({ 'type': value });
    };

    // dataType 强制指定数据类型
    exports['dataType'] = function(value, field, ui) {
        field.set({ 'dataType': value });
    };

    // title 标题
    exports['title'] = function(value, field, ui) {
        field.set({ 'title': value });
    };
    // label - title别名
    exports['label'] = exports['title'];

    // reminder 提示信息 
    exports['reminder'] = function(value, field, ui) {
        if (_.isArray(value)) {
            _.each(value, function(reminder) {
                field.addReminder(reminder);
            });
        } else if (_.isObject(value)) {
            field.addReminder(value);
        }
    };

    // rule 自定义规则
    exports['rule'] = function(value, field, ui) {
        if (_.isArray(value)) {
            _.each(value, function(rule) {
                if (AbstractRule.isValid(rule)) {
                    field.addRule(new AbstractRule(rule, field));
                }
            });
        } else if (_.isObject(value)) {
            if (AbstractRule.isValid(value)) {
                field.addRule(new AbstractRule(value, field));
            }
        }
    };

    // options 选项
    exports['options'] = function(value, field, ui) {
        if (!_.isArray(value)) {
            error('custom sale property, options must be array');
            return;
        }

        var options = [];
        _.each(value, function(option) {
            options.push(_.extend({}, option));
        });

        field.set({ 'options': options });
    };

    // style 布局方式 
    exports['style'] = function(value, field, ui) {
        field.set({ 'style': value });
    };

    // unit 单位信息-针对文本输入框 
    exports['unit'] = function(value, field, ui) {
        field.set({ 'unit': value });
    };

    // inputable 可输入-针对枚举类型
    exports['inputable'] = function(value, field, ui) {
        field.set({ 'inputable': value });
    };

    // column 如果被放进容器，所占列数
    exports['column'] = function(value, field, ui) {
        field.set({ 'column': value });
    };

    // biz 作为业务组件的一部分
    exports['biz'] = function(value, field, ui) {
        field.set({ 'biz': value });
    };

    // counter 作为业务组件的一部分
    exports['counter'] = function(value, field, ui) {
        field.set({ 'counter': value });
    };

    // control 描述组件间依赖关系
    exports['control'] = function(value, field, ui) {
        if (!_.isArray(value)) {
            return;
        }

        var control = field.get('control');
        if (_.isArray(control)) {
            value = control.concat(value);
        }

        field.set('control', value);
    };
    // reactions - control别名 
    exports['reactions'] = exports['control'];

    // must 强行指定必填
    exports['must'] = function(value, field, ui) {
        field.set('must', value);
    };
    // required - must别名
    exports['required'] = exports['must'];

    // default 默认值
    exports['default'] = function(value, field, ui) {
        var rawValue = field.value();
        if (rawValue === undefined) {
            field.set({ 'value': value });
        }
    };

    // 异步
    exports['async'] = function(value, field, ui) {
        var groups = [];
        if (!_.isArray(value) && _.isObject(value)) {
            groups.push(value);
        } else {
            groups = value;
        }

        field.set('async', groups);
    };

    // 示例图
    exports['sample'] = function(value, field, ui) {
        var sample = [];
        if (!_.isArray(value) && _.isObject(value)) {
            sample.push(value);
        } else {
            sample = value;
        }

        field.set('sample', sample);
    };

    // precondition 前置条件
    var preconditionService = require('src/schema/precondition/service');
    exports['precondition'] = function(value, field, ui) {
        var preconditions;
        if (_.isArray(value)) {
            preconditions = value;
        } else if (_.isObject(value)) {
            preconditions = [value];
        }

        var preconditionModel = field.get('precondition');
        _.each(preconditions, function(precondition) {
            var Precondition;
            if (_.isObject(precondition) && precondition.action) {
                Precondition = preconditionService.get(precondition.action);
            }

            if (_.isFunction(Precondition)) {
                preconditionModel.push(new Precondition(precondition));
            }
        });
    };

    // 可设置初始值-disable-写入到初始action状态集合中
    exports['disable'] = function(value, field, ui) {
        var initActionStatus = field.get('initActionStatus');
        initActionStatus.disable = value;
    };

    // 可设置初始值-readonly-写入到初始action状态集合中
    exports['readonly'] = function(value, field, ui) {
        var initActionStatus = field.get('initActionStatus');
        initActionStatus.readonly = value;
    };

    // -----------------------------  schema 规则支持  --------------------------------
    // decimalDigits 最多小数点位数
    var DecimalDigits = require('src/schema/rule/decimaldigits');
    exports['decimalDigits'] = function(value, field, ui) {
        var rule = new DecimalDigits(value, field);
        field.addRule(rule);
    };

    // minimum 最小值,支持uiconfig对schema规则的覆盖
    var Minimum = require('src/schema/rule/minimum');
    exports['minimum'] = function(value, field, ui) {
        var isExclusiveMinimum = (ui['exclusiveMinimum'] && ui['exclusiveMinimum'] === true);
        var rule = new Minimum(value, isExclusiveMinimum, field);
        field.removeRule('minimum');
        field.addRule(rule);
    };

    // maximum 最大值 
    var Maximum = require('src/schema/rule/maximum');
    exports['maximum'] = function(value, field, ui) {
        var isExclusiveMaximum = (ui['exclusiveMaximum'] && ui['exclusiveMaximum'] === true);
        var rule = new Maximum(value, isExclusiveMaximum, field);
        field.removeRule('maximum');
        field.addRule(rule);
    };

    // maxLength 字符串最大长度
    var MaxLength = require('src/schema/rule/maxlength');
    exports['maxLength'] = function(value, field, ui) {
        var rule = new MaxLength(value, field);
        field.addRule(rule);
    };

    // minLength 字符串最短长度
    var MinLength = require('src/schema/rule/minlength');
    exports['minLength'] = function(value, field, ui) {
        var rule = new MinLength(value, field);
        field.addRule(rule);
    };

    // 自定义错误信息
    exports['errors'] = function(value, field, ui) {
        if (_.isObject(value)) {
            field.set('bizErrors', value);
        }
    };
});
