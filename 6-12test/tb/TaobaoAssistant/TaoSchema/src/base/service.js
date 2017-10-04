/**
 * 服务管理
 * service
 * {
 *     id:
 *     pid: 顶层服务或者是需要动态插入的服务，pid为占位符'as'
 *     order: > 0
 *     model: 和view至少存在一个构造函数
 *     view: 
 *     other: 自行约定，不做约束
 * }
 * 
 *
 * as 顶层pid，占位符
 * tab 顶层容器
 * 
 * 
 */

define(function(require, exports, module) {
    // 所有服务都被保存在这里 
    var serviceMap = {};

    var check = function(service) {
        return (_.isObject(service) && service['id'] && service['pid'] && service['order'] &&
            (_.isFunction(service['model']) || _.isFunction(service['view'])));
    };

    exports.register = function(service) {
        if (!check(service)) {
            return false;
        }

        var id = service['id'];
        var lastService = serviceMap[id];
        if (!lastService) {
            serviceMap[id] = service;
        } else {
            error('framework service register error >> 重复注册:' + id);
            return false;
        }

        return true;
    };

    exports.getModel = function(id) {
        var service = serviceMap[id];
        if (service) {
            return service.model;
        }
    };

    exports.getView = function(id) {
        var service = serviceMap[id];
        if (service) {
            return service.view;
        }
    };

    exports.get = function(id) {
        return serviceMap[id];
    };

    exports.getChildren = function(pid) {
        var children = [];
        _.each(serviceMap, function(service) {
            if (service.pid === pid) {
                children.push(service);
            }
        });

        // 排序，从小到大
        children = _.sortBy(children, function(service) {
            return service.order;
        });

        return children;
    };
});
