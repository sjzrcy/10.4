// JavaScript Document

//
util.createNamespace("util.sku");

//
util.sku.emptyOption = function(){
	return {
		id:"",
		value:"",
		text:"",
		alias:"",
		isCustom:false,
		sizeTip:"",
		basecolor:[],
		url:"",
		rgb:"",
		checked:false,
		complexid:"",
	}
}

util.sku.isRely = function(field, relyId, value){
	var disableRuleName = shell.constants.rule.DISABEL;
	var unEqualSymbolName = shell.constants.rule.symbol.UNEQUAL;

	var rule = field.getRule(disableRuleName);
	if(!rule || !rule.dependGroup() || !rule.dependGroup().dependExpresses()){
		return false;
	}

	var dependExpresses = rule.dependGroup().dependExpresses();
	if(dependExpresses.length != 1){
		return false;
	}

	if(relyId != dependExpresses[0].fieldId()){
		return false;
	}

	var symbol = dependExpresses[0].symbol();
	var dependValue = dependExpresses[0].value();
	if((symbol != unEqualSymbolName) || (dependValue != value)){
		return false;
	}

	return true;
}

util.sku.findRelyField = function(sku, relyId, groupOption){
	var children = sku.children();
	for(var i = children.length - 1; i >= 0; --i){
		var child = children[i];
		var field = FieldManager.get(child.id);
		if(!field){field = new ItemField(child);}
		if(this.isRely(field, relyId, groupOption.value)){
			return field;
		}
	}
}

util.sku.findOption = function(field, text, likeValue){
	var options = field.options();
	if(!options){return;}

	for(var i = 0; i < options.length; ++i){
		var option = options[i];
		var opText = option.text();
		var opValue = option.value();
		if(opText == text && opValue.indexOf(likeValue) != -1){
			return option;
		}
	}
}

util.sku.findRelyInput = function(sku, size){
	var relyId = size.rawId();
	var relyOption = this.findOption(size, "其它", "-1");
	if(!relyOption){
		relyOption = this.findOption(size, "其他", "-1");
		if(!relyOption){
			return;
		}
	}

	var relyValue = relyOption.value();
	var INPUT = shell.constants.field.INPUT;

	var children = sku.children();
	for(var i = children.length - 1; i >= 0; --i){
		var child = children[i];
		var field = FieldManager.get(child.id);
		if(!field){field = new ItemField(child);}

		if(field.type() != INPUT){continue;}
		if(this.isRely(field, relyId, relyValue)){
			return field;
		}
	}
	
}

util.sku.confirm = function(cbConfirm, cbCancel){
	var options = {
		title:"操作确认",
		content:"切换销售属性分组将丢失所有数据，确定切换？",
		buttons:[
			{
				text:"确认", 
				click:function(){
					dialog.close();
					cbConfirm();
				}
			}, 
			{
				text:"取消", 
				click:function(){
					dialog.close();
					cbCancel();
				}
			},
		],
		contentIcon:config.image.WARN,
	};

	var dialog = new SchemaDialog(options);
	dialog.show();
}

util.sku.isRequired = function(field){
	if(field){
		return !!field.getRule(shell.constants.rule.REQUIRED);
	}
}

util.sku.getTip = function(field){
	var tip = "";
	
	if(field){
		var tipRule = field.getRule(shell.constants.rule.TIP);
		if(tipRule){tip = tipRule.value();}
	}
	
	return tip;
}

util.sku.getTipRule = function(field){
	if(field){
		return field.getRule(shell.constants.rule.TIP);
	}
}

util.sku.fields = new (function(){
	var used_ = {};

	this.add = function(id){
		used_[id] = true;
	}

	this.reset = function(){
		used_ = {};
	}

	this.isUsed = function(id){
		return (used_[id] === true);
	}
});

util.sku.translate = function(skuItems, schemaType, tokens){
	var fields = [];
	for(var i = 0; i < tokens.length; ++i){
		var token = tokens[i];
		if(skuItems[token.id] !== undefined){
			debug.trace(token);
			token.schemaType = schemaType;
			var field = new ItemField(token);
			fields.push(field);
		}
	}
	return fields;
}

