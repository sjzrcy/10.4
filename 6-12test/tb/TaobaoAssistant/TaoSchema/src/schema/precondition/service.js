/*
    # action不区分大小写
*/
define(function(require, exports, module) {
    var Model = function() {
        this.map = {};
    };

    Model.prototype.set = function(action, Constructor) {
        if (!action || !_.isString(action) || !_.isFunction(Constructor)) {
            return;
        }

        action = action.toLowerCase();
        if (this.map[action]) {
            error('前置条件Handle命名冲突!', action);
            return;
        }

        this.map[action] = Constructor;

    };

    Model.prototype.get = function(action) {
        if (_.isString(action)) {
            return this.map[action.toLowerCase()];
        }
    };

    // 导出实例
    var map = new Model();
    map.set('oversea', require('src/schema/precondition/oversea'));
    map.set('tax', require('src/schema/precondition/oversea'));

    // --------------------------------------------------------------------------
    // 导出
    module.exports = map;
});
