// JavaScript Document

//初始化时的skuMeta
function SkuInitedMetas(skuMetaIds){
	//
	var options_ = {};
	var skuMetaIds_ = skuMetaIds;

	var isMetaId = function(id, metaIds){
		for(var i = 0; i < metaIds.length; ++i){
			if(id == metaIds[i]){
				return true;
			}
		}
		return false;
	}
	
	this.add = function(id, value){
		if(!value || !isMetaId(id, skuMetaIds_)){
			return;
		}

		if(!options_[id]){
			options_[id] = [];
		}

		for(var i = 0; i < options_[id].length; ++i){
			var option = options_[id][i];
			if(option && option.value == value){
				return;
			}
		}

		var option = {};
		option.id = id;
		option.value = value;

		options_[id].push(option);
	}

	this.get = function(id){
		if(options_[id]){
			return options_[id];
		}else{
			return [];
		}
	}
}

///////////////////////////////////////////////////
util.createNamespace("util.sku");
//
util.sku.applyRules2PriceAndQuantity = function($el, sku){
	var inputs = sku.inputs();
	var filterIds = ["sku_price", "sku_quantity"];
	var filterInputs = [];
	_.each(inputs, function(input){
		if(filterIds.indexOf(input.rawId()) != -1){
			filterInputs.push(input);
		}
	});

	_.each(filterInputs, function(input){
		util.sku.applyRules(input, $el);
	});
}

util.sku.applyRules = function(field, $el){
	if(!field || $el.length == 0){
		return;
	}

	var id = field.rawId();
	var $input = $("#" + id, $el);
	if($input.length == 0){
		return;
	}
	var $tdInputs = $(".custom-sku-table td[for=" + id + "] input", $el);

	var valueTypeRule = field.getRule(shell.constants.rule.VALUE_TYPE);
	if(valueTypeRule){
		var value = valueTypeRule.value();
		if(input[value]){
			input[value]($input);
			input[value]($tdInputs);
		}
	}

	var minValueRule = field.getRule(shell.constants.rule.MIN_VALUE);
	if(minValueRule){
		var value = minValueRule.value(true);
		var isInclude = minValueRule.exProperty() == "include";
		input["minValue"]($input, value, isInclude);
		input["minValue"]($tdInputs, value, isInclude);
	}

	var maxValueRule = field.getRule(shell.constants.rule.MAX_VALUE);
	if(maxValueRule){
		var value = maxValueRule.value(true);
		var isInclude = maxValueRule.exProperty() == "include";
		input["maxValue"]($input, value, isInclude);
		input["maxValue"]($tdInputs, value, isInclude);
	}
}
