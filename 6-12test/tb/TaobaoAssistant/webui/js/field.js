// JavaScript Document

//////////////LabelGroup//////////////////
function LabelGroup(group)
{
	var name_ = group.name;
	var labels_ = JSON.parse(group.labels);
	var groups_ = (function(gs){
		var groups = [];
		for(var i = 0; i < gs.length; ++i){
			var g = new LabelGroup(gs[i]);
			groups.push(g);
		}
		return groups;
	})(group.groups);

	this.name = function(){return name_;}
	this.groups = function(){return groups_;}
	this.labels = function(){return labels_;}
}

////////ItemField/////////////
function ItemField(field) {
	if (!field) { 
		debug.error("fatal error. c++ filed is empty.");
		return;
	}

	this.rawField = function(){
		return field;
	}

	// 私有成员变量
	var rawId_ = field.id;
	var id_ = (function(field){//parent 统一为qtField
		var id = field.id;
		var parent = field.parent;
		while(parent){
			id = parent.id + config.ID_SPLIT + id;
			parent = parent.parent;
		}
		return id;
	})(field);

	var type_ = field.type;
	/*if(type_ == shell.constants.field.INPUT){
		type_ = shell.constants.field.MULTI_INPUT;
	}*/

	var name_ = field.name;
	if(config.alias[field.id]){
		name_ = config.alias[field.id];
	}
	
	var value_ = (function(value, type){
		if(type != shell.constants.field.MULTI_CHECK 
			&& type != shell.constants.field.MULTI_INPUT){
			return value;
		}

		var vs = value.split(config.SPLIT);
		for(var i = 0; i < vs.length; ++i){
			vs[i] = urlCoder.decode(vs[i]);
		}

		if(vs.length > 1){
			debug.trace("MULTI_CHECK | MULTI_INPUT:" + vs.join("-"));
			return vs;
		}else{
			return vs[0];
		}
	})(field.value, type_);

	var schemaType_ = field.schemaType;
	var options_ = (function(options) {
		var ops = [];
		if (options == null) {
			return ops;
		}

		for (var index = 0; index < options.length; ++index) {
			ops.push(new FieldOption(options[index].value, options[index].text));
		}
		return ops;
	})(field.options);

	var rules_ = (function(rules) {
		rules = util.mergeTipRule(rules);
		var fieldRules = [];
		for (var index = 0; index < rules.length; ++index) {
			fieldRules.push(new FieldRule(rules[index]));
		}
		return fieldRules;
	})(field.rules);

	var children_ = field.children;
	var complexValueList_ = field.complexValueList;
	var labelGroup_ = (function(group){
		if(group != null){
			return (new LabelGroup(group));
		}else{
			return null;
		}
	})(field.labelGroup);

	this.labelGroup = function(){
		return labelGroup_;
	}

	this.id = function() {
		return id_;
	}
	this.rawId = function(){
		return rawId_;
	}
	this.name = function() {
		return name_;
	}
	this.setName = function(name){
		name_ = name;
	}
	this.type = function() {
		return type_;
	}
	this.setType = function(type){
		type_ = type;
	}
	this.schemaType = function() {
		return schemaType_;
	};

	this.options = function() {
		return options_;
	}

	this.updateOptions = function(qtOptions){
		if(!$cache_){return;}

		options_ = (function(options) {
			var ops = [];
			if (options == null) {
				return ops;
			}
			for (var index = 0; index < options.length; ++index) {
				ops.push(new FieldOption(options[index].value, options[index].text));
			}
			return ops;
		})(qtOptions);

		var $select = $("select", $cache_);
		$select.empty();

		var hasInitedValue = false;
		for (var index = 0; index < options_.length; ++index) {
			var option = options_[index];
			var $option = $("<option>")
				.attr("value", option.value())
				.text(option.text());
			$select.append($option);

			if (option.value() == value_) {
				$option.prop("selected", true);
				hasInitedValue = true;
				var selectedOption = option;
			}
		}

		var $emptyOption = $("<option>").attr("value", "").text(config.queryselect.DELETE);
		$select.prepend($emptyOption);
		if(!hasInitedValue){
			$emptyOption.prop("selected", true);
		}

		if(selectedOption){
			$(":text", $cache_).val(selectedOption.text());
		}
	}

	this.rules = function() {
		return rules_;
	}
	this.children = function() {
		return children_;
	}
	
	this.complexValues = function() {
		return complexValueList_;
	}

	this.setSizeMapping = function(sizeMapping){
		_.each(sizeMapping, function(mapping){
			var sizeOption = mapping.sizeOption;
			var complexValue = mapping.complexValue;

			var id = sizeOption.id;
			var value = sizeOption.value;
			var complex = null;
			_.find(complexValueList_, function(complexValue){
				if(complexValue[id] == value){
					complex = complexValue;
				}
			});

			if(!complex){
				complex = {};
				complex["complexid"] = shell.createUUID();
				complex[id] = value;
				complexValueList_.push(complex);
			}else{//只有在complexValue已经存在的情况下才需要先清空原有的值
				_.each(complex, function(value, key){
					if(key.indexOf("size_mapping_") == 0){
						delete complex[key];
					}
				});
			}

			//如果是自定义，将枚举值的其他写入
			if(sizeOption.isCustom && sizeOption.other){
				var other = sizeOption.other;
				complexValue[other.id] = other.value;
			}

			_.extend(complex, complexValue);
			shell.setComplexValue(schemaType_, rawId_, complex["complexid"], complex);
		});
	}

	this.removeInvalidSizeMapping = function(selectedOptions){
		var newComplexValueList = [];
		_.each(selectedOptions, function(option){
			var id = option.id;
			var value = option.value;
			var complex = _.find(complexValueList_, function(complexValue){
				return (complexValue[id] == value);
			});

			if(complex){
				newComplexValueList.push(complex);
			}
		});

		//@ZZ 此处验证一下
		var diffs = _.difference(complexValueList_, newComplexValueList);
		_.each(diffs, function(complexValue){
			debug.trace("removeComplexValue:" + complexValue["complexid"]);
			shell.removeComplexValue(schemaType_, rawId_, complexValue["complexid"]);
		});

		//更新内存
		complexValueList_ = newComplexValueList;
	}

	this.addComplexValue = function(complexValue){
		complexValueList_.push(complexValue);
	},

	this.removeComplexValue = function(complex){
		var index = -1;
		_.find(complexValueList_, function(complexValue, i){
			if(complexValue == complex){
				index = i;
				return true;
			} 
		});

		if(index >= 0){
			complexValueList_.splice(index, 1);
		}
	}

	this.value = function() {
		return value_;
	}

	var hasUpdated_ = true;
	this.hasUpdated = function(){return hasUpdated_;}
	this.setUpdated = function(){hasUpdated_ = true;}

	this.setValue = function(value) {
		value_ = value;
		hasUpdated_ = false;

		if(!this.isProduct()){this.update();}
		if(this.cache()){$cache_.trigger("valueChanged");}
	}

	var $cache_ = undefined;
	this.setCache = function($cache){$cache_ = $cache;}
	this.cache = function() {
		if (!$cache_) {
			$cache_ = $("#" + JID(id_));
			if($cache_.length == 0){
				$cache_ = null;
				debug.warn("!important, [" + JID(id_) + "]get null $cache!");
			}
		}
		return $cache_;
	}

	var isChild_ = (field.isChild === true);
	this.isChild = function(){
		return isChild_;
	}

	var layer_ = (field.layer == undefined) ? 1: field.layer;
	this.layer = function(){
		return layer_;
	}

	var isProduct_ = (field.isProduct === true);
	this.isProduct = function(){return isProduct_;}

	if(children_){
		for(var i = children_.length - 1; i >= 0; --i){
			var child = children_[i];
			child.schemaType = field.schemaType;
			child.layer = layer_ + 1;
			child.isProduct = isProduct_;
			child.parent = field;
			child.isChild = true;
		}
	}
	
	//将新创建的对象保存到静态变量中
	FieldManager.add(id_, this);
};

