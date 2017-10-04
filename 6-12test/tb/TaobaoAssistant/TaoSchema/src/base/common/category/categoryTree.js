/**
 * zTree封装
 *
 * 以id索引zTree实例，可以存在多个实例
 * 保证每个id始终最多只能映射到一个实例
 * id和存在于ui元素上的id保持一致
 */

define(function(require, exports, module){
	//
	
	var zTreeSetting = {
		view: {
			showLine: false,
			showIcon: true,
			expandSpeed: 'fast',
			selectedMulti: false,
			fontCss: getFontCss
		},
		
		check: {
			enable: false,
			chkStyle: 'checkbox',
			autoCheckTrigger: true,
			chkboxType: {Y: 'ps', N: 'ps'},
		},

		callback: {
			onClick: function(event, treeId, treeNode, clickFlag){
				var tree = $.fn.zTree.getZTreeObj(treeId);
				if(tree){
					tree.trigger('checkStatusChanged');
				}
			}
		}
	};

	var getFontCss = function(treeId, treeNode) {  
    	return (!!treeNode.highlight) ? {color:"#A60000", "font-weight":"bold"} : {color:"#333", "font-weight":"normal"};  
	}  

	var changeColor = function(id,key,value){
		treeId = id;
		updateNodes(false);
		if(value != ""){
			var treeObj = $.fn.zTree.getZTreeObj(treeId);
			nodeList = treeObj.getNodesByParamFuzzy(key, value);
			if(nodeList && nodeList.length>0){
				updateNodes(true);
			}
		}
	}

	var updateNodes = function(highlight) {
		var treeObj = $.fn.zTree.getZTreeObj(treeId);
		for( var i=0; i<nodeList.length;  i++) {
			nodeList[i].highlight = highlight;
			treeObj.updateNode(nodeList[i]);
		}
	}


	// 创建zTree，维持一个单实例
	var shopCats;
	var createZTree = function($el, field){
		var id = $el.attr('id');
		if(!_.isString(id) || id.length <= 0){
			return;
		}
		
		var tree = $.fn.zTree.destroy(id);
		
		shopCats = undefined;
		checkStatusChangeHandle = undefined;
		if($el.length !== 1 || !_.isObject(field)){
			return;
		}

		shopCats = field;
		var treeModel = field.treeModel;
		var lastCid = field.lastCid;
	
		tree = $.fn.zTree.init($el, zTreeSetting, treeModel);
		_.extend(tree, Backbone.Events);


		return tree;
	};

	var expand = function(id){
		var zTree = $.fn.zTree.getZTreeObj(id);
		if(_.isObject(zTree)){
			zTree.expandAll(true);
		}
	};

	var pack = function(id){
		var zTree = $.fn.zTree.getZTreeObj(id);
		if(_.isObject(zTree)){
			zTree.expandAll(false);
		}
	};

	var expandSelectedNodes = function(zTree, nodes){
		if(!_.isObject(zTree)){
			return;
		}

		// 展开
		for(var i = 0; i < nodes.length; ++i){
			// 拿到该节点对应的根节点
			var node = nodes[i];
			while(node.getParentNode()){
				node = node.getParentNode();
			}
			zTree.expandNode(node, true, true, true, true);	
		}

		zTree.refresh();		
	}

	var expandChecked = function(id){
		var zTree = $.fn.zTree.getZTreeObj(id);
		if(!_.isObject(zTree)){
			return;
		}

		// 展开
		var nodes = zTree.getCheckedNodes(true);
		for(var i = 0; i < nodes.length; ++i){
			// 拿到该节点对应的根节点
			var node = nodes[i];
			while(node.getParentNode()){
				node = node.getParentNode();
			}
			zTree.expandNode(node, true, true, true, true);	
		}

		zTree.refresh();
	};

	// 创建一个新的tree实例
	exports.create = createZTree;

	// 展开
	exports.expand = expand;

	// 收起
	exports.pack = pack;

	// 展开选中项
	exports.expandChecked = expandChecked;

	// 当前选中项发生变化(便于外面更新) => 基于shopCats字段去做
});