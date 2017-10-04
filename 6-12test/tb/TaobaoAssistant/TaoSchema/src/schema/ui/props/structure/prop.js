/**
 * 所有宝贝属性的入口
 */

define(function(require, exports, module){
  //
  var BaseView = require('src/schema/baseview');
  var LeftView = require('src/schema/ui/props/structure/prop-left');
  var RightView = require('src/schema/ui/props/structure/prop-right');
  var BottomView = require('src/schema/ui/props/structure/prop-bottom');

  //
  var View = BaseView.extend({
    tagName: 'div',
    className: 'schema prop clearfix',

    initialize: function(){
      // 继承schema行为
      BaseView.prototype.initialize.apply(this, arguments);

      this.left = new LeftView({'model': this.model});
      this.right = new RightView({'model': this.model});
      this.bottom = new BottomView({'model': this.model});
    },

    render: function(){
      this.$el.empty();
      
      var $top = $('<div class="prop-item clearfix">');
      this.$el.append($top);

      this.left.render();
      $top.append(this.left.$el);

      this.right.render();
      $top.append(this.right.$el);

      this.bottom.render();
      this.$el.append(this.bottom.$el);
    }
  });

  //
  module.exports = View;
});