// 类的成员方法 
ItemField.prototype.html = function() {
	var $title = this.title(false);
	var $content = this.content();

	if(!this.isSimple()){
		$title.addClass("clearfix");
	}

	var $wrapper = $("<div>")
		.addClass("wrapper clearfix")
		.append($title)
		.append($content);

	return $wrapper;
}

ItemField.prototype.update = function(){
	if(this.hasUpdated()){
		return;
	}
	
	var id = this.id();
	var value = this.value();
	var schemaType = this.schemaType();
	debug.trace("update:(id," + id + "), (value,[" + value + "]), (schemaType," + schemaType + ")");
	shell.updateProperty(id, value, schemaType);
	this.setUpdated();

	//更新任何一条关键属性，都触发一次获取潜在产品的流程
	if (schemaType === shell.constants.schema.PRODUCT) {
		shell.updateBrand(function(data){
			spu.clear();
			basic.clearItemEditSchema();
		});
	}
}

ItemField.prototype.updateProduct = function(productId){
	if(this.hasUpdated()){
		return;
	}
	
	var id = this.id();
	var value = this.value();
	var schemaType = this.schemaType();
	debug.log("updateProduct:(id," + id + "), (value,[" + value + "]), (schemaType," + schemaType + ")");
	if(this.type() != shell.constants.field.LABEL){
		shell.updateProductProperty(productId, schemaType, id, value);
	}

	this.setUpdated();
}

