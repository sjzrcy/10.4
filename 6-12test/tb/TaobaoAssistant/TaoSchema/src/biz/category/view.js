/**
 * 类目选择 - view
 */

define(function(require, exports, module){
	//
	var service = require('src/base/service');
	var AsSelectView = require('src/schema/ui/base/asselect');
	var TitleView = require('src/schema/ui/base/schematop');
	var ChooseCategoryDialog = require('src/base/common/category/category');
	//var treedata = CATEGORYLIST;

	//
	var CategoryView = Backbone.View.extend({
		tagName: 'div',
		className: 'category schema',
		
		initialize: function(){

		},

		render: function(){
			// title
			var title = new TitleView({model: this.model});
			title.render();
			this.$el.append(title.$el);

			var $box = $('<div id="category-box">');
			this.$el.append($box);

			// asselect
			var asselect = new AsSelectView({model: this.model});
			asselect.QUERY_NULL = {value: '', text: '暂无记录'};
			this.model.on('cidChanged', asselect.render, asselect); // 刷新类目组件

			asselect.$el.css('width', 'calc(100% - 66px)').addClass('float-left');
			asselect.render();
			$box.append(asselect.$el);

			var $choose = $('<div id="choose-category-button">').text('选类目');
			$box.append($choose);

			var me = this;
			$choose.click(function(){
				if(window.asHost === 'qntest'){
					//使用内部的类目控件
					var treeModel = {};
					treeModel.lastCid = 50012081;//me.model.value();
					treeModel.treeModel = treedata;
					var dialog = new ChooseCategoryDialog({'model': {
						field: treeModel,
						title: '选类目分类',
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
										dialog.close();
									}
								},
								{
									text: '取消',
									click: function(){
										dialog.close();
									}
								}
							]
					}});

					dialog.render();

					dialog.$el.appendTo($('body'));
					dialog.afterCreator();


				}else{
					//使用内部的类目控件
					as.shell.chooseCategory(me.model.value(), function(cat){
						cat = JSON.parse(cat);
						var cid = cat.cid;
						var title = cat.title;
						if(!me.model.checkRecentRecord(cid)){
							me.model.addRecentRecord(cid, title);
						}
						me.model.setValue(cid);
					});	
				}
			});
		},
	});

	//
	module.exports = CategoryView;
});