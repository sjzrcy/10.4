/*
 * model:
 * groups: [{groupId: , text: , rgb: '', img: '', colors: [{text:, value:, rgb:}, ...]}, ...]
 *
 */
 define(function(require, exports, module){
 	var Panel = require('src/base/common/panel');
 	var View = Panel.extend({
 		events: {
 			'click .option-panel .option': function(){
 				var $e = $(event.srcElement);
 				var $option = $e;
 				while(!$option.hasClass('option') && $option.length){
 					$option = $option.parent();
 				}

 				this.selected = {
 					value: $option.data('value'),
 					text: $option.text()
 				};

 				this.close();
 			},
 		},

 		initialize: function(){
 			Panel.prototype.initialize.apply(this, arguments);

 			this.groups = this.model.groups;
 			this.currentGroupId = this.groups[0].groupId;
 			this.$el.addClass('group-option-panel');
 		},

 		// 重新渲染右边枚举选项
 		updateOptions: function(){
 			if(this.last === this.currentGroupId){
 				return;
 			}

 			this.$options.empty();
 			this.last = this.currentGroupId;
 			var options = this.findGroupOption(this.currentGroupId);
 			for(var i = 0; i < options.length; ++i){
				this.$options.append(this.renderOneOption(options[i]));
 			}

 			this.adaptHeight();
 		},

 		adaptHeight: function(){
 			var h1 = this.$('.group-panel').height();
 			var h2 = this.$('.option-panel').height() + 28;
 			var h = h1 > h2? h1: h2;
 			this.$('.group-panel').height(h);
 			this.$('.option-panel').height(h - 28);
 		},

 		findGroupOption: function(id){
 			var options = [];
 			for(var i = 0; i < this.groups.length; ++i){
 				if(this.groups[i].groupId === id){
 					options = this.groups[i].colors;
 				}
 			}

 			return options;
 		},

 		render: function(){
 			this.$el.empty();

 			this.$el.append(this.renderHeader());
 			this.$el.append(this.renderPanel());
 		},

 		renderHeader: function(){
 			var $header = $('<div class="header">');
 			return $header;
 		},

 		renderPanel: function(){
 			var $panel = $('<div class="group-option-panel clearfix">');
 			$panel.append(this.renderGroup());
 			$panel.append(this.renderOption());

 			return $panel;
 		},

 		renderGroup: function(){
 			var $ul = $('<ul class="group-ul">');
 			for(var i = 0; i < this.groups.length; ++i){
 				var $group = this.renderOneGroup(this.groups[i]);
 				$ul.append($group);

 				if(i === 0){ // 初始化
 					$group.addClass('selected');
 				}
 			}

 			return $('<div class="group-panel float-left">').append($ul);
 		},

 		renderOneGroup: function(group){
 			var $block = $('<span class="color-block">');
 			if(group.rgb){
 				$block.css('background-color', group.rgb);
 			}else if(group.imgUrl){
 				$block.css('background-image', 'url(' + group.imgUrl + ')');
 			}else{
 				$block.css('background-color', '#ffffff');
 			}
 			
 			var $group = $('<li class="group-option">').data('groupId', group.groupId).append($block).append(group.text);
 			var me = this;
 			$group.hover(function(){
 				var $group = $(this);
 				$group.siblings().removeClass('selected');
 				$group.addClass('selected');

 				me.currentGroupId = $group.data('groupId');
 				me.updateOptions();
 			}, function(){
 				
 			});

 			return $group;
 		},

 		renderOption: function(){
 			var $remark = $('<div class="option-remark">').text('常用标准颜色：');
 			this.$options = $('<ul class="option-ul">');

 			var $panel = $('<div class="option-panel float-left">');
 			$panel.append($remark).append(this.$options);
 			this.updateOptions();

 			return $panel;
 		},

 		renderOneOption: function(option){
 			var $block = $('<span class="color-block">');
 			if(option.rgb){
 				$block.css('background-color', option.rgb);
 			}else if(option.imgUrl){
 				$block.css('background-image', 'url(' + option.imgUrl + ')');
 			}else{
 				$block.css('background-color', '#ffffff');
 			}
 			
 			return $('<li class="option">').data('value', option.value).append($block).append(option.text);
 		},

 		value: function(){
 			return this.selected;
 		}
 	});

	module.exports = View;
 });