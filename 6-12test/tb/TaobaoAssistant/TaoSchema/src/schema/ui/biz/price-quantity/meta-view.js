/**
 * 
 */

define(function(require, exports, module){
  //
  var InputView = require('src/schema/ui/props/base/input');
  var BaseView = require('src/schema/baseview');

  //
  var View = BaseView.extend({
    tagName: 'div',
    className: 'pq-meta float-left',

    initialize: function(){
      // 继承schema行为
      BaseView.prototype.initialize.apply(this, arguments);
      
      this.model.on('focus', this.onFoucs, this);
      this.model.on('hasError', this.onHasError, this);
      this.model.on('noError', this.onNoError, this);
    },

    render: function(){
      //
      this.$el.html('');

      //
      var $title = $('<div class="title">');
      this.$el.append($title);

      if(this.model.get('must')){
        $title.append($('<span class="must">*</span>'));
      }
      $title.append(this.model.get('title'));

      //
      var input = new InputView({'model': this.model});
      input.registerAfterRenderCb(function(){
        input.$('input').css('text-align', 'center'); 
      });
      
      input.render();
      this.$el.append(input.$el);
    },

    onFoucs: function(){
      as.util.twinkle(this.$('.title'));
      as.util.scrollTo(this.el);
    },

    onHasError: function(){
      this.$('.title').addClass('has-error');
    },

    onNoError: function(){
      this.$('.title').removeClass('has-error');
    }
  });

  //
  module.exports = View;
});