ItemField.prototype.isSimple = function(){
	var type = this.type();
	var field = shell.constants.field;
	return (type == field.INPUT 
			|| type == field.MULTI_INPUT
			|| type == field.SINGLE_CHECK
			|| type == field.MULTI_CHECK
			|| type == field.LABEL);
}

ItemField.prototype.isComplex = function(){
	return (this.type() == shell.constants.field.COMPLEX);
}

ItemField.prototype.simpleTitle = function(isRequired) {
	var $e = $("<div>").addClass("title_box float_left").addClass(config.css.TITLE_WRAP);

	var adapted = this.adaptedTitle(isRequired);
	var $text = $("<div>").text(adapted).addClass("float_right").css({position:"relative", right:"6px"});
	if (adapted != this.name()) {
		$text.attr("title", this.name());
		$text.tooltip();
	}
	$e.append($text);

	if (isRequired) {
		var $required = $("<div>").text("*").addClass("float_right required").css({position:"relative", right:"7px"});
		$e.append($required);
	}
	
	if(this.layer() > 2 && this.isSimple()){
		$e.css("width", (122 - ((this.layer() - 2) * 12)) + "px");
	}
	
	return $e;
}

ItemField.prototype.complexTitle = function(isRequired) {
	var $e = $("<div>").addClass("title_box float_left").addClass(config.css.TITLE_WRAP);
	if (isRequired) {
		var $required = $("<div>").text("*").addClass("float_left required").css({position:"relative", left:this.indent()});
		$e.append($required);
	}

	var adapted = this.adaptedTitle(isRequired);
	var $text = $("<div>").text(adapted).addClass("float_left").css({position:"relative", left:this.indent()});
	if (adapted != this.name()) {
		$text.attr("title", this.name());
		$text.tooltip();
	}
	$e.append($text);
	
	if(this.layer() > 2 && this.isSimple()){
		$e.css("width", (112 - ((this.layer() - 2) * 24)) + "px");
	}
	
	return $e;
}

ItemField.prototype.title = function(isRequired) {
	var $title;
	if(this.type() == shell.constants.field.MULTI_COMPLEX){
		var $e = $("<div>").addClass(config.css.TITLE_WRAP);
		var name = this.name();
		if(this.layer() == 2){
			name = ("·" + name);
		}
		$e.text(name);
		var $required = $("<span>").addClass("required").text("*");
		if(isRequired){
			$e.prepend($required);
		}
		$title = $e;
	}else if(this.type() == shell.constants.field.COMPLEX || this.layer() > 1){
		$title = this.complexTitle(isRequired);
	}else if(this.isSimple()){
		$title = this.simpleTitle(isRequired);
	}

	if(this.type() == shell.constants.field.COMPLEX || this.type() == shell.constants.field.MULTI_COMPLEX){
		if($title){$title.addClass("title_box_complex");}
	}

	return $title;
}

