// JavaScript Document
// 规则引擎
/* 
 *  设计思想
 *  1.订阅者模式：依赖者监控被依赖者，并触发自己的规则应用操作；被依赖者主动发射change信号；
 *  2.延迟部署：ui渲染过程中，将依赖者的depend规则应用封装成命令对象，待ui渲染完成之后，再行应用
 *  3.对象身份确认：id
 *
 command{id:"", rule:rule, depend:{operator:op, express:[{relativeFieldId, symbol, value},]}}
 */
window.DisableRuleService = {} 
/*  保存disable规则中的依赖关系
	对象结构：
	{
		schemaType:{
			id:[]
		}
	}
*/
function disableRuleHide(schemaType, id){
	if(DisableRuleService[schemaType] == undefined){
		return;
	}
	var relyIds = DisableRuleService[schemaType][id];
	if(relyIds == undefined){
		return;
	}

	for(var i = relyIds.length - 1; i >= 0; --i){
		var relyId = relyIds[i];
		var relyField = FieldManager.get(relyId);
		if(relyField){
			var $cache = relyField.cache();
			if($cache){
				$cache.css("display", "none");
				$cache.trigger("hide");
				debug.trace("auto hide " + relyId);
			}
			disableRuleHide(schemaType, relyId);
		}
	}
}

