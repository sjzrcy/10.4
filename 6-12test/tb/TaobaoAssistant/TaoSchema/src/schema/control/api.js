/**
 * 表达式提供的内置接口集合
 */

define(function(require, exports, module) {
    // 判断包含关系
    exports.contain = function(container, element) {
        if (_.isArray(container) || _.isString(container)) {
            return (container.indexOf(element) !== -1);
        } else {
            return false;
        }
    };
    exports.include = function(container, element) {
        return exports.contain(container, element);
    };

    // 判断value是否为空
    exports.isEmpty = function(value) {
        if (_.isObject(value) || _.isString(value) || _.isUndefined(value)) {
            return _.isEmpty(value);
        } else {
            return !!value;
        }
    };

    // 获取对象数组中某子项的最小值
    exports.subMin = function(array, subId) {
        if (!_.isArray(array) || !_.isString(subId) || subId.length === 0) {
            return 0;
        }

        var minValue;
        for (var i = 0; i < array.length; ++i) {
            var sub = array[i];
            if (_.isObject(sub)) {
                var temp = Number(sub[subId]);
                if (_.isNaN(temp)) {
                    continue;
                }
                if (_.isUndefined(minValue) || temp < minValue) {
                    minValue = temp;
                }
            }
        }

        return _.isUndefined(minValue) ? 0 : minValue;
    };

    // 获取对象数组中某子项的最大值
    exports.subMax = function(array, subId) {
        if (!_.isArray(array) || !_.isString(subId) || subId.length === 0) {
            return 99999999;
        }

        var maxValue;
        for (var i = 0; i < array.length; ++i) {
            var sub = array[i];
            if (_.isObject(sub)) {
                var temp = Number(sub[subId]);
                if (_.isNaN(temp)) {
                    continue;
                }
                if (_.isUndefined(maxValue) || temp > maxValue) {
                    maxValue = temp;
                }
            }
        }

        // 如果还没填写，则默认最大值为一亿差1
        return _.isUndefined(maxValue) ? 99999999 : maxValue;
    };

    // 获取对象数组中某子项的和
    exports.subSum = function(array, subId) {
        var sumValue = 0;
        if (!_.isArray(array) || !_.isString(subId) || subId.length === 0) {
            return sumValue;
        }

        for (var i = 0; i < array.length; ++i) {
            var sub = array[i];
            if (_.isObject(sub)) {
                var temp = Number(sub[subId]);
                if (!_.isNaN(temp) && temp > 0) {
                    sumValue += temp;
                }
            }
        }

        return sumValue;
    };

    // 取出对象中‘value’属性值
    exports.value = function(obj) {
        if (_.isArray(obj)) {
            // 类目多选
            var res = [];
            for (var i = 0; i < obj.length; ++i) {
                if (_.isObject(obj[i])) {
                    res.push(obj[i].value);
                }
            }
            return res;
        } else if (_.isObject(obj)) {
            // 类目单选
            return obj['value'];
        } else if (obj) {
            // 类目文本
            return -1;
        }
    };

    // 检测变化，一旦执行到这里，必然是发生了变化，或者第一次计算
    // 隐患：当表达式中其他字段变化时，也会触发计算，会带来一定量的多余计算，不过影响不大
    exports.isChanged = function() {
        return true;
    };

    exports.isEdit = function() {
        return !!as.entity.itemId();
    };

    exports.isNumber = function(value) {
        return !isNaN(Number(value));
    };

    // 限制小数点位数
    exports.digitalCount = function(value, count) {
        var res = value;
        var str = String(value);
        var index = str.indexOf('.');
        if (index !== -1 && str.length > (index + count)) {
            str = str.substr(0, index + count + 1);
            res = Number(str);
        }

        return res;
    };

    // 乘法
    exports.multiply = function(num1, num2) {
        num1 = Number(num1);
        num2 = Number(num2);
        if (!isNaN(num1) && !isNaN(num2)) {
            return num1 * num2;
        } else {
            return 0;
        }
    };
});
