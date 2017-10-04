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
            error('异步命名冲突!', action);
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
    map.set('queryColor', require('src/schema/async/colorquery'));
    map.set('checkColor', require('src/schema/async/colorcheck'));
    map.set('updateQualification', require('src/schema/async/qualificationrefresh'));
    map.set('fillQualification', require('src/schema/async/qualificationfill'));
    map.set('checkQualification', require('src/schema/async/itemcheck'));
    map.set('getSubProp', require('src/schema/async/subpropget'));
    map.set('checkbrand', require('src/schema/async/brandcheck'));

    // --------------------------------------------------------------------------
    // 导出
    module.exports = map;
});
