// JavaScript Document
function ExtendLayout(minCountPerColumn, fixedColumnCount, pre, fields)
{
	/*
	{
		minCountPerColumn:每列最少字段数
		fixedColumnCount:固定列数
		pre:预定义字段集合数组，pre[0]代表第0列的所有预定义，以此类推
		fields:所有字段集合
	}
	*/
	var layout_ = [];

	var isPredefineField = function(id){
		for(var i = pre.length - 1; i >= 0; --i){
			if(typeof(pre[i][id]) != "undefined"){
				return true;
			}
		}
		return false;
	}

	var contains = function(id){
		for(var i = fields.length - 1; i >= 0; --i){
			if(fields[i].id == id){
				return true;
			}
		}
		return false;
	}

	var get = function(id){
		for(var i = fields.length - 1; i >= 0; --i){
			if(fields[i].id == id){
				return fields[i];
			}
		}
	}

	var preCount = (function(){
		var count = [];
		for(var i = 0; i < pre.length; ++i){
			var preItem = pre[i];
			var countItem = [];
			for(var e in preItem){
				if(contains(e)){
					countItem.push(e);
				}
			}

			count.push(countItem);
			countItem = [];
		}
		return count;
	})();

	var allPreCount = (function(){
		var all = 0;
		for(var i = preCount.length - 1; i >= 0; --i){
			all += preCount[i].length;
		}
		return all;
	})();

	var countPerColumn = parseInt(fields.length / fixedColumnCount);
	var extra = fields.length % fixedColumnCount;
	var fieldsIndex = 0;
	for(var i = 0; i < fixedColumnCount; ++i){
		var layoutItem = [];
		var itemPreCount = 0;
		if(preCount.length > i){
			itemPreCount = preCount[i].length;
			for(var j = 0; j < itemPreCount; ++j){
				layoutItem.push(get(preCount[i][j]));
			}
		}

		var expected = countPerColumn + (extra > 0 ? 1 : 0);
		if(expected > itemPreCount){
			extra -= 1;
			var left = expected - itemPreCount;
			for(var k = fieldsIndex; k < fields.length && left > 0; ++k){
				fieldsIndex = (k + 1);
				var fieldItem = fields[k];
				if(!isPredefineField(fieldItem.id)){
					layoutItem.push(fieldItem);
					left -= 1;
				}
			}
		}

		layout_.push(layoutItem);
		layoutItem = [];
	}

	debug.log("fields length:" + fields.length);
	debug.log((function(){
		var allCount = 0;
		for(var i = 0; i < layout_.length; ++i){
			allCount += layout_[i].length;
		}
		return allCount;
	})());
	
	this.fields = function(index){
		return layout_[index];
	}
	this.ids = function(index){
		var ids = {};
		for(var i = 0; i < layout_[index].length; ++i){
			ids[layout_[index][i].id] = "";
		}

		if(index < pre.length){
			for(var p in pre[index]){
				ids[p] = pre[index][p];
			}
		}
		return ids;
	}
}

window.extend = new (function(){
	this.clearSchema = function () {
		var section0 = "\
			<div id='auto_fill'></div>\
			<div id='second_kill'></div>\
			<div id='is_offline'></div>\
			<div id='agency_sale'></div>\
			<div id='valid_thru'></div>\
			<div id='after_sale_id'></div>";
		$("#section0").empty();
		$("#section0").html(section0);

		var section1 = "\
			<div id='has_warranty'></div>\
			<div id='sell_promise'></div>\
			<div id='has_invoice'></div>\
			<div id='has_showcase'></div>\
			<div id='has_discount'></div>\
			<div id='shop_same_style'></div>\
			<div id='try_weared_item'></div>\
			<div id='is_lightning_consignment'></div>\
			<div id='isIgnoreFakeCredit'></div>";
		$("#section1").empty();
		$("#section1").html(section1);

		var section2 = "\
			<div id='diaopai_pic'></div>\
			<div id='vertical_image'></div>";
		$("#section2").empty();
		$("#section2").html(section2);

		RuleEngine.reset();
		FieldManager.clear();
	}

	this.loadExtendSchema = function(schemaType){
		debug.log("loadExtendSchema");

		var MIN_COUNT_PER_COLUMN = 5;
		var FIX_COLUMN_COUNT = 3;
		var extend = frame.extend();
		var pre = [];
		pre.push(extend.e0);
		pre.push(extend.e1);
		pre.push(extend.e2);

		var fields = (function(){
			var fields = [];
			var others = frame.others(shell.item);
			for(var i = 0; i < shell.item.length; ++i){
				var schemaField = shell.item[i];
				if(others[schemaField.id] != undefined){
					fields.push(schemaField);
				}
			}
			return fields;
		})();

		var layout = new ExtendLayout(MIN_COUNT_PER_COLUMN, FIX_COLUMN_COUNT, pre, fields);
		loadSchema(layout.ids(0), layout.fields(0), "#section0", schemaType);
		loadSchema(layout.ids(1), layout.fields(1), "#section1", schemaType);
		loadSchema(layout.ids(2), layout.fields(2), "#section2", schemaType);

		RuleEngine.applyCommands(schemaType);
		FieldManager.applyRules(schemaType);
	}

})();

/**************************/
process.renderItemAddSchema = function(json){
	shell.setItemToken(json);
	extend.loadExtendSchema(shell.constants.schema.ITEM_ADD);
}

process.renderItemUpdateSchema = function(json){
	shell.setItemToken(json);
	extend.loadExtendSchema(shell.constants.schema.ITEM_UPDATE);
}

process.clearAllSchema = function(){
	process.tryHideLoadingUi();
	process.tryCloseNetErrorTip();
	extend.clearSchema();
	process.handleClear();
	Tooltip.clear();
}