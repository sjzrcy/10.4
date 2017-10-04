/**
 * 多媒体组件-Tab容器
 * 1.active
 *
 * tab子组件接口：
 * 1.$tab
 * 2.$content
 * 3.active()
 * 4.deactive()
 * 
 */

define(function(require, exports, module){
  //
  var TabMediaView = require('src/schema/ui/biz/media/tab/submediaview');
  var TabVerticalView = require('src/schema/ui/biz/media/tab/subverticalview');
  var TabWirelessView = require('src/schema/ui/biz/media/tab/wireless/index');

  // 查询无线图片的layout
  var findWireless = function(layout){
    return _.find(layout.children(), function(child){
      return (child.get('type') === 'layout' && child.get('biz') === 'wireless-image');
    });
  };

  module.exports = Backbone.View.extend({
    tagName: 'div',
    className: 'schema tab-media',

    initialize: function(){
      this.tabs = [];

      // 宝贝主图
      this.tabs.push(new TabMediaView({model: {layout: this.model, parent: this}}));

      // 宝贝竖图
      var config = this.model.get('config');
      if(_.isObject(config) && config.verticalImage){
        this.tabs.push(new TabVerticalView({model: {layout: this.model, parent: this}}));
      }

      // 无线主图
      if(_.isObject(config) && config.wirelessImage){
        var layout = findWireless(this.model);
        if(layout){
          this.tabs.push(new TabWirelessView({model: {layout: layout, parent: this}}));
        }
      }
    },

    render: function(){
      this.$el.empty();

      // render structure
      var $bar = $('<div class="media-bar clearfix">');
      var $panel = $('<div class="media-panel">');
      this.$el.append($bar).append($panel);

      // render tab
      for(var i = 0; i < this.tabs.length; ++i){
        var tab = this.tabs[i];
        tab.render(i);
        $bar.append(tab.$tab);
        $panel.append(tab.$content.hide());
      }

      this.active(this.tabs[0]);
    },

    active: function(tab){
      for(var i = 0; i < this.tabs.length; ++i){
        if(tab === this.tabs[i]){
          this.tabs[i].active();
        }else{
          this.tabs[i].deactive();
        }
      }
    }
  });
});