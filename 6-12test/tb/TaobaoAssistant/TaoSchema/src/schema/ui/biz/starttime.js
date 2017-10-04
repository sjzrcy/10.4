/**
 * 包含两个字段
 * startTime.startType 上架类型
 * startTime.settingTime 上架时间
 */

define(function(require, exports, module) {
    //
    var service = require('src/schema/service/viewservice');

    //
    var View = Backbone.View.extend({
        tagName: 'div',
        className: 'startTime clearfix',

        initialize: function() {
            var children = this.model.children();
            if (children.length === 2) {
                this.startType = children[0];
                this.settingTime = children[1];
            }
        },

        render: function() {
            this.$el.html('');

            if (!this.startType || !this.settingTime) {
                error('上架类型或者上架时间未设置');
                return;
            }

            var TypeView = service.get(this.startType.get('type'));
            var SettingTimeView = service.get(this.settingTime.get('type'));
            if (!TypeView || !SettingTimeView) {
                error('上架类型或者上架时间的VIEW未支持');
                return;
            }

            var startType = new TypeView({ 'model': this.startType });
            startType.render();
            startType.$el.addClass('float-left').css('width', 'calc(50% + 14px)');
            this.$el.append(startType.$el);

            var settingTime = new SettingTimeView({ 'model': this.settingTime });
            settingTime.render();
            settingTime.$el.addClass('float-left').css('width', 'calc(50% - 14px)');
            settingTime.$('.asdate').css('margin-left', '4px').css('width', 'calc(100% - 6px)');
            settingTime.$('.top').empty();
            this.$el.append(settingTime.$el);
        }
    });

    //
    module.exports = View;
});