util.sku.find = function(id, fields){
	if(!fields || !fields.length){
		return;
	}

	for(var i = fields.length - 1; i >= 0; --i){
		var field = fields[i];
		if(field.rawId() == id){
			return field;
		}
	}
}

util.sku.findChild = function(id, field){
	if(!field){
		return;
	}
	
	var children = field.children();
	if(!children || !children.length){
		return;
	}

	for(var i = children.length - 1; i >= 0; --i){
		var child = children[i];
		if(child.id == id){
			return child;
		}
	}
}

util.sku.extendId = function(id){
	var length = 8;
	var index = id.indexOf("in_prop_");
	if(index == -1){
		length = 5;
		index = id.indexOf("prop_");
	}

	if(index >= 0){
		var extend = id.substr(length);
		var extend = "prop_extend_" + extend;
		return extend;
	}else{
		alert("字段ID格式异常:" + id + ", 不以prop_或in_prop_开头");
	}
}

util.sku.findColor = function(sku){
	var children = sku.children();
	if(!children || !children.length){
		return;
	}

	var color = _.find(children, function(child){
		return util.config.isColor(child.id);
	});

	if(!color){
		return;
	}

	return (new ItemField(color));
}

util.sku.findExtendColor = function(color, fields){
	var id = color.rawId();
	var extendId = util.sku.extendId(id);
	if(extendId){
		return this.find(extendId, fields);
	}
}

util.sku.findSize = function(sku){
	var children = sku.children();
	if(!children || !children.length){
		return;
	}

	var size = _.find(children, function(child){
		return util.config.isSize(child.id);
	});

	if(!size){
		return;
	}

	return (new ItemField(size));
}

util.sku.findExtendSize = function(size, fields){
	var id = size.rawId();
	var extendId = util.sku.extendId(id);
	if(extendId){
		return this.find(extendId, fields);
	}
}

util.sku.findStdSizeExtends = function(fields){
	var field = _.find(fields, function(field){
		var id = field.rawId();
		return util.config.isSizeExtends(id);
	});

	return field;
}

util.sku.normalSkuProps = function(sku){
	var props = [];
	var children = sku.children();
	if(!children || !children.length){
		return props;
	}

	var SINGLE_CHECK = shell.constants.field.SINGLE_CHECK;
	for(var i = 0; i < children.length; ++i){
		var child = children[i];
		if(child.type == SINGLE_CHECK && !util.sku.fields.isUsed(child.id)){
			util.sku.fields.add(child.id);
			props.push(new ItemField(child));
		}
	}

	return props;
}

util.sku.inputs = function(sku){
	var inputs = [];
	var children = sku.children();
	if(!children || !children.length){
		return inputs;
	}

	var INPUT = shell.constants.field.INPUT;
	for(var i = 0; i < children.length; ++i){
		var child = children[i];
		if(child.type == INPUT && !util.sku.fields.isUsed(child.id)){
			util.sku.fields.add(child.id);
			inputs.push(new ItemField(child));
		}
	}

	return inputs;
}

util.sku.checkUnkonwSkuMeta = function(sku){
	var children = sku.children();
	if(!children || !children.length){
		return;
	}

	var info = "";
	for(var i = 0; i < children.length; ++i){
		var child = children[i];
		if(!util.sku.fields.isUsed(child.id)){
			info += (child.id + ":" + child.type + "\n");			
		}
	}

	if(info.length > 0){
		info = "没有处理到sku子属性为：\n" + info + "=============================";
		debug.trace(info);
		debug.error(info);
	}
}

util.sku.key = function(skuItem){
	var key ="k";
	_.each(skuItem, function(option){
		key += option.value;
	});
	return key;
}

util.sku.value = function(model, key, input){
	var id = input.rawId();
	var item = model[key];
	if(item){
		var data = item["data"];
		if(data){
			return data[id]? data[id]: "";
		}
	}

	return "";
}

