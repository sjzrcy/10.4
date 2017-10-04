define(function(require, exports, module) {
    /**
     * 前后端调用中转服务 
     *
     * 调用标准数据格式：
     * method "methodName"
     * params JSON
     * callback [可选]，转化为uuid暴露到window域下
     *
     */
    exports.invoke = function(json) {
        if (typeof(workbench) === 'object') {
            if (json && json['method']) {
                workbench.callWorkBenchFunction(JSON.stringify(json));
            } else {
                error('invoke[invalid json] >> ');
                error(json);
            }
        } else {
            error('invoke["workbench" object is not register]');
        }
    };

    /**
     * 创建UUID
     */
    exports.createUUID = function() {
        if (typeof(workbench) === 'object') {
            var uuid = workbench.createSequenceId();
            log('create uuid: ' + uuid);
            return uuid;
        } else {
            error('createUUID["workbench" object is not register]');
            return _.random(0, 99999999) + "r"; //网页上测试用
        }
    };
    //
});
