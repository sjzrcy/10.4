define(function(require, exports, module) {
    // 字符常量
    var code_a = 'a'.charCodeAt(0);
    var code_z = 'z'.charCodeAt(0);
    var code_A = 'A'.charCodeAt(0);
    var code_Z = 'Z'.charCodeAt(0);
    var code_0 = '0'.charCodeAt(0);
    var code_9 = '9'.charCodeAt(0);
    var code_underline = '_'.charCodeAt(0);
    var code_dot = '.'.charCodeAt(0);

    //变量替换
    var replaceVariable = function(exp, ids) {
        for (var i = ids.length - 1; i >= 0; --i) {
            exp = replaceOneVariable(exp, ids[i]);
        }
        return exp;
    };

    var replaceOneVariable = function(exp, id) {
        var replace = 'v("' + id.substr(1) + '")';
        while (exp.indexOf(id) !== -1) {
            exp = exp.replace(id, replace);
        }
        return exp;
    };

    //导出
    var Expression = function(exp) {
        this.exp = exp;
    };

    Expression.prototype.depends = function() {
        //获取当前表达式中所有的变量，排重
        if (typeof(this.dependIds) !== 'undefined') {
            return this.dependIds;
        }

        var isVariableChar = function(c) {
            var code = c.charCodeAt(0);
            return ((code >= code_a && code <= code_z) || //a...z
                (code >= code_A && code <= code_Z) || //A...Z
                (code >= code_0 && code <= code_9) || //0...9
                (code === code_underline) || // '_'
                (code === code_dot)); // '.'
        };

        var patchAllUniqueVariable = function(exp) {
            var ids = [];
            if (typeof(exp) !== 'string') {
                return ids;
            }

            var start = -1; //变量起始位置，获取完毕后置-1
            var count = -1; //遇到$开始计数，获取完整的变量后，置为-1
            var isLastDot = false;

            var addVariable = function() {
                var id = exp.substr(start, count);
                if (ids.indexOf(id) === -1) {
                    ids.push(id);
                }

                start = -1;
                count = -1;
            };

            var error = function() {
                alert('表达式语法错误！变量格式错误，请检查！>> ' + exp);
                start = -1;
                count = -1;
                ids = [];
            };

            for (var index = 0; index < exp.length; ++index) {
                var c = exp[index];
                if (c === '$') {
                    if (start >= 0 || count > 0) {
                        error();
                        return;
                    }
                    count = 1;
                    start = index;
                } else if (isVariableChar(c)) {
                    if (start >= 0 && count > 0) {
                        //符号'.'不能重复
                        if (isLastDot && c === '.') {
                            error();
                            return;
                        }

                        isLastDot = (c === '.');
                        count += 1;
                    }
                } else {
                    if (start >= 0) {
                        if (count > 1) {
                            addVariable();
                        } else {
                            error();
                            return;
                        }
                    }
                }
            }

            if (start >= 0) {
                if (count > 1) {
                    addVariable();
                } else {
                    error();
                    return;
                }
            }

            return ids;
        };

        // id格式：$xx.xx.xx
        this.dependIds = patchAllUniqueVariable(this.exp);
        return this.dependIds;
    };

    Expression.prototype.replace = function() {
        return replaceVariable(this.exp, this.depends());
    };

    // 计算器
    var caculate = require('src/schema/control/caculate');
    Expression.prototype.caculate = function() {
        if (this.cacheExp === undefined) {
            this.cacheExp = this.replace();
        }

        var val = caculate.eval(this.cacheExp);
        log(this.cacheExp, val);
        return val;
    };

    //
    module.exports = Expression;
});
