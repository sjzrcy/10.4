// JavaScript Document
function ImageChooser(currentUrl, options){
	var currentIndex_ = 0;
	var length_ = options.length;

	if(currentUrl){
		_.find(options, function(option, index){
			if(option.value == currentUrl){
				currentIndex_ = index;
				return true;
			}
		});	
	}

	var toNext = function(){
		event.stopPropagation();
		if(currentIndex_ >= 0 && currentIndex_ <= length_ - 2){
			currentIndex_ += 1;
			renderImage();
		}
	}

	var toPrevious = function(){
		event.stopPropagation();
		if(currentIndex_ >= 1 && currentIndex_ <= length_ - 1){
			currentIndex_ -= 1;
			renderImage();
		}
	}

	var renderImage = function(url){
		var url = options[currentIndex_].value;
		var title = options[currentIndex_].text;
		title += ("(" + (currentIndex_ + 1) + "/" + length_ +")");

		$title.text(title);
		$image.css("background-image", "url(" + encodeURI(url) + ")");
	}

	var $title;
	var $image;
	this.show = function(chooseImageCb){
		var $body = $("body");
		var $bg = $("<div>").addClass("image-chooser-bg").appendTo($body);
		$bg.css("top", $body.scrollTop() + "px").css("left", $body.scrollLeft() + "px");

		var $box = $("<div>").addClass("image-chooser-box").appendTo($bg);
		$title = $("<div>").addClass("image-chooser-title").appendTo($box);
		var $content = $("<div>").addClass("image-chooser-content").appendTo($box);
		var $toPrevious = $("<div>").addClass("image-chooser-2-previous").appendTo($content);
		$image = $("<div>").addClass("image-chooser-image").appendTo($content);
		var $toNext = $("<div>").addClass("image-chooser-2-next").appendTo($content);
		var $submit = $("<div>").addClass("image-chooser-submit").text("确定").appendTo($box);

		$toPrevious.click(toPrevious);
		$toNext.click(toNext);
		$submit.click(function(){
			event.stopPropagation();
			if(chooseImageCb){
				var option = options[currentIndex_];
				chooseImageCb(option.text, option.value);
			}

			$bg.remove();
		});
		$bg.click(function(){
			event.stopPropagation();
			$bg.remove();
		});

		renderImage();
	}
}

//
util.createNamespace("util.size");

util.size.createView = function(sizeModel){
	var view;
	var version = sizeModel.version();
	switch(version){
		case Sku.Version.Size.V1:{
			view = new Sku.View.SizeV1({model:sizeModel});
			break;
		}

		case Sku.Version.Size.V2:{
			view = new Sku.View.SizeV2({model:sizeModel});
			break;
		}

		case Sku.Version.Size.V3:{
			view = new Sku.View.SizeV3({model:sizeModel});
			break;
		}

		default:{
			alert("size version is unknow:" + version);
			break;
		}
	}

	return view;
}

util.size.getVersion = function(sku, group){
	var version = 0;
	if(group){
		version = Sku.Version.Size.V2;
	}else{
		var children = sku.children();
		for(var i = children.length - 1; i >= 0; --i){
			var child = children[i];
			var id = child.id;
			if(util.config.isSize(id)){
				if(child.type == shell.constants.field.SINGLE_CHECK){
					version = Sku.Version.Size.V1;
				}else if(child.type == shell.constants.field.INPUT){
					version = Sku.Version.Size.V3;
				}else{
					alert("尺码字段输入类型异常！（" + child.type + ")");
				}
			}
		}
	}
	return version;
}

util.size.findSize = function(sku){
	var children = sku.children();
	for(var i = children.length - 1; i >= 0; --i){
		var child = children[i];
		var id = child.id;
		if(util.config.isSize(id)){
			var field = FieldManager.get(id);
			if(!field){
				field = new ItemField(child);
			}
			return field;
		}
	}
}

util.size.getSizeMeasureImage = function(){
	var id = "size_measure_image";
	var field = FieldManager.get(id);
	if(field){
		//
	}
}

util.size.getExtendId = function(id){
	var index = id.indexOf("prop_");
	if(index >= 0){
		var extend = id.substr(5);
		var extend = "prop_extend_" + extend;
		return extend;
	}else{
		alert("尺码字段ID格式异常:" + id);
	}
}

util.size.findExtend = function(size){
	var id = size.rawId();
	var extendId = this.getExtendId(id);

	var extend = FieldManager.get(extendId);
	if(extend){
		return extend;
	}

	extend = util.itemRawField(extendId);
	if(extend){
		extend = new ItemField(extend);
		return extend;
	}
}

util.size.hasSameValue = function($input, selector){
	if(!selector){
		selector = ":text";
	}

	var hasSame = false;
	var element = $input[0];
	var source = $input.val();
	var $options = $input.parent().parent();
	$(selector, $options).each(function(){
		if(this == element){
			return;
		}
		if($(this).val() == source){
			hasSame = true;
			return false;
		}
	});
	return hasSame;
}

