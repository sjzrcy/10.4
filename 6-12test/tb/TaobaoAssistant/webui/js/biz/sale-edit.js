/*
	商品属性
	布局：3列，比例1:1:1
	动态生长策略：
	依次填充：1-2-3
	
	1.第一列和第二列可能会多一个字段（平均取余）
	2.关联的字段会强制放在同一个区域

*/
function ValueNode()
{
	var parent_; //当前节点的值从属的字段
	
	var value_; //当前节点值
	var text_; //当前节点文本

	var child_; //当前节点对应的字段,FieldNode,为叶子结点时，该值为null
}

//可做根节点
function FieldNode(field)
{
	var field_ = field;
	var options_ = []; //ValueNode

	// tcs 孩子字段
	// tp 父亲字段
}

function buildTree(fields){
	var trees = [];
	var record = {}; //已经被分配过的记录

	var findParentId = function(field){
		var disableRuleName = shell.constants.rule.DISABEL;
		var unEqualSymbolName = shell.constants.rule.symbol.UNEQUAL;
		var notContianSymbolName = shell.constants.rule.symbol.NOT_CONTAIN;

		var rule = field.getRule(disableRuleName);
		if(!rule || !rule.dependGroup() || !rule.dependGroup().dependExpresses()){
			return;
		}

		var dependExpresses = rule.dependGroup().dependExpresses();
		if(dependExpresses.length != 1){
			return;
		}

		var parentId = dependExpresses[0].fieldId();
		var symbol = dependExpresses[0].symbol();
		if((symbol == unEqualSymbolName || symbol == notContianSymbolName)
			&& dependExpresses[0].value() == relyValue){
			return parentId;
		}
	}

	var findParent = function(id){
		for(var i = 0; i < fields.length; ++i){
			if(id == fields[i].id()){
				return fields[i];
			}
		}
	}

	var buildParents = function(field){
		if(field.tp){
			record[field.tp.id()] = true;
			return arguments.callee(field.tp);
		}else{
			return field;
		}
	}

	var buildChildren = function(field){
		if(!field || !field.tcs){return;}
		for (var i = field.tcs.length - 1; i >= 0; i--) {
			var child = field.tcs[i];
			if(child){
				record[child.id()] = true;
				arguments.callee(child);
			}
		};
	}

	var buildFieldTree = function(field){
		record[field.id()] = true;

		buildChildren(field);
		return buildParents(field);
	}

	var isSupport = function(tree){
		//父全为多选或者全为单选，叶子必须为多选
		//先将字段分为两部分，叶子节点和其他
		var leaf = [];
		var parents = [];

		var patch = function(node){
			if(!node.tcs || node.tcs.length == 0){
				leaf.push(node);
			}else{
				parents.push(node);
				for(var i = 0; i < node.tcs.length; ++i){
					arguments.callee(node.tcs[i]);
				}				
			}
		}

		patch(tree);

		var SINGLE_CHECK = shell.constants.field.SINGLE_CHECK;
		var MULTI_CHECK = shell.constants.field.MULTI_CHECK;

		for(var i = 0; i < leaf.length; ++i){
			if(leaf[i].type() != MULTI_CHECK){
				return false;
			}
		}

		if(parents.length <= 0){
			return false;
		}

		var type = parents[0].type();
		if(type != SINGLE_CHECK && type != MULTI_CHECK){
			return false;
		}

		for(var i = 1; i < parents.length; ++i){
			if(type != parents[i].type()){
				return false;
			}
		}

		return true;
	}

	for(var i = 0; i < fields.length; ++i){
		var field = fields[i];
		var pid = findParentId(field);
		if(!pid){continue;}
		var parent = findParent(field.id());
		if(!parent){continue;}

		if(!parent.tsc){parent.tsc = [];}
		parent.tsc.push(field);
		field.tp = parent;
	}

	//提炼出一棵棵树
	for(var i = 0; i < fields.length; ++i){
		var field = fields[i];
		var id = field.id();

		if(record[id]){continue;}
		var root = buildFieldTree(field, true);
		trees.push(root);
	}

	//将不符合规则的tree排除掉
	var result = [];
	for(var i = 0; i < trees.length; ++i){
		var tree = trees[i];
		if(isSupport(tree)){
			result.push(tree);
		}
	}

	return result;
}

