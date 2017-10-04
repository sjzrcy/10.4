/*
 *发布助手
 */

define(function(require, exports, module) {
    var View = require('src/base/common/helper/view')

    var Model = Backbone.Model.extend({

        events: {
            'helperUpdated': '助手需要进行修改的信号'
        },

        findText: function(moduleId) {
            if (!moduleId) {
                return '';
            }
            var idTextMap = this.get('idTextMap');
            for (var property in idTextMap) {
                if (property === moduleId) {
                    return idTextMap[moduleId];
                }
            }
            return '';
        },

        convert: function(items) {
            var idTextMap = {};
            if (items) {
                for (var i in items) {
                    var item = items[i];
                    if (_.isObject(item)) {
                        idTextMap[item.id] = item.text;
                    }
                }
            }
            return idTextMap;
        },

        initialize: function() {

        },

        init: function(items) {
            this.set('idTextMap', this.convert(items));

            //组件是不是要展示
            this.set('isToShow', false);

            //打开后是否会隔一段时间自动关闭
            // var autoHide = false;
        },

        reset: function() {
            this.set('idTextMap', undefined);
            this.set('isToShow', false);
        },

        onHelperChanged: function(moduleId, $moduleDom) {
            //校验参数
            if (!moduleId || !$moduleDom) {
                error('淘宝助手传入的参数格式不正确，moduleId=' + moduleId + ',$moduleDom=' + $moduleDom);
                this.set('isToShow', false);
                this.trigger('helperUpdated');
                return;
            }
            var cRect = as.util.rect($moduleDom);
            if (!cRect || !_.isObject(cRect)) {
                error('淘宝助手传入的参数格式不正确，cRect=' + cRect);
                this.set('isToShow', false);
                this.trigger('helperUpdated');
                return;
            }

            //设置cRect。fix矩阵，如果有dom符合 $moduleDom下有top，top下有must，must下有margin-left属性，那么将发布助手左移margin-left。
            if ($('.top .must', $moduleDom).length > 0) {
                cRect.x = cRect.x + 28;
            }
            this.set('cRect', cRect);

            //设置isToShow字段
            var currentId = this.get('currentId');
            log('currentId=' + currentId + ',moduleId=' + moduleId + ',isToShow=' + this.get('isToShow'));
            if (currentId && currentId === moduleId) {
                this.set('isToShow', false);
            } else {
                this.set('isToShow', true);
            }
            this.set('currentId', moduleId);

            //设置text字段，字段为空，不显示。
            var text = this.findText(moduleId);
            if(!text){
            	this.set('isToShow',false);
            }
            this.set('text', text);

            this.trigger('helperUpdated');
        },

    });

    var helperModel = new Model({});
    var helperView = new View({
        'model': helperModel
    });
    module.exports = helperModel;
});