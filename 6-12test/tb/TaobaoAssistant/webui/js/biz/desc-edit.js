//
var DESC_KEY = "description";
var BUTTON_BAR = "button_bar";
var DESC_EDITOR = "desc_editor";
var USER_DEFINE_MODULE = "desc_module_user_mods";
var SINGLE_DESC = 1;
var MULTI_DESC = 2;

var mode = 0;
var SPACING = 2;

window.desc = new (function(){
	//
	var desc = null;
	var itemDesc = null;

    var htmlEditorWidth = null;
    var htmlEditorHeight = null;

	var hasRequiredRule = function(ruleList){
		var REQUIRED = shell.constants.rule.REQUIRED;
		for(var i = 0; i < ruleList.length; ++i){
			var rule = ruleList[i];
			if(rule.name == REQUIRED){
				return true;
			}
		}

		return false;
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

	var loadSpecifiedDesc = function(id){
		$("." + DESC_EDITOR).attr("for", id);
        var src = FieldManager.getValue(id);
        npUtil.setHtmlEditorContent(src);
	}

	var saveCurrentDesc = function(id){
		var field = FieldManager.get(id);
		if(field){
            npUtil.getHtmlEditorContent(function(JsonParam){
                var contentObj = JSON.parse(JsonParam);
                var field = FieldManager.get(id);
                if(field){
                    var source = contentObj["content"];
                    field.setValue(source);
                }else{
                    debug.error("can not find:" + id);
                }

                shell.saveData();
            });
		}else{
			debug.error("can not find:" + id);
		}
	}

	var genButton = function(field, name){
		var $e = $("<div>").addClass("button_box").attr("id", field.id()).click(function(){
			var $item = $(this);
			var id = $item.attr("id");
			var lastId = $("." + DESC_EDITOR).attr("for");
			if(id == lastId){
				return;
			}

			saveCurrentDesc(lastId);
			loadSpecifiedDesc(id);

			$(".selected", ".button_box").removeClass("selected");
			$(".desc_button", $item).addClass("selected");
		});

		var $button = $("<div>").addClass("desc_button");
		var $text = $("<div>").addClass("button_text");;
		if(hasRequiredRule(field)){
			$text.append($("<span>").addClass("required").text("*"));
		}
		$text.append($("<span>").text(name? name: field.name));

		$text.appendTo($button);
		$button.appendTo($e);
		return $e;
	}

	var genSingleDesc = function(field){
		mode = SINGLE_DESC;
		var itemField = new ItemField(field);
		var $bar = $("." + BUTTON_BAR);
		$bar.hide();

		$("." + DESC_EDITOR).attr("for", field.id);

        var src = itemField.value();
        npUtil.setHtmlEditorContent(src);
	}

	var findContent = function(field){
		var id = field.id + "_content";
		var children = field.children;
		if(!children){return;}

		for(var i = 0; i < children.length; ++i){
			var child = children[i];
			if(child.id == id){
				return child;
			}
		}
	}

	var genMultiDesc = function(field){
		mode = MULTI_DESC;
		var $bar = $("." + BUTTON_BAR);
		$bar.show();

		var children = field.children;
		var hasLoadFirst = false;
		for(var i = 0; i < children.length; ++i){
			var child = children[i];
			if(child.id == USER_DEFINE_MODULE){
				continue;
			}

			var qtContentField = findContent(child);
			if(!qtContentField){continue;}

			var itemField = new ItemField(child);
			var contentField = new ItemField(qtContentField);
			var $buttonBox = genButton(contentField, itemField.name());
			$bar.append($buttonBox);

			if(!hasLoadFirst){
				hasLoadFirst = true;
				$("." + DESC_EDITOR).attr("for", contentField.id());
				$(".desc_button", $buttonBox).addClass("selected");
                var src = contentField.value();
                npUtil.setHtmlEditorContent(src);
			}
		}

		$bar.addClass("clearfix");
		$bar.disableSelection();

		var descField = new ItemField(field);
		var readOnlyRule = descField.getRule(shell.constants.rule.READ_ONLY);
		if(!readOnlyRule || !readOnlyRule.isEnabled()){
			$bar.sortable({stop:function(event, ui){
				var id = "";
				var list = "";
				$(".button_box").each(function(){
					var DESC_SORT_SPLIT = ",";
					if(list.length > 0){list += DESC_SORT_SPLIT;}
					id = $(this).attr("id");
					id = removeIDLayer(descField.id(), id);
					list += id;
				});
				debug.log(list);
				field.extend = list;
			}});
		}
	}

	this.loadItemEditSchema = function(schemaType){
		desc = null;
		itemDesc = null;
		mode = SINGLE_DESC;
		var schema = shell.item;
		for(var i = schema.length; i >= 0; --i){
			var field = schema[i];
			if(field && field.id == DESC_KEY){
				desc = field;
				break;
			}
		}

		if(!desc){
			debug.warn("not find field:" + DESC_KEY);
			return;
		}

		desc.schemaType = schemaType;
		itemDesc = new ItemField(desc);
		if(desc.type == shell.constants.field.INPUT){
			genSingleDesc(desc);
		}else if(desc.type == shell.constants.field.COMPLEX){
			genMultiDesc(desc);
		}else{
			debug.error(DESC_KEY + " type is" + desc.type);
		}

		setTimeout(function(){$(window).resize();}, 40);
	}

	this.saveCurrent = function(){
		var id = $("." + DESC_EDITOR).attr("for");
		saveCurrentDesc(id);
	}

	this.clearSchema = function(){
		$("." + BUTTON_BAR).empty().hide();
        npUtil.setHtmlEditorContent("");
		FieldManager.clear();
	}

	this.setEditorVisible = function(visible){
        if(!visible){
            var ww = $(".desc_editor").width();
            var hh = $(".desc_editor").height();
            if(ww!=0 && hh!=0){
                htmlEditorWidth = ww;
                htmlEditorHeight = hh;
            }
        }
        npUtil.setEditorVisible(htmlEditorWidth, htmlEditorHeight, visible);
	}
	//
})();

$(window).resize(function(){
	var TOP = 16;
	var LEFT = 0;

	if(mode != MULTI_DESC){
		TOP = 0;
		LEFT = 0;
	}

	var $editor = $("." + DESC_EDITOR);
	$editor.width(window.innerWidth - 2 * LEFT);
	$editor.css("left", LEFT + "px");

	var $bar = $("." + BUTTON_BAR);
	var barHeight = $bar.css("display") != "none" ? ($bar.height() + SPACING) : 0;
	$editor.height(window.innerHeight - barHeight - TOP);
	$editor.css("top", TOP + "px");
});

process.saveAll = function(){
	desc.saveCurrent();
}

process.renderItemAddSchema = function(json){
	shell.setItemToken(json);
	desc.loadItemEditSchema(shell.constants.schema.ITEM_ADD);
}

process.renderItemUpdateSchema = function(json){
	shell.setItemToken(json);
	desc.loadItemEditSchema(shell.constants.schema.ITEM_UPDATE);
}

//适配对话框效果
var netErrorDialog = null;
process.notifyNetError = function(error) {
	var options = {
		title:"出错啦！",
		content:error,
		buttons:[],                 
		contentIcon:config.image.ERROR,
		callback:{
			show:function(){ desc.setEditorVisible(false);},
			hide:function(){ desc.setEditorVisible(true);},
		}
	};

	if(netErrorDialog && !netErrorDialog.hasClose()){
		netErrorDialog.close();
		netErrorDialog = null;
	}
	
	netErrorDialog = new SchemaDialog(options);
	netErrorDialog.show();
}

process.tryCloseNetErrorTip = function(){
	if(netErrorDialog && !netErrorDialog.hasClose()){
		netErrorDialog.close();
		netErrorDialog = null;
	}
}


//适配加载效果
var loading = null;
process.showLoadingUi = function() {
	if(loading == null){
		loading = new LoadingUi2("", "");	
	}

	desc.setEditorVisible(false);
	loading.show();
}

process.hideLoadingUi = function() {
	if(loading != null){
		loading.hide();
		desc.setEditorVisible(true);
	}
}

//宝贝描述在提示不支持类目时的回调
process.callback.notSupportCategory = {
	show: function(){desc.setEditorVisible(false);},
	hide: function(){desc.setEditorVisible(true);},
};

process.tryHideLoadingUi = function(){
	if(loading != null && loading.isVisible()){
		loading.hide();
		desc.setEditorVisible(true);
	}
}

process.renderProductSchema = function(){
	desc.clearSchema();	
}

process.clearAllSchema = function(){
	process.tryHideLoadingUi();
	process.tryCloseNetErrorTip();
	desc.clearSchema();
	process.handleClear();
	Tooltip.clear();
}

//不使用自定义滚动条
config.edit.useCustomScrollbar = false;