function SaleLayout(minCountPerColumn, fixedColumnCount, fields)
{
	/*
	{
		minCountPerColumn:每列最少字段数
		fixedColumnCount:固定列数
		fields:所有字段集合
	}
	*/

	/*
		数据转换,将关联的字段聚合为单元
		FieldUnit
		{
			push：function,
			size:function,
			get:function,
		}
	*/

	var record_ = {};
	function FieldUnit(){
		var unit_ = [];
		
		this.push = function(field){
			if(record_[field.id] == true){
				// 一个字段被添加至少两次，其显示隐藏依赖的字段不止一个
				// 此时，它只会添加到第一个依赖的字段
				debug.error("record_[" + field.id + "] == true");
				return;
			}

			unit_.push(field);
			record_[field.id] = true;
		}

		this.size = function(){
			return unit_.length;
		}
		
		this.get = function(index){
			if(index >= 0 && index < unit_.length){
				return unit_[index];
			}
		}

		this.toString = function(){
			var s = "{\n";
			for(var i = 0; i < unit_.length; ++i){
				s += unit_[i].id;
				s += ":";
				s += unit_[i].name;
				s += "\n";
			}
			s += "}\n";
			return s;
		}
	}

	function units2String(units){
		for(var i = 0; i < units.length; ++i){
			debug.trace(units[i].toString());
		}
	}

	var findDepends = function(item, items, fieldUnit){
		var disableRule = function(field){
			var rules = field.rules;
			for(var i = 0; i < rules.length; ++i){
				if(rules[i].name == shell.constants.rule.DISABEL){
					return rules[i];
				}
			}
		}

		var isDependOn = function(field, id){
			var rule = disableRule(field);
			if(!rule || !rule.dependGroup){return false;}
			var expresses = rule.dependGroup.expresses;
            if(expresses && expresses.length){
                for(var i = 0; i < expresses.length; ++i){
                    var express = expresses[i];
                    if(!express){continue;}
                    var relyId = express.relativeFieldId;
                    if(relyId == id){
                        return true;
                    }
                }
            }

			return false;

		}

		var id = item.id;
		fieldUnit.push(item);

		//1.A的disable的依赖者
		var relyIds = [];
		var rule = disableRule(item);
		if(rule && rule.dependGroup){
			var expresses = rule.dependGroup.expresses;
	        if(expresses && expresses.length){
	            for(var i = 0; i < expresses.length; ++i){
	                var express = expresses[i];
	                var relyId = express.relativeFieldId;
	                debug.error(relyId);
	                relyId? relyIds.push(relyId): undefined;
	            }
	        }
		}

		for(var i = 0, relyId; relyId < relyIds[i]; ++i){
			for(var j = 0, tempItem; tempItem = items[j]; ++j){
				if(tempItem.id == relyId){
					if(!record_[tempItem.id]){
						fieldUnit.push(tempItem);
						arguments.callee(tempItem, items, fieldUnit);
					}

					break;
				}
			}
		}

		//2.A被依赖
		for(var i = 0; i < items.length; ++i){
			var other = items[i];
			if(id == other.id){continue;}
			if(isDependOn(other, id)){
				arguments.callee(other, items, fieldUnit);
			}
		}
	}

	var subSchema = function(count, units, index){
		var list = [];
		while(list.length < count && index < units.length){
			var unit = units[index];
			for(var i = 0; i < unit.size(); ++i){
				list.push(unit.get(i));
			}
			++index;
		}

		return {"index":index, "list":list}
	}

	var layout_ = [];//数据排版结果

	var fields_ = (function(){
		var array = [];
		for(var i = 0; i < fields.length; ++i){
			array.push(fields[i]);
		}
		return array;
	})();

	var depend_ = [];
	for(var i = 0; i < fields_.length; ++i){
		var field = fields_[i];
		if(record_[field.id]){continue;}

		var unit = new FieldUnit();
		findDepends(field, fields_, unit);
		depend_.push(unit);
	}

	var length = fields_.length;
	var isOut = fields_.length > fixedColumnCount * minCountPerColumn;
	var left = 0;
	if(isOut){left = length % fixedColumnCount;}
	var perColumnCount = parseInt(length / fixedColumnCount);
	var dependIndex = 0;
	for(var i = 0; i < fixedColumnCount; ++i){
		var per = perColumnCount + (left > 0 ? 1 : 0);
		if(left > 0){--left;}

		if(depend_.length < fixedColumnCount){per = 1;}
		var ret = subSchema(per, depend_, dependIndex);
		layout_.push(ret.list);
		dependIndex = ret.index;
	}

	this.fields = function(index){
		return layout_[index];
	}
}

// JavaScript Document
window.sale = new (function(){
	//
	var loadSaleSchema = function(saleFields, schema, schemaType) {
		var saleFieldList = [];
		for (var i = 0; i < schema.length; ++i) {
			var id = schema[i].id;
			if (saleFields.hasOwnProperty(id)) {
				saleFieldList.push(schema[i]);
			}
		}
		debug.log("render length:" + saleFieldList.length);
		debug.error(saleFieldList);

		//预排版
		var MIN_COUNT_PER_COLUMN = 5;
		var FIXED_COLUMN_COUNT = 3;
		var layout = new SaleLayout(MIN_COUNT_PER_COLUMN, FIXED_COLUMN_COUNT, saleFieldList);
		for(var i = 0; i < FIXED_COLUMN_COUNT; ++i){
			var section = "#section" + i;
			var fields = layout.fields(i);
			if(fields.length > 0){
				loadOthers({}, fields, section, schemaType);
			}else{
				break;
			}
		}
	}

	this.clearSchema = function () {
		$("#section0").empty();
	   	$("#section1").empty();
	   	$("#section2").empty();

		RuleEngine.reset();
		FieldManager.clear();
	}

	this.loadSaleSchema = function(schemaType){
		debug.log("loadSaleSchema");
		loadSaleSchema(frame.property(shell.item), shell.item, schemaType);

		RuleEngine.applyCommands(schemaType);
		FieldManager.applyRules(schemaType);
	}

})();

/**************************/
process.renderItemAddSchema = function(json){
	shell.setItemToken(json);
	sale.loadSaleSchema(shell.constants.schema.ITEM_ADD);
}

process.renderItemUpdateSchema = function(json){
	shell.setItemToken(json);
	sale.loadSaleSchema(shell.constants.schema.ITEM_UPDATE);
}

process.clearAllSchema = function(){
	process.tryHideLoadingUi();
	process.tryCloseNetErrorTip();
	sale.clearSchema();
	process.handleClear();
	Tooltip.clear();
}