/*
 *
 */

window.editFactory = new (function() {
	///
	var singleInput = function(field) {
		var $input = $("<input/>")
			.addClass("wrapper_input")
			.attr("type", "text")
			.attr("value", field.value())
			.attr("last_value", field.value());
		var $inputWrapper = $("<div>")
			.addClass("input_wrapper")
			.append($input); 

		// 失去焦点，检测提交，发送信号 
		$input.blur(function() {
			var last_value = $input.attr("last_value");
			var value = $input.val();
			if (last_value != value) {
				field.setValue(value);
				$input.attr("last_value", value);
			}
		});

		var $e = $("<div>").append($inputWrapper);
		return $e;
	}

	var multiInput = function(field) {
		var update = function(){//更新值
			var value = "";
			$("input", $e).each(function(index){
				if (value != "") value += config.SPLIT;
				value += urlCoder.encode($(this).val());
			});
			field.setValue(value);
		}

		var inputBlur = function($from){
			var lastValue = $from.attr("last_value");
			var value = $from.val();
			if (lastValue != value){
				update();
				$from.attr("last_value", value);
			}
		}

		var addInput = function(initValue){
			var $sub = $("<div>").addClass("multi-input-sub");
			var $subInput = $("<input/>")
				.addClass("wrapper_input")
				.attr("type", "text")
				.attr("value", initValue)
				.attr("last_value", initValue)
				.blur(function(){inputBlur($(this));});
			
			var $subWrapper = $("<div>")
				.addClass("input_wrapper")
				.append($subInput);

			var $subDelete = $("<div>").addClass("multi-input-delete").click(function(){
				$sub.remove();
				update();
			});

			$sub.append($subWrapper).append($subDelete);
			$sub.insertBefore($add);
		}

		var $input = $("<input/>")
			.addClass("wrapper_input")
			.attr("type", "text")
			.attr("fixed", "fixed")
			.attr("value", "")
			.attr("last_value", "")
			.blur(function(){inputBlur($(this));});

		var $inputWrapper = $("<div>")
			.addClass("input_wrapper")
			.append($input);

		var $multiInput = $("<div>").addClass("multi-input-container");
		var $add = $("<div>").html("<img src='pic/add.png'/>添加").addClass("multi-input-add").appendTo($multiInput);
		$add.click(function(){
			if(!$inputWrapper.hasClass("readonly")){
				addInput("");
			}
		});

		var $e = $("<div>").append($inputWrapper).append($multiInput);
		var value = field.value();
		if(typeof(value) == "object" && value.length > 0){
			$input.attr("value", value[0]).attr("last_value", value[0]);
			for(var i = 1; i < value.length; ++i){
				addInput(value[i]);
			}
		}else{
			$input.attr("value", value).attr("last_value", value);
		}



		return $e;
	}

	var multiInput_textarea = function(field) {
		var $textarea = $("<textarea/>")
			.addClass("input_style")
			.css({height:"60px"})
			.attr("value", field.value())
			.attr("last_value", field.value());

		// 失去焦点，检测提交，发送信号 
		$textarea.blur(function() {
			var last_value = $textarea.attr("last_value");
			var value = $textarea.val();
			if (last_value != value) {
				field.setValue(value);
				$textarea.attr("last_value", value);
			}
		});

		var $e = $("<div>").append($textarea);
		return $e;
	}

	var singleCheck = function(field) {
		//枚举可输入，ID为"in_"开头
		var black = {item_status:"", postage_id:"", after_sale_id:"", };
		var id = field.id();
		var enableInput = false;
		if(id.indexOf("in_") == 0){
			enableInput = true;
		}

		var options = field.options();
		if( frame.isSkuGroupField(id)
			|| black[id] === undefined
			&& options.length >= 1 
			&& options.length <= 3 
			&& !enableInput
			&& !field.hasRule(shell.constants.rule.INPUT)){
			return singleRadio(field);
		}

		var $select = $("<select>").addClass("input_style");
		var hasInitedValue = false;
		for (var index = 0; index < options.length; ++index) {
			var option = options[index];
			var $option = $("<option>")
				.attr("value", option.value())
				.text(option.text());
			$select.append($option);

			if (option.value() == field.value()) {
				$option.prop("selected", true);
				hasInitedValue = true;
			}
		}

		var $emptyOption = $("<option>").attr("value", "").text(config.queryselect.DELETE);
		$select.prepend($emptyOption);
		if(!hasInitedValue){
			$emptyOption.prop("selected", true);
		}

		var $e = $("<div>").append($select);
		$select.queryselect();
		$select.queryselect("trySetEmpty");

		if(enableInput || field.hasRule(shell.constants.rule.INPUT)){
			$select.queryselect("permitCustomInput", true);
			if(field.value() != "" && hasInitedValue == false){
				$select.queryselect("setCustomValue", field.value());
			}

			var last_value = field.value();
			$select.bind("custominput", function(e, value){
				if(last_value != value){
					field.setValue(value);
					last_value = value;
				}
			});
		}

		$select.select(function(event, e, ui){
			if(ui && ui.item && ui.item.option){
				var value = ui.item.option.value;
				field.setValue(value);
			}
		});
		return $e;
	}

	var singleRadio = function(field){
		var $radioboxs = $("<div>").addClass("input_style");
		var options = field.options();
		for (var index = 0; index < options.length; ++index) {
			var option = options[index];
			debug.log(field.id() + ":" + option.value() + "===" + field.value());
			var $radiobox = $("<div>").addClass("radio_item");
			$("<div>").addClass("radio_icon float_left")
						.attr("value", option.value())
						.addClass((option.value() === field.value()) ? "radio_icon_checked": "radio_enbale_hover")
						.appendTo($radiobox);
			$("<div>").addClass("radio_text float_left").text(option.text()).appendTo($radiobox);
			$("<div>").addClass("radio_space float_left").appendTo($radiobox);

			$radioboxs.append($radiobox);
		}

		$(".radio_icon", $radioboxs).click(function(){
			var $target = $(this);
			// fix 不支持radio取消
			if(!$target.hasClass("radio_icon_checked")){
				$(".radio_icon_checked", $radioboxs).removeClass("radio_icon_checked").addClass("radio_enbale_hover");
				$target.addClass("radio_icon_checked");
				$target.removeClass("radio_enbale_hover");
				var value = $target.attr("value");
				field.setValue(value);
			}
		});

		return $radioboxs;
	}

	var multiCheck = function(field) {
		var isChecked = function(optionValue, initValues){
			if(typeof(initValues) == "string"){
				return (optionValue == initValues);
			}else{
				for (var i = initValues.length - 1; i >= 0; i--) {
					if(initValues[i] == optionValue){
						return true;
					}
				}
				return false;
			}
		}

		var $checkboxs = $("<div>").addClass("input_style");
		var options = field.options();
		for (var index = 0; index < options.length; ++index) {
			var option = options[index];
			var $checkbox = $("<div>").addClass("check_item");
			$("<div>").addClass("check_icon float_left")
						.attr("value", option.value())
						.addClass(isChecked(option.value(), field.value()) ? "check_icon_checked": "")
						.appendTo($checkbox);
			$("<div>").addClass("check_text float_left").text(option.text()).appendTo($checkbox);
			$("<div>").addClass("check_space float_left").appendTo($checkbox);

			$checkboxs.append($checkbox);
		}

		var checkItems = $(".check_item", $checkboxs);
		var checkIcons = $(".check_icon", $checkboxs);
		$checkboxs.bind("setReadonly", function(e, isReadonly){
			$(this).attr("readonly", isReadonly);
			if(isReadonly){
				checkItems.removeClass("check_item").addClass("check_item_no_hover");
				checkIcons.removeClass("check_icon").addClass("check_icon_no_hover");
			}else{
				checkItems.removeClass("check_item_no_hover").addClass("check_item");
				checkIcons.removeClass("check_icon_no_hover").addClass("check_icon");
			}
		});

		checkIcons.click(function(){
			if($checkboxs.attr("readonly") == "readonly"){
				return;
			}

			var $target = $(this);
			if($target.hasClass("check_icon_checked")){
				$target.removeClass("check_icon_checked");
			}else{
				$target.addClass("check_icon_checked");
			}

			var value = "";
			$(".check_icon", $checkboxs).each(function(index) {
				var $item = $(this);
				if($item.hasClass("check_icon_checked")){
					if (value != "") value += config.SPLIT;
					value += urlCoder.encode($(this).attr("value"));
				}
			});

			field.setValue(value);
		});

		var $e = $("<div>").append($checkboxs);
		$checkboxs.addClass("clearfix");

		return $e;
	}

	var complex = function(field) {
		var $e = $("<div>").addClass("complex_box");
		var children = field.children();

		for (var index = 0; index < children.length; ++index) {
			var child = children[index];
			var childId = (function(field){
				var id = field.id;
				var parent = field.parent;
				while(parent){
					id = parent.id + config.ID_SPLIT + id;
					parent = parent.parent;
				}
				return id;
			})(child);

			if ($("#" + JID(childId)).length == 0) {
				var $ce = $("<div>").attr("id", childId);
				$e.append($ce);
				$ce.append(generateNode(child));
				$ce.addClass("clearfix");

				var jsField = FieldManager.get(childId);
				if(jsField){
					jsField.setCache($ce);
					jsField.installRules(true);
					RuleEngine.tryRegisterDependRule(jsField);
				}else{
					debug.error("fatal error:cannot find js field:" + childId);
				}
			}
		}

		return $e;
	}


	var multiComplex = function(field) {
		var $e = complex(field);
		var multi = new (function() {
			/*需要监听子字段被隐藏或者显示的信号*/
			var table_ = {};
			table_.id = field.id();
			table_.columnWidth = 80;
			table_.isPercent = true;
			table_.rowWidth = "auto";
			/*
			{
				id:"",字段ID
				count:0, 计数，仅仅作为参照
				headers:[],
				ids:[],
				columnWidth:0, 列宽
			}
			*/
			var hasInited_ = false;

			var unit = function(){
				return (table_.isPercent? "%": "px");
			}

			var td = function(text) {
				return $("<div>").addClass("td_item").text(text)
						.css("width", parseInt(table_.columnWidth / 2) + unit());
			}

			var addEmptyTip = function(){
				var $tip = $("<div>").addClass("empty_table_tip").text("暂无数据，请填写以上数据并添加");
				var $table = $(".multi_table", $e);
				$table.append($tip);
			}

			var removeEmptyTip = function(){
				$(".empty_table_tip", $e).remove();
			}

			var initTable = function() {
				table_.count = 0;
				table_.headers = [];
				table_.ids = []; // id和head根据index一一对应

				var childId = function(field){
					var id = field.id;
					var parent = field.parent;
					while(parent){
						id = parent.id + config.ID_SPLIT + id;
						parent = parent.parent;
					}
					return id;
				}

				var children = field.children();
				for (var i = 0; i < children.length; ++i) {
					table_.headers.push(children[i].name);
					table_.ids.push(childId(children[i]));
				}

				// 初始化UI 
				var tableWidth = $(".multi_table", $e).width();
				if(tableWidth < table_.columnWidth * (table_.ids.length + 1)){
					table_.isPercent = false;
					table_.rowWidth = table_.columnWidth * (table_.ids.length + 1) + "px";
				}else{
					table_.isPercent = true;
					table_.columnWidth = parseInt(99 / (table_.ids.length + 1));
				}

				var $header = $("<div>").addClass("header").css("width", table_.rowWidth).addClass("clearfix");
				$header.append(td("序号"));
				for (var i = 0; i < table_.headers.length; ++i) {
					var $headItem = $("<div>").addClass("td_item")
						.css("width", table_.columnWidth + unit())
						.attr("rely_id", table_.ids[i])
						.text(table_.headers[i]);
					$header.append($headItem);

					var $cache = FieldManager.getCache(table_.ids[i]);
					if(!$cache || $cache.css("display") == "none"){
						$headItem.hide();
					}
				}
				$header.append(td("操作"));

				var $table = $(".multi_table", $e);
				$table.append($header);

				setTimeout(function(){
					var height = $header.css("height");
					$(".td_item", $header).each(function(index){
						$(this).css("height", height);
					});
				}, 0);
			}

			var listenChildVisibility = function(from){
				if(table_.id != "sku" && table_.id != "darwin_sku"){return;}
				var field = FieldManager.get(from);
				if(!field){return;}

				var checkIdRely = function(relyIds, ids){
					for(var i = relyIds.length - 1; i >= 0; --i){
						for(var j = ids.length - 1; j >= 0; --j){
							if(relyIds[i] == ids[j]){
								return true;
							}
						}
					}
					return false;
				}

				var getRelyIds = function(schemaType, id){
					if(!DisableRuleService[schemaType]){
						return;
					}
					if(!DisableRuleService[schemaType][id]){
						return;
					}
					return DisableRuleService[schemaType][id];
				}

				var listenFieldChange = function(id){
					var field = FieldManager.get(id);
					if(!field){return false;}
					var $cache = field.cache();
					if(!$cache){return false;}

					var lastValue = field.value();
					var dialog = null;
					$cache.bind("valueChanged", function(){
						var value = field.value();
						if(lastValue == value){return;}

						var options = {
							title:"确认操作",
							content:"切换属性将丢失所有数据，确定切换？",
							buttons:[
								{text:"确认", click:function(){
									dialog.close();
									lastValue = value;

									var schemaType = field.schemaType();
									var multiId = table_.id;
									$(".row", $e).each(function(){
										var complexId = $(this).attr("id");
										shell.removeComplexValue(schemaType, multiId, complexId);	
									});

									$(".row", $e).remove();
									if($(".empty_table_tip", $e).length == 0){
										addEmptyTip();
									}
								}}, 
								{text:"取消", click:function(){
									dialog.close();

									var text = "";
									var options = field.options();
									for(var i = options.length - 1; i >= 0; --i){
										var option = options[i];
										if(option.value() == lastValue){
											text = option.text();
											break;
										}
									}
									if(!text){text = lastValue;}

									var $select = $("select", $cache);
									$select.queryselect("permitCustomInput", true);
									$select.queryselect("setCustomValue", text);
									$select.queryselect("permitCustomInput", false);
									field.setValue(lastValue);
								}}
							],
							contentIcon:config.image.WARN,
							callback:{}
						};
						
						if(dialog && !dialog.hasClose()){
							dialog.close();
							dialog = null;
						}

						dialog = new SchemaDialog(options);
						dialog.show();
					});
					return true;
				}

				if(!listenFieldChange(from)){return;}
				
				for(var i = 0; i < table_.ids.length; ++i){
					var id = table_.ids[i];
					var field = FieldManager.get(id);

					if(!field){continue;}
					var $cache = field.cache();
					if(!$cache){continue;}

					$cache.bind("show", function(){
						var id = $(this).attr("id");
						$("[rely_id='" + id + "']").show();
					});

					$cache.bind("hide", function(){
						var id = $(this).attr("id");
						$("[rely_id='" + id + "']").hide();
					});
				}
			}

			var removeLayer = function(parentId, complex){
				if(!parentId){
					return complex;
				}
				
				var after = {};
				var parentLength = parentId.length;
				for(var e in complex){
					if(e.indexOf(parentId) == 0){
						var id = e.substr(parentLength + 1);
						after[id] = complex[e];
					}
				}
				return after;
			}

			var removeIDLayer = function(parentId, id){
				if(!parentId){
					return id;
				}

				var parentLength = parentId.length;
				if(id.indexOf(parentId) == 0){
					return id.substr(parentLength + 1);
				}else{
					return id;
				}
			}

			var addLayer = function(parentId, complex){
				if(!parentId){
					return complex;
				}

				var after = {};
				for(var e in complex){
					var id = parentId + config.ID_SPLIT + e; 
					after[id] = complex[e];
				}
				return after;
			}

			var collectComplexData = function() {
				// 添加数据到后台
				var complex = {};
				for (var i = 0; i < table_.ids.length; ++i) {
					var id = table_.ids[i];
					var value = FieldManager.getValue(id);
					complex[id] = value;
				}

				var multiId = field.id();
				var complexid = shell.createUUID();
				shell.setComplexValue(field.schemaType(), multiId, complexid, JSON.stringify(removeLayer(multiId, complex)));
				return [complexid, complex];
			}

			//往后台更新一条complex数据
			var updateComplex = function() {
				var $from = $(this);
				var val = $from.val();
				var $td = $from.parent();
				var last_val = $td.attr("last_value");
				if (val == last_val) {
					return;
				}
				$td.attr("last_value", val);

				var $row = $td.parent();
				var multiId = field.id();
				var complexId = $row.attr("id");
				var complex = {};
				for (var i = 0; i < table_.ids.length; ++i) {
					var tdId = table_.ids[i];
					var $td = $("[rely_id='" + tdId + "']", $row);
					if ($td.length == 0) {
						complex[tdId] = "";
						continue;
					}

					if ($td.attr("has_option") == 1) {
						complex[tdId] = $td.attr("v");
					} else if ($td.attr("has_input") == 1) {
						complex[tdId] = $("input", $td).val();
					} else {
						complex[tdId] = $td.text();
					}
				}

				complex = removeLayer(multiId, complex);
				shell.setComplexValue(field.schemaType(), multiId, complexId, JSON.stringify(complex));
			}

			var isComplexCompleted = function() {
				for (var i = 0; i < table_.ids.length; ++i) {
					var cur_field = FieldManager.get(table_.ids[i]);
					if (!cur_field) {
						debug.error("error on [IsComplexCompleted]");
						return false;
					}

					var $cache = cur_field.cache();
					if(!$cache || $cache.css("display") == "none"){
						continue;
					}

					var type = cur_field.type();
					if (type == shell.constants.field.SINGLE_CHECK) {
						var value = FieldManager.getValue(cur_field.id());
						if (!value) {
							var option = {
								title:"错误提示",
								contentIcon:config.image.ERROR,
								content:("'" + cur_field.name() + "'的值为空，请补充后添加！"),
								buttons:[{text:"我知道了", click:function(){dialog.close();}}]
							};
							var dialog = new SchemaDialog(option);
							dialog.show();
							return false;
						}
					}
				}
				return true;
			}

			var isAdded = function(){//单选组合是否有重复
				var current = {};
				for (var i = 0; i < table_.ids.length; ++i) {
					var cur_field = FieldManager.get(table_.ids[i]);
					if (!cur_field) {
						debug.error("error on [isAdded]");
						return false;
					}

					var $cache = cur_field.cache();
					if(!$cache || $cache.css("display") == "none"){
						continue;
					}

					var type = cur_field.type();
					if (type == shell.constants.field.SINGLE_CHECK) {
						var value = FieldManager.getValue(cur_field.id());
						if (!value) {
							return true;
						}else{
							current[cur_field.id()] = value;
						}
					}
				}

				var context = $e;
				for(var id in current){
					var $tds = $("[rely_id='" + id + "'][v='" + current[id] + "']", context);
					context = $tds.parent();
					if(context.length == 0){
						break;
					}
				}

				if(context.length > 0 && context != $e){
					var option = {
						title:"错误提示",
						contentIcon:config.image.ERROR,
						content:"待添加的值已经存在，不可重复添加！",
						buttons:[{text:"我知道了", click:function(){dialog.close();}}]
					};
					var dialog = new SchemaDialog(option);
					dialog.show();
					return true;
				}else{
					return false;	
				}	
			}

			//从后台删除一条complex数据
			var removeComplex = function() {
				var $target = $(this);
				var $row = $target.parent();

				var multiId = field.id();
				var complexId = $row.attr("id");

				var schemaType = field.schemaType();
				shell.removeComplexValue(schemaType, multiId, complexId);
				$row.remove();

				if($(".row", $e).length == 0){
					addEmptyTip();
				}
			}

			//删除一条complex数据
			var removeComplexUi = function() {
				return $("<div>").addClass("td_item")
					.addClass("minus")
					.css("width", parseInt(table_.columnWidth / 2) + unit())
					.text("删除")
					.click(removeComplex);
			}

			var addComplexUi = function(complexId, complex) {
				debug.trace(JSON.stringify(complex));

				// 添加ui到界面
				var $row = $("<div>").attr("index", (table_.count += 1))
					.attr("id", complexId)
					.addClass("clearfix")
					.addClass("row")
					.css("width", table_.rowWidth);

				$row.append(td(table_.count));
				for (var i = 0; i < table_.ids.length; ++i) {
					var cur_field = FieldManager.get(table_.ids[i]);
					if (!cur_field) {
						debug.error("error on [add complex]");
						return;
					}

					var $cache = cur_field.cache();
					if(!$cache){
						debug.error("error on [add complex]");
						return;
					}

					var type = cur_field.type();
					var v = complex[table_.ids[i]];
					var v1 = v;
					var hasOption = (type == shell.constants.field.SINGLE_CHECK);
					if (hasOption == true) {
						var options = cur_field.options();
						for (var j = 0; j < options.length; ++j) {
							var op = options[j];
							if (op.value() == v) {
								v1 = op.text();
								break;
							}
						}
					}

					var $td = $("<div>").addClass("td_item")
						.css("width", table_.columnWidth + unit())
						.attr("rely_id", table_.ids[i])
						.attr("has_option", hasOption ? 1 : 0)
						.attr("v", v)
						.attr("last_value", v)
						.appendTo($row);

					var isSingleInput = (type == shell.constants.field.INPUT);
					$td.attr("has_input", isSingleInput ? 1 : 0);
					if (isSingleInput == true) {
						$td.append($("<input>").addClass("td_input").val(v1).blur(updateComplex));
					} else {
						$td.html(v1);
					}

					if($cache.css("display") == "none"){
						$td.hide();
					}
				}

				$row.append(removeComplexUi());
				var $table = $(".multi_table", $e);
				$table.append($row);

				setTimeout(function(){
					var height = $row.css("height");
					$(".td_item", $row).each(function(index){
						$(this).css("height", height);
					});
				}, 0);
			}

			var addRow = function() {
				if (!isComplexCompleted()){return;}
				if(isAdded()){return;}

				var complexValue = collectComplexData();
				var complexId = complexValue[0];
				var complex = complexValue[1];

				if (typeof(complexId) == "string" && complexId.length > 0) {
					removeEmptyTip();
					addComplexUi(complexId, complex);
				}
			}

			this.plus = function() {
				var $items = $(".title_box", $e);
				var width = $($items[$items.length - 1]).width();
				if(width == 0){//若取不到，默认值为112
					width += 112;
				}

				var $contents = $("." + config.css.CONTENT_WRAP, $e);
				var left = util.removePx($($contents[$contents.length - 1]).css("left"));
				if(left == 0){
					left = 8;
				}
				
				width += left;
				width += "px";

				return $("<div>")
							.text("确认添加")
							.addClass("plus button clearfix")
							.css("left", width)
							.click(addRow);
			}

			this.loadComplexs = function() {
				if (hasInited_ == false) {
					initTable();
					listenChildVisibility("custom_prop_field_key");
					listenChildVisibility("std_size_group");
					hasInited_ = true;
				}

				var multiId = field.id();
				var complexValues = field.complexValues();
				if(complexValues.length > 0){
					for (var i = 0; i < complexValues.length; ++i) {
						var complexValue = complexValues[i];
						var complex = {};
						var complexId = complexValue["complexid"];
						for (var j = 0; j < table_.ids.length; ++j) {
							var fid = removeIDLayer(multiId, table_.ids[j]);
							complex[fid] = complexValue[fid];
						}

						addComplexUi(complexId, addLayer(field.id(), complex));
					}
				}else{
					addEmptyTip();
				}
			}
			//
		})();

		setTimeout(function(){
			$e.append(multi.plus());
			$e.append($("<div>").addClass("multi_table clearfix"));
			multi.loadComplexs();
		}, 0);
		
		return $e;
	}

	//--------------label--------------------------------------------
	var label = function(field) {
		var $e = $("<div>");
		var lis = [];
		var genLabelGroup = function(groupLabel, onlyGroupNames){
			var isTheOnlyGroupName = true;
			if(onlyGroupNames){
				isTheOnlyGroupName = (function(names, name){
					for(var i = names.length - 1; i >= 0; --i){
						if(names[i] == name){
							return true;
						}
					}
					return false;
				})(onlyGroupNames, groupLabel.name());
			}
			
			var labels = groupLabel.labels();
			if(isTheOnlyGroupName && labels.length > 0){
				for(var i = 0; i < labels.length; ++i){
					lis.push($("<li class='label_li'>" + labels[i].name + ":" +  labels[i].value + "</li>"));
				}
			}

			var children = groupLabel.groups();
			if(children.length > 0){
				for(var i = 0; i < children.length; ++i){
					lis.concat(genLabelGroup(children[i], onlyGroupNames));
				}
			}

			return lis;
		}

		var onlyGroupNames = (function(id){
			if(!config.publish){
				return undefined;
			}

			if(id == "infos"){
				return ["biz_infos", "sys_infos"]
			}else if(id == "warns"){
				return ["biz_warns"];
			}else if(id == "errors"){
				return ["biz_errors"];
			}else{
				return undefined;
			}

		})(field.id());

		lis = [];
		var lis = genLabelGroup(field.labelGroup(), onlyGroupNames);
		field.setValue((function(liArray){
			var html = "";
			for(var i = 0; i < liArray.length; ++i){
				if(html.length > 0){html += "<br/>";}
				html += "·";
				html += liArray[i].text();
			}
			return html;
		})(lis));
		
		var $ul = $("<ul class='label_ul' style='margin:0;'></ul>");
		for(var i = 0; i < lis.length; ++i){
			$ul.append(lis[i]);
		}

		$e.append($ul);
		return $e;
	}

	////////////////////////////////////////////////////
	this.create = function(field) {
		var type = shell.constants.field;
		switch (field.type()) {
			case type.INPUT:
				return singleInput(field);

			case type.MULTI_INPUT:
				return multiInput(field);

			case type.SINGLE_CHECK:
				return singleCheck(field);

			case type.MULTI_CHECK:
				return multiCheck(field);

			case type.COMPLEX:
				return complex(field);

			case type.MULTI_COMPLEX:
				return multiComplex(field);

			case type.LABEL:
				return label(field);

			default:
				debug.error("field input type(ui):" + field.type() + ", is not support now!");
				return $("<div>");
		}
	}
	///
})();