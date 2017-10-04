/**
 * 异步处理基类
 * 
 * 初始化
 * 1.建立监听
 * 2.收集数据，发送请求
 * 3.处理返回结果
 * 4.执行业务（基类为空函数，子类处理）
 *
 *
 {
    module: '', （是什么？）用于后端路由
    params: {},（要什么？）用于端收集请求参数
    condition: [], （何时触发？）端执行请求的时机
    action: '',（如何处理？）用于端的路由
 }
 * 
 * 内部数据：
 * 1.async{module: '', params: {}, condition: '', action: ''}
 * 2.field[可选，基类不使用]，基于业务组件的一定会有，全局的肯定没有
 *
 * 接口约定：
 * onResponse 必选 - 处理返回结果
 * doParams 可选 - 请求前对参数进行处理
 * doException 可选 - 异常返回，处理一些收尾工作
 *
 */

define(function(require, exports, module) {
    //
    var Expression = require('src/schema/control/expression');
    var Tip = require('src/base/common/dialog/tip');

    //
    var Base = Backbone.Model.extend({
        initialize: function() {
            this.async = this.get('async');
            this.async.action = this.async.action.toLowerCase(); // action不区分大小写
            this.field = this.get('field'); // 可选，不一定有
            this.expCache = {}; // 表达式缓存
            this.listen();
        },

        destroy: function() {
            var me = this;
            _.each(this.exp.depends(), function(depend) {
                depend = as.schema.find(depend.substr(1));
                if (depend) {
                    depend.off('valueChanged', me.check, me);
                }
            });
        },

        listen: function() {
            this.exp = new Expression(this.async.condition);
            var depends = this.exp.depends();

            var me = this;
            _.each(depends, function(depend) {
                depend = as.schema.find(depend.substr(1));
                if (depend) {
                    depend.on('valueChanged', me.check, me);
                }
            });
        },

        check: function(isValidate) {
            // 如果是验证，则不需要触发异步
            if (isValidate) {
                return;
            }

            if (this.exp.caculate()) {
                debug('asyncCheck[true]', _.isObject(this.field) ? this.field.id : 'no field');
                this.doRequest();
            }
        },

        doRequest: function() {
            if (this.action() === 'getSubprop') {
                as.isRequestSubprop = true;
                setTimeout(function() {
                    as.isRequestSubprop = false;
                }, 5 * 1000);
            }

            as.shell.asyncGet(
                this.method(),
                as.entity.categoryId(),
                as.entity.itemId(),
                this.getParams(),
                this._onResponse.bind(this)
            );
        },

        method: function() {
            var async = this.get('async');
            return async.module;
        },

        action: function() {
            var async = this.get('async');
            return async.action;
        },

        getParams: function() {
            var me = this;
            var async = this.get('async');

            var params = _.extend({}, async.params);
            _.each(async.params, function(value, key) {
                if (as.util.isExp(value)) {
                    if (!me.expCache[key]) {
                        me.expCache[key] = new Expression(value);
                    }
                    params[key] = me.expCache[key].caculate();
                }
            });

            return this.doParams(params);
        },

        /* 助理包了一层皮
            {
                result: boolean,
                msg: string,
                response: 业务接口的真正返回
            }
        */
        _onResponse: function(jsonStr) {
            var response = JSON.parse(jsonStr);
            try {
                response = JSON.parse(jsonStr);
            } catch (e) {
                response = {
                    result: false,
                    msg: ('非法JSON，请检查！ >> ' + this.async.module)
                };
            }

            if (response.result) {
                this.doResponse(response.response);
            } else {
                this.doException();
                (new Tip({ model: { text: response.msg, icon: '../img/error.png', time: 800 } })).render();
            }
        },

        // 子类必须实现返回结果处理
        doResponse: function(response) {
            error('请具体业务实现者处理自己的异步返回结果！！！ >> ', this.async.module, this.async.action);
        },

        // 子类可对参数进行加工
        doParams: function(params) {
            return params;
        },

        // 子类可处理异常
        doException: function() {
            warn('具体业务实现者可处理异常返回！！！ >> ', this.async.module, this.async.action);
        }
    });

    module.exports = Base;
});
