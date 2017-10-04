/*
 * model:
 * query
 * options
 */
 define(function(require, exports, module){
 	var Panel = require('src/base/common/panel');
 	var View = Panel.extend({
 		events: {
 			'click ul li': function(){
 				var $src = $(event.srcElement);
 				var $li = $src;
 				if(!$li.is('li')){
 					$li = $li.parent();
 				}

 				this.word = $li.text();
 				this.close();
 			}
 		},

 		initialize: function(){
 			Panel.prototype.initialize.apply(this, arguments);
 			this.query = this.model.query;
 			this.options = this.model.options;
 			this.$el.addClass('query-option-panel');
 			this.$ul = $('<ul>');
 		},

 		render: function(){
 			this.$el.empty();
 			this.$el.append(this.renderHeader());
 			this.$el.append(this.renderPanel());
 		},

 		renderHeader: function(){
 			return $('<div class="header">');
 		},

 		renderPanel: function(){
 			var $panel = $('<div class="panel">');
 			$panel.append(this.renderRemark());
 			$panel.append(this.renderOption());
 			return $panel;
 		},

 		renderRemark: function(){
 			return $('<div class="remark">').text('标准色：');
 		},

 		renderOption: function(){
 			this.$ul.empty();
 			for(var i = 0; i < this.options.length; ++i){
 				this.$ul.append(this.renderOneOption(this.options[i]));
 			}
 			return this.$ul;
 		},

 		renderOneOption: function(option){
 			var word = option.word;
 			var html = word.replace(this.query, ('<span class="highlight">' + this.query + '</span>'));
 			return $('<li>').html(html);
 		},

 		updateOption: function(options, query){
 			this.query = query;
 			this.options = options;
 			this.renderOption();
 		},

 		text: function(){
 			return this.word;
 		}
 	});

 	//
 	module.exports = View;
 });