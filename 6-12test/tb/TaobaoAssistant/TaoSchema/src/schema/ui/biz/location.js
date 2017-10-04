/**
 * 
 */

define(function(require, exports, module){
	//
	var base = require('src/schema/ui/base/index');
	var BaseView = require('src/schema/baseview');

	//
	var PROV = 'prov';
	var CITY = 'city';

	//
	var View = BaseView.extend({
		tagName: 'div', 
		className: 'schema',

		initialize: function(){
			// 继承schema行为
			BaseView.prototype.initialize.apply(this, arguments);

			//
			var find = function(id, list){
				return (_.find(list, function(item){
					return (item.id === id);
				}));
			};

			// 数据处理
			var children = this.model.children();
			this.prov = find(PROV, children);
			this.city = find(CITY, children);

			// 数据准备
			this.model.set('title', '采购地');
			this.top = new base.TopSchemaView({model: this.model});
		},

		render: function(){
			if(!this.prov || !this.city){
				return;
			}
			
			this.$el.html('');
			this.top.render();
			this.$el.append(this.top.$el);

			// 渲染主体
			var $location = this.renderLocation();
			this.$el.append($location);
		},

		renderLocation: function(){
			var $ui = $('<div class="schema-location clearfix">');
			var $init = $('<div class="location-init-text float-left">').text('+选择地址');
			$ui.append($init);

			var text = this.getLocation();
			var $location = $('<div class="location-text float-left">').text(text);
			$ui.append($location);	
			
			var $edit = $('<div class="edit-button">').text('修改');
			$ui.append($edit);

			var me = this;
			var onClick = function(){
				as.shell.chooseLocation(function(loc){
					loc = JSON.parse(loc);
					if(_.isObject(loc) && loc.location && _.isString(loc.location)){
						me.setLocation(loc.location);

						// update text
						var text = me.getLocation();
						$location.text(text);

						// init
						if(!text){
							$init.show();
							$location.hide();
							$edit.hide();
						}else{
							$init.hide();
							$location.show();
							$edit.show();
						}
					}
				});
			};

			$edit.click(onClick);
			$init.click(onClick);

			// init
			if(!text){
				$init.show();
				$location.hide();
				$edit.hide();
			}else{
				$init.hide();
				$location.show();
				$edit.show();
			}

			return $ui;
		},

		getLocation: function(){
			var prov = this.prov.value();
			var city = this.city.value();
			if(prov && city){
				return (prov + '/' + city);
			}
		},

		setLocation: function(location){
			if(!_.isString(location)){
				return;
			}

			var list = location.split('/');
			if(list.length !== 2){
				return;
			}

			// update
			this.prov.setValue(list[0]);
			this.city.setValue(list[1]);
		}
	});

	//
	module.exports = View;
});