/**
 * 支持SPU自动匹配
 */

define(function(require, exports, module) {
    //
    var Tip = require('src/base/common/dialog/tip');

    // 获取状态
    var getStatus = function(templateId, cb) {
        if (typeof(cb) !== 'function') {
            (new Tip({
                model: {
                    text: 'delivery状态查询接口中未传入回调!',
                    icon: '../img/error.png',
                    time: 800
                }
            })).render();
            return;
        }

        as.shell.asyncGet(
            'delivery',
            as.entity.categoryId(),
            as.entity.itemId(), { 'id': templateId },
            function(resp) {
                var status;
                try {
                    status = JSON.parse(resp);
                } catch (e) {
                    status = {
                        result: false,
                        msg: '非法JSON，请检查！'
                    };
                }

                if (status.result) {
                    cb(status.response);
                } else {
                    (new Tip({ model: { text: status.msg, icon: '../img/error.png', time: 800 } })).render();
                }
            });
    };

    var deliver = _.extend({}, Backbone.Events);
    deliver.getStatus = getStatus;

    // 导出
    module.exports = deliver;
});
