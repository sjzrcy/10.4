/**
 * 支持SPU自动匹配
 */

define(function(require, exports, module) {
    //
    var Tip = require('src/base/common/dialog/tip');

    // 根据返回数据刷新组件
    var update = function(spuSchema) {
        // 如果子属性接口正在跑，则等
        if (as.isRequestSubprop) {
            setTimeout(function() {
                spu.update(spuSchema);
            }, 400);
            return;
        }

        if (!spuSchema.result) {
            (new Tip({ model: { text: spuSchema.msg, icon: '../img/error.png', time: 800 } })).render();
            return;
        }

        // 组件更新：值更新，readonly状态更新，disable状态更新
        var items = spuSchema.data;
        _.each(items, function(item, id) {
            var field = as.schema.find(id);
            if (field) {
                var value = item.value;
                if (!_.isUndefined(value)) {
                    field.setActionStatus('value', value);
                }

                var readonly = item.readonly;
                if (_.isBoolean(readonly)) {
                    field.setActionStatus('readonly', readonly);
                }

                var disable = item.disable;
                if (_.isBoolean(disable)) {
                    field.setActionStatus('disable', disable);
                }
            }
        });

        // mock
        /*
        items.correctUrl = {
            "text": "!不，产品信息有误，<a href='//baike.taobao.com/edit.htm?id=8643936&t=1463629202364' target='_blank'>我要纠错</a>"
        };
        */

        var correctUrlFeild = as.schema.find('correctUrl');
        if (correctUrlFeild) {
            correctUrlFeild.set('text', items.correctUrl.text);
            correctUrlFeild.updateView();
        }

        /*
        items.spuInfo = [{
            "label": "!传感器类型",
            "value": "CMOS"
        }, {
            "label": "待机时间",
            "value": "384小时"
        }, {
            "label": "电池容量",
            "value": "2915毫安时"
        }, {
            "label": "厚度",
            "value": "7.1mm"
        }, {
            "label": "机身尺寸",
            "value": "158.1*77.8*7.1mm"
        }, {
            "label": "铃声",
            "value": "支持"
        }];
        */

        //
        var spuInfoFeild = as.schema.find('spuInfo');
        if (spuInfoFeild) {
            spuInfoFeild.set('ui', items.spuInfo);
            spuInfoFeild.updateView();
        }
    };

    // 执行请求
    var doRequest = function() {
        // 必须包含类目id，否则不执行的
        if (!as.entity.categoryId()) {
            return;
        }

        var fields = as.schema.getSpuFields();
        var value = {};
        _.each(fields, function(field) {
            value[field.id] = field.value();
        });

        // 加上title
        var titleField = as.schema.find('title');
        if (titleField) {
            value[titleField.id] = titleField.value();
        }

        as.shell.asyncGet(
            'spu',
            as.entity.categoryId(),
            as.entity.itemId(),
            value,
            function(resp) {
                var spuSchema;
                try {
                    spuSchema = JSON.parse(resp);
                } catch (e) {
                    spuSchema = {
                        result: false,
                        msg: '非法JSON，请检查！'
                    };
                }

                if (spuSchema.result) {
                    update(spuSchema.response);
                } else {
                    (new Tip({ model: { text: spuSchema.msg, icon: '../img/error.png', time: 800 } })).render();
                }
            });
    };

    // 使spu支持事件
    var spu = _.extend({}, Backbone.Events);

    // 关键属性变更
    spu.onSpuChanged = function() {
        setTimeout(function() {
            doRequest();
        }, 200);
    };

    // schema渲染完成以后
    spu.afterRenderSchema = function() {
        setTimeout(function(){
            doRequest();
        }, 1000);
    };

    // 导出
    module.exports = spu;
});