ItemField.prototype.adaptedTitle = function(isRequired) {
	if (this.layout() == config.layout.V) {
		if(this.layer() == 2){
			return ("·" + this.name());
		}else{
			return this.name();
		}	
	}

	var MAX_LENGTH = 15 - (this.layer() > 2 ? (this.layer() - 2) * 4 : 0); //包括*在内最多显示8个中文字符
	if (isRequired != true) {
		MAX_LENGTH += 1;
	}

	var title = this.name();
	if(this.layer() == 2){
		MAX_LENGTH -= 2;
	}

	var adapted = title;
	while(util.tbPxStringSize(adapted) > MAX_LENGTH){
		adapted = adapted.substr(0, (adapted.length - 1));
	}

	if (adapted != title) {
		adapted += "..";
	}

	if(this.layer() == 2){
		adapted = ("·" + adapted);
	}
	return adapted;
}

ItemField.prototype.isNeedMidDot = function() {
	if(this.layer() == 2){
		return true;
	}else if(this.layer() > 2){
		return (this.type() == shell.constants.field.COMPLEX
				|| this.type() == shell.constants.field.MULTI_COMPLEX);
	}

	return false;
}

ItemField.prototype.indent = function() {
	if(this.layer() <= 2){
		return "-4px";
	}else if(this.layer() > 2){
		return ((this.layer() - 2) * 24 - 4) + "px";
	}
}

ItemField.prototype.updateContentBorder = function() {
	var $cache = this.cache();
	if(!$cache){return;}

	var $content = $("." + config.css.CONTENT_WRAP, $cache);
	var $tipBox = $("." + config.css.TIP_WRAP, $cache);
	var type = this.type();
	var field = shell.constants.field;

	if($(".tip_item", $tipBox).length > 0){
		switch(type){
			case field.INPUT:{
				var $e = $(".input_wrapper", $content);
				$e.addClass("error");
				break;
			}
	
			case field.MULTI_INPUT:{
				var $e = $("textarea", $content);
				$e.addClass("error");
				break;
			}
			
			case field.SINGLE_CHECK:{
				$("select", $content).queryselect("setBorderColor", config.color.ERROR, "#333333");
				break;
			}

			case field.MULTI_CHECK:{
				$content.addClass("error");
				break;
			}

			default:
				break;
		}
	}else{
		switch(type){
			case field.INPUT:{
				var $e = $(".input_wrapper", $content);
				$e.removeClass("error");
				break;
			}
					
			case field.MULTI_INPUT:{
				var $e = $("textarea", $content);
				$e.removeClass("error");
				break;
			}

			case field.SINGLE_CHECK:{
				$("select", $content).queryselect("setBorderColor", config.color.NORMAL, "#333333");
				break;
			}

			case field.MULTI_CHECK:{
				$content.removeClass("error");
				break;
			}

			default:
				break;
		}
	}
}

