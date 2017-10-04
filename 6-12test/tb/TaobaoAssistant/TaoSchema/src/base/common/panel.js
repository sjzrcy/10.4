/*
 * ui展示面板
 *
 * 
 * 基础功能：
 * 定位: absolute,基于body
 * 尺寸
 * 自动关闭
 *
 * model:
 * $rel(必需) -  相对于谁定位，(下方，左对齐)
 * offset(可选) - 定制标准位移 {x, y},默认{0, 0}
 * closeCb - 关闭后回调
 *
 * 继承类可用：
 * $el
 * close
 */

 define(function(require, exports, module){
 	var View = Backbone.View.extend({
 		tagName: 'div',
 		className: 'panel',

 		initialize: function(){
 			this._doRel();
 			this._doOffset();
 			this._doAutoClose();
 		},

 		_doRel: function(){
 			var $rel = this.model.$rel;
 			var offset = $rel.offset();

 			this.$el.offset({
 				top: (offset.top + $rel.height()),
 				left: offset.left
 			});
 		},

 		_doOffset: function(){
 			var offset = this.model.offset;
 			if(offset){
 				var source = this.$el.offset();
 				source.left += offset.x;
 				source.top += offset.y;
 				this.$el.offset(source);
 			}
 		},

 		_doAutoClose: function(){
 			var me = this;
 			setTimeout(function(){
 				me.checkClose = me._checkClose.bind(me);
 				$('body').bind('click', me.checkClose);
 			}, 400);
 		},

 		_doAfterClose: function(){
 			if(_.isFunction(this.model.closeCb)){
 				this.model.closeCb();
 			}

 			// 支持外部设置额外的关闭回调
 			if(_.isFunction(this.exCloseCb)){
 				this.exCloseCb();
 			}

 			$('body').unbind('click', this.checkClose);
 			this.checkClose = undefined;
 		},

 		_checkClose: function(){
 			if(!as.util.isCoverCursor(this.$el)){
 				this.close();
 			}
 		},

 		show: function(){
 			$('body').append(this.$el);
 		},

 		close: function(){
 			this.$el.remove();
 			this._doAfterClose();
 		},

 		setExCloseCb: function(cb){
 			this.exCloseCb = cb;
 		},
 	});

 	module.exports = View;
 });