util.size.isRely = function(field, relyId, value){
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

util.size.findRelySize = function(sku, relyId, groupOption){
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

util.size.findOption = function(field, text, likeValue){
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

util.size.findRelyInput = function(sku, size){
	var relyId = size.rawId();
	var relyOption = this.findOption(size, "其它", "-1");
	if(!relyOption){
		relyOption = this.findOption(size, "其他", "-1");
		if(relyOption){
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

util.size.initGroupOptions = function(group, extendsSize){
	group.options = [];
	//
	var size = group.size;
	if(!size){
		return;
	}
	
	var id = size.rawId();
	var options = size.options();
	for(var i = 0; i < options.length; ++i){
		if(options[i].text() == "其它" || options[i].text() == "其他"){
			group.other = {"id":id, "value":options[i].value()};
			continue;
		}
		
		var option = {};
		option["value"] = options[i].value();
		option["text"] = options[i].text();
		option["id"] = id;
		option["isCustom"] = false;
		option["sizeTip"] = "";
		util.size.setSizeTip(option, extendsSize);

		group.options.push(option);
	}
}

util.size.confirm = function(cbConfirm, cbCancel){
	var options = {
		title:"操作确认",
		content:"切换分组信息将丢失所有数据，确定切换？",
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

util.size.tipSizeOptionEmpty = function(){
	var options = {
		title:"警告",
		content:"请选择尺码后操作，当前没有选中任何尺码",
		buttons:[
			{
				text:"好，我知道了", 
				click:function(){
					dialog.close();
				}
			}, 
		],
		contentIcon:config.image.WARN,
	};

	var dialog = new SchemaDialog(options);
	dialog.show();
}

util.size.customOptions = function(options){
	var customOptions = [];
	_.each(options, function(option){
		if(option.isCustom){
			customOptions.push(option);
		}
	});
	return customOptions;
}

util.size.normalOptions = function(options){
	var normalOptions = [];
	_.each(options, function(option){
		if(!option.isCustom){
			normalOptions.push(option);
		}
	});
	return normalOptions;
}

util.size.isUrlValue = function(field){
	var options = field.options();
	if(options.length == 0){
		return false;
	}

	var is = true;
	_.find(options, function(option){
		var value = option.value();
		//如果不是以"http"开头即认为不是url
		if(value.indexOf("http") != 0){
			is = false;
			return true;
		}
	});
	return is;
}

util.size.text = function(value, options){
	var text = "";
	_.find(options, function(option){
		if(option.value() == value){
			text = option.text();
			return true;
		}
	});
	return text;
}

util.size.extendText = function(field){
	var complexs = field.complexValues();
	if(complexs && complexs.length > 0){
		return "已编辑尺码表";
	}else{
		return "编辑尺码表";
	}
}

util.size.filterSizeExtendChildren = function(extend, sizeOption){
	//
	var isWork = function(field, sizeOption){
		var disableRuleName = shell.constants.rule.DISABEL;
		var rule = field.getRule(disableRuleName, true);
		if(!rule){
			return true;
		}

		if(!rule.dependGroup() || !rule.dependGroup().dependExpresses()){
			return rule.value() != "true";
		}

		var dependExpresses = rule.dependGroup().dependExpresses();
		if(dependExpresses.length != 1){
			return true;
		}

		var unEqualSymbolName = shell.constants.rule.symbol.UNEQUAL;
		var equalSymbolName = shell.constants.rule.symbol.EQUAL;

		var relyId = dependExpresses[0].fieldId();
		var symbol = dependExpresses[0].symbol();
		var dependValue = dependExpresses[0].value();

		if(relyId == sizeOption.id){
			if(symbol == unEqualSymbolName){
				return (dependValue == sizeOption.value);
			}else if(symbol == equalSymbolName){
				return (dependValue != sizeOption.value);
			}
		}else{
			if(symbol == unEqualSymbolName){
				return false;
			}else if(symbol == equalSymbolName){
				return true;
			}
		}

		return true;
	}

	//
	var works = [];
	var children = extend.children();

	var sizeExtendChildren = [];
	_.each(children, function(child){
		var id = child.id;
		if(id.indexOf("size_mapping_") == 0){
			sizeExtendChildren.push(new ItemField(child));
		}
	});

	_.each(sizeExtendChildren, function(child){
		if(isWork(child, sizeOption)){
			debug.trace(child.rawId());
			works.push(child);
		}
	});

	return works;
}

util.size.updateSizeTip = function(extendsSize, id, value, sizeTip, other){
	var complexValues = extendsSize.complexValues();
	var complex = _.find(complexValues, function(complexValue){
		return (complexValue[id] == value);
	});

	if(!complex){
		complex = {};
		complex["complexid"] = shell.createUUID();
		complex[id] = value;
		complex["size_tip"] = sizeTip;
		extendsSize.addComplexValue(complex);
	}else{
		complex["size_tip"] = sizeTip;
	}

	if(other){
		complex[other.id] = other.value;
	}

	shell.setComplexValue(extendsSize.schemaType(), extendsSize.rawId(), complex["complexid"], complex);
}

util.size.removeSizeTip = function(extendsSize, id, value){
	var complexValues = extendsSize.complexValues();
	var complex = _.find(complexValues, function(complexValue){
		return (complexValue[id] == value);
	});

	if(complex){
		shell.removeComplexValue(extendsSize.schemaType(), extendsSize.rawId(), complex["complexid"]);
		extendsSize.removeComplexValue(complex);
	}
}

util.size.setSizeTip = function(option, extendsSize){
	if(!extendsSize){
		return;
	}

	var complexValues = extendsSize.complexValues();
	var id = option.id;
	var value = option.value;
	var complex = _.find(complexValues, function(complexValue){
		return (complexValue[id] == value);
	});

	//设置sizeTip
	if(complex && complex["size_tip"]){
		option["sizeTip"] = complex["size_tip"];
	}
}

util.size.hasCheckedOption = function(options, startIndex, count){
	for(var i = startIndex, j = 0; i < options.length && j < count; ++i, ++j){
		if(options[i].checked){
			return true;
		}
	}
	return false;
}

util.size.decodeOptionV2 = function($el){
	if($el.length == 0){
		return;
	}

	$(".sku-size2-option", $el).each(function(){
		var $option = $(this);
		var value = $option.attr("value");
		if(value){
			$option.attr("value", unescape(value));
		}
	});
}