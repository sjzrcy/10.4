/**
 * model: SchemaField
 * 前台类目
 */

define(function(require, exports, module){
	//
	var base = require('src/schema/ui/base/index');
	var BaseView = require('src/schema/baseview');
	var ChooseShopCatsDialog = require('src/base/common/dialog/shopcats');

	//
	var View = BaseView.extend({
		tagName: 'div',
		className: 'schema',

		initialize: function(){
			// 继承schema行为
			BaseView.prototype.initialize.apply(this, arguments);
			
			// 数据准备
			this.top = new base.TopSchemaView({model: this.model});
			this.bottom = new base.BottomSchemaView({model: this.model});
		},

		render: function(){
			this.$el.empty();
			
			this.top.render();
			this.$el.append(this.top.$el);

			// 渲染主体
			var $shopCats = this.renderShopCats();
			this.$el.append($shopCats);

			this.bottom.render();
			this.$el.append(this.bottom.$el);
		},

		renderShopCats: function(){
			var $ui = $('<div class="schema-shop-cats clearfix">');
			var $init = $('<div class="cats-init-text float-left">').text('+选择分类');
			$ui.append($init);

			var text = this.getShopCats();
			var $cats = $('<div class="cats-text float-left">').text(text);
			$ui.append($cats);	
			
			var $edit = $('<div class="edit-button">').text('修改');
			$ui.append($edit);

			var me = this;
			var onClick = function(){
				var dialog = new ChooseShopCatsDialog({'model': {
					field: me.model,
					title: '选店铺分类',
					offset:{left: 258, top: 58},
					buttons: [
						{
							text: '确认',
							click: function(){
								var checkedOptions = dialog.checkedOptions();
								var values = [];
								for(var i = 0; i <checkedOptions.length; ++i){
									var option = checkedOptions[i];
									values.push(option.value);
								}

								// 设置值，并重绘text区域
								me.model.setValue(values);
								var text = me.getShopCats();
								me.$('.cats-text').text(text);
								dialog.close();

								// update
								if(!text){
									$init.show();
									$cats.hide();
									$edit.hide();
								}else{
									$init.hide();
									$cats.show();
									$edit.show();
								}
							}
						}
					]
				}});

				dialog.render();
				dialog.$el.appendTo($('body'));
			};

			$edit.click(onClick);
			$init.click(onClick);

			// init
			if(!text){
				$init.show();
				$cats.hide();
				$edit.hide();
			}else{
				$init.hide();
				$cats.show();
				$edit.show();
			}

			return $ui;
		},

		getShopCats: function(){
			var values = this.model.value();
			if(!_.isArray(values) || values.length === 0){
				return '';
			}

			var catsText = [];
			var validValues = [];
			var options = this.model.get('options');
			for(var i = 0; i < values.length; ++i){
				var text = this.getCatText(values[i], options);
				if(text){
					validValues.push(values[i]);
					catsText.push(text);
				}
			}

			this.model.setValue(validValues);
			return catsText.join(', ');
		},

		getCatText: function(value, options){
			for(var i = 0; i < options.length; ++i){
				var option = options[i];
				if(option.value === value){
					return option.text;
				}

				if(_.isArray(option.options)){
					var pText = option.text;
					for(var j = 0; j < option.options.length; ++j){
						var child = option.options[j];
						if(child.value === value){
							return (pText + '>>' + child.text);
						}
					}
				}
			}
		}
	});

	//
	module.exports = View;
});