/**
 * 所有的工具通过util透出
 */

/* jshint -W083 */

define(function(require, exports, module) {
    //
    var Tip = require('src/base/common/dialog/tip');

    /**
     * 计算字符串的md5值
     */
    exports.md5 = require('src/util/md5');

    /**
     * 动态加载css
     */
    exports.loadCSS = function(url, cbLoad, cbError) {
        if (!url || !_.isString(url)) {
            return;
        }

        var node = document.createElement('link');
        node.rel = 'stylesheet';
        node.type = 'text/css';
        node.href = url;

        node.onload = function() {
            console.log(url, '加载成功');
            if (_.isFunction(cbLoad)) {
                cbLoad();
            }
        };

        node.onerror = function() {
            console.log(url, '加载失败');
            if (_.isFunction(cbError)) {
                cbError();
            }
        };

        document.getElementsByTagName('head')[0].appendChild(node);
    };

    /**
     * 测量指定样式下，字符串的像素尺寸
     */
    exports.measureText = function(text, uiClass) {
        var $ui = $('<span>').addClass(uiClass).text(text);
        $("body").append($ui);

        var size = {
            width: $ui.width(),
            height: $ui.height()
        };

        $ui.remove();
        return size;
    };

    /**
     * 测量指定样式下，ui元素的像素尺寸
     */
    exports.measureUi = function($ui) {
        $("body").append($ui);

        var size = {
            width: $ui.width(),
            height: $ui.height()
        };

        $ui.detach();
        return size;
    };

    /**
     * 计算字符串byte长度
     */
    exports.bytes = function(str) {
        var bytes = 0;
        if (typeof(str) !== "string") {
            return bytes;
        }

        var code = 0;
        for (var i = 0; i < str.length; ++i) {
            // 英文字符长度为1，非英文字符长度为2 
            code = str.charCodeAt(i);
            bytes += ((code >= 0 && code <= 255) ? 1 : 2);
        }

        return bytes;
    };

    /**
     * 从字符串截byte长度
     */
    exports.subBytes = function(str, byteSize) {
        if (typeof(str) !== "string") {
            return '';
        }

        var bytes = 0;
        var code = 0;
        var length = 0;
        for (var i = 0; i < str.length; ++i) {
            // 英文字符长度为1，非英文字符长度为2 
            code = str.charCodeAt(i);
            bytes += ((code >= 0 && code <= 255) ? 1 : 2);
            if (bytes > byteSize) {
                length = i;
                break;
            }
        }

        if (bytes <= byteSize) { // 循环内没有break
            return str;
        } else {
            return str.substr(0, length);
        }
    };

    /**
     * 计算一个数字包含的小数点位数
     */
    exports.digits = function(n) {
        var str = Number(n).toString();
        if (str === 'NaN') {
            return 0;
        }

        // 直接使用用户输入的字符串更合理
        if (typeof(n) === 'string') {
            str = n;
        }

        var startIndex = str.indexOf('.');
        if (startIndex === -1) {
            return 0;
        }

        var digits = str.substr(startIndex + 1);
        return digits.length;
    };

    /* 最多保留N为小数 */
    exports.subDigits = function(n, count) {
        var str = Number(n).toString();
        if (str === 'NaN') {
            return n;
        }

        // 直接使用用户输入的字符串更合理
        if (typeof(n) === 'string') {
            str = n;
        }

        var startIndex = str.indexOf('.');
        if (startIndex >= 0) {
            str = str.substr(0, startIndex + count + 1);
        }

        return Number(str);
    };

    /**
     * 根据value查找option
     */
    exports.findOption = function(options, value) {
        if (_.isArray(options)) {
            var option = _.find(options, function(option) {
                return (option.value === value);
            });

            return option;
        }
    };

    /**
     * 根据text查找option
     */
    exports.findOptionByText = function(options, text) {
        if (_.isArray(options)) {
            var option = _.find(options, function(option) {
                return (option.text === text);
            });

            return option;
        }
    };

    /**
     * 判断text是否来自选项中
     */
    exports.isOptionText = function(options, text) {
        if (_.isArray(options)) {
            var option = _.find(options, function(option) {
                return (option.text === text);
            });

            return !!option;
        }
    };

    /**
     * 判断多选，某项是否被选中
     */
    exports.isChecked = function(field, value) {
        var values = field.value();
        if (values === undefined || !_.isArray(values) || value === undefined) {
            return;
        }

        var findIndex;
        _.find(values, function(valueItem, index) {
            if (value === valueItem) {
                findIndex = index;
                return true;
            }
        });

        return (findIndex !== undefined);
    };

    /**
     * 移除多选中的某一项
     */
    exports.removeOptionValue = function(field, value) {
        var values = field.value();
        if (values === undefined || !_.isArray(values) || value === undefined) {
            return;
        }

        var findIndex;
        _.find(values, function(valueItem, index) {
            if (value === valueItem) {
                findIndex = index;
                return true;
            }
        });

        if (findIndex !== undefined) {
            values.splice(findIndex, 1);
            field.setValue(values);
        }
    };

    /**
     * 增加多选中的某一项
     */
    exports.addOptionValue = function(field, value) {
        if (value === undefined) {
            return;
        }

        var values = field.value();
        if (!_.isArray(values)) {
            values = [];
        }

        var findIndex;
        _.find(values, function(valueItem, index) {
            if (value === valueItem) {
                findIndex = index;
                return true;
            }
        });

        // 不存在则添加进去
        if (findIndex === undefined) {
            values.push(value);
            field.setValue(values);
        }
    };

    /**
     * $box是否包含$el
     */

    var rect = function($widget) {
        var r = {};
        var offset = $widget.offset();
        r.x = offset.left;
        r.y = offset.top;
        r.w = $widget.width();
        r.h = $widget.height();
        return r;
    };

    var isContain = function(rect0, rect1) {
        return (rect0.x <= rect1.x && (rect1.x + rect1.w) <= (rect0.x + rect0.w)) &&
            ((rect0.y <= rect1.y && (rect1.y + rect1.h) <= (rect0.y + rect0.h)));
    };

    exports.isContain = function($box, $el) {
        return isContain(rect($box), rect($el));
    };

    exports.rect = function($el) {
        return rect($el);
    };

    var containPos = function($el, pos) {
        var r = rect($el);
        return (pos.x >= r.x && pos.x <= (r.x + r.w)) && (pos.y >= r.y && pos.y <= (r.y + r.h));
    };
    exports.containPos = containPos;

    // 获取当前鼠标绝对位置
    var cursorPos = function() {
        var bodyScrollLeft = $("body").scrollLeft();
        var cursorX = as.clientX + bodyScrollLeft;
        var bodyScrollTop = $("body").scrollTop();
        var cursorY = as.clientY + bodyScrollTop;

        return { "x": cursorX, "y": cursorY };
    };

    // 鼠标是否在ui元素上
    exports.isCoverCursor = function($el) {
        return containPos($el, cursorPos());
    };

    exports.numberOfPx = function(px) {
        var number;
        if (px && _.isString(px)) {
            var index = px.indexOf('px');
            if (index !== -1) {
                number = px.substr(0, px.length - 2);
                number = Number(number);
            }
        }

        return (_.isUndefined(number) ? 0 : number);
    };

    exports.memory = function() {
        var limit = parseInt(console.memory.jsHeapSizeLimit / (1024 * 1024));
        var total = parseInt(console.memory.totalJSHeapSize / (1024 * 1024));
        var used = parseInt(console.memory.usedJSHeapSize / (1024 * 1024));
        var percent = parseInt(console.memory.usedJSHeapSize * 100 / console.memory.totalJSHeapSize);

        console.error(percent, '%');
        console.warn('used:', used, 'MB');
        console.warn('total:', total, 'MB');
        console.warn('limit:', limit, 'MB');
    };

    // 表格合并接口
    exports.mergeTd = require('src/util/td-merge');

    // 判断schema value是否为空
    exports.isEmptyValue = function(value) {
        switch (typeof(value)) {
            case 'string':
                {
                    if (value.length === 0) {
                        return true;
                    }
                    break;
                }

            case 'object':
                {
                    if (_.isArray(value) && value.length === 0) {
                        return true;
                    } else {
                        return _.isEmpty(value);
                    }
                    break;
                }

            case 'undefined':
                {
                    return true;
                }

            default:
                {
                    return false;
                }
        }
    };

    var focusInText = function($el, tagName) {
        var $text = $(tagName, $el);
        if ($text.length > 0) {
            $text[0].focus();
            return true;
        }
    };

    // 定位
    exports.scrollTo = function(el) {
        if (!el) {
            return;
        }

        if (as.isInQN()) {
            el.scrollIntoView(false);
        } else {
            el.scrollIntoView(true);
            //校正
            var top = $('body').scrollTop();
            $('body').scrollTop(top - 52);
        }

        // 聚焦文本框
        if (focusInText($(el), 'input')) {
            return;
        }
        if (focusInText($(el), 'textarea')) {
            return;
        }
    };

    // twinkle 闪烁 默认3次
    exports.twinkle = function($el, count) {
        // 默认闪烁3次
        if (count === undefined) {
            count = 3;
        }

        //
        var PER = 200;
        for (var i = 0; i < count; ++i) {
            setTimeout(function() {
                $el.animate({ 'opacity': 0.0 }, 100);
            }, (2 * i) * PER);

            setTimeout(function() {
                $el.animate({ 'opacity': 1.0 }, 100);
            }, (2 * i + 1) * PER);
        }
    };

    exports.onClickATag = function($a) {
        var url = $a.attr('href');
        var login = !!$a.attr('login');
        if (_.isString(url) && url.length > 0) {
            if (url.indexOf('http:') === -1 && url.indexOf('https:') === -1) {
                url = as.DEFAUL_PROTOCOL + url;
            }
            // 跳转到外部浏览器打开链接
            as.shell.openUrl(url, login);
        }

        return false;
    };

    // reminder中a标签响应事件,协议头自动补全
    exports.handleATag = function($el) {
        $('a', $el).click(function() {
            return exports.onClickATag($(this));
        });
    };

    // 获取元素相对于body的绝对偏移和尺寸
    var absRect = function($e) {
        var rect = {};
        var offset = $e.offset();
        rect.x = offset.left;
        rect.y = offset.top;
        rect.width = $e.width();
        rect.height = $e.height();
        return rect;
    };
    exports.absRect = absRect;

    // show - relative, $e必须是body的直接孩子
    exports.relMove = function($e, $rel) {
        var rect = absRect($rel);
        $e.css({
            'top': (rect.y + rect.height) + 'px',
            'left': rect.x + 'px'
        });
    };

    // 数据判空
    exports.isEmpty = function(value) {
        return (value === '' || value === null || value === undefined || _.isEqual(value, []) || _.isEqual(value, {}));
    };

    exports.windowSize = function() {
        return {
            width: document.documentElement.clientWidth,
            height: document.documentElement.clientHeight
        };
    };

    var isObjectEmpty = function(obj) {
        var isEmpty = true;
        var self = arguments.callee;
        _.find(obj, function(value) {
            if (_.isObject(value)) {
                if (!self(value)) {
                    isEmpty = false;
                    return true;
                }
            } else if (value !== undefined) {
                isEmpty = false;
                return true;
            }
        });

        return isEmpty;
    };

    var removeEmptyObject = function(bizData) {
        var self = arguments.callee;
        _.each(bizData, function(value, key, biz) {
            if (_.isObject(value)) {
                if (isObjectEmpty(value)) {
                    biz[key] = undefined;
                } else {
                    self(value);
                }
            }
        });
    };

    exports.removeUndefined = function(bizData) {
        var self = arguments.callee;
        _.each(bizData, function(value, key, biz) {
            if (value === undefined) {
                delete biz[key];
            } else if (!_.isArray(value) && _.isObject(value)) {
                self(value);
            }
        });
    };

    // 处理空对象
    exports.isObjectEmpty = isObjectEmpty;
    exports.removeEmptyObject = removeEmptyObject;

    // 提示错误
    exports.showErrorTip = function(text) {
        (new Tip({ model: { 'text': text, icon: '../img/error.png' } })).render();
    };

    // 类目属性：选出自定义选项
    exports.pickCustomOptions = function(options) {
        var customOptions = [];
        if (_.isArray(options)) {
            _.each(options, function(option) {
                if (Number(option.value) < 0) {
                    customOptions.push(option);
                }
            });
        }

        return customOptions;
    };

    // 类目属性：枚举项是否被选中
    exports.isOptionChecked = function(item, options) {
        var isChecked = false;
        if (!_.isArray(options)) {
            return isChecked;
        }

        _.find(options, function(option) {
            if (option.value === item.value) {
                isChecked = true;
                return true;
            }
        });

        return isChecked;
    };

    // 获取全局唯一的id
    var prefix = 'F23B31F26E824A8A8B649B8A67AA56AB';
    var counter = 0;
    exports.genUniqueID = function() {
        counter += 1;
        return (prefix + counter);
    };

    exports.isGenID = function(id) {
        return (_.isString(id) && id.indexOf(prefix) !== -1);
    };

    // 字符串格式化
    exports.format = function(source, context) {
        _.each(context, function(value, key) {
            var exp = '\\{' + key + '\\}';
            var reg = new RegExp(exp, 'g');
            source = source.replace(reg, value);
        });
        return source;
    };

    // 对象深层拷贝，不丢失dest原有结构
    // 算法核心：不直接覆盖目标对象上的子对象
    exports.extend = function(dest, src) {
        var obj = _.extend({}, dest);
        var self = arguments.callee;
        _.each(src, function(value, key) {
            if (_.isArray(value)) {
                obj[key] = _.extend([], value);
            } else if (_.isObject(value)) {
                if (_.isObject(obj[key])) {
                    obj[key] = self(obj[key], value);
                } else {
                    obj[key] = _.extend({}, value);
                }
            } else {
                obj[key] = value;
            }
        });

        return obj;
    };

    // 从$input获取值，自动trim，也支持textarea
    exports.trimedValue = function($input) {
        var value = $input.val();
        var trimed = value.trim();
        if (trimed !== value) {
            $input.val(trimed);
        }

        return trimed;
    };

    // 提示错误
    var Tip = require('src/base/common/dialog/tip');
    exports.showErrorTip = function(text) {
        (new Tip({ model: { 'text': text, icon: '../img/error.png' } })).render();
    };
    exports.showOkTip = function(text) {
        (new Tip({ model: { 'text': text, icon: '../img/tip-ok.png' } })).render();
    };

    // promise队列起点
    exports.go = function() {
        var promise = $.Deferred();
        setTimeout(function() {
            promise.resolve();
        }, 0);
        return promise;
    };

    exports.toString = function(obj) {
        for (var key in obj) {
            console.warn(key, obj[key]);
        }
    };

    // 对象结构扁平化
    exports.flattening = function(prefix, obj, flattern) {
        var self = arguments.callee;
        _.each(obj, function(value, key) {
            var tkey = prefix ? (prefix + '.' + key) : key;
            if (_.isObject(value) && !_.isArray(value)) {
                self(tkey, value, flattern);
            } else {
                flattern[tkey] = value;
            }
        });
    };

    exports.toUrlParam = function(map) {
        var urlParam = '';
        _.each(map, function(value, key) {
            if (urlParam) {
                urlParam += '&';
            }

            urlParam += (key + '=' + value);
        });
        return urlParam;
    };

    exports.isExp = function(str) {
        return (typeof str === 'string' && str.indexOf('$') !== -1);
    };

    exports.isInOptions = function(value, options) {
        var isInOptions = false;
        if (_.isArray(options)) {
            _.find(options, function(option) {
                if (option.value === value) {
                    isInOptions = true;
                    return true;
                }
            });
        }

        return isInOptions;
    };

    exports.fetchUrl = function(jsonstr) {
        var url = '';
        var obj;
        try {
            obj = JSON.parse(jsonstr);
        } catch (e) {
            error('获取自动登录的url失败，非法JSON', jsonstr);
        }

        if (obj && obj.url) {
            url = obj.url;
        }
        if (obj && obj.params) {
            url += ('&' + obj.params);
        }

        return url;
    };

    exports.loadScript = function(url, cb) {
        var head = document.getElementsByTagName('head')[0];
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url;
        script.onload = script.onreadystatechange = function() {
            if ((!this.readyState || this.readyState === "loaded" || this.readyState === "complete")) {
                cb && cb();
                // 处理掉IE中的内存泄露
                script.onload = script.onreadystatechange = null;
                if (head && script.parentNode) {
                    head.removeChild(script);
                }
            }
        };

        head.insertBefore(script, head.firstChild);
    };

    exports.xssEncode = function(str) {
        return $('<div/>').text(str).html();
    };

    exports.xssDecode = function(str) {
        return $('<div/>').html(str).text();
    };

    var Expression = require('src/schema/control/expression');
    exports.testExp = function(exp) {
        console.log((new Expression(exp)).caculate());
    };
});
