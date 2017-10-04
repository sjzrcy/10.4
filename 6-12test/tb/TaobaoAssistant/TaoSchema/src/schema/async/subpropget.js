/*
{
	action: "getSubprop"
}
*/

define(function(require, exports, module) {
    var Async = require('src/schema/async/base');
    module.exports = Async.extend({
        initialize: function() {
            Async.prototype.initialize.apply(this, arguments);
            this.field.set('subprop', true);
        },

        doResponse: function(response) {
            if (response.result) {
                if (_.isObject(response.data) && _.isArray(response.data.items)) {
                    if (this.field.value()) {
                        this.field.updateSubProp(response.data.items);
                    } else {
                        error('属性值为空，不该存在的异常流程');
                        this.field.updateSubProp([]);
                    }
                } else {
                    error('子属性接口返回值异常', response);
                }
            } else {
                as.util.showErrorTip(response.msg);
            }

            // 返回时重置
            as.isRequestSubprop = false;
        }
    });
});