ItemField.prototype.setReadOnly = function(isReadOnly) {
	var $cache = this.cache();
	if(!$cache){return;}

	var $content = $("." + config.css.CONTENT_WRAP, $cache);
	var $tipBox = $("." + config.css.TIP_WRAP, $cache);
	var type = this.type();
	var field = shell.constants.field;

	if(isReadOnly){
		switch(type){
			case field.INPUT:{
				var $e = $(".input_wrapper", $content);
				$e.addClass("readonly");
				$("input", $e).css("color", "#999999");
				setTimeout(function(){$("input", $e).prop("disabled", true);}, 40);
				break;
			}
	
			case field.MULTI_INPUT:{
				var $e = $(".input_wrapper", $content);
				$e.addClass("readonly");
				$("input", $e).css("color", "#999999");
				setTimeout(function(){$("input", $e).prop("disabled", true);}, 40);
				break;
			}
			
			case field.SINGLE_CHECK:{
				$("select", $content).queryselect("setBorderColor", config.color.DISABLED, "#999999");
				$("select", $content).queryselect("setDisabled", true);
				break;
			}

			case field.MULTI_CHECK:{
				$content.addClass("readonly");
				$(".input_style", $content).trigger("setReadonly", [true]);
				break;
			}

			default:
				break;
		}
	}else{
		switch(type){
			case field.INPUT:{
				var $e = $(".input_wrapper", $content);
				$e.removeClass("readonly");
				$("input", $e).css("color", "#000000");
				setTimeout(function(){$("input", $e).prop("disabled", false);}, 40);
				break;
			}
					
			case field.MULTI_INPUT:{
				var $e = $(".input_wrapper", $content);
				$e.removeClass("readonly");
				$("input", $e).prop("disabled", false);
				$("input", $e).css("color", "#000000");
				break;
			}

			case field.SINGLE_CHECK:{
				$("select", $content).queryselect("setBorderColor", config.color.NORMAL, "#333333");
				$("select", $content).queryselect("setDisabled", false);
				break;
			}

			case field.MULTI_CHECK:{
				$content.removeClass("readonly");
				$(".input_style", $content).trigger("setReadonly", [false]);
				break;
			}

			default:
				break;
		}
	}
}

ItemField.prototype.updateTip = function(text, tipClass) {
	//每一类提示都要有单元内唯一类名，作为索引标识符，以便对其进行操作
	if (!text || !tipClass) {return;}
	var $cache = this.cache();
	if(!$cache){return;}

	var $wrapper = $cache.children(".wrapper");
	var $tip_box = $wrapper.children("." + config.css.TIP_WRAP);

	var $ul = null;
	if($tip_box.length == 0){
		var $content = $("." + config.css.CONTENT_WRAP, $cache);
		var contentWidth = $content.css("width");

		var titleWidth = $("." + config.css.TITLE_WRAP, $cache).width();
		titleWidth += util.removePx($content.css("left"));
		
		$ul = $("<ul class='ul_tips'>").css("width", contentWidth);
		$tip_box = $("<div>").addClass(config.css.TIP_WRAP)
				.addClass("tip_box clearfix")
				.css("left", titleWidth + "px")
				.css("width", contentWidth);
		$tip_box.append($ul);
		$wrapper.append($tip_box);
	}else{
		$ul = $("ul", $tip_box);
	}

	var $tipItem = $("." + tipClass, $ul);
	if($tipItem.length == 0){
		$tipItem = $("<li>").addClass("tip_item").addClass(tipClass);
		$ul.append($tipItem);

		var tipWidth = $tip_box.width();
		var itemLeft = util.removePx($tipItem.css("left"));
		$tipItem.css("width", (tipWidth + itemLeft) + "px");
	}

	$tipItem.text(text);
	this.updateContentBorder();
}

ItemField.prototype.checkTip = function(tipClass) {
	var $target = this.cache();
	if(!$target){
		return false;
	}

	var $tip_box = $("." + config.css.TIP_WRAP, $target);
	if($tip_box.length == 0){
		return false;
	}

	return ($("." + tipClass, $tip_box).length > 0);
}

ItemField.prototype.removeTip = function(tipClass) {
	var $target = this.cache();
	if(!$target){
		return;
	}

	var $tip_box = $("." + config.css.TIP_WRAP, $target);
	if($tip_box.length == 0){
		return;
	}

	$("." + tipClass, $tip_box).remove();
	if($(".tip_item", $tip_box).length == 0){
		$tip_box.remove();
	}

	this.updateContentBorder();
}

ItemField.prototype.content = function() {
	var $content = editFactory.create(this);
	$content.addClass(config.css.CONTENT_WRAP);
	if(this.isSimple()){
		$content.addClass("content_box clearfix");
		if(this.layer() == 3){
			$content.css("left", "32px");
		}
	}else{
		$content.addClass("complex_box");
	}
	
	$content.css("width", this.isSimple() ? "60%" : "100%");
	return $content;
}

