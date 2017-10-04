/**
 * field
 */

/* jshint -W083 */

define(function(require, exports, module){
	//
	var BaseDialog = require('src/base/common/dialog/dialog');
	var zTree = require('src/base/common/zTree');

	//
	var View = BaseDialog.extend({
		initialize: function(){
			this.zid = 'shopCats';
			BaseDialog.prototype.initialize.apply(this, arguments);
			this.$panel.addClass('shop-cats-box clearfix');

			var me = this;
			$(window).resize(function(){
				me.onWindowResize();
			});
		},

		render: function(){
			var $panel = this.$panel;
			$panel.empty();
			$panel.append(this.renderShopCats());
			$panel.append(this.renderSelectedCats());
			zTree.expandChecked(this.zid);

			// 校准尺寸
			this.onWindowResize();
		},

		renderShopCats: function(){
			var $ui = $('<div class="shop-cats float-left">');
			var $bar = $('<div class="shop-title-bar clearfix">').appendTo($ui);
			$bar.append($('<div class="shop-cats-title float-left">').text('店铺所有分类'));

			var zid = this.zid;
			var $pack = $('<div class="icon pack float-right">').attr('title', '全部收起').appendTo($bar);
			$pack.mousedown(function(){
				$(this).addClass('icon-checked');
			}).mouseup(function(){
				$(this).removeClass('icon-checked');
			}).click(function(){
				zTree.pack(zid);
			});

			var $expand = $('<div class="icon expand float-right">').attr('title', '全部展开').appendTo($bar);
			$expand.mousedown(function(){
				$(this).addClass('icon-checked');
			}).mouseup(function(){
				$(this).removeClass('icon-checked');
			}).click(function(){
				zTree.expand(zid);
			});

			var $zTree = $('<div class="ztree">').attr('id', this.zid).appendTo($ui);
			this.tree = zTree.create($zTree, this.model.field);
			this.tree.on('checkStatusChanged', this.refreshSelectedCats, this);

			return $ui;
		},

		renderSelectedCats: function(){
			var $ui = $('<div class="selected-cats float-left">');
			var $bar = $('<div class="shop-title-bar">').appendTo($ui);
			$bar.append($('<div class="shop-cats-title">').text('已选分类'));

			var $selectedCatsPanel = $('<div class="cats-panel">').appendTo($ui);
			this.renderCats(this.tree.getCheckedNodes(), $selectedCatsPanel);

			return $ui;
		},

		refreshSelectedCats: function(){
			this.renderCats(this.tree.getCheckedNodes(), this.$('.cats-panel'));
		},

		renderCats: function(nodes, $c){
			if(!_.isArray(nodes) || $c.length !== 1){
				return;
			}

			var me = this;
			$c.empty();
			if(nodes.length === 0){
				$c.css({
					'padding-top': '6px',
					'padding-bottom': '6px',
					'color': '#767676',
				}).text('请在左侧选择');
			}else{
				$c.css({
					'padding-top': '0px',
					'padding-bottom': '12px',
				});
			}

			for(var i = 0; i < nodes.length; ++i){
				var node = nodes[i];
				if(!node.isParent){
					var $node = $('<div class="selected-cat-text">').text(node.name).hover(function(){
						$('.quick-remove-button', $(this)).show();
					}, function(){
						$('.quick-remove-button', $(this)).hide();
					});

					var $quickRemove = $('<div class="quick-remove-button">').attr('remove', node.value).css('display', 'none').text('×').click(function(){
						if(me.tree){
							var value = $(this).attr('remove');
							var nodes = me.tree.getNodesByParam('value', value);
							if(nodes.length === 1){
								nodes[0].checked = false;
								me.tree.updateNode(nodes[0], true);
								var $currentNode = $(this).parent();
								var siblings = $currentNode.siblings().length;
								$currentNode.remove();
								if(siblings === 0){
									me.refreshSelectedCats();
								}
							}
						}
					});

					$node.append($quickRemove);
					$c.append($node);
				}
			}
		},

		// 获取当前选中的节点
		checkedOptions: function(){
			var options = [];
			var checkedNodes = this.tree.getCheckedNodes();
			for(var i = 0; i < checkedNodes.length; ++i){
				var node = checkedNodes[i];
				if(!node.isParent){
					options.push({value: node.value, text: node.name});	
				}
			}
			return options;
		},

		onWindowResize: function(){
			var MIN = 56;
			var MAX = 354;
			var OFFSET = 200;
			
			var windowHeight = as.util.windowSize().height;
			var maxHeight = windowHeight - OFFSET;
			if(maxHeight < MIN){
				maxHeight = MIN;
			}
			if(maxHeight > MAX){
				maxHeight = MAX;
			}

			$('.ztree', this.$panel).css('max-height', maxHeight + 'px');
			$('.cats-panel', this.$panel).css('max-height', maxHeight + 'px');
		}
	});

	//
	module.exports = View;
});