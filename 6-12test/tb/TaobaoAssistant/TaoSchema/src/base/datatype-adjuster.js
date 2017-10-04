/**
 * 数据类型校正器
 */

/* jshint -W053 */

define(function(require, exports, module) {
    // 判断是否需要校正
    var isNeedAdjust = function(dataType) {
        return (dataType === 'number' || dataType === 'integer' || dataType === 'boolean');
    };

    // 简单类型
    var adjust = function(value, dataType) {
        // 如果非简单类型，则直接返回
        if (typeof value === 'object') {
            return value;
        }

        if (dataType === 'number') {
            value = parseFloat(value);
            if (isNaN(value)) { //如果非法就不要往后面传输了
                value = undefined;
            }
        } else if (dataType === 'integer') {
            value = parseInt(value);
            if (isNaN(value)) { //如果非法就不要往后面传输了
                value = undefined;
            }
        } else if (dataType === 'boolean') {
            value = (new Boolean(value));
        } else if (dataType === 'money') {
            value = as.util.subDigits(value, 2);
            warn(value, typeof value);
        }

        return value;
    };

    // 对象类型
    var adjustObject = function(object, config) {
        if (_.isObject(object) && _.isObject(config)) {
            _.each(object, function(value, key) {
                var dataType = config[key];
                if (isNeedAdjust(dataType)) {
                    object[key] = adjust(value, dataType);
                }
            });
        }

        return object;
    };

    // 校正接口
    exports.adjust = adjust;
    exports.adjustObject = adjustObject;
});