ItemField.prototype.layout = function() {
	var H = "input,multiinput,singlecheck,multicheck,label";
	var V = "complex.multicomplex";

	var type = this.type();
	if (H.indexOf(type) != -1) {
		return config.layout.H;
	} else if (V.indexOf(type) != -1) {
		return config.layout.V;
	} else {
		return config.layout.V;// 若为已知7种类型之外，默认使用垂直布局 
	}
}

ItemField.prototype.getRule = function(ruleName, ignoreCheck) {
	var rules = this.rules();
	for (var i = 0; i < rules.length; ++i) {
		var rule = rules[i];
		if (rule.name() == ruleName) {
			if (ignoreCheck === true || rule.isEnabled()) {
				return rule;
			}
		}
	}
}

ItemField.prototype.hasRule = function(ruleName) {
	var rule = this.getRule(ruleName);
	return (rule != undefined && rule != null);
}

// 安装规则，分为两类规则：UI类，数据校验类
ItemField.prototype.installRules = function(isForUi) {
	RuleEngine.setIsIniting(true);

	var $target = this.cache();
	if ($target == undefined || $target == null) {
		return;
	}

	var rules = this.rules();
	for (var i = 0; i < rules.length; ++i) {
		var rule = rules[i];
		if (isForUi == true && !RuleEngine.isUiRule(rule.name())) {
			continue;
		} 

		RuleEngine.installRule($target, rule);
	}

	RuleEngine.setIsIniting(false);
}

// 增加提醒 
ItemField.prototype.addReminder = function(tipRule){
	if(this.rawId() == "sell_points"){
		return;
	}

	if(!tipRule){return;}
	var $cache = this.cache();
	if(!$cache){return;}

	if(this.isSimple()){
		var $wrapper = $cache.children(".wrapper");
		var $reminder = $wrapper.children("." + config.css.REMINDER_WRAP);
		if($reminder.length > 0){return;}

		$reminder = $("<div>").addClass(config.css.REMINDER_WRAP).addClass("reminder_box reminder_simple");
		$wrapper.append($reminder);

		var tooltip = new Tooltip($reminder, tipRule);
		$reminder.hover(function(){tooltip.show();}, function(){tooltip.hide();});
	}else{
		var $wrapper = $cache.children(".wrapper");
		var $title = $wrapper.children("." + config.css.TITLE_WRAP);
		var $reminder = $title.children("." + config.css.REMINDER_WRAP);
		if($reminder.length > 0){return;}

		$reminder = $("<div>").addClass(config.css.REMINDER_WRAP).addClass("reminder_box reminder_complex")
		$title.append($reminder);

		var tooltip = new Tooltip($reminder, tipRule);
		$reminder.hover(function(){tooltip.show();}, function(){tooltip.hide();});
	}
}

// 增加提醒 
ItemField.prototype.removeReminder = function(){
	var $cache = this.cache();
	if(!$cache){return;}

	var $wrapper = $cache.children(".wrapper");
	var $reminder = $wrapper.children("." + config.css.REMINDER_WRAP);
	$reminder.remove();
}
////////end of ItemField/////////////
/*------------------------------------------------------------------------*/


