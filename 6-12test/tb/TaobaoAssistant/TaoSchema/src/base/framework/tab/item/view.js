/**
 * tab item 控件
 */
var desc = '<object style="position:relative; height:100%; width:100%;" class="widget" type="tbassistant/npworkbench-plugin" id="htmledit"></object>';
var wireless = '<object style="position:relative; height:100%; width:100%;" class="widget" type="tbassistant/npworkbench-plugin" id="htmledit"></object>';

//
define(function(require, exports, module){
	//
	var TabItemView = Backbone.View.extend({
		initialize: function(){
			this.$tab = $('<div class="item">').attr('id', this.model.get('id')).text(this.model.get('title'));
			this.$panel = $('<div class="item">').attr('for', this.model.id).css('display', 'none');
			this.$panel.html('<object class="widget" type="tbassistant/npworkbench-plugin" id="htmledit"></object>');

			var me = this;
			this.$tab.click(function(){
				me.model.active();
			});
		},

		active: function(){
			this.$tab.addClass('active');
			this.$panel.css('display', 'block');
		},

		deactive: function(){
			this.$tab.removeClass('active');
			this.$panel.css('display', 'none');
		},

		id: function(){
			return this.model.get('id');
		}
	});

	//
	module.exports = TabItemView;
});