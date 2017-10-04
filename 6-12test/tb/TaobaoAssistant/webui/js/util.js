///
function JID(id){
	if(typeof(id) == "string"){
		id = id.replace(/\./g, "\\.");
		id = id.replace(/\*/g, "\\*");
		id = id.replace(/\,/g, "\\,");
		id = id.replace(/\//g, "\\/");
		return id;
	}else{
		return "";
	}
}

/////
window.util = new (function(){
	//
	this.title = function(text, width, className){
		var title = "";
		var $temp = $("<span>").addClass(className).text(text);
		$("body").append($temp);
		if($temp.width() > width){
			title = text;
		}
		$temp.remove();
		return title;
	}
	
	this.isBlank = function(input){
		var tmp = input;
		var rtn = (0 == input.trim().length);
		input = tmp;
		return rtn;
	}

	this.strEndWith = function(content, input){
		if(input==null||input==""||content.length==0||input.length>content.length)
			return false;
		if(content.substring(content.length-input.length)==input)
			return true;
		else
			return false;
		return true;
	}

	this.tbPxStringSize = function(str){
		var length = 0;
		if(typeof(str) != "string"){
			return length;
		}

		var code = 0;
		for(var i = 0; i < str.length; ++i){
			code = str.charCodeAt(i);
			// 英文字符长度为1，非英文字符长度为2 
			length += ((code >= 0 && code <= 128) ? (code >= 65 && code <=90 ? 1.5 : 1.1) : 2);
		}

		var size = parseInt(length);
		if(size < length){
			size += 1;
		}
		
		return size;
	}

	this.tbLogicStringSize = function(str, unit){
		var length = 0;
		if(typeof(str) != "string"){
			return length;
		}

		if(unit == "byte"){
			var code = 0;
			for(var i = 0; i < str.length; ++i){
				code = str.charCodeAt(i);
				length += ((code >= 0 && code <= 255) ? 1 : 2); // 英文字符长度为1，非英文字符长度为2 
			}
		}else{
			length = str.length;			
		}
		
		return length;
	}

	this.tbSubString = function(str, count, unit){
		if(unit == "byte"){
			var length = 0;
			var code = 0;
			var size = str.length;

			for(var i = 0; i < str.length; ++i){
				code = str.charCodeAt(i);
				length += ((code >= 0 && code <= 255) ? 1 : 2);
				if(length > count){
					size = i;
					break;
				}
			}
			
			return str.substring(0, size);
		}else{
			return str.substring(0, count);
		}
	}

	this.help = function(object) {
		for (var e in object) {
			debug.log(e + ":" + object[e]);
		}
	}

	this.toString = function(object, space){
		var detail = "";
		space = (space == undefined ? "" : space);
		if(space.length > 10){
			return;
		}
		
		var nextSpace = (space + "  ");

		if(typeof(object) == "object"){
			for(var key in object){
				debug.log(key);
				if(typeof(object[key]) == "object"){
					var value = arguments.callee(object[key], nextSpace);
					detail += ((space + key) + ":\n" + value + "\n");
				}else{
					detail += ((space + key) + ":" + object[key] + "\n");
				}
			}
		}else if(typeof(object) == "array"){
			for(var i = 0; i < object.length; ++i){
				detail += (space + object[i] + "\n");
			}
		}else{
			detail = (space + object);
		}
		
		return detail;
	}

	this.getKeys = function(object){
	  var keys = [];
	  for(var key in object){
	      keys.push(key);
	  }
	  return keys;
	}

	this.showFields = function(fields) {
		for (var i = 0; i < fields.length; ++i) {
			debug.log((i + 1) + ":(" + fields[i].name + "," + fields[i].id + ", " + fields[i].type + ")");
		}
	}

	this.disableSelection = function() {
		//允许被选择的控件列表  
		var allowedControls = ["input", "textarea"];

		// 禁用选中，防止出现选中阴影 
		document.body.oncontextmenu = function(){//1.屏蔽右键菜单
			var tagName = event.srcElement.tagName;
			if(!tagName){tagName = "";}

			var allowSelected = (-1 != allowedControls.indexOf(tagName.toLowerCase())) ? true : false;
			!allowSelected? event.preventDefault(): false;
		}

		document.body.ondragstart =  function(){ //2.屏蔽拖拽
			event.preventDefault();
		}

		document.body.onselectstart = function(){//3.屏蔽控件选中
			var tagName = event.srcElement.tagName;
			if(!tagName){tagName = "";}

			var allowSelected = (-1 != allowedControls.indexOf(tagName.toLowerCase())) ? true : false;
			!allowSelected? event.preventDefault(): false;
		}
	}

	this.mergeObjects = function() {
		var mt = {}
		for (var i = 0; i < arguments.length; ++i) {
			var arg = arguments[i];
			if (typeof arg == "object") {
				for (var p in arg) {
					if (mt.hasOwnProperty(p)) {
						debug.warn("警告：mergeObjects,对象合并存在属性冲突：" + p);
					}

					mt[p] = arg[p];
				}
			} else {
				debug.warn("传入的参数，类型不是object");
			}
		}
		return mt;
	}

	this.countAttr = function(object){
		var count = 0;
		for(var attr in object){
			++count;
		}
		return count;
	}

	this.removeAttrs = function(obj, blacks){
		for(var i = 0; i < blacks.length; ++i){
			if(typeof(obj[blacks[i]]) != "undefined"){
				delete obj[blacks[i]];
			}
		}
		return obj;
	}

	this.getKeyList = function(cppObjectList){
		var keys = [];
		for(var i = 0; i < cppObjectList.length; ++i){
			keys.push(cppObjectList[i]);
		}
		return keys;
	}

	this.createNamespace = function(namespaces){
		var ns = namespaces.split(".");
		var top = window;
		for (var i = 0; i < ns.length; ++i) {
			var sub = ns[i];
			if(!sub){
				continue;
			}

			if(typeof(top[sub]) != "object"){
				top[sub] = {};
			}

			top = top[sub];
		};
	}

	this.qtField = function(id){
		var find = function(id, fields){
			for(var i = 0; i < fields.length; ++i){
				var field = fields[i];
				if(field.id == id){
					return field;
				}
			}
		}

		var field = find(id, shell.brand);
		if(field){
			return field;
		}

		var field = find(id, shell.product);
		if(field){
			return field;
		}

		var field = find(id, shell.item);
		if(field){
			return field;
		}
	}

	this.itemRawField = function(id){
		var fields = shell.item;
		for(var i = 0; i < fields.length; ++i){
			var field = fields[i];
			if(field.id == id){
				return field;
			}
		}
	}

	this.jsField = function(id){
		return FieldManager.get(id);
	}

	this.removePx = function(px){
		if(px.indexOf("px") == -1){
			return 0;
		}

		var rs = px.substr(0, px.length - 2);
		return parseInt(rs);
	}

	this.clone = function(obj){
		var ser = JSON.stringify(obj);
		return JSON.parse(ser);
	}

	this.lightClone = function(obj){
		var clone = {};
		for(var p in obj){
			clone[p] = "";
		}
		return clone;
	}
	
	this.sprintf = function(str_source, array_params){
		if (array_params.length > 0){
			for ( var i = 0; i < array_params.length; ++i ){
				var re = new RegExp('%' + i, 'gm');
				str_source = str_source.replace(re, array_params[i]);
			}
		}

		return str_source;
	}

	this.isArrayContains = function(value, array){
		if(typeof(array) != "object" && array.length){
			return false;
		}

		for(var i = array.length - 1; i >= 0; --i){
			if(array[i] == value){
				return true;
			}
		}

		return false;
	}

	this.skuMetaTitle = function(name, isRequired){
		var handleName = function(name){
			if(name.length > 4){
				name = name.substr(0, 3);
				name += "..";
			}
			return name;
		}

		var $title = $("<div>").addClass("sku-sub-title");
		if(isRequired){
			$("<span>").text("*").addClass("required").appendTo($title);
		}

		var newName = handleName(name);
		var $name = $("<span>").text(newName).appendTo($title);
		if(newName != name){
			$name.attr("title", name);
		}

		return $title;
	}

	this.encodeComplexValue = function(complexValue){
		//对complexValue批量编码
		for(var key in complexValue){
			var value = complexValue[key];
			complexValue[key] = urlCoder.encode(value);
		}
		return complexValue;
	}

	this.decodeComplexValue = function(complexValue){
		//对complexValue批量解码，并返回新对象
		var complex = {};
		for(var key in complexValue){
			var value = complexValue[key];
			complex[key] = urlCoder.decode(value);
		}
		return complex;
	}

	this.mergeTds = function($table, startIndex){
		if(!$table || !$table.length || startIndex < 1){
			return;
		}

		var mergeCounts = {};
		mergeCounts[1] = 999;

		for(var i = startIndex; i >= 1; --i){
			var $tds = $("tr td:nth-child(" + i + ")", $table);

			var currentText = "";
			var currentMergeCount = 0;
			var $mergeTd = null;
			var removeTds = [];

			var internalMerge = function(){
				var last = $mergeTd.attr("rowspan");
				if(last === undefined){
					last = 1;
				}else{
					last = parseInt(last);
				}
				
				//记录当前列一次合并的单元格数量
				mergeCounts[i] = (last + currentMergeCount - 1);

				currentText = "";
				currentMergeCount = 0;
				$mergeTd = null;
				removeTds = [];
			}

			for(var j = 0; j < $tds.length; ++j){
				var $td = $($tds[j])
				if(j == 0){
					$mergeTd = $td;
					currentText = $td.text();
					currentMergeCount = 1;
				}else{
					if($td.text() == currentText){
						/*
							遇到和上一次相同的单元格，将本单元格加入到合并组
							若为最后一个单元格，将本轮单元格合并
						*/
						currentMergeCount += 1;
						removeTds.push($td);

						if(j == $tds.length - 1){
							internalMerge();
						}
					}else{
						/*
							遇到与上一次不同的单元格，将之前的所有单元合并
							然后开始下一轮合并
						*/
						internalMerge();

						$mergeTd = $td;
						currentMergeCount = 1;
						currentText = $td.text();
					}
				}
			}
		}

		//第一列不用处理，无论如何它都是走正常的合并流程
		for(var i = startIndex; i > 1; --i){
			//若前面一列单次合并的单元数量小于本列，则本列不合并
			if(mergeCounts[i] > mergeCounts[i - 1]){
				//若某列不需要合并，则该列后面的所有列也不合并
				for(var j = i; j <= startIndex; ++j){
					mergeCounts[j] = true;
				}
			}
		}

		for(var i = startIndex; i >= 1; --i){
			if(mergeCounts[i] === true){
				continue;
			}

			var $tds = $("tr td:nth-child(" + i + ")", $table);
			var currentText = "";
			var currentMergeCount = 0;
			var $mergeTd = null;
			var removeTds = [];

			var internalMerge = function(){
				var last = $mergeTd.attr("rowspan");
				if(last === undefined){
					last = 1;
				}else{
					last = parseInt(last);
				}
				
				debug.trace(last);
				$mergeTd.attr("rowspan", last + currentMergeCount - 1);
				for(var k = 0; k < removeTds.length; ++k){
					removeTds[k].remove();
				}

				currentText = "";
				currentMergeCount = 0;
				$mergeTd = null;
				removeTds = [];
			}

			for(var j = 0; j < $tds.length; ++j){
				var $td = $($tds[j])
				if(j == 0){
					$mergeTd = $td;
					currentText = $td.text();
					currentMergeCount = 1;
				}else{
					if($td.text() == currentText){
						/*
							遇到和上一次相同的单元格，将本单元格加入到合并组
							若为最后一个单元格，将本轮单元格合并
						*/
						currentMergeCount += 1;
						removeTds.push($td);

						if(j == $tds.length - 1){
							internalMerge();
						}
					}else{
						/*
							遇到与上一次不同的单元格，将之前的所有单元合并
							然后开始下一轮合并
						*/
						internalMerge();

						$mergeTd = $td;
						currentMergeCount = 1;
						currentText = $td.text();
					}
				}
			}
		}
	}

	this.showTipDialog = function(title, text, onClose){
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

	this.mergeTipRule = function(rules){
		var tipRuleName = shell.constants.rule.TIP;
		var tipRuleIndexs = [];

		for(var i = 0; i < rules.length; ++i){
			var rule = rules[i];
			if(rule.name == tipRuleName){
				tipRuleIndexs.push(i);
			}
		}

		if(tipRuleIndexs.length >= 1){
			var tips = [];
			for(var i = tipRuleIndexs.length - 1; i > 0; --i){
				var index = tipRuleIndexs[i];
				var tempRule = rules[index];
				tips.unshift(tempRule);
				rules.splice(index, 1);
			}

			/*
			tips.push({"value":"百度", "url":"http://www.baidu.com/"});
			tips.push({"value":"百度1", "url":"http://www.baidu.com/"});
			tips.push({"value":"百度2", "url":"http://www.baidu.com/"});
			tips.push({"value":"百度3", "url":"http://www.baidu.com/"});
			*/
			//如果多余两条，则合并为一条新的tip规则，挂在字段tips[]下
			var tipRule = rules[tipRuleIndexs[0]];
			tipRule["tips"] = tips;
		}

		return rules;
	}
	//
})();
/*
	@ZZ 面板，1它是一个对话框；2其内的内容可以任意定制；3模态；
*/

function fee(field, parentId){
	var TITLE = {
		express_fee:"快递",
		post_fee:"平邮",
		ems_fee:"EMS",
	}

	var title = TITLE[field.id]? TITLE[field.id]: field.name;
	var itemField = new ItemField(field);
	var $e = $("<div class='fee'>");
	$e.append($("<div class='fee-title'>").text(title));
	var $fee = $("<div class='fee-box'>");
	var $feeInput = $("<input class='fee-input'>").attr("lastValue", itemField.value()).val(itemField.value())
		.blur(function(){
			var lastValue = $(this).attr("lastValue");
			var value = $(this).val();
			if(lastValue != value){
				itemField.setValue(value);
				$(this).attr("lastValue", value);
			}
		})
		.bind("textchange", function(){
			var value = $(this).val();
			var newValue = value.replace(/[^\d.]/g, "");
			if (value != newValue) {
				debug.trace("[value, " + value + "], [newValue, " + newValue + "]");
				$(this).val(newValue);
			}
		});

	$fee.append($feeInput);
	$fee.append($("<div class='fee-unit'>").text("元"));
	$e.append($fee);
	return $e;
}

function findChildByID(id, field){
	var children = field.children;
	if(!children){return;}

	for(var i = 0; i < children.length; ++i){
		var child = children[i];
		if(child && child.id == id){
			return child;
		}
	}
}

function refund(field, options){
	/*
	options
	{
		title:"",
		support:"",
		rate:"",
		top:"",
	}
	*/

	if(field.type != shell.constants.field.COMPLEX 
		|| !field.children 
		|| field.children.length != 2
		|| !options.title || !options.support || !options.rate){
		generateHtml(field);
		return;
	}

	var qtSupportRate = findChildByID(options.support, field);
	var qtRate = findChildByID(options.rate, field);
	if(!qtSupportRate || qtSupportRate.options.length != 1 || !qtRate){
		generateHtml(field);
		return;
	}

	qtSupportRate.parent = field;
	qtRate.parent = field;

	var itemField = new ItemField(field);
	var $cache = $("#" + JID(field.id));
	itemField.setCache($cache);

	var $box = $("<div>").addClass("refund-box");
	if(options.top){$box.css("top", options.top);}
	$cache.append($box);

	var supportRate = new ItemField(qtSupportRate);
	var rate = new ItemField(qtRate);

	var isRequired = supportRate.hasRule(shell.constants.rule.REQUIRED);
	if(isRequired){
		supportRate.setValue(qtSupportRate.options[0].value);
	}

	var isChecked = (supportRate.value() == qtSupportRate.options[0].value);
	var $checkbox = $("<div>").addClass("check_item").css({"left":"36px"});
	supportRate.setCache($checkbox);
	$box.append($checkbox);

	$("<div>").addClass("check_icon float_left")
		.addClass(isChecked ? "check_icon_checked": "")
		.click(function(){
			if(isRequired){
				//如果是必填的，则不允许用户取消
				return;
			}

			var $self = $(this);
			if($self.hasClass("check_icon_checked")){
				$self.removeClass("check_icon_checked");
				supportRate.setValue("");
			}else{
				$self.addClass("check_icon_checked");
				supportRate.setValue(supportRate.options()[0].value());
			}
		})
		.appendTo($checkbox);
	$("<div>").addClass("check_text float_left").text(options.title).appendTo($checkbox);

	var $percentInput = $("<div>").addClass("refund-rate-percent");
	$box.append($percentInput);
	rate.setCache($percentInput);

	$("<input/>").addClass("refund-rate-percent-input").attr("lastValue", rate.value()).val(rate.value())
		.blur(function(){
			var $self = $(this);
			var lastValue = $self.attr("lastValue");
			var value = $self.val();
			if(lastValue != value){
				rate.setValue(value);
				$self.attr("lastValue", value);
			}
		})
		.bind("textchange", function(){
			var value = $(this).val();
			var newValue = value.replace(/[^\d.]/g, "");
			if (value != newValue) {
				debug.trace("[value, " + value + "], [newValue, " + newValue + "]");
				$(this).val(newValue);
			}
		})
		.appendTo($percentInput);
	$("<div class='refund-rate-percent-text'/>").text("%").appendTo($percentInput);

	RuleEngine.tryRegisterDependRule(itemField);
	itemField.installRules(true);

	RuleEngine.tryRegisterDependRule(supportRate);
	supportRate.installRules(true);

	RuleEngine.tryRegisterDependRule(rate);
	rate.installRules(true);
}