////////Begin of FieldManager/////////////
//@ZZ
window.FieldManager = new (function() {
	//
	var fieldSet = {};

	this.add = function(id, itemField) {
		fieldSet[id] = itemField;
	}

	this.get = function(id) {
		return fieldSet[id];
	}

	this.find = function(id){
		for(var e in fieldSet){
			if(e.indexOf(id) > 0){
				return fieldSet[e];
			}
		}
	}

	this.sync = function(productId, schemaType){
		for(var id in fieldSet){
			var field = fieldSet[id];
			if(field && field.schemaType() == schemaType){
				field.updateProduct(productId);
			}
		}
	}

	this.setValue = function(id, value){
		var field = fieldSet[id];
		if(field){
			field.setValue(value);
		}else{
			debug.error("can not find field[id," + id +"]");
		}
	}

	this.getValue = function(id){
		var field = fieldSet[id];
		if(field){
			var $e = field.cache();
			if($e && ($e.css("display") != "none")){
				var value = field.value();
				debug.log("getValue, [id:" + id + "],[value:" + value + "]");
				return value;
			}
		}else{
			debug.error("can not get value[id," + id +"]");
		}

		return undefined;
	}

	this.getCache = function(id) {
		var field = fieldSet[id];
		if (field) {
			return field.cache();
		}
	}

	this.clear = function(schemaType) {
		if (schemaType != undefined) {
			var ids = [];
			schemaType += "";

			for (var id in fieldSet) {
				var field = fieldSet[id];
				if (field) {
					if (field.schemaType() == schemaType) {
						ids.push(id);
					}
				}
			}

			for (var i = 0; i < ids.length; ++i) {
				var id = ids[i];
				var $cache = fieldSet[id].cache();
				if($cache){
					$cache.unbind();
				}

				delete fieldSet[id];
			}

			DisableRuleService[schemaType] = [];
		} else {
			for (var id in fieldSet) {
				var field = fieldSet[id];
				if (field) {
					var $cache = fieldSet[id].cache();
					if($cache){
						$cache.unbind();
					}
				}
			}

			fieldSet = {};
			DisableRuleService = {};
		}
	}

	this.applyRules = function(schemaType) {
		var isSpecifiedSchemaType = (arguments.length >= 1);
		for (var id in fieldSet) {
			var field = fieldSet[id];
			if (field) {
				if(isSpecifiedSchemaType === true && 
					field.schemaType() != schemaType){
					continue;
				}

				field.installRules(false);
			}
		}
	}
	//
})();


////////Begin of FieldOption/////////////
function FieldOption(value, text) {
		var value_ = value;
		var text_ = text;

		this.value = function() {
			return value_;
		}
		this.text = function() {
			return text_;
		}
	}
	////////End of FieldOption/////////////
	/*------------------------------------------------------------------------*/


////////Begin of FieldRule/////////////
function FieldRule(rule) {
	var name_ = rule.name;
	var value_ = rule.value;
	var exProperty_ = rule.exProperty;
	var unit_ = rule.unit;

	var dependGroup_ = (function(dependGroup) {
		if (!dependGroup) {
			return null;
		}

		return (new DependGroup(dependGroup));
	})(rule.dependGroup);

	this.name = function() {
		return name_;
	}

	this.value = function(isNeedRawValue) {
		var v = value_;

		if(isNeedRawValue){
			return v;
		}

		if(name_.indexOf("max") != -1){
			if(exProperty_ == "include"){
				v += 1;
			}
		}else if(name.indexOf("min") != -1){
			if(exProperty_ == "include"){
				v -= 1;
			}
		}
		
		return v;
	}

	this.exProperty = function() {
		return exProperty_;
	}

	this.unit = function() {
		return unit_;
	}

	this.dependGroup = function() {
		return dependGroup_;
	}

	//fix tip rule
	var url_ = rule.url;
	var tips_ = rule.tips;

	this.url = function(){
		return url_;
	}

	this.tips = function(){
		return rule.tips;
	}
}

FieldRule.prototype.isEnabled = function() {
	// 只在rule的值是true/false時有這種判斷，所有的值到前端都為字符串
	if (this.value() == "false") {
		return false;
	} else {
		if (this.dependGroup() != null) {
			return this.dependGroup().check();
		} else {
			return true;
		}
	}
}

/////
function DependGroup(dependGroup) {
	var operator_ = dependGroup.op;
	var dependExpresses_ = (function(expresses) {
		var exps = [];
		if(!expresses){
			return exps;
		}

		for (var index = 0; index < expresses.length; ++index) {
			exps.push(new DependExpress(expresses[index]));
		}
		return exps;
	}(dependGroup.expresses));

	this.operator = function() {
		return operator_;
	}
	this.dependExpresses = function() {
		return dependExpresses_;
	}
}

DependGroup.prototype.check = function() {
	var operator = this.operator();
	var AND = shell.constants.rule.operators.AND;

	var exps = this.dependExpresses();
	for (var index = 0; index < exps.length; ++index) {
		var check = exps[index].check();
		if (operator == AND) {
			if (check == false) {
				return false;
			}
		} else {
			if (check == true) {
				return true;
			}
		}
	}

	// 若为与，则最后为true；若为或，则最后为false 
	return (operator == AND);
}

/////////////////////////////////////////////////////////////
function DependExpress(express) {
	var fieldId_ = express.relativeFieldId;
	var symbol_ = express.symbol;
	var value_ = express.value;

	this.fieldId = function() {
		return fieldId_;
	}
	this.symbol = function() {
		return symbol_;
	}
	this.value = function() {
		return value_;
	}
}

DependExpress.prototype.check = function() {
	// 按照express的symbol，获取express的真假
	var contains = function(current, compare){
		var list = [];
		if(typeof(current) == "string"){
			list = current.split(config.SPLIT);
		}else if(typeof(current) == "object"){
			list = current;
		}else{
			return false;
		}

		for(var i = 0; i < list.length; ++i){
			if(list[i] == compare){
				return true;
			}
		}
		return false;
	}

	var id = this.fieldId();
	var field = FieldManager.get(id);
	if(!field){
		field = FieldManager.find(id);
		if(!field){
			debug.error("can not find id:" + id);
			return true;
		}
	}

	var cv = undefined;
	if(field.cache() && field.cache().css("display") != "none"){
		cv = field.value();
	}

	var isTrue = false;
	var symbol = shell.constants.rule.symbol;
	var value = this.value();

	switch (this.symbol()) {
		case symbol.IS_NULL:
			isTrue = (cv == "");
			break;
		case symbol.EQUAL:
			isTrue = (cv == value);
			break;
		case symbol.UNEQUAL:
			isTrue = (cv != value);
			break;
		case symbol.BIG_THAN:
			isTrue = (parseFloat(cv) > parseFloat(value));
			break;
		case symbol.LESS_THAN:
			isTrue = (parseFloat(cv) < parseFloat(value));
			break;
		case symbol.BIG_EQUAL_THAN:
			isTrue = (parseFloat(cv) >= parseFloat(value));;
			break;
		case symbol.LESS_EQUAL_THAN:
			isTrue = (parseFloat(cv) <= parseFloat(value));;
			break;
		case symbol.CONTAIN:
			isTrue = contains(cv, value);
			break;
		case symbol.NOT_CONTAIN:
			isTrue = !contains(cv, value);
			break;
		case symbol.IN_OPTIONS: // 在选项内 
		case symbol.NOT_IN_OPTIONS: // 不在选项内
			debug.warn(this.symbol() + ": not suppport!");
			break;
		default:
			debug.warn(this.symbol() + ": unknow!");
	}

	debug.log(id + "(" + cv + " " + this.stringSymbol() + " " + value +")");
	return isTrue;
}

DependExpress.prototype.stringSymbol = function(){
	var symbol = shell.constants.rule.symbol;
	switch (this.symbol()) {
		case symbol.IS_NULL:
			return "is null";
		case symbol.EQUAL:
			return "==";
		case symbol.UNEQUAL:
			return "!=";
		case symbol.BIG_THAN:
			return ">";
		case symbol.LESS_THAN:
			return "<";
		case symbol.BIG_EQUAL_THAN:
			return ">=";
		case symbol.LESS_EQUAL_THAN:
			return "<=";
		case symbol.CONTAIN:
			return "contains";
		case symbol.NOT_CONTAIN:
			return "not contains";
		case symbol.IN_OPTIONS: // 在选项内 
			return "this field's value in fieldoptions";
		case symbol.NOT_IN_OPTIONS: // 不在选项内
			return "this field's value not in fieldoptions";
		default:
			return "unkonw";
	}
}

////////End of FieldRule/////////////