/**
 * tab main 
 * 宝贝信息主页面
 *
 *  
 *
 */

define(function(require, exports, module){
	//
	var service = require('src/base/service');

	//
	var MainTabView = Backbone.View.extend({
		events: {
			'moveTo': '切换至某tab的视图下'
		},

		initTab: function(){
			var subServices = service.getChildren(this.id);
			var me = this;

			var tabs = [];
			_.each(this.model.get('subTabs'), function(subTabModel){
				var id = subTabModel.get('id');
				var View = service.getView(id);
				var tab = new View({model: subTabModel});
				tabs.push(tab);
			});

			this.tabs = tabs;
		},

		renderTab: function(){
			var me = this;
			_.each(this.tabs, function(tab, index){
				if(index === 0){
					tab.$tab.addClass('active');
				}
				
				me.$tab.append(tab.$tab);
				me.$panel.append(tab.$panel);
			});
		},

		initialize: function(){
			this.$tab = $('<div class="item">').attr('id', this.model.get('id'));
			this.$panel = $('<div class="item">').attr('for', this.model.id).css('display', 'none');
			this.initTab();
			this.renderTab();
			this.model.on('moveTo', this.moveTo, this);

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
			$(".main-item", this.$tab).removeClass('active');
		},

		render: function(){

		},

		id: function(){
			return this.model.get('id');
		},

		moveTo: function(id){
			var $tab = $('#' + id, this.$tab);
			$tab.siblings().removeClass('active');
			$tab.addClass('active');

			var $tabPanel = $('.main-sub-panel[link=' + id + ']', this.$panel);
			if($tabPanel.length === 1){
				if(this.$panel.css('display') !== 'none'){
					if(as.isInQN()){
						$tabPanel[0].scrollIntoView(false);
					}else{
						$tabPanel[0].scrollIntoView();
						var top = $('body').scrollTop();
						$('body').scrollTop(top - 32);
					}
				}else{
					setTimeout(function(){
						if(as.isInQN()){
							$tabPanel[0].scrollIntoView(false);
						}else{
							$tabPanel[0].scrollIntoView();
							var top = $('body').scrollTop();
							$('body').scrollTop(top - 32);
						}
					}, 1);							
				}
			}
		}
	});
	
	//
	module.exports = MainTabView;
});