//
window.RuleEngine = new (function() {
	//
	var isIniting_ = false;
	this.isIniting = function() {
		return isIniting_;
	}
	this.setIsIniting = function(isIniting) {
		isIniting_ = isIniting;
	}

	var commands_ = [];
	var registerRuleCommand = function(command) {
		commands_.push(command);
	}

	this.reset = function() {
		unapplyCommands();
		commands_ = [];
	}

	this.tryRegisterDependRule = function(field) {
		var rules = field.rules();
		for (var i = 0; i < rules.length; ++i) {
			var rule = rules[i];
			if (!rule || !rule.dependGroup()) {
				continue;
			}

			// 命令对象组装 
			var command = {}
			command.id = field.id();
			command.rule = rule;
			registerRuleCommand(command);
		}
	}

	this.applyCommands = function(schemaType) {
		var isSpecifiedSchemaType = (arguments.length >= 1);
		for (var i = 0; i < commands_.length; ++i) {
			var command = commands_[i];
			if(isSpecifiedSchemaType === true){
				var field = FieldManager.get(command.id);
				if(field && field.schemaType() != schemaType){
					continue;
				}
			}
			
			installRuleCommand(command);
		}

		isCommandApplied_ = true;
	}

	// 对目标元素安装规则命令，监听其valueChanged信号
	var installRuleCommand = function(command) {
		var dependGroup = command.rule.dependGroup();
		if (dependGroup == null) {
			return;
		}

		var isDisableRule = (command.rule.name() == shell.constants.rule.DISABEL);
		var id = command.id;
		var field = FieldManager.get(id);
		if(!field){
			return;
		}

		var schemaType = field.schemaType();
		var expresses = dependGroup.dependExpresses();
		for (var i = 0; i < expresses.length; ++i) {
			var relid = expresses[i].fieldId();
			var $server = FieldManager.getCache(relid);
			if (!$server) {
				var jsField = FieldManager.find(relid);
				if(jsField){
					$server = jsField.cache();
				}

				if(!$server){
					debug.error("rely id:" + relid + ", not exist!");
					continue;
				}
			}

			if(isDisableRule){
				if(DisableRuleService[schemaType] === undefined){
					DisableRuleService[schemaType] = {};
				}
				if(DisableRuleService[schemaType][relid] == undefined){
					DisableRuleService[schemaType][relid] = [];
				}

				var as = DisableRuleService[schemaType][relid];
				if(as.indexOf(id) == -1){
					DisableRuleService[schemaType][relid].push(id);
				}
			}

			var ruleListenerKey = command.rule.name() + "listener";
			var listeners = $server.data(ruleListenerKey);
			if(!listeners){
				listeners = [];
			}

			if(listeners.indexOf(command.id) == -1){
				$server.bind("valueChanged", function() {
					debug.trace(command.id + " recived valueChanged signal from:" + $(this).attr("id"));
					checkRule(command);
				});

				listeners.push(command.id);
				$server.data(ruleListenerKey, listeners);
			}
		}
	}

	var unapplyCommands = function() {
		for (var i = 0; i < commands_.length; ++i) {
			uninstallRuleCommand(commands_[i]);
		}

		isCommandApplied_ = true;
	}

	var uninstallRuleCommand = function(command){
		var dependGroup = command.rule.dependGroup();
		if (dependGroup == null) {
			return;
		}

		var expresses = dependGroup.dependExpresses();
		for (var i = 0; i < expresses.length; ++i) {
			var express = expresses[i];
			var $server = FieldManager.getCache(express.fieldId());
			if ($server == undefined || $server == null) {
				continue;
			}

			$server.unbind("valueChanged");
		}
	}

	// 应用规则 
	var checkRule = function(command) {
		var $target = FieldManager.getCache(command.id);
		if ($target == undefined || $target == null) {
			return;
		}

		RuleEngine.installRule($target, command.rule);
	}

	this.isUiRule = function(name) {
		var EnumRule = shell.constants.rule;
		return (name == EnumRule.REQUIRED || name == EnumRule.TIP);
	}

	this.installRule = function($target, rule) {
		var name = rule.name();
		var value = rule.value();

		var id = $target.attr("id");
		var isEnabled = rule.isEnabled();
		debug.log((isEnabled ? "" : "un") + "install rule[" + name + ", " + value + "] for id[" + id + "]");

		if (typeof RuleDeployer[name] == "function") {
			RuleDeployer[name]($target, isEnabled);
		} else {
			debug.warn("target:[" + id + "],rule[" + name + ", " + value + "] is not support now!");
		}
	}
	//
})();

 function getRuleDeployer()
 {
	var deployer = {};
	var EnumRule = shell.constants.rule;

	// 必填 1
	deployer[EnumRule.REQUIRED] = function($target, isInstall) {
		var $titleContainer = $($("." + config.css.TITLE_WRAP, $target)[0]);
		var itemField = FieldManager.get($target.attr("id"));
		if (itemField != undefined && itemField != null) {
			if (isInstall == true) {
				if ($(".required", $titleContainer).length == 0) {
					$titleContainer.replaceWith(itemField.title(true));
				}
			} else {
				if ($(".required", $titleContainer).length > 0) {
					$titleContainer.replaceWith(itemField.title(false));
				}
			}
		}
	}

	//隐藏 2
	deployer[EnumRule.DISABEL] = function($target, isInstall) {
		var itemField = FieldManager.get($target.attr("id"));
		if(!itemField){return;}

		TimeRecorder.start(itemField.id() + ":" + ((isInstall == true) ? "install" : "uninstall") + " " + EnumRule.DISABEL);
		debug.log(itemField.id() + ":" + (isInstall ? "hide" : "show"));
		if(isInstall){//hide
			$target.css("display", "none");
			$target.trigger("hide");
			disableRuleHide(itemField.schemaType(), itemField.id());
		}else{//show
			$target.css("display", "block");
			$target.trigger("valueChanged");
			$target.trigger("show");
		}

		itemSectionResize();
		if(itemField){
			TimeRecorder.finish();
		}
	}

	//只读 3
	deployer[EnumRule.READ_ONLY] = function($target, isInstall) {
		var itemField = FieldManager.get($target.attr("id"));
		if(itemField){
			itemField.setReadOnly(isInstall);
		}
	}

	//提示 4
	deployer[EnumRule.TIP] = function($target, isInstall) {
		var $content = $($("." + config.css.CONTENT_WRAP, $target)[0]);
		if(!$content){return;}

		if(isInstall){
			var id = $target.attr("id");
			var itemField = FieldManager.get(id);
			if(itemField){
				var rule = itemField.getRule(EnumRule.TIP);
				itemField.addReminder(rule);
			}
		}else{
			itemField.removeReminder();
		}
	}

	//限制输入类型 5
	deployer[EnumRule.VALUE_TYPE] = function($target, isInstall) {
		var id = $target.attr("id");
		var itemField = FieldManager.get(id);
		if (itemField != undefined && itemField != null) {
			if (isInstall == true) {
				var rule = itemField.getRule(EnumRule.VALUE_TYPE);
				if (rule == undefined || rule == null) {
					return;
				}

				var value = rule.value();
				if (typeof InputTypeLimiter[value] == "function") {
					InputTypeLimiter[value](id, itemField);
				}
			}
		}
	}

	var isComplexType = function(type){
		var field = shell.constants.field;
		return (type == field.COMPLEX || type == field.MULTI_COMPLEX)
	}

	//最大长度 6
	deployer[EnumRule.MAX_LENGTH] = function($target, isInstall) {
		var itemField = FieldManager.get($target.attr("id"));
		if (itemField) {
			if(isComplexType(itemField.type())){
				return;
			}

			if (isInstall == true) {
				var rule = itemField.getRule(EnumRule.MAX_LENGTH);
				if (rule == undefined || rule == null) {
					return;
				}

				var value = rule.value();/*dw确认，value默认单位为character*/
				var unit = rule.unit();
				var isByte = (unit == "byte");
				$target.find("input").bind("textchange", function() {
					var length = util.tbLogicStringSize($(this).val(), unit);
					var maxLengthClass = "max_length_class";
					if (length > value) {
						if(isByte){
							var tip = "最大长度为:" + value + "个字节（" + value/2 + "个汉字）,当前长度为:" + length + "字节";
						}else{
							var tip = "最大长度为:" + value + ", 当前长度为:" + length;
						}
						itemField.updateTip(tip, maxLengthClass);
					}else{
						if(itemField.checkTip(maxLengthClass)){
							itemField.removeTip(maxLengthClass);
						}
					}
				});
			}
		}
	}

	//最小长度 7
	deployer[EnumRule.MIN_LENGTH] = function($target, isInstall) {
		var itemField = FieldManager.get($target.attr("id"));
		if (itemField) {
			if(isComplexType(itemField.type())){
				return;
			}

			if (isInstall == true) {
				var rule = itemField.getRule(EnumRule.MIN_LENGTH);
				if (rule == undefined || rule == null) {
					return;
				}

				var value = rule.value();
				var unit = rule.unit();
				$target.find("input").bind("textchange", function() {
					var minLengthClass = "min_length_class";
					var length = util.tbLogicStringSize($(this).val(), unit);
					if (length < value) {
						var tip = "最小长度为:" + value + ",当前长度为:" + length;
						itemField.updateTip(tip, minLengthClass);
					}else{
						if(itemField.checkTip(minLengthClass)){
							itemField.removeTip(minLengthClass);
						}
					}
				});
			}
		}
	}

	//最大值 8
	deployer[EnumRule.MAX_VALUE] = function($target, isInstall) {
		var itemField = FieldManager.get($target.attr("id"));
		if(!itemField || !itemField.isSimple()){return;}
		if (itemField != undefined && itemField != null) {
			if (isInstall == true) {
				var rule = itemField.getRule(EnumRule.MAX_VALUE);
				if (rule == undefined || rule == null) {
					return;
				}

				var value = parseFloat(rule.value());
				$target.find("input").bind("textchange", function() {
					var maxValueClass = "max_value_class";
					var v = parseFloat($(this).val());
					if (v > value) {
						var tip = "最大值为:" + value + ",当前值为:" + v;
						itemField.updateTip(tip, maxValueClass);
					}else{
						if(itemField.checkTip(maxValueClass)){
							itemField.removeTip(maxValueClass);
						}
					}
				});
			}
		}
	}

	//最小值 9
	deployer[EnumRule.MIN_VALUE] = function($target, isInstall) {
		var itemField = FieldManager.get($target.attr("id"));
		if(!itemField || !itemField.isSimple()){return;}
		if (itemField != undefined && itemField != null) {
			if (isInstall == true) {
				var rule = itemField.getRule(EnumRule.MIN_VALUE);
				if (rule == undefined || rule == null) {
					return;
				}

				var value = parseFloat(rule.value());
				$target.find("input").bind("textchange", function() {
					var minValueClass = "min_value_class";
					var v = parseFloat($(this).val());
					if (v < value) {
						var tip = "最小值为:" + value + ",当前值为:" + v;
						itemField.updateTip(tip, minValueClass);
					}else{
						if(itemField.checkTip(minValueClass)){
							itemField.removeTip(minValueClass);
						}
					}
				});
			}
		}
	}

	//最多选择数 10
	deployer[EnumRule.MAX_INPUT_NUM] = function($target, isInstall) {
		var itemField = FieldManager.get($target.attr("id"));
		if(!itemField || !itemField.isSimple()){return;}
		if (itemField != undefined && itemField != null) {
			if (isInstall == true) {
				var rule = itemField.getRule(EnumRule.MAX_INPUT_NUM);
				if (rule == undefined || rule == null) {
					return;
				}

				var value = rule.value();
				$target.find("input").click(function() {
					var maxInputNumClass = "max_input_num_class";
					if ($target.find("input:checked").length > value) {
						var tip = "可选数量最多为:" + value + ",当前已选:" + v;
						itemField.updateTip(tip, maxInputNumClass);
					}else{
						if(itemField.checkTip(maxInputNumClass)){
							itemField.removeTip(maxInputNumClass);
						}
					}
				});
			}
		}
	}

	//最少可选数 11
	deployer[EnumRule.MIN_INPUT_NUM] = function($target, isInstall) {
		var itemField = FieldManager.get($target.attr("id"));
		if(!itemField || !itemField.isSimple()){return;}
		if (itemField != undefined && itemField != null) {
			if (isInstall == true) {
				var rule = itemField.getRule(EnumRule.MAX_INPUT_NUM);
				if (rule == undefined || rule == null) {
					return;
				}

				var value = rule.value();
				$target.find("input").click(function() {
					var minInputNumClass = "min_input_num_class";
					if ($target.find("input:checked").length < value) {
						var tip = "可选数量最少为:" + value + ",当前已选:" + v;
						itemField.updateTip(tip, minInputNumClass);
					}else{
						if(itemField.checkTip(minInputNumClass)){
							itemField.removeTip(minInputNumClass);
						}
					}
				});
			}
		}
	}

	//最大小数点数 12
	deployer[EnumRule.MAX_DECIMAL_DIGITS] = function($target, isInstall) {
		var id = $target.attr("id");
		var itemField = FieldManager.get(id);
		if(!itemField || !itemField.isSimple()){return;}
		if (itemField != undefined && itemField != null) {
			if (isInstall == true) {
				var rule = itemField.getRule(EnumRule.MAX_DECIMAL_DIGITS);
				if (!rule) {
					return;
				}

				var value = rule.value();
				if(!value || parseInt(value) == NaN){return;}
				
				$target.find("input").bind("textchange", function() {
					var maxDecimalDigitsClass = "max_decimal_digits_class";
					var v = $(this).val();
					var index = v.indexOf(".");
					var decimal = v.substr(index + 1);
					if (decimal.length > value && index != -1) {
						var tip = "小数点后最多位数为:" + value + ",当前为:" + decimal.length;
						itemField.updateTip(tip, maxDecimalDigitsClass);
					}else{
						if(itemField.checkTip(maxDecimalDigitsClass)){
							itemField.removeTip(maxDecimalDigitsClass);
						}
					}
				});
			}
		}
	}

	//最少小数点数 13
	deployer[EnumRule.MIN_DECIMAL_DIGITS] = function($target, isInstall) {
		var id = $target.attr("id");
		var itemField = FieldManager.get(id);
		if(!itemField || !itemField.isSimple()){return;}

		if (itemField != undefined && itemField != null) {
			if (isInstall == true) {
				var rule = itemField.getRule(EnumRule.MAX_DECIMAL_DIGITS);
				if (!rule) {
					return;
				}

				var value = rule.value();
				if(!value || parseInt(value) == NaN){return;}

				$target.find("input").bind("textchange", function() {
					var minDecimalDigitsClass = "min_decimal_digits_class";
					var v = $(this).val();
					var index = v.indexOf(".");
					var decimal = v.substr(index + 1);
					if(index == -1){decimal = "";}
					if (decimal.length < value) {
						var tip = "小数点后最少位数为:" + value + ",当前为:" + decimal.length;
						itemField.updateTip(tip, minDecimalDigitsClass);
					}else{
						if(itemField.checkTip(minDecimalDigitsClass)){
							itemField.removeTip(minDecimalDigitsClass);
						}
					}
				});
			}
		}
	}

	//正则表达式匹配 14
	deployer[EnumRule.REGX] = function($target, isInstall) {
		var id = $target.attr("id");
		var itemField = FieldManager.get(id);
		if(!itemField || !itemField.isSimple()){
			return;
		}

		if (itemField) {
			if (isInstall == true) {
				var rule = itemField.getRule(EnumRule.REGX);
				if (rule == undefined || rule == null) {
					return;
				}

				var reg = new RegExp(rule.value());
				$target.find("input").bind("textchange", function() {
					var regexClass = "regex_class";
					var v = $(this).val();
					if (v && !reg.test(v)) {
						if(!itemField.checkTip(regexClass)){
							var tip = "格式错误！标准格式:" + rule.value();
							itemField.updateTip(tip, regexClass);
						}
					} else {
						if(itemField.checkTip(regexClass)){
							itemField.removeTip(regexClass);
						}
					}
				});
			}
		}
	}

	//枚举可输入 15
	deployer[EnumRule.INPUT] = function($target, isInstall) {
		var id = $target.attr("id");
		var itemField = FieldManager.get(id);
		if(!itemField || !itemField.isSimple()){return;}
		
		if (itemField != undefined && itemField != null) {
			if (isInstall == true) {
				var rule = itemField.getRule(EnumRule.INPUT);
				if (rule == undefined || rule == null) {
					return;
				}

				var $select = $target.find("select");
				$select.queryselect("permitCustomInput", true);

				var last_value = itemField.value();
				$select.bind("custominput", function(e, value){
					if(last_value != value){
						last_value = value;
						itemField.setValue(value);
						$("#" + itemField.id()).trigger("valueChanged");
					}
				});
			}
		}
	}

	/*********************************************/
	return deployer;
};