util.sku.text = function(option){
	var text = option.text;

	if(option.isCustom){
		text = option.value;
	}else if(option.alias){
		text = option.alias;
	}

	return text;
}

util.sku.updateSkuModel = function(key, skuItem, model, sku){
	var item = model[key];
	if(!item){
		item = {};
		item["complexid"] = shell.createUUID();
		
		var data = {};
		_.each(skuItem, function(option){
			data[option.id] = option.value;
			if(option.isCustom && option.isSize){
				var other = option["other"];
				data[other["id"]] = other["value"];
			}
		});

		item["data"] = data;
		model[key] = item;

		//添加到缓存的同时添加到后端
		sku.updateSkuItem(key, sku.emptyInputs());
	}
}

util.sku.customRelyId = function(id, metas){
	var metaId = id;
	_.find(metas, function(meta){
		if(meta.inputId() == id){
			metaId = meta.id();
			return true;
		}
	});
	return metaId;
}

util.sku.relyInputId = function(id, metas){
	var inputId = "";
	_.find(metas, function(meta){
		if(meta.id() == id){
			inputId = meta.inputId();
			return true;
		}
	});
	return inputId;
}

util.sku.removeInvalidSkuItem = function(skuItems, model, removeCb){
	var keys = [];
	_.each(skuItems, function(skuItem){
		var key = "k";
		_.each(skuItem, function(option){
			key += option.value;
		});
		keys.push(key);
	});

	for(var key in model){
		if(keys.indexOf(key) == -1){
			var item = model[key];
			var complexid = item["complexid"];

			//不打标记，直接清空缓存
			if(!model[key]["outdate"] && removeCb){
				removeCb(complexid);
				delete model[key];
			}
			//
		}
	}
}

util.sku.title = function(text, width, className){
	var title = "";
	var $temp = $("<span>").addClass(className).text(text);
	$("body").append($temp);
	if($temp.width() > width){
		title = text;
	}

	$temp.remove();
	return title;
}

util.sku.setTitle2Inputs = function($el, width, className){
	$("input", $el).each(function(){
		var $input = $(this);
		var text = $input.val();
		$input.attr("title", util.sku.title(text, width, className));
	});
}

util.sku.updateInputBorder = function($input, isChecked){
	if(!$input.length){return;}
	//
	if(isChecked){
		if(!$input.hasClass("sku-checked")){
			$input.addClass("sku-checked");
		}
	}else{
		if($input.hasClass("sku-checked")){
			$input.removeClass("sku-checked");
		}
	}
}

util.sku.decodeInput = function($el){
	if($el.length == 0){
		return;
	}
	
	$(":text", $el).each(function(){
		var $input = $(this);
		if($input.attr("encode") == "1"){
			var value = $input.attr("value");
			$input.attr("value", unescape(value));

			var lastValue = $input.attr("lastValue");
			$input.attr("lastValue", unescape(lastValue));
		}
	});
}

util.sku.decodeTable = function($table){
	if($table.length == 0){
		return;
	}
	
	$("td", $table).each(function(){
		var $td = $(this);
		var $input = $(":text", $td);
		if($input.length > 0){
			var value = $td.attr("value");
			$td.attr("value", unescape(value));

			var lastValue = $td.attr("lastValue");
			$td.attr("lastValue", unescape(lastValue));

			var val = $input.val();
			$input.val(unescape(val));
		}else{
			var value = $td.attr("value");
			$td.attr("value", unescape(value));

			var text = $td.text();
			$td.text(unescape(text));
		}
	});

	$("tr", $table).each(function(){
		var $tr = $(this);
		var key = $tr.attr("key");
		$tr.attr("key", unescape(key));
	});
}

util.sku.showTipDialog = function(title, text, onClose){
	var option = {
		title: title,
		content: text,
		buttons:[{text:"我知道了", click:function(){dialog.close();}}],
		contentIcon:config.image.WARN,
		callback:{hide:onClose,},
	}

	var dialog = new SchemaDialog(option);
	dialog.show();
}