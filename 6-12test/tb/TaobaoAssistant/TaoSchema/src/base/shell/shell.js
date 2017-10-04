/**
 * @file shell，助理后端提供的服务接口
 * @remark，<< 回调参数必须为单参，如果参数较多，用json包装 >>
 */
define(function(require, exports, module) {
    //
    var native;
    if (window.asHost === 'qn') {
        native = require('src/base/shell/native-qn');
    } else {
        native = require('src/base/shell/native');
    }

    var translate = require('src/base/shell/translate');
    var wrap = require('src/base/shell/wrap');
    var callback = require('src/base/shell/callback');

    var ImagePicker = require('src/base/common/dialog/imagespace');
    var VideoPicker = require('src/base/common/dialog/video');

    var METHOD = 'method';
    var PARAMS = 'params';
    var CALLBACK = 'callback';

    //
    exports.createUUID = function() {
        return native.createUUID();
    };

    // 通过系统默认浏览器打开链接，支持自动登录
    exports.openUrl = function(url, isAutoLogin) {
        var json = {};
        json[METHOD] = 'openUrl';
        json[PARAMS] = { 'url': url, 'isAutoLogin': isAutoLogin };

        native.invoke(json);
    };

    // 获取自动登录的url
    var loginQueue = require('src/base/shell/loginqueue');
    var autoLoginFailCount = 0;
    exports.getAutoLoginUrl = function(url, cb) {
        log('getAutoLoginUrl >> ', url);
        var wrapCb = function(jsonStr) {
            log('getAutoLoginUrl << ', jsonStr);
            // 服务器重启或者异常之后， 会出现插件登录失败的情况， 若连续失败多次， 建议用户退出重登
            {
                var url = as.util.fetchUrl(jsonStr);
                if (!url) {
                    autoLoginFailCount += 1;
                }
                if (autoLoginFailCount > 10) {
                    alert('助理依赖的外部插件登录异常，您可以尝试退出程序重新登录解决');
                    autoLoginFailCount = 0;
                }
            }

            if (_.isFunction(cb)) {
                cb(jsonStr);
            }
        };

        var json = {};
        json[METHOD] = 'getAutoLoginUrl';
        json[PARAMS] = { 'url': url };
        json[CALLBACK] = translate(wrapCb);

        loginQueue.push(json);
    };

    // 选择图片
    exports.choosePictures = function(cb, type) {
        var json = {};
        json[METHOD] = 'choosePictures';
        if (type) {
            json[PARAMS] = { type: type };
        }
        json[CALLBACK] = translate(cb);

        native.invoke(json);
    };

    // 图片空间-线上组件
    exports.pickImage = function(maxCount, cb) {
        var picker = new ImagePicker({
            'model': {
                title: '选择图片',
                max: maxCount,
                cb: cb
            }
        });

        picker.render();
    };

    // 选择视频
    exports.chooseVideo = function(cb) {
        var json = {};
        json[METHOD] = 'chooseVideo';
        json[CALLBACK] = translate(cb);

        native.invoke(json);
    };

    // 视频中心-线上组件
    exports.pickVideo = function(maxCount, cb) {
        var picker = new VideoPicker({
            'model': {
                title: '选择视频',
                max: maxCount,
                cb: cb
            }
        });

        picker.render();
    };

    // 选择类目
    exports.chooseCategory = function(lastCid, cb) {
        var json = {};
        json[METHOD] = "chooseCategory";
        json[PARAMS] = { "lastCid": lastCid };
        json[CALLBACK] = translate(cb);

        native.invoke(json);
    };

    // 保存数据，除了业务本身，还包括类目id，clientId等
    exports.saveEntity = function(clientId, bizData, isValidateOk, cb) {
        var json = {};
        json[METHOD] = 'saveData';
        json[PARAMS] = { 'clientId': clientId, 'bizData': bizData, 'validate': (isValidateOk === true) };
        json[CALLBACK] = translate(cb);

        native.invoke(json);
    };

    // 加载宝贝时，获取JSONSchema，UIConfig，data
    exports.getAllSchema = function(cid, clientId, cb) {
        var json = {};
        json[METHOD] = 'getAllDataByClientIdAndCid';
        json[PARAMS] = { 'cid': cid, 'clientId': clientId };
        json[CALLBACK] = translate(wrap.time('getAllDataByClientIdAndCid', cb));
        callback.register(json[CALLBACK]);

        native.invoke(json);
    };

    // 切换类目时，重新获取JSONSchema和UIConfig
    exports.getJSONSchemaAndUIConfig = function(cid, cb) {
        var json = {};
        json[METHOD] = 'getJsonSchemaAndUiConfig';
        json[PARAMS] = { 'cid': cid };
        json[CALLBACK] = translate(wrap.time('getJsonSchemaAndUiConfig', cb));
        callback.register(json[CALLBACK]);

        native.invoke(json);
    };

    // 批量获取schema和uiconfig的值
    exports.getJSONSchemaAndUIConfigs = function(cidList, cb) {
        var json = {};
        json[METHOD] = 'getJsonSchemaAndUiConfigs';
        json[PARAMS] = cidList;
        json[CALLBACK] = translate(wrap.time('getJsonSchemaAndUiConfigs', cb));
        native.invoke(json);
    };

    // 强制刷新schema数据 config{refreshUIConfig: true, refreshDataSchema: true}
    exports.refreshJSONSchemaAndUIConfig = function(cid, config, cb) {
        var json = {};
        json[METHOD] = 'getJsonSchemaAndUiConfig';
        json[PARAMS] = _.extend({ 'cid': cid }, config);
        json[CALLBACK] = translate(wrap.time('refreshJSONSchemaAndUIConfig', cb));
        callback.register(json[CALLBACK]);

        native.invoke(json);
    };

    // id, hwnd
    exports.createNPWidget = function(id, hwnd) {
        var json = {};
        json[METHOD] = "createNPWidget";
        json[PARAMS] = { 'id': id, 'hwnd': hwnd };

        native.invoke(json);
    };

    // id, hwnd
    exports.resizeNPWidget = function(id, hwnd) {
        var json = {};
        json[METHOD] = "resizeNPWidget";
        json[PARAMS] = { 'id': id, 'hwnd': hwnd };

        native.invoke(json);
    };

    // 写
    exports.setPluginContent = function(id, content) {
        var json = {};
        json[METHOD] = "setPluginContent";
        json[PARAMS] = { 'id': id, 'content': content };

        native.invoke(json);
    };

    // 读
    exports.getPluginContent = function(id, cb) {
        var json = {};
        json[METHOD] = "getPluginContent";
        json[PARAMS] = { 'id': id };
        json[CALLBACK] = translate(cb);

        native.invoke(json);
    };

    // 获取物流模板选项
    exports.getBizOptions = function(id, cb) {
        var json = {};
        json[METHOD] = "getPluginContent";
        json[PARAMS] = { 'id': id };
        json[CALLBACK] = translate(cb);

        native.invoke(json);
    };

    // onelevelstring2json
    exports.convertEntitytoJsonData = function(cid, jsonData, delItemKeyStr) {
        var json = {};
        json[METHOD] = "setConvertedJsonData";
        json[PARAMS] = { 'cid': cid, 'jsonData': jsonData, 'delItemKeyStr': delItemKeyStr };
        native.invoke(json);
    };

    //json2onelevelstring
    exports.convertJsonDatatoEntity = function(onelevelstr) {
        var json = {};
        json[METHOD] = "setConvertedOnelevelStr";
        json[PARAMS] = { 'onelevelstr': onelevelstr };
        native.invoke(json);
    };

    // 获取物流模板选项
    exports.getDeliverTemplateOptions = function(isRefresh, cb) {
        var wrapCb = function(jsonStr) {
            log('getDeliverTemplateOptions', jsonStr);
            var params = JSON.parse(jsonStr);
            var temp = (params.result === true) ? params.temp : undefined;

            var options = [];
            if (_.isArray(temp)) {
                _.each(temp, function(subTemp) {
                    options.push({
                        'value': subTemp.id,
                        'text': subTemp.name,
                        'oversea': (subTemp.boverseas ? true : false)
                    });
                });
            }

            // 回调 
            if (_.isFunction(cb)) {
                cb(options);
            }
        };

        var json = {};
        json[METHOD] = "getDeliverTemplateOptions";
        json[PARAMS] = { 'isRefresh': (isRefresh ? true : false) };
        json[CALLBACK] = translate(wrapCb);

        native.invoke(json);
    };

    // 设置最近使用的类目
    exports.setRecentUsedCategory = function(recentUsedCategory) {
        var json = {};
        json[METHOD] = "setRecentCategory";
        json[PARAMS] = { 'categroy': JSON.stringify(recentUsedCategory) };

        native.invoke(json);
    };

    // 获取最近使用的类目
    exports.getRecentUsedCategory = function(cb) {
        var json = {};
        json[METHOD] = "getRecentCategory";
        json[CALLBACK] = translate(cb);

        native.invoke(json);
    };

    // 获取类目树数据
    exports.getCategoryTree = function(cb) {
        var json = {};
        json[METHOD] = "getCategoryTree";
        json[CALLBACK] = translate(cb);

        native.invoke(json);
    }

    // 获取类目名字
    exports.getCategoryName = function(cid, cb) {
        var json = {};
        json[METHOD] = "getCategoryName";
        json[PARAMS] = { 'cid': cid };
        json[CALLBACK] = translate(cb);

        native.invoke(json);
    };

    // 序列化
    exports.serialize = function(key, value) {
        var json = {};
        json[METHOD] = "serialize";
        json[PARAMS] = { 'key': key, 'value': JSON.stringify(value) };

        native.invoke(json);
    };

    // 反序列化
    exports.deserialize = function(key, cb) {
        var json = {};
        json[METHOD] = "deserialize";
        json[PARAMS] = { 'key': key };
        json[CALLBACK] = translate(wrap.deserialize(key, cb));

        native.invoke(json);
    };

    // 选择所在地
    // 返回值示例：{"location":"甘肃/定西"} 
    exports.chooseLocation = function(cb) {
        var json = {};
        json[METHOD] = "chooseLocation";
        json[CALLBACK] = translate(cb);

        native.invoke(json);
    };

    // 按键F1
    exports.keyF1Release = function() {
        var json = {};
        json[METHOD] = "keyUp";
        json[PARAMS] = { 'key': 'F1' };

        native.invoke(json);
    };

    // 拷贝clientId
    exports.copyClientId = function() {
        var json = {};
        json[METHOD] = "copyClientId";
        json[PARAMS] = { 'key': 'F2' };

        native.invoke(json);
    };

    // 通知后端页面准备完毕
    exports.pageReady = function() {
        var json = {};
        json[METHOD] = "pageReady";

        native.invoke(json);
    };

    // asyncGet 异步通道
    exports.asyncGet = function(bizName, cid, itemid, params, cb) {
        var json = {};
        json[METHOD] = 'asyncGet';
        json[PARAMS] = {
            'module': bizName,
            'cid': cid,
            'itemid': itemid,
            'params': JSON.stringify(params),
        };
        json[CALLBACK] = translate(wrap.time(('asyncGet - ' + bizName), cb, json[PARAMS]));
        callback.register(json[CALLBACK]);

        native.invoke(json);
    };

    // 设置视频缩略图
    exports.setVideoPreview = function(vid, url) {
        var json = {};
        json[METHOD] = 'setPreviewImage';
        json[PARAMS] = { 'vid': vid, 'url': url };

        native.invoke(json);
    };

    // 获取视频缩略图
    exports.getVideoPreview = function(vid, cb) {
        var json = {};
        json[METHOD] = 'getPreviewImage';
        json[PARAMS] = { 'vid': vid };
        json[CALLBACK] = translate(cb);

        native.invoke(json);
    };

    // 判断是否在主容器中
    exports.isInEdit = function(cb) {
        var json = {};
        json[METHOD] = 'isInEdit';
        json[CALLBACK] = translate(cb);

        native.invoke(json);
    };

    // 判断服务保障类型
    exports.getNewprepayType = function(clientId, cb) {
        var json = {};
        json[METHOD] = 'getNewprepayType';
        json[PARAMS] = { 'clientId': clientId };
        json[CALLBACK] = translate(cb);

        native.invoke(json);
    };

    // 设置当前cid
    exports.setCurrentCid = function(cid) {
        var json = {};
        json[METHOD] = 'setCurrentCid';
        json[PARAMS] = { 'cid': cid };

        native.invoke(json);
    };

    // 获取海外直邮状态
    exports.getOverseaAndTaxStatus = function(cb) {
        var json = {};
        json[METHOD] = 'getOverseaAndTaxStatus';
        json[CALLBACK] = translate(cb);

        native.invoke(json);
    };

    // 同步海外直邮状态
    exports.setOverseaAndTaxStatus = function(status) {
        var json = {};
        json[METHOD] = 'setOverseaAndTaxStatus';
        json[PARAMS] = status;

        native.invoke(json);
    };

    exports.qnTrigger = function() {
        if (type(native.trigger) !== 'function') {
            return;
        }

        var args = Array.prototype.slice.call(arguments);
        native.trigger.apply(native, args);
    };
});