shell.addInitCb(function(){
	window.RuleDeployer = getRuleDeployer();
});

window.InputTypeLimiter = new (function() {
	// text 文本 不处理
	// decimal 浮点数 不处理
	// integer 整数 不处理
	// date 日期 
	// time 同时包含日期和时间
	// url 链接 当做是图片，从图片空间获取

	// 默认input 
	this.text = function(id) {}

	this.decimal = function(id, field) {
		$("#" + JID(id) + " input").css("ime-mode", "Disabled").bind("textchange", function() {
			var value = $(this).val();
			var newValue = value.replace(/[^\d.]/g, "");
			if (value != newValue) {
				$(this).val(newValue);
			}
		})
	}

	this.integer = function(id, field) {
		$("#" + JID(id) + " input").css("ime-mode", "Disabled").bind("textchange", function() {
			var value = $(this).val();
			var newValue = value.replace(/[^\d]/g, "");
			if (value != newValue) {
				$(this).val(newValue);
			}
		});
	}

	this.long = function(id, field) {
		$("#" + JID(id) + " input").css("ime-mode", "Disabled").bind("textchange", function() {
			var value = $(this).val();
			var newValue = value.replace(/[^\d]/g, "");
			if (value != newValue) {
				$(this).val(newValue);
			}
		});
	}

	this.date = function(id, field) {
		$("#" + JID(id) + " input").datepicker({
			dateFormat: config.DATE_FORMAT,
			onSelect:function(){$(this).blur();}
		});
	}

	this.time = function(id, field) {
		$("#" + JID(id) + " input").datetimepicker({
			timeFormat: config.TIME_FORMAT,
			dateFormat: config.DATE_FORMAT,
			showSecond: true,
			stepHour: 1,
			stepMinute: 1,
			stepSecond: 1,
			onSelect:function(){$(this).blur();}
		});
	}

	// url实现为从图片空间获取图片，取最后一张(这种实现不严谨，url不仅仅为图片，但大多数为图片)
	this.url = function(id, field) {
		var $cache = FieldManager.getCache(id);
		if(!$cache || !$cache.length){return;}
		var $content = $(".content_wrap", $cache);
		if(!$content || !$content.length){return;}
		$content.empty();

		var $image = $('<div class="field-image">').appendTo($content);
		var $choose = $('<div class="button">').css("max-width", "70px").text('选择图片').appendTo($image);
		var $preview = $('<div class="field-image-preview">').appendTo($image);
		var $delete = $('<div class="field-image-delete">').text('删除').appendTo($image);
		
		var setImage = function(url){
			field.setValue(url);
			$preview.css("background-image", "url('" + encodeURI(url) + "')");

			if(url){
				$choose.css("display", "none");
				$preview.css("display", "block");
				$delete.css("display", "block");
			}else{
				$choose.css("display", "block");
				$preview.css("display", "none");
				$delete.css("display", "none");
			}
		}

		$choose.click(function(){
			shell.choosePictures(function(images){
				var list = images.split(";");
				if (list.length == 0) {
					return;
				}

				var image = list[list.length - 1];
				if(image){
					setImage(image);
				}
			});
		});

		$preview.click(function(){
			var preview = new ImagePreview(field.value());
			preview.show(function(url){setImage(url);}, function(){setImage("");});
		});

		$delete.click(function(){
			setImage("");
		});

		setImage(field.value());
	}
	//
})();


