/**
 * 一级入口，索引其他模块
 * 自动注册到全局域下，标识符‘as’
 */

define(function(require, exports, module){
    // 注册
    var as = {};
    window.as = as;

    // 配置
    as.debug = false; // 调试开关
    as.daily = false; // 网络环境开关

    // 常量
    as.VALIDATE = 'validate';
    as.SAVE = 'save';
    as.UPLOAD = 'upload';
    as.WIDTH = 1010;
    as.DEFAUL_PROTOCOL = 'https:';

    // JID
    window.JID = function(id){
        if(_.isString(id)){
            id = id.replace(/\./g, "\\.");
            id = id.replace(/\*/g, "\\*");
            id = id.replace(/\,/g, "\\,");
            id = id.replace(/\//g, "\\/");
        }
        return id;
    };

    // etc 0.1.1 / 3.1.0 / 3.1.3
    as.etcDailyJS = 'http://g-assets.daily.taobao.net/cm/ma-sell/3.1.3/ma-sell/ma-iframes/index.js';
    as.etcOnlineJS = 'http://g.alicdn.com/cm/ma-sell/3.1.3/ma-sell/ma-iframes/index.js';

    // create index
    as.shell = require('src/base/shell/shell');
    as.util = require('src/util/util');
    as.service = require('src/base/service');
    as.key = require('src/base/key');
    as.viewService = require('src/schema/service/viewservice');
    as.schema = require('src/schema/schema');
    as.entity = require('src/base/entity');
    as.entity2json = require('src/util/entity2json');
    as.json2entity = require('src/util/json2entity');
    as.loading = require('src/base/common/loading');

    // etc
    as.etc = require('src/schema/ui/biz/deliver/etc/etc');

    // register service
    require('src/biz/serviceregister');
    require('src/schema/service/viewregister');
    require('src/base/common/extend/date');

    if(window.asHost === 'qn'){
        require('src/base/postmessage-qn');
    }else{
        require('src/base/postmessage');
    }

    as.isInQN = function(){
        return (window.asHost === 'qn');
    };

    // 导出
    module.exports = as;
});