window.input = new (function() {
	// text 文本 不处理
	// decimal 浮点数 不处理
	// integer 整数 不处理
	// date 日期 
	// time 同时包含日期和时间
	// url 链接 当做是图片，从图片空间获取

	// 默认input 
	this.text = function($input) {}

	this.decimal = function($input) {
		if($input.length == 0){
			return;
		}

		$input.css("ime-mode", "Disabled").bind("textchange", function() {
			var value = $(this).val();
			var newValue = value.replace(/[^\d.]/g, "");
			if (value != newValue) {
				$(this).val(newValue);
			}
		})
	}

	this.integer = function($input) {
		if($input.length == 0){
			return;
		}

		$input.css("ime-mode", "Disabled").bind("textchange", function() {
			var value = $(this).val();
			var newValue = value.replace(/[^\d]/g, "");
			if (value != newValue) {
				$(this).val(newValue);
			}
		});
	}

	this.long = function($input) {
		if($input.length == 0){
			return;
		}

		$input.css("ime-mode", "Disabled").bind("textchange", function() {
			var value = $(this).val();
			var newValue = value.replace(/[^\d]/g, "");
			if (value != newValue) {
				$(this).val(newValue);
			}
		});
	}

	this.date = function($input) {
		if($input.length == 0){
			return;
		}

		$input.datepicker({
			dateFormat: config.DATE_FORMAT,
			onSelect:function(){$(this).blur();}
		});
	}

	this.time = function($input) {
		if($input.length == 0){
			return;
		}

		$input.datetimepicker({
			timeFormat: config.TIME_FORMAT,
			dateFormat: config.DATE_FORMAT,
			showSecond: true,
			stepHour: 1,
			stepMinute: 1,
			stepSecond: 1,
			onSelect:function(){$(this).blur();}
		});
	}

	// url实现为从图片空间获取图片，取最后一张(这种实现不严谨，url不仅仅为图片，但大多数为图片)
	this.url = function($input) {
		if($input.length == 0){
			return;
		}

		$input.click(function() {
			var $self = $(this);
			shell.choosePictures(function(pics){
				var list = pics.split(";");
				if (list.length > 0 && list[list.length - 1].length > 0) {
					$self.val(list[list.length - 1]);
				}
			});
		});
	}

	//若小于最小值，则等于最小值
	this.minValue = function($input, value, isInclude){
		if($input.length == 0){
			return;
		}

		value = parseFloat(value);
		if(isInclude){
			$input.bind("textchange", function(){
				if(parseFloat($input.val()) < value){
					$input.val(value);
				}
			});
		}else{
			$input.bind("textchange", function(){
				if(parseFloat($input.val()) <= value){
					$input.val(value + 1);
				}
			});
		}
		
	}

	//若大于最大值，则等于最大值
	this.maxValue = function($input, value, isInclude){
		if($input.length == 0){
			return;
		}

		value = parseFloat(value);
		if(isInclude){
			$input.bind("textchange", function(){
				if(parseFloat($input.val()) > value){
					$input.val(value);
				}
			});
		}else{
			$input.bind("textchange", function(){
				if(parseFloat($input.val()) >= value){
					$input.val(value - 1);
				}
			});
		}
	}